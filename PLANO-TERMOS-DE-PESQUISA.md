# Plano: aba "Termos de pesquisa" no /dashboard

> Handoff escrito em 04/09/2026 pela sessão que subiu a campanha no Google Ads
> (projeto `Desktop/Google Ads Automate`). Esta LP não tem acesso à API do Ads,
> então o trabalho está dividido entre os dois projetos. Leia a seção
> "Divisão de trabalho" antes de começar.

## 1. Problema

O dashboard hoje mostra `utm_term`, que vem da campanha como `{keyword}`. O
ValueTrack `{keyword}` devolve **a palavra-chave que acionou o anúncio**, não o
que a pessoa digitou no Google. Exemplo real, medido na conta da M|P:

```
DIGITOU:      'empresas de marketing digital em fortaleza'
acionou a kw: 'agencia de marketing digital' (PHRASE)
```

O usuário quer ver o termo digitado. Isso **não pode** vir por UTM: o Google não
tem nenhum ValueTrack que devolva a busca do usuário (o Bing tem `{QueryString}`,
o Google nunca teve). Verificado na API v25 em 04/09/2026:

| Recurso | Traz o termo digitado? | Granularidade |
|---|---|---|
| ValueTrack na URL final | não existe parâmetro | por clique |
| `click_view` (por gclid) | não, só `keyword_info.text` | 1 linha por clique |
| `search_term_view` | **sim** | agregado por dia x grupo x keyword |

Conclusão: o único caminho é puxar `search_term_view` pela API do Google Ads e
gravar no mesmo Supabase que o dashboard já consulta.

### Limitações que precisam aparecer na interface

1. **Não dá para amarrar um termo a um lead específico.** O Google não expõe a
   query por clique. O máximo é "este lead veio da keyword X" (via `utm_term`)
   somado a "a keyword X recebeu estes termos naquele dia".
2. **O Google esconde termos de baixo volume** por privacidade. Numa campanha
   pequena, parte dos cliques nunca aparece em lugar nenhum, nem aqui nem no
   relatório nativo do Ads. Não é bug.

Colocar as duas como nota de rodapé do painel, para ninguém interpretar a soma
de cliques da aba como o total da campanha.

## 2. Contexto da campanha (já no ar, pausada)

| Item | Valor |
|---|---|
| Conta | Gaspar Lopes Alfaiataria, `6905000015` |
| MCC | `6039892603` |
| Campanha | `[MP] - [S] - Alfaiataria Goiania`, ID `24210343917` |
| Status | PAUSADA em 04/09/2026, aguardando ativação do usuário |
| Orçamento | R$ 30/dia, Maximizar conversões, só Rede de Pesquisa |
| Geo | Goiânia cidade, por presença |

Grupos e o `utm_content` de cada um (o `utm_content` é a chave que liga a sessão
do dashboard ao grupo do Ads):

| `utm_content` | Grupo no Ads | ID do grupo |
|---|---|---|
| `alfaiate-goiania` | Alfaiate Goiânia | 202776330631 |
| `alfaiataria-geral` | Alfaiataria geral | 202776330671 |
| `alfaiataria-masculina` | Alfaiataria masculina | 202776330711 |
| `alfaiataria-antiga` | Alfaiataria antiga | 202776330871 |
| `alfaiate-preco` | Preço | 202776330911 |

`utm_campaign` é sempre `mp-s-alfaiataria-goiania`.

**A campanha está pausada, então a tabela nasce vazia.** A aba precisa ter um
estado vazio decente ("sem dados no período"), não quebrar nem sumir.

## 3. Divisão de trabalho

| # | Tarefa | Quem faz |
|---|---|---|
| 1 | Migration `0002_gaspar_search_terms.sql` | **esta sessão (LP)** |
| 2 | Rodar a migration no Supabase | usuário, no SQL Editor |
| 3 | Puxador do `search_term_view` que escreve na tabela | sessão do projeto `Google Ads Automate` |
| 4 | Bloco `search_terms` no `api/dashboard.js` | **esta sessão (LP)** |
| 5 | Aba "Termos de pesquisa" no `dashboard/index.html` | **esta sessão (LP)** |
| 6 | Commit, push e verificação em produção | **esta sessão (LP)** |

O puxador fica no outro projeto de propósito: é lá que estão as credenciais do
Google Ads e a lib Python `google-ads`. Trazer a API do Ads para cá obrigaria a
refazer o OAuth em Node e guardar mais um segredo na Vercel, para nenhum ganho.
Esta LP só ganha um `select` a mais.

## 4. Tarefa 1: a migration

