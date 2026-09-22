# Trackeamento da LP Gaspar Lopes: GTM + GA4 + Google Ads + Pixel da Meta

Guia passo a passo para medir tudo que acontece na landing page usando o
Google Tag Manager. O site já empurra os eventos para o `dataLayer`
(código em `js/main.js`, bloco "Tracking"). O que falta é só configuração
nas contas Google e o preenchimento de 2 placeholders no código.

---

## 0. O que o site envia (catálogo de eventos)

| Evento (`dataLayer`) | Quando dispara | Parâmetros | Uso |
|---|---|---|---|
| `whatsapp_click` | Clique em QUALQUER link `wa.me` | `source` (header, hero, pecas, colecao, comecar, investimento, autoridade, cta-final, footer, flutuante), `label` (texto do botão ou categoria da peça, ex.: "Camisas"), `page` | **Conversão principal** no Ads + evento-chave no GA4 |
| `social_click` | Clique no Instagram (footer) | `network` = instagram, `source`, `page` | GA4 |
| `collection_filter` | Clique num filtro da Coleção | `filter` (todas, ternos, paletos, camisas, calcas, especiais) | GA4 (interesse por categoria) |
| `faq_open` | Abriu uma pergunta do FAQ | `question` | GA4 (objeções) |
| `section_view` | Seção ficou 40% visível (1x por seção) | `section` (hero, sob-medida, pecas, colecao, comecar, investimento, autoridade, faq, cta-final) | GA4 (funil de leitura) |
| `cookie_consent` | Clique no banner de cookies | `consent_choice` = `accepted` \| `essential` | Taxa de aceite |

Além desses, o container adiciona sem código: **page_view** (Google Tag),
**scroll depth** (25/50/75/90%) e **cliques de saída** (`click_outbound`,
excluindo wa.me e Instagram, que já têm evento próprio).

**LGPD / Consent Mode v2 (modo avançado):** o GTM carrega sempre, mas com
`consent default = denied` para `ad_storage`, `ad_user_data`,
`ad_personalization` e `analytics_storage`. Enquanto o visitante não aceita,
as tags Google funcionam **sem cookies** (pings anônimos, e o Google modela as
conversões). Ao clicar **Aceitar**, o site envia `consent update = granted`
e a escolha fica salva em `localStorage` (`gl-consent`). "Só o essencial"
mantém o modo sem cookies. Isso difere da Sólida (lá nada carregava antes do
aceite); para o mesmo comportamento estrito, basta condicionar o carregamento
do gtm.js ao aceite no bloco de tracking do `index.html`.

---

## 1. Preencher os placeholders no código

| Onde | O quê |
|---|---|
| `index.html`, bloco "Tracking" no `<head>` e `<noscript>` logo após `<body>` | `GTM-PREENCHER` → ID real do container (2 lugares). Enquanto o ID contiver "PREENCHER" o script não carrega, de propósito. |
| `gtm/gen-container.mjs` (`SITE_HOST`) | domínio real, para o gatilho de "clique de saída" não contar links internos. Regenerar o JSON depois. |

---

## 2. Google Tag Manager: criar o container

