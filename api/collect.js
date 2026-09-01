// POST /api/collect — recebe lotes anônimos do coletor (js/tracker.js) e grava no Supabase.
// Sem IP, sem cookies. Cidade/região vêm dos cabeçalhos de geolocalização da Vercel.
import { configured, rpc, insert } from './_lib/db.js';
import { classifyChannel, parseUA, isBotUA } from './_lib/classify.js';

const EVENTS = new Set(['page_view', 'page_leave', 'click', 'whatsapp_click', 'social_click', 'collection_filter', 'faq_open', 'section_view', 'cookie_consent']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const str = (v, n = 160) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null);
const int = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : null);
const decode = (v) => { try { return v ? decodeURIComponent(v) : null; } catch { return v || null; } };

function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body) { try { return JSON.parse(req.body); } catch { return null; } }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!configured()) return res.status(204).end(); // sem banco configurado: descarta em silêncio
  const ua = req.headers['user-agent'] || '';
  if (isBotUA(ua)) return res.status(204).end();

  const body = parseBody(req);
  if (!body || !body.s || !UUID.test(body.s.id || '') || !Array.isArray(body.e) || body.e.length > 50) return res.status(400).end();
  const s = body.s;

  const session = {
    id: s.id.toLowerCase(),
    visitor_id: str(s.visitor_id, 64),
    consent: ['accepted', 'essential'].includes(s.consent) ? s.consent : null,
    duration_ms: int(s.duration_ms),
    max_scroll_pct: int(s.max_scroll_pct),
    wa_clicks: int(s.wa_clicks) || 0,
  };
  // Atribuição e ambiente só chegam no primeiro lote da sessão
  if (s.landing_path) {
    const attr = {
      landing_path: str(s.landing_path, 300),
      referrer_host: str(s.referrer_host, 120),
      utm_source: str(s.utm_source), utm_medium: str(s.utm_medium), utm_campaign: str(s.utm_campaign),
      utm_content: str(s.utm_content), utm_term: str(s.utm_term),
      gclid: Boolean(s.gclid),
    };
    Object.assign(session, attr, parseUA(ua), {
      channel: classifyChannel(attr),
      screen_w: int(s.screen_w), screen_h: int(s.screen_h),
      city: decode(req.headers['x-vercel-ip-city']), region: decode(req.headers['x-vercel-ip-country-region']),
      country: req.headers['x-vercel-ip-country'] || null,
      returning: Boolean(s.returning),
    });
  }

  const now = Date.now();
  const maxT = Math.max(0, ...body.e.map((e) => int(e.t) || 0));
  const rows = body.e
    .filter((e) => EVENTS.has(e.n))
    .map((e) => ({
      session_id: session.id,
      ts: new Date(now - (maxT - (int(e.t) || 0))).toISOString(),
      name: e.n,
      props: sanitize(e.p),
    }));

  try {
    await rpc('gaspar_upsert_session', { p: session });
    if (rows.length) await insert('gaspar_events', rows);
  } catch (err) {
    console.error('[collect]', err.message);
    return res.status(204).end(); // nunca quebra a página por causa de analytics
  }
  return res.status(204).end();
}

function sanitize(p) {
  if (!p || typeof p !== 'object') return {};
  const out = {};
  for (const [k, v] of Object.entries(p).slice(0, 12)) {
    if (!/^[a-z_]{1,32}$/.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 160);
    else if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.round(v);
    else if (typeof v === 'boolean' || v === null) out[k] = v;
  }
  return out;
}
