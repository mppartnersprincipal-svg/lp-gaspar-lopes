# Dashboard first-party da LP Gaspar Lopes

Painel de comportamento dos visitantes em **/dashboard**, no modelo do site da
Sólida: coleta **própria, anônima e sempre ativa** (independe do aceite de
cookies), gravada no Supabase, **sem tocar** no GTM/GA4/Ads (que seguem o
`gtm/TRACKING.md`).

## Como funciona

| Peça | Arquivo | O quê |
|---|---|---|
| Coletor | `js/tracker.js` | Sessão anônima em `sessionStorage` (renova após 30 min parado), id de visitante em `localStorage` por 13 meses (**apagado/omitido** para quem escolhe "Só o essencial"), fila com flush a cada 10 eventos / 5 s / aba oculta (`sendBeacon`). Sem IP, sem cookies. Não roda para bots nem no /dashboard. |
| Eventos | `js/tracker.js` + espelho em `js/main.js` | `page_view`, `page_leave` (tempo visível + rolagem máx.), `click` (nome do botão + seção + posição), e os mesmos do GTM: `whatsapp_click`, `social_click`, `collection_filter`, `faq_open`, `section_view`, `cookie_consent`. |
| Ingestão | `api/collect.js` (Vercel Function) | Valida, filtra bot, deriva dispositivo/navegador/SO do user-agent e cidade/UF dos cabeçalhos de geolocalização da Vercel. Grava via RPC + insert (service role). |
| Banco | `supabase/migrations/0001_gaspar_analytics.sql` | Tabelas `gaspar_sessions` / `gaspar_events` (+ RPC `gaspar_upsert_session`), RLS ligado sem policies (só a service role acessa). Projeto Supabase: `https://khipnjfbxjgvmjvyxero.supabase.co` (compartilhado com o site Sólida; prefixo `gaspar_` separa tudo). |
| Atribuição | `api/_lib/classify.js` | `gclid` → Google Ads; UTM/referrer → orgânico, Instagram, Meta, direto, indicação. Link aberto do painel do Ads ou UTM com `{keyword}` cru → direto (regra herdada da Sólida). |
| Login | `api/login.js` | Senha única (`DASHBOARD_PASSWORD`) → token HMAC 30 dias (`DASHBOARD_SECRET`). |
| Consulta | `api/dashboard.js` | KPIs com comparação de período, série diária, origens, dispositivos, WhatsApp por botão/rótulo + pivô por canal, funil de leitura, filtros/FAQ, campanhas UTM, jornadas com trilha, heatmap 7×24, geografia, cliques, consentimento, novo × recorrente, feed ao vivo. |
| UI | `dashboard/index.html` | Página única (Chart.js via CDN), filtros na URL, mesma identidade visual da LP. `noindex` + `robots.txt`. |

## Variáveis de ambiente (Vercel → Settings → Environment Variables)

| Variável | Onde conseguir |
|---|---|
| `SUPABASE_URL` | `https://khipnjfbxjgvmjvyxero.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com/dashboard → projeto → Project Settings → API keys → `service_role` (**secreta**, nunca no front) |
| `DASHBOARD_PASSWORD` | você define (mín. 8 caracteres) — é a senha da tela de login |
| `DASHBOARD_SECRET` | string aleatória longa (mín. 16), ex.: saída de `openssl rand -hex 24` |

Sem as duas primeiras, a coleta descarta em silêncio (a LP nunca quebra por
causa de analytics). Sem as duas últimas, o /dashboard responde 503 no login.

## Desenvolvimento local

```
cp .env.example .env.local   # e preencha
node scripts/dev-server.mjs  # http://localhost:4173 (site + /api + /dashboard)
```

## QA / redeploy

- Depois do deploy: abrir a LP, navegar/clicar, e conferir em /dashboard (período "Hoje").
- Sessões de teste podem ser apagadas com: `delete from gaspar_sessions where utm_content = 'qa-seed';`
- O deploy é o mesmo do site (repo → Vercel). `supabase/` e `gtm/` não são publicados (.vercelignore); a pasta `api/` vira Functions automaticamente.

## LGPD

- Coleta anônima e agregada: sem IP, sem cookies, sem identificadores pessoais.
- Quem escolhe "Só o essencial" no banner fica **sem** o id de visitante
  persistente (apenas a sessão anônima) — o card "Consentimento" do dashboard
  mostra a cobertura.
- Base: legítimo interesse para medição anônima + respeito à recusa. Recomenda-se
  publicar uma Política de Privacidade/Cookies simples (pendência do projeto).

## Mudar para um projeto Supabase próprio (quando houver plano pago)

Hoje as tabelas vivem no projeto `khipnjfbxjgvmjvyxero`, **compartilhado com o
site da Sólida** (o plano free permite só 2 projetos). A separação é por
prefixo: tudo do Gaspar começa com `gaspar_` e nada toca em
`analytics_sessions` / `analytics_events` / `posts` / `categories`, que são da
Sólida. RLS ligado sem policies nas duas famílias de tabelas: só a service role
lê e escreve, e cada site usa a sua própria API.

A troca para um projeto exclusivo é um caminho fechado, sem mexer no código:

1. Crie o projeto novo (região São Paulo) e abra o **SQL Editor**.
2. Cole e rode `supabase/migrations/0001_gaspar_analytics.sql` inteiro. Ele é
   idempotente (`create table if not exists`) e cria as duas tabelas, os
   índices, o RLS e a RPC `gaspar_upsert_session`.
3. **Mantenha o prefixo `gaspar_`.** Os nomes estão escritos em `api/collect.js`
   e `api/dashboard.js`; renomear as tabelas obrigaria a alterar o código.
4. Histórico (opcional). No projeto antigo, rode um `select * from
   public.gaspar_sessions` e outro em `public.gaspar_events` e use **Download
   CSV**; no projeto novo, importe pelo Table Editor. Importe **sessions antes
   de events** (há chave estrangeira) e, no fim, acerte a sequência:
   ```sql
   select setval(pg_get_serial_sequence('public.gaspar_events','id'),
                 coalesce(max(id), 1)) from public.gaspar_events;
   ```
5. Na Vercel, troque `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` pelos do
   projeto novo e faça **Redeploy**. `DASHBOARD_PASSWORD` e `DASHBOARD_SECRET`
   continuam iguais.
6. Confira o /dashboard no período "Hoje" e veja se chegam sessões novas.
7. **Só depois de confirmar**, limpe o projeto da Sólida:
   ```sql
   drop function if exists public.gaspar_upsert_session(jsonb);
   drop table if exists public.gaspar_events;
   drop table if exists public.gaspar_sessions;
   ```
   Nunca rode um `drop` sem o prefixo `gaspar_` nesse projeto.

Enquanto a mudança não acontece, não há risco de mistura: os dois sites gravam
em tabelas diferentes, com credenciais diferentes, e os painéis consultam
tabelas diferentes.
