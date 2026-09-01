// GET /api/dashboard?de=YYYY-MM-DD&ate=YYYY-MM-DD&origem=<canal>&jornadas=todas|conv
// GET /api/dashboard?live=1  → últimos eventos (feed ao vivo)
// Autenticação: Authorization: Bearer <token de /api/login>
import { configured, selectAll } from './_lib/db.js';
import { verifyToken, bearer } from './_lib/auth.js';

const TZ_OFFSET_MS = -3 * 60 * 60 * 1000; // America/Sao_Paulo (sem horário de verão)
const SECTION_ORDER = ['hero', 'sob-medida', 'pecas', 'colecao', 'comecar', 'investimento', 'autoridade', 'destaques', 'faq', 'cta-final'];
const SECTION_LABEL = { hero: 'Hero', 'sob-medida': 'Por que sob medida', pecas: 'Peças', colecao: 'Coleção', comecar: 'Comece pelo WhatsApp', investimento: 'Investimento', autoridade: 'Quem faz', destaques: 'Destaques', faq: 'FAQ', 'cta-final': 'CTA final' };

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  if (!verifyToken(bearer(req))) return res.status(401).json({ error: 'Sessão expirada. Entre novamente.' });
  if (!configured()) return res.status(503).json({ error: 'Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).' });
  res.setHeader('Cache-Control', 'no-store');

  const q = req.query || {};
  try {
    if (q.live) return res.status(200).json(await live());
    return res.status(200).json(await report(q));
  } catch (err) {
    console.error('[dashboard]', err.message);
    return res.status(500).json({ error: 'Falha ao consultar o banco.' });
  }
}

async function live() {
  const events = await selectAll('gaspar_events', 'select=ts,name,props,session_id&order=ts.desc&name=neq.page_leave', 40, 40);
  const ids = [...new Set(events.map((e) => e.session_id))];
  const sessions = ids.length ? await selectAll('gaspar_sessions', `select=id,channel,device,city,utm_campaign&id=in.(${ids.join(',')})`) : [];
  const byId = Object.fromEntries(sessions.map((s) => [s.id, s]));
  return { events: events.map((e) => ({ ...e, session: byId[e.session_id] || null })) };
}

function range(q) {
  const today = localDate(new Date());
  const de = /^\d{4}-\d{2}-\d{2}$/.test(q.de || '') ? q.de : addDays(today, -29);
  const ate = /^\d{4}-\d{2}-\d{2}$/.test(q.ate || '') ? q.ate : today;
  const from = localStart(de), to = localStart(addDays(ate, 1));
  const days = Math.max(1, Math.round((to - from) / 86400000));
  return { de, ate, from, to, prevFrom: new Date(from.getTime() - days * 86400000), prevTo: from, days };
}

