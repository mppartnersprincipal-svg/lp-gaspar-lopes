# LP Gaspar Lopes — contexto do projeto

Landing page de conversão da **Gaspar Lopes Alfaiataria** (alfaiataria sob medida, Setor Sul, Goiânia/GO), cliente da **M|P Assessoria**. Objetivo único: gerar conversas no **WhatsApp**. Briefing e copy oficiais: `PRD-LP-Gaspar-Lopes.md`.

## Regras inegociáveis
1. **NUNCA inventar dado factual.** Tudo vem do PRD. `[PREENCHER]` fica como placeholder (visível ou comentado) — nunca preencher com suposição.
2. Mobile-first (360–1440px), carregamento ≤ 3s, todo CTA → WhatsApp.
3. **Visual: usar SÓ A PALETA** do `Design System Gaspar Lopes/tokens/colors.css` (decisão do usuário — o resto do DS foi descartado: sem os botões/ícones/tipos do DS).

## Stack e estrutura
- HTML/CSS/JS puro, zero frameworks. `index.html` (CSS crítico inline) + `css/style.css` + `js/main.js` (interações) + `js/tracker.js` (coletor first-party).
- Imagens: WebP+JPG responsivos gerados por `scripts/optimize-images.mjs` (sharp; `npm run images`; aplica rotação EXIF — as fotos do Gaspar têm orientação EXIF). Originais em `Fotos Gaspar/` (518MB, fora do git), `Fotos - Produtos/`, `Logo/`.
- Dev local: `node scripts/dev-server.mjs` → http://localhost:4173 (site + `/api/*` + `/dashboard`; lê `.env.local`).
- Repo: `github.com/mppartnersprincipal-svg/lp-gaspar-lopes` (main). Deploy: **Vercel** (estático + Functions em `api/`; `vercel.json` sem build/install; `.vercelignore` mantém PRD/DS/fotos/gtm/supabase/CLAUDE.md fora do site publicado).

## Design (aprovado pelo usuário após iterações)
- Escuro premium: fundos `#0C0F14`/`#11151C`, navys `#33436E/#16305F/#0A2453/#071736`, off-white `#F2F4F8`, hairlines `rgba(255,255,255,.10/.24)`.
- Display **Cormorant Garamond** (caixa mista, itálico como acento), apoio **Jost** 300/400/500.
- **Botões: pílula "liquid glass"** (translúcido + blur + brilho interno + reflexo no hover). Filtros e WA float idem.
- Sem travessões (—) em NENHUMA copy visível (pedido do usuário); ícone oficial do WhatsApp (nunca balão genérico).
- Animações vanilla: scroll-reveal com stagger, marquee infinito, hover zoom, carrosséis com autoplay (respeitam `prefers-reduced-motion`).

## Seções (ordem)
Header fixo (transparente→sólido) · Hero full-bleed (foto ROD02606) · Marquee · Por que sob medida (3 pilares, ícones) · Faixa punho bordado · Vitrine 6 categorias do PRD (cards clicáveis→WhatsApp) · **Coleção** (12 peças, filtros por categoria, nomes = nomes dos arquivos do cliente) · Comece pelo WhatsApp (3 passos, só copy existente) · Investimento (**SEM preços** — decisão do usuário; versão com preços comentada) · Quem faz (carrossel 4 retratos) · Destaques (carrossel 10 peças) · FAQ (accordion) · CTA final · Footer 3 colunas · WA float · Banner de cookies.
**Ocultas (comentadas) até dados reais**: Como funciona (processo do atelier), Depoimentos, 2 FAQs (prazo / presencial), história do Gaspar (fonte: revista).

## Dados reais já aplicados
- Endereço: Rua 104, 234, Setor Sul, Goiânia, GO, CEP 74083-300 (footer `<address>`, JSON-LD, llms.txt).
- Instagram: https://www.instagram.com/gasparlopess/ (footer + `sameAs`).

## SEO / GEO (feito)
Head completo (canonical, robots, OG absoluto, Twitter, preload LCP, theme-color), favicons do monograma GL, `site.webmanifest`, JSON-LD (`LocalBusiness+ClothingStore` + `WebSite` + `WebPage` speakable + `FAQPage`), `robots.txt` (libera GPTBot/ClaudeBot/PerplexityBot etc.), `sitemap.xml`, `llms.txt`.