1. [tagmanager.google.com](https://tagmanager.google.com) → **Criar conta** (ou usar a conta da M|P) → Container **"LP Gaspar Lopes"**, plataforma **Web**.
2. Copie o ID `GTM-XXXXXXX` e coloque no `index.html` (item 1). Faça deploy.

---

## 3. Google Analytics 4

1. [analytics.google.com](https://analytics.google.com) → **Administrador → Criar → Propriedade**
   - Nome: `Gaspar Lopes Alfaiataria`; fuso `Brasil (GMT-3)`; moeda `BRL`
   - Categoria: Compras / Vestuário; tamanho: pequena
2. **Fluxo de dados → Web** → URL do site, nome `LP`
   - Na **Medição aprimorada**, desligue **Rolagem** e **Cliques de saída** (já vêm pelo GTM; evitar duplicar). Deixe o resto ligado.
3. Copie o **ID de medição** (`G-XXXXXXXXXX`).
4. **Administrador → Coleta e modificação de dados → Coleta de dados** → ativar **Sinais do Google**.
5. **Retenção de dados** → 14 meses.
6. Quando os eventos começarem a chegar (24 a 48 h), em **Administrador → Eventos** marque como **Evento-chave**: `whatsapp_click`.
7. **Administrador → Definições personalizadas → Dimensões personalizadas** (escopo Evento). Sem isso os parâmetros não aparecem nos relatórios:

   | Nome da dimensão | Parâmetro do evento |
   |---|---|
   | Origem do CTA | `source` |
   | Rótulo do CTA | `label` |
   | Filtro da coleção | `filter` |
   | Pergunta do FAQ | `question` |
   | Seção vista | `section` |
   | Rede social | `network` |
   | Escolha de consentimento | `consent_choice` |
   | Percentual de rolagem | `percent_scrolled` |
   | URL do link | `link_url` |

8. **Administrador → Vinculações do produto → Google Ads** → vincular a conta de Ads do Gaspar Lopes.

---

## 4. Google Ads

1. [ads.google.com](https://ads.google.com) → **Metas → Conversões → Nova ação de conversão → Site** → domínio → **"Adicionar uma ação de conversão manualmente"**:

   | Nome | Categoria | Ação | Contagem |
   |---|---|---|---|
   | WhatsApp – clique (LP) | Lead / Contato | **Principal** | Uma por clique |

2. Na ação → **Configurar a tag → Usar o Google Tag Manager** → anote o **ID de conversão** (`AW-XXXXXXXXXX`) e o **Rótulo**.
3. **Ferramentas → Gerenciador de público → Suas fontes de dados → Tag do Google Ads** → ativar a coleta de remarketing (mesmo `AW-…`).
4. **Ferramentas → Contas vinculadas → Google Analytics (GA4)** → aceitar a vinculação.
5. **Marcação automática (gclid)**: manter ligada. UTMs: padrão da M|P é UTM manual por grupo/anúncio (`utm_source=google&utm_medium=cpc&utm_campaign=<campanha>&utm_content=<grupo-ou-anuncio>&utm_term={keyword}`), gerada quando as campanhas existirem.

---

## 5. Importar o container no GTM

1. GTM → container da LP → **Administrador → Importar container**
2. Arquivo: `gtm/gtm-container-gaspar-lopes.json`
3. Espaço de trabalho: **Novo** ("GA4 + Ads") · Opção: **Mesclar → Sobrescrever**
4. Confirme. Deve aparecer **12 tags, 10 gatilhos, 11 variáveis**.
5. Em **Variáveis → Variáveis definidas pelo usuário**, preencha as 3 constantes:

   | Variável | Valor |
   |---|---|
   | `CONST - GA4 Measurement ID` | `G-…` (passo 3.3) |
   | `CONST - Google Ads Conversion ID` | só os números do `AW-…` (passo 4.2), **sem o prefixo AW-** |
   | `CONST - Ads Label - whatsapp_click` | rótulo da ação "WhatsApp – clique (LP)" |

### O que vem no container

- **Google Tag – GA4** (Inicialização, page_view automático)
- 1 tag GA4 por evento do catálogo + `scroll_depth` e `click_outbound`
- **Ads – Conversion Linker** (Inicialização) e **Ads – Remarketing** (todas as páginas)
- **Ads – Conversão – WhatsApp Click (principal)**

---

## 6. Testar antes de publicar

1. GTM → **Visualizar** → URL da LP → conectar (Tag Assistant).
2. No Tag Assistant confira:
   - `Initialization` / `Container Loaded` → "Google Tag – GA4", "Ads – Conversion Linker", "Ads – Remarketing"
   - aba **Consent**: tudo `denied` antes do banner; clique **Aceitar** → `granted` + evento `cookie_consent`
   - clique no botão do hero → `whatsapp_click` com `source=hero` → tag GA4 + **conversão Ads**
   - clique num card da vitrine → `whatsapp_click` com `source=pecas`, `label=Camisas`
   - clique num filtro da Coleção → `collection_filter`
   - abra uma pergunta do FAQ → `faq_open`
   - role a página → `section_view` por seção e `scroll_depth` 25/50/75/90
   - Instagram no footer → `social_click`
3. GA4 → **Relatórios → Tempo real** (ou DebugView) mostrando os eventos.
4. Tudo ok → **Enviar → Publicar**.
5. Google Ads → Conversões: sai de "Inativo" para "Registrando conversões" depois dos primeiros cliques reais (até 24 h).

---

## 7. Relatórios úteis no GA4 (depois de 1 semana)

- **Qual CTA converte**: `whatsapp_click` × `source` e × `label`.
- **Funil de leitura**: `section_view` por `section` (onde as pessoas param).
- **Interesse por categoria**: `collection_filter` × `filter` e `whatsapp_click` × `label`.
- **Objeções**: `faq_open` × `question`.
- **Aquisição → Aquisição de tráfego** com o evento-chave `whatsapp_click`: qual campanha/termo gera contato.

---

## 8. Pixel da Meta (configurado na interface do GTM em 22/09/2026)

As duas tags abaixo foram criadas **direto na interface do GTM**, com o template
"Meta Pixel" (facebook) da Galeria de modelos. Elas **não estão** no JSON gerado por
`gen-container.mjs`, porque templates da galeria não são reproduzíveis pelo gerador.
Se o container for reimportado com "Sobrescrever", recriar as duas à mão com esta ficha.

Pixel: `1136325035763218`.

| Tag | Evento (Standard) | Acionadores | Object Properties | Disparo |
|---|---|---|---|---|
| `Pixel Meta - PageView` | `PageView` | `All Pages` **e** `Consentimento de Cookie` (ver abaixo) | nenhuma | **Uma vez por página** |
| `Pixel Meta - Contact (WhatsApp)` | `Contact` | `CE - whatsapp_click` | `content_name` = `{{DLV - label}}`, `content_category` = `{{DLV - source}}` | Uma vez por evento |

Configuração comum às duas tags:

- **Consent Granted (GDPR)** = `True` (pode, porque o GTM só deixa a tag rodar depois do aceite, ver abaixo).
- **Enable Advanced Matching** desmarcado (o site não tem formulário, não há dado do visitante para enviar).
- **Meta-enabled Conversions API integration** marcado (a Meta cria a integração server-side por conta dela e respeita o disparo da tag; não precisa de Event ID).
- **Limited Data Use** desmarcado (regra da Califórnia, não se aplica).
- **Configurações avançadas → Configurações de permissão** = **"Exigir consentimento adicional para disparar a tag"** com `ad_storage` e `ad_user_data`. Sem isso o Pixel ignora o banner: ao contrário das tags do Google, o template da Meta **não lê o Consent Mode sozinho**.

Acionador extra `Consentimento de Cookie` (só na PageView): Evento personalizado `cookie_consent`,
condição `DLV - consent_choice` igual a `accepted`. Ele cobre a **primeira visita**: o
`All Pages` roda com o consentimento ainda negado e a tag fica bloqueada; ao clicar em
Aceitar o site libera o consentimento e depois empurra o evento, e aí a PageView dispara.
Nas visitas seguintes o `index.html` já manda o `consent update` antes do gtm.js, então
a PageView dispara direto no `All Pages`. "Uma vez por página" garante que nunca dispare
duas vezes na mesma visita.

Não usar o acionador `CE - cookie_consent` já existente com essa condição: ele alimenta a
tag GA4 `cookie_consent`, que precisa registrar também o "Só o essencial".

Teste (feito em 22/09/2026, tudo ok): janela anônima → nada da Meta antes do banner →
Aceitar → `PageView` no evento `cookie_consent` → botão de WhatsApp → `Contact` no
`whatsapp_click` → recarregar → `PageView` uma vez no `All Pages`. As mensagens
"A variável retornou falso devido a um erro desconhecido" na aba Console do Tag Assistant
são só o painel avaliando as `DLV - *` em eventos onde a chave ainda não existe; não
afetam as tags.

No Gerenciador de Eventos da Meta usar `Contact` como evento de otimização das campanhas.
A política de privacidade cita o Pixel e o cookie `_fbp` desde 22/09/2026.

---

## Regenerar o JSON

```
node gtm/gen-container.mjs gtm/gtm-container-gaspar-lopes.json
```
