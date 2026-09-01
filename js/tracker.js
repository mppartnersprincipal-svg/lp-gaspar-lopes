/* ============================================================================
 * Coletor first-party da LP Gaspar Lopes (dashboard /dashboard)
 * - Anônimo: sem IP, sem cookies; sessão em sessionStorage (renova após 30 min parado);
 *   id de visitante persistente (localStorage, 13 meses) SÓ se o visitante não
 *   escolheu "Só o essencial" no banner de cookies.
 * - Independente do GTM/GA4/Ads: não altera nada no container.
 * - Não roda para bots (navigator.webdriver / UA) nem na página /dashboard.
 * - Fila com flush a cada 10 eventos / 5 s / aba oculta / pagehide (sendBeacon).
 *
 * Eventos próprios: page_view {sw, sh, ref_host}, page_leave {duration_ms (tempo
 * VISÍVEL), max_scroll_pct}, click {tag, text, href, track, section, x_pct, y_pct}.
 * Os eventos do dataLayer (whatsapp_click, social_click, collection_filter,
 * faq_open, section_view, cookie_consent) chegam por window.glCollect(name, props).
 * ========================================================================== */
(function () {
  'use strict';
  if (/\/dashboard/.test(location.pathname)) return;
  if (navigator.webdriver) return;
  if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp/i.test(navigator.userAgent)) return;

  var ENDPOINT = '/api/collect';
  var SESSION_KEY = 'gl-s';
  var VISITOR_KEY = 'gl-v';
  var CONSENT_KEY = 'gl-consent';
  var IDLE_MS = 30 * 60 * 1000;
  var VISITOR_TTL = 13 * 30 * 24 * 60 * 60 * 1000;

  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  function store(kind) { try { return kind === 'local' ? localStorage : sessionStorage; } catch (e) { return null; } }
  function get(kind, k) { var s = store(kind); try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(kind, k, v) { var s = store(kind); try { if (s) s.setItem(k, v); } catch (e) {} }
  function del(kind, k) { var s = store(kind); try { if (s) s.removeItem(k); } catch (e) {} }

  // ---- consentimento (decisão do banner) ----
  function consent() { return get('local', CONSENT_KEY); }

  // ---- visitante persistente (novo × recorrente) ----
  var isReturning = false;
  function visitorId() {
    if (consent() === 'essential') { del('local', VISITOR_KEY); return null; }
    var raw = get('local', VISITOR_KEY);
    if (raw) {
      try {
        var v = JSON.parse(raw);
        if (v && v.id && (Date.now() - v.at) < VISITOR_TTL) { isReturning = true; set('local', VISITOR_KEY, JSON.stringify({ id: v.id, at: Date.now() })); return v.id; }
      } catch (e) {}
    }
    var id = uuid();
    set('local', VISITOR_KEY, JSON.stringify({ id: id, at: Date.now() }));
    return id;
  }

  // ---- sessão ----
  var isNewSession = false;
  function sessionId() {
    var raw = get('session', SESSION_KEY);
    if (raw) {
      try { var s = JSON.parse(raw); if (s && s.id && (Date.now() - s.at) < IDLE_MS) { set('session', SESSION_KEY, JSON.stringify({ id: s.id, at: Date.now() })); return s.id; } } catch (e) {}
    }
    isNewSession = true;
    var id = uuid();
    set('session', SESSION_KEY, JSON.stringify({ id: id, at: Date.now() }));
    return id;
  }
  var SID = sessionId();
  var VID = visitorId();

  // ---- atribuição ----
  var q = new URLSearchParams(location.search);
  var refHost = '';
  try { refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) {}
  function utm(k) { var v = q.get(k); return v ? v.slice(0, 120) : null; }
  var session = {
    id: SID,
    visitor_id: VID,
    landing_path: location.pathname + (location.search ? location.search : ''),
    referrer_host: refHost || null,
    utm_source: utm('utm_source'), utm_medium: utm('utm_medium'), utm_campaign: utm('utm_campaign'),
    utm_content: utm('utm_content'), utm_term: utm('utm_term'),
    gclid: q.has('gclid') || q.has('gbraid') || q.has('wbraid'),
    screen_w: screen.width, screen_h: screen.height,
    consent: consent(),
    returning: isReturning
  };
  // Só a primeira página da sessão carrega atribuição (evita sobrescrever com refresh)
  if (!isNewSession) { ['landing_path', 'referrer_host', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) { delete session[k]; }); session.gclid = false; }

  // ---- fila ----
  var queue = [];
  var timer = null;
  var t0 = performance.now();
  function send(useBeacon) {
    if (!queue.length) return;
    var batch = queue.splice(0, queue.length);
    var body = JSON.stringify({ s: session, e: batch });
    session = { id: SID, visitor_id: VID, consent: consent() }; // lotes seguintes só atualizam
    if (useBeacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }))) return; } catch (e) {}
    }
    try { fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: body, keepalive: true }); } catch (e) {}
  }
  function schedule() { if (!timer) timer = setTimeout(function () { timer = null; send(false); }, 5000); }
  function track(name, props) {
    queue.push({ n: name, t: Math.round(performance.now() - t0), p: props || {} });
    if (name === 'whatsapp_click') session.wa_clicks = (session.wa_clicks || 0) + 1;
    if (queue.length >= 10) send(false); else schedule();
  }
  window.glCollect = function (name, props) { if (name && name !== 'page_view') track(name, props); };

  // ---- page_view ----
  track('page_view', { sw: innerWidth, sh: innerHeight, ref_host: refHost || null });

  // ---- tempo visível + scroll ----
  var visibleMs = 0, lastVisible = document.visibilityState === 'visible' ? Date.now() : null;
  var maxScroll = 0;
  function scrollPct() {
    var h = document.documentElement.scrollHeight - innerHeight;
    return h > 0 ? Math.min(100, Math.round((scrollY / h) * 100)) : 100;
  }
  addEventListener('scroll', function () { var p = scrollPct(); if (p > maxScroll) maxScroll = p; }, { passive: true });
  function accumulate() { if (lastVisible !== null) { visibleMs += Date.now() - lastVisible; lastVisible = null; } }
  var leaveSent = false;
  function leave(final) {
    accumulate();
    if (maxScroll === 0) maxScroll = scrollPct();
    if (!leaveSent || final) {
      queue.push({ n: 'page_leave', t: Math.round(performance.now() - t0), p: { duration_ms: visibleMs, max_scroll_pct: maxScroll } });
      leaveSent = true;
      session.duration_ms = visibleMs; session.max_scroll_pct = maxScroll;
    }
    send(true);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { leave(false); }
    else { lastVisible = Date.now(); leaveSent = false; }
  });
  addEventListener('pagehide', function () { leave(true); });

  // ---- cliques genéricos (com nome do botão e de onde veio) ----
  function hrefKind(a) {
    var href = a.getAttribute('href') || '';
    if (/wa\.me|api\.whatsapp\.com/.test(href)) return 'wa.me';
    if (/^tel:/.test(href)) return 'tel:';
    if (/^mailto:/.test(href)) return 'mailto:';
    if (/^#/.test(href)) return href;
    try { var u = new URL(href, location.href); return u.host === location.host ? (u.pathname + u.hash) : u.hostname; } catch (e) { return href.slice(0, 80); }
  }
  function sectionOf(el) {
    if (el.closest('.wa-float')) return 'flutuante';
    if (el.closest('.header')) return 'header';
    if (el.closest('.footer')) return 'footer';
    if (el.closest('.cookie-bar')) return 'cookies';
    var sec = el.closest('section');
    if (!sec) return '';
    return sec.id || (sec.classList.contains('hero') ? 'hero' : sec.classList.contains('final-cta') ? 'cta-final' : '');
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('a,button,[role=button],[data-track],input[type=submit],summary');
    if (!el) return;
    var text = (el.getAttribute('data-track') || el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
    var piece = el.closest('.piece'); var h3 = piece && piece.querySelector('h3');
    if (h3) text = h3.textContent.trim();
    var p = { tag: el.tagName.toLowerCase(), text: text, section: sectionOf(el), x_pct: Math.round(e.clientX / innerWidth * 100), y_pct: Math.round(e.clientY / innerHeight * 100) };
    if (el.tagName === 'A') p.href = hrefKind(el);
    if (el.getAttribute('data-filter')) p.track = 'filtro: ' + el.getAttribute('data-filter');
    track('click', p);
  }, true);
})();