async function report(q) {
  const r = range(q);
  const origem = q.origem && q.origem !== 'todas' ? q.origem : null;
  const [sessionsAll, prevSessions, eventsAll] = await Promise.all([
    selectAll('gaspar_sessions', `select=*&started_at=gte.${r.from.toISOString()}&started_at=lt.${r.to.toISOString()}&order=started_at.desc`),
    selectAll('gaspar_sessions', `select=id,visitor_id,wa_clicks,duration_ms,channel&started_at=gte.${r.prevFrom.toISOString()}&started_at=lt.${r.prevTo.toISOString()}`),
    selectAll('gaspar_events', `select=session_id,ts,name,props&ts=gte.${r.from.toISOString()}&ts=lt.${r.to.toISOString()}&order=ts.asc`),
  ]);
  const sessions = origem ? sessionsAll.filter((s) => s.channel === origem) : sessionsAll;
  const sid = new Set(sessions.map((s) => s.id));
  const events = eventsAll.filter((e) => sid.has(e.session_id));
  const byName = (n) => events.filter((e) => e.name === n);

  // ---- KPIs (com delta vs período anterior) ----
  const kpi = (ss) => {
    const wa = ss.reduce((a, s) => a + (s.wa_clicks || 0), 0);
    const conv = ss.filter((s) => (s.wa_clicks || 0) > 0).length;
    const dur = ss.filter((s) => s.duration_ms > 0);
    const visitors = new Set(ss.map((s) => s.visitor_id || `anon-${s.id}`)).size;
    return {
      sessions: ss.length, visitors, wa_clicks: wa, converting_sessions: conv,
      conversion_rate: ss.length ? +(conv / ss.length * 100).toFixed(1) : 0,
      avg_duration_s: dur.length ? Math.round(dur.reduce((a, s) => a + s.duration_ms, 0) / dur.length / 1000) : 0,
      google_ads_share: ss.length ? +(ss.filter((s) => s.channel === 'google_ads').length / ss.length * 100).toFixed(1) : 0,
    };
  };
  const cur = kpi(sessions);
  const prev = kpi(origem ? prevSessions.filter((s) => s.channel === origem) : prevSessions);
  const scrolls = sessions.filter((s) => s.max_scroll_pct != null);
  cur.avg_scroll_pct = scrolls.length ? Math.round(scrolls.reduce((a, s) => a + s.max_scroll_pct, 0) / scrolls.length) : 0;

  // ---- Série diária ----
  const daily = {};
  for (let d = new Date(r.from); d < r.to; d = new Date(d.getTime() + 86400000)) daily[localDate(d)] = { date: localDate(d), sessions: 0, wa_clicks: 0 };
  sessions.forEach((s) => { const k = localDate(new Date(s.started_at)); if (daily[k]) { daily[k].sessions++; daily[k].wa_clicks += s.wa_clicks || 0; } });

  // ---- Distribuições ----
  const count = (arr, fn) => { const m = {}; arr.forEach((x) => { const k = fn(x); if (k == null || k === '') return; m[k] = (m[k] || 0) + 1; }); return Object.entries(m).map(([key, value]) => ({ key, value })).sort((a, b) => b.value - a.value); };
  const channels = count(sessionsAll, (s) => s.channel || 'other'); // ignora filtro de origem, de propósito
  const devices = count(sessions, (s) => s.device);
  const browsers = count(sessions, (s) => s.browser);
  const os = count(sessions, (s) => s.os);
  const cities = count(sessions, (s) => s.city ? `${s.city}${s.region ? ' · ' + s.region : ''}` : null).slice(0, 15);
  const regions = count(sessions, (s) => s.region);
  const consent = count(sessions, (s) => s.consent || 'nao_respondeu');
  const audience = count(sessions, (s) => (s.is_returning ? 'recorrente' : 'novo'));

  // ---- WhatsApp por botão / origem ----
  const waEv = byName('whatsapp_click');
  const wa_by_source = count(waEv, (e) => e.props.source || 'outro');
  const wa_by_label = count(waEv, (e) => e.props.label || '(sem rótulo)');
  const wa_source_x_channel = pivot(waEv, (e) => e.props.source || 'outro', (e) => (sessionById(sessionsAll, e.session_id)?.channel) || 'other');

  // ---- Funil de leitura, filtros, FAQ ----
  const secCount = count(byName('section_view'), (e) => e.props.section);
  const sections = SECTION_ORDER.map((k) => ({ key: k, label: SECTION_LABEL[k] || k, value: secCount.find((x) => x.key === k)?.value || 0, pct: sessions.length ? Math.round(((secCount.find((x) => x.key === k)?.value || 0) / sessions.length) * 100) : 0 }));
  const filters = count(byName('collection_filter'), (e) => e.props.filter);
  const faq = count(byName('faq_open'), (e) => e.props.question);
  const social = count(byName('social_click'), (e) => e.props.network);

  // ---- Campanhas (Google Ads / UTM) ----
  const campMap = {};
  sessions.filter((s) => s.channel === 'google_ads' || s.utm_campaign).forEach((s) => {
    const k = [s.utm_campaign || '(sem utm_campaign)', s.utm_content || '', s.utm_term || ''].join('|');
    campMap[k] ||= { campaign: s.utm_campaign || '(sem utm_campaign)', content: s.utm_content || '', term: s.utm_term || '', channel: s.channel, sessions: 0, wa_clicks: 0 };
    campMap[k].sessions++; campMap[k].wa_clicks += s.wa_clicks || 0;
  });
  const campaigns = Object.values(campMap).sort((a, b) => b.sessions - a.sessions);

  // ---- Tudo que foi clicado ----
  const clicks = count(byName('click'), (e) => `${e.props.text || '(sem texto)'}|${e.props.section || ''}`)
    .slice(0, 40).map((c) => { const [text, section] = c.key.split('|'); return { text, section, value: c.value }; });

  // ---- Heatmap dia da semana × hora ----
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  sessions.forEach((s) => { const d = new Date(new Date(s.started_at).getTime() + TZ_OFFSET_MS); heatmap[d.getUTCDay()][d.getUTCHours()]++; });

  // ---- Jornadas ----
  const evBySession = {};
  events.forEach((e) => (evBySession[e.session_id] ||= []).push(e));
  const wantAll = q.jornadas === 'todas';
  const journeys = sessions
    .filter((s) => wantAll || (s.wa_clicks || 0) > 0)
    .filter((s) => !q.botao || (evBySession[s.id] || []).some((e) => e.name === 'whatsapp_click' && (e.props.source === q.botao || e.props.label === q.botao)))
    .slice(0, 60)
    .map((s) => ({
      id: s.id, started_at: s.started_at, channel: s.channel, campaign: s.utm_campaign, content: s.utm_content, term: s.utm_term,
      device: s.device, browser: s.browser, os: s.os, city: s.city, region: s.region, returning: s.is_returning,
      duration_s: Math.round((s.duration_ms || 0) / 1000), max_scroll_pct: s.max_scroll_pct, wa_clicks: s.wa_clicks,
      trail: trail(evBySession[s.id] || []),
    }));

  return {
    range: { de: r.de, ate: r.ate, days: r.days }, origem: origem || 'todas',
    kpis: { current: cur, previous: prev },
    daily: Object.values(daily), channels, devices, browsers, os, cities, regions, consent, audience,
    wa_by_source, wa_by_label, wa_source_x_channel, sections, filters, faq, social, campaigns, clicks, heatmap, journeys,
    generated_at: new Date().toISOString(),
  };
}

