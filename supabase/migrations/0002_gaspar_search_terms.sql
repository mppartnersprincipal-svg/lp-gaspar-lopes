-- Termos de pesquisa do Google Ads (relatório search_term_view) da LP Gaspar Lopes
-- O que a pessoa realmente digitou no Google. Não vem por UTM: o ValueTrack {keyword}
-- devolve a palavra-chave que acionou o anúncio, não a busca do usuário.
-- Escrita: puxador em Python do projeto "Google Ads Automate", via PostgREST com a service role.
-- Leitura: /api/dashboard (aba "Termos de pesquisa").
-- Acesso só pela service role. RLS ligado sem policies = bloqueado para anon.

create table if not exists public.gaspar_search_terms (
  date          date   not null,                    -- dia do relatório (fuso da conta: America/Sao_Paulo)
  campaign_id   bigint not null,
  campaign_name text,
  ad_group_id   bigint not null,
  ad_group_name text,                               -- casa com o utm_content das sessões (1 grupo = 1 utm_content)
  search_term   text   not null,                    -- O QUE A PESSOA DIGITOU
  keyword_text  text   not null default '',         -- a palavra-chave que acionou; '' porque coluna de PK não aceita null
  match_type    text,                               -- EXACT | PHRASE | BROAD | NEAR_EXACT | NEAR_PHRASE
  status        text,                               -- ADDED | EXCLUDED | ADDED_EXCLUDED | NONE
  impressions   int    not null default 0,
  clicks        int    not null default 0,
  cost_micros   bigint not null default 0,          -- dividir por 1e6 para reais
  conversions   numeric(12,2) not null default 0,
  updated_at    timestamptz not null default now(),
  -- PK composta: o puxador reescreve os últimos N dias a cada execução, então o upsert
  -- é idempotente e dias sem rodar se consertam sozinhos na execução seguinte.
  primary key (date, campaign_id, ad_group_id, search_term, keyword_text)
);

create index if not exists gaspar_search_terms_date_idx
  on public.gaspar_search_terms (date desc);
create index if not exists gaspar_search_terms_campaign_date_idx
  on public.gaspar_search_terms (campaign_id, date desc);

alter table public.gaspar_search_terms enable row level security;
-- Sem policies: igual às outras tabelas, só a service role acessa.