Criar `supabase/migrations/0002_gaspar_search_terms.sql` seguindo exatamente o
estilo do `0001`: `create table if not exists`, prefixo `gaspar_`, RLS ligado
sem policies, comentários em português explicando cada coluna.

```sql
create table if not exists public.gaspar_search_terms (
  date          date   not null,               -- dia do relatório (fuso da conta: America/Sao_Paulo)
  campaign_id   bigint not null,
  campaign_name text,
  ad_group_id   bigint not null,
  ad_group_name text,                          -- casa com o utm_content pela tabela da seção 2
  search_term   text   not null,               -- O QUE A PESSOA DIGITOU
  keyword_text  text   not null default '',    -- a palavra-chave que acionou
  match_type    text,                          -- EXACT | PHRASE | BROAD | NEAR_EXACT | NEAR_PHRASE
  status        text,                          -- ADDED | EXCLUDED | ADDED_EXCLUDED | NONE
  impressions   int    not null default 0,
  clicks        int    not null default 0,
  cost_micros   bigint not null default 0,     -- dividir por 1e6 para reais
  conversions   numeric(12,2) not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (date, campaign_id, ad_group_id, search_term, keyword_text)
);

create index if not exists gaspar_search_terms_date_idx
  on public.gaspar_search_terms (date desc);
create index if not exists gaspar_search_terms_campaign_date_idx
  on public.gaspar_search_terms (campaign_id, date desc);

alter table public.gaspar_search_terms enable row level security;
-- Sem policies: igual às outras tabelas, só a service role acessa.
```

Por que a PK é composta: o puxador reescreve os últimos N dias a cada execução.
Com essa chave o upsert é idempotente e qualquer buraco de dias sem rodar se
conserta sozinho na próxima execução.

`keyword_text` tem `default ''` porque coluna de PK não aceita `null` e o Google
às vezes devolve o termo sem keyword associada.

**Atenção, é o mesmo Supabase da Sólida.** Projeto `khipnjfbxjgvmjvyxero`,
compartilhado porque o plano free só permite 2 projetos. Regra do
`DASHBOARD.md`: tudo do Gaspar começa com `gaspar_` e nada toca em
`analytics_sessions`, `analytics_events`, `posts` ou `categories`. Nunca rodar
`drop` sem o prefixo nesse projeto.

## 5. Tarefa 3: contrato com o puxador (não implementar aqui)

Só para saber o que vai chegar na tabela. O puxador roda no outro projeto, em
Python, e grava via PostgREST com a service role:

```
POST {SUPABASE_URL}/rest/v1/gaspar_search_terms
     ?on_conflict=date,campaign_id,ad_group_id,search_term,keyword_text
Prefer: resolution=merge-duplicates,return=minimal
```

A GAQL de origem, já testada e funcionando:

```sql
SELECT segments.date, campaign.id, campaign.name, ad_group.id, ad_group.name,
       search_term_view.search_term, search_term_view.status,
       segments.keyword.info.text, segments.keyword.info.match_type,
       metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_30_DAYS
  AND campaign.id = 24210343917
```

Observação: `LAST_90_DAYS` **não** é um literal válido nessa versão da API. Os
que funcionam são `LAST_7_DAYS`, `LAST_14_DAYS`, `LAST_30_DAYS` ou um
`BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'`.

## 6. Tarefa 4: `api/dashboard.js`

Acrescentar um bloco `search_terms` no payload de `report(q)`, respeitando o
recorte de datas que já existe em `range(q)`.

- Ler com o `selectAll` de `api/_lib/db.js`, que já pagina de 1000 em 1000:
  ```js
  selectAll('gaspar_search_terms',
    `select=*&date=gte.${r.de}&date=lte.${r.ate}&order=clicks.desc`)
  ```
  Aqui o filtro é por `date` (tipo `date`), não pelo `started_at` em ISO usado
  nas sessões. Não reaproveitar `r.from`/`r.to`.
- Agregar por `search_term` somando `impressions`, `clicks`, `cost_micros` e
  `conversions`, guardando quais keywords acionaram aquele termo.
- Devolver também um total do período, para a interface conseguir mostrar
  "N termos, X cliques" e calcular participação.
- Formato sugerido:
  ```js
  search_terms: {
    total: { terms: 42, clicks: 87, cost: 261.4, conversions: 3 },
    rows: [{ term, clicks, impressions, cost, conversions, ctr,
             keywords: [{ text, match_type }], ad_groups: ['Preço'], status }]
  }
  ```