function trail(evs) {
  const steps = [];
  evs.forEach((e) => {
    if (e.name === 'page_view') steps.push({ t: e.ts, kind: 'page', text: 'Entrou na página' });
    else if (e.name === 'section_view') steps.push({ t: e.ts, kind: 'section', text: SECTION_LABEL[e.props.section] || e.props.section });
    else if (e.name === 'whatsapp_click') steps.push({ t: e.ts, kind: 'wa', text: `WhatsApp: ${e.props.label || ''} (${e.props.source || ''})` });
    else if (e.name === 'collection_filter') steps.push({ t: e.ts, kind: 'action', text: `Filtro: ${e.props.filter}` });
    else if (e.name === 'faq_open') steps.push({ t: e.ts, kind: 'action', text: `FAQ: ${e.props.question}` });
    else if (e.name === 'social_click') steps.push({ t: e.ts, kind: 'action', text: `Instagram (${e.props.source || ''})` });
    else if (e.name === 'cookie_consent') steps.push({ t: e.ts, kind: 'action', text: e.props.consent_choice === 'accepted' ? 'Aceitou cookies' : 'Só o essencial' });
    else if (e.name === 'click' && e.props.text && !/wa\.me/.test(e.props.href || '')) steps.push({ t: e.ts, kind: 'click', text: `${e.props.text}${e.props.section ? ' · ' + e.props.section : ''}` });
    else if (e.name === 'page_leave') steps.push({ t: e.ts, kind: 'leave', text: `Saiu (${Math.round((e.props.duration_ms || 0) / 1000)} s, ${e.props.max_scroll_pct || 0}% da página)` });
  });
  return steps.slice(0, 40);
}

function pivot(arr, rowFn, colFn) {
  const rows = {};
  arr.forEach((x) => { const rk = rowFn(x), ck = colFn(x); rows[rk] ||= {}; rows[rk][ck] = (rows[rk][ck] || 0) + 1; });
  return Object.entries(rows).map(([row, cols]) => ({ row, cols })).sort((a, b) => sum(b.cols) - sum(a.cols));
}
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
const sessionById = (arr, id) => arr.find((s) => s.id === id);
function localDate(d) { return new Date(d.getTime() + TZ_OFFSET_MS).toISOString().slice(0, 10); }
function localStart(ymd) { return new Date(new Date(`${ymd}T00:00:00Z`).getTime() - TZ_OFFSET_MS); }
function addDays(ymd, n) { const d = new Date(`${ymd}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
