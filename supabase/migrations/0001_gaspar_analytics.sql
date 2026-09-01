-- Dashboard first-party da LP Gaspar Lopes
-- Coleta anônima: sem IP, sem cookie de terceiros, sem dados pessoais.
-- Acesso só pela service role (API na Vercel). RLS ligado sem policies = bloqueado para anon.

create table if not exists public.gaspar_sessions (
  id              uuid primary key,                 -- gerado no navegador (sessionStorage, renova após 30 min parado)
  visitor_id      text,                             -- id aleatório persistente (localStorage, 13 meses); null se "Só o essencial"
  started_at      timestamptz not null default now(),
  last_seen_at    timestamptz not null default now(),
  landing_path    text,
  referrer_host   text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  utm_content     text,
  utm_term        text,
  gclid           boolean not null default false,
  channel         text,                             -- google_ads | google_organic | instagram | meta_ads | facebook | direct | referral | other
  device          text,                             -- mobile | tablet | desktop
  browser         text,
  os              text,
  screen_w        int,
  screen_h        int,
  city            text,                             -- cabeçalhos de geolocalização da Vercel (sem IP)
  region          text,
  country         text,
  consent         text,                             -- accepted | essential | null (não respondeu)
  is_returning    boolean not null default false,
  duration_ms     int,
  max_scroll_pct  int,
  wa_clicks       int not null default 0
);

create table if not exists public.gaspar_events (
  id          bigserial primary key,
  session_id  uuid not null references public.gaspar_sessions(id) on delete cascade,
  ts          timestamptz not null default now(),
  name        text not null,                        -- page_view | page_leave | click | whatsapp_click | social_click | collection_filter | faq_open | section_view | cookie_consent
  props       jsonb not null default '{}'::jsonb
);

create index if not exists gaspar_sessions_started_at_idx on public.gaspar_sessions (started_at desc);
create index if not exists gaspar_sessions_channel_idx    on public.gaspar_sessions (channel);
create index if not exists gaspar_events_session_idx      on public.gaspar_events (session_id);
create index if not exists gaspar_events_ts_idx           on public.gaspar_events (ts desc);
create index if not exists gaspar_events_name_idx         on public.gaspar_events (name);

alter table public.gaspar_sessions enable row level security;
alter table public.gaspar_events   enable row level security;
-- Sem policies: anon/authenticated não leem nem escrevem. A API usa a service role.

-- Upsert de sessão chamado pela API (/api/collect)
create or replace function public.gaspar_upsert_session(p jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gaspar_sessions as s (
    id, visitor_id, landing_path, referrer_host,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term, gclid, channel,
    device, browser, os, screen_w, screen_h, city, region, country, consent, is_returning,
    duration_ms, max_scroll_pct, wa_clicks
  ) values (
    (p->>'id')::uuid, p->>'visitor_id', p->>'landing_path', p->>'referrer_host',
    p->>'utm_source', p->>'utm_medium', p->>'utm_campaign', p->>'utm_content', p->>'utm_term',
    coalesce((p->>'gclid')::boolean, false), p->>'channel',
    p->>'device', p->>'browser', p->>'os', (p->>'screen_w')::int, (p->>'screen_h')::int,
    p->>'city', p->>'region', p->>'country', p->>'consent', coalesce((p->>'returning')::boolean, false),
    (p->>'duration_ms')::int, (p->>'max_scroll_pct')::int, coalesce((p->>'wa_clicks')::int, 0)
  )
  on conflict (id) do update set
    last_seen_at   = now(),
    visitor_id     = coalesce(excluded.visitor_id, s.visitor_id),
    consent        = coalesce(excluded.consent, s.consent),
    duration_ms    = greatest(coalesce(excluded.duration_ms, 0), coalesce(s.duration_ms, 0)),
    max_scroll_pct = greatest(coalesce(excluded.max_scroll_pct, 0), coalesce(s.max_scroll_pct, 0)),
    wa_clicks      = s.wa_clicks + coalesce(excluded.wa_clicks, 0);
end;
$$;

revoke all on function public.gaspar_upsert_session(jsonb) from public, anon, authenticated;