- Converter `cost_micros` para reais aqui no servidor (`/1e6`), como o resto do
  arquivo já faz com valores.
- O filtro `origem` do dashboard é por canal de sessão e **não** se aplica a esta
  tabela (os dados vêm do Ads, não da coleta). Ignorar `origem` neste bloco e
  deixar claro na interface que a aba é sempre "Google Ads".
- Se a tabela ainda não existir (migration não rodada), o PostgREST devolve erro
  e o `handler` inteiro cai no 500, derrubando o dashboard todo. Envolver essa
  consulta num `try/catch` próprio que devolve `{ total: null, rows: [] }`.

## 7. Tarefa 5: `dashboard/index.html`

Nova seção "Termos de pesquisa", na mesma identidade visual das outras.

- Tabela ordenável: termo digitado, keyword que acionou, correspondência,
  impressões, cliques, CTR, custo, conversões.
- Marcar visualmente o `status`: `ADDED` (já é keyword), `EXCLUDED` (já é
  negativa), `NONE` (nem uma coisa nem outra, é onde mora o trabalho de garimpo).
- Campo de busca por texto e filtro por grupo de anúncios.
- Estado vazio explícito, porque a campanha está pausada. Sugestão de texto:
  "Sem termos no período. Os dados aparecem depois que a campanha começar a
  receber cliques."
- As duas limitações da seção 1 como nota de rodapé do bloco.

Regras de copy do projeto (do `CLAUDE.md`): **sem travessões em nenhuma copy
visível** e contraste AA. Verificar em 360/390/768/1440 com o browse headless
antes de entregar, como o resto do projeto.

## 8. Como testar sem campanha rodando

A campanha está pausada, então não haverá dado real. Para validar a ponta a
ponta, inserir algumas linhas na mão no SQL Editor e apagar depois:

```sql
insert into public.gaspar_search_terms
  (date, campaign_id, campaign_name, ad_group_id, ad_group_name,
   search_term, keyword_text, match_type, status, impressions, clicks, cost_micros, conversions)
values
  (current_date, 24210343917, '[MP] - [S] - Alfaiataria Goiania', 202776330911, 'Preço',
   'quanto custa um terno sob medida em goiania', 'alfaiate preço', 'PHRASE', 'NONE', 12, 3, 8400000, 1),
  (current_date, 24210343917, '[MP] - [S] - Alfaiataria Goiania', 202776330631, 'Alfaiate Goiânia',
   'alfaiate no setor sul', 'alfaiate goiania', 'PHRASE', 'NONE', 7, 2, 5100000, 0);

-- limpeza depois do QA:
-- delete from public.gaspar_search_terms where campaign_id = 24210343917 and clicks in (2,3);
```

O projeto já tem a convenção de marcar dado de teste (`utm_content = 'qa-seed'`
nas sessões). Aqui não existe coluna equivalente, então apagar por data e valor,
ou fazer o QA antes de o puxador rodar pela primeira vez.

## 9. Pendências que ficam com o usuário

1. **Chave `service_role` do Supabase** para o puxador escrever. Não existe
   `.env.local` nesta pasta. Ela está em Supabase, Project Settings, API keys,
   `service_role`, e também nas variáveis da Vercel. Vai no `.env` do projeto
   `Google Ads Automate` (que já é gitignored), junto com
   `SUPABASE_URL=https://khipnjfbxjgvmjvyxero.supabase.co`. Não precisa de env
   nova na Vercel: a LP só lê a tabela, com as credenciais que já tem.
2. **Rodar a migration** no SQL Editor do Supabase.
3. **Ativar a campanha** no Google Ads. Sem isso a aba fica vazia para sempre.
4. **Frequência do puxador**: manual, ou tarefa agendada no Windows. Como ele
   reescreve os últimos N dias a cada execução, não existe problema em rodar
   com intervalo irregular.

## 10. Cuidados

- **Resolvido em 08/09/2026, com o usuário**: `gtm/UTMS-CAMPANHAS.md` teve a
  deleção commitada (o arquivo vive agora no projeto do Ads) e
  `politica-de-privacidade.html` foi publicado, com link no rodapé e no banner
  de cookies.
- Não mexer em `js/tracker.js`. Foi avaliada e **descartada** a ideia de guardar
  o `gclid` completo (hoje ele é gravado como booleano). Guardar o gclid inteiro
  contraria o anonimato que a LP anuncia no banner de cookies e no próprio
  código, e não traria o termo digitado de qualquer forma. Se um dia o objetivo
  for importar conversão offline para o Ads, aí a conversa é outra e precisa de
  decisão explícita do usuário.