## Trackeamento (feito no código; contas pendentes do usuário)
- **GTM + Consent Mode v2** (modo avançado: gtm.js carrega sempre, consent default=denied, banner Aceitar/Só o essencial, escolha em `localStorage gl-consent`). O gtm.js só carrega quando o ID não contiver "PREENCHER".
- Eventos dataLayer (catálogo em `js/main.js` e `gtm/TRACKING.md`): `whatsapp_click`{source,label,page} = **conversão principal**, `social_click`, `collection_filter`, `faq_open`, `section_view`, `cookie_consent`.
- Container importável: `gtm/gtm-container-gaspar-lopes.json` (12 tags/10 gatilhos/11 variáveis; gerado por `gtm/gen-container.mjs` — **não editar o JSON à mão**). Guia completo: `gtm/TRACKING.md`.
- **Dashboard first-party `/dashboard`** (modelo Sólida, decisão do usuário): coletor anônimo sempre ativo (sem IP/cookies; visitante persistente 13 meses EXCETO "Só o essencial"), `api/collect|login|dashboard.js` (zero deps, fetch→PostgREST), UI com Chart.js. Detalhes: `DASHBOARD.md`.
- **Supabase**: projeto COMPARTILHADO com a Sólida `khipnjfbxjgvmjvyxero` (https://khipnjfbxjgvmjvyxero.supabase.co) — o plano free não permitiu projeto novo (limite 2). Tabelas `gaspar_sessions`/`gaspar_events` + RPC `gaspar_upsert_session` (migration aplicada 01/09/2026; RLS on sem policies; NÃO tocar nas tabelas `analytics_*`/`posts`/`categories` da Sólida). Coluna `is_returning` (não `returning` — palavra reservada).

## Pendências (donas do usuário/Marcos)
| # | O quê | Onde |
|---|---|---|
| ~~1~~ | ~~Número WhatsApp~~ **FEITO 01/09/2026**: (62) 99998-1896 aplicado em todos os CTAs (`wa.me/5562999981896`), footer, JSON-LD (`telephone`) e llms.txt | — |
| ~~2~~ | ~~ID do GTM~~ **FEITO 02/09/2026**: `GTM-5H43TLN7` aplicado (head + noscript) | — |
| ~~3~~ | ~~Domínio real~~ **FEITO 02/09/2026**: https://www.gasparlopesalfaiataria.com.br aplicado no código (SITE_HOST=gasparlopesalfaiataria.com.br); DNS no Registro.br apontado pelo usuário; reimportar container GTM se já tinha sido importado antes | — |
| 4 | Env na Vercel: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DASHBOARD_PASSWORD`, `DASHBOARD_SECRET` | ver DASHBOARD.md / .env.example |
| ~~5~~ | ~~GA4/Ads/container~~ **FEITO 02/09/2026**: GA4 `G-NSFXD61147` (dimensões criadas), conversão Ads `AW-17013001775` rótulo `jp8ZCLLI4ewcEK-ct7A_`, container importado, preenchido e PUBLICADO; verificado no site real (page_view/section_view no GA4, ping de conversão e remarketing no Ads). Falta só: marcar `whatsapp_click` como evento-chave no GA4 em 24-48h | — |
| 6 | História do Gaspar (revista), processo do atelier, prazo, depoimentos, presencial? | seções comentadas |
| 7 | **Campanhas Google Ads: quando o usuário trouxer os nomes, gerar URLs finais com UTM manual por grupo/anúncio** — padrão `utm_source=google&utm_medium=cpc&utm_campaign=<campanha>&utm_content=<grupo-ou-anuncio>&utm_term={keyword}`, slugs sem acento/espaço; gclid ligado; NUNCA propor sufixo de conta (mesmo combinado da Sólida) | — |

## Convenções de trabalho com este usuário
- Ele aprova por etapas; commits/push no repo são o fluxo normal (Vercel deploya do main). Mensagens de commit em PT.
- Verificar sempre em 360/390/768/1440 com o browse headless antes de entregar; sem travessões na copy; contraste AA.
- QA de coleta: sessões de teste marcadas `utm_content='qa-seed'` e apagadas ao final.
