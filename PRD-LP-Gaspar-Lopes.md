# PRD — Landing Page Gaspar Lopes (Alfaiataria Sob Medida)

> Documento de requisitos + copy pronta para desenvolvimento no VSCode via extensão Claude Code.
> Cliente: **Gaspar Lopes** — Alfaiataria sob medida | Goiânia, GO.
> Agência: **M|P Assessoria**.

---

## 0. Instruções para o Claude Code (LEIA PRIMEIRO)

Ao abrir a pasta `LP - Gaspar Lopes` no VSCode, você tem à disposição os seguintes diretórios. **Use-os obrigatoriamente:**

| Pasta | Uso obrigatório |
|---|---|
| `Design System Gaspar Lopes` | **Fonte única de verdade visual.** Extraia daqui a paleta de cores, tipografia, espaçamentos e componentes. **NÃO invente cores nem fontes** — use exatamente o que estiver definido no design system. |
| `Referências` | **Siga a direção de layout, estrutura e estética dos sites de referência contidos nesta pasta.** A LP deve conversar visualmente com essas referências (hierarquia, seções, ritmo visual, sensação premium). |
| `Fotos Gaspar` | Fotos do próprio Gaspar. Use no Hero e/ou na seção de autoridade/"quem faz". |
| `Fotos - Produtos` | Fotos das peças (camisa, paletó, calça, colete, ternos). Use na vitrine de produtos e nas provas visuais. |
| `Logo` | Logo oficial. Use no header e no footer. |

**Regras inegociáveis deste projeto:**
1. **NÃO inventar nenhuma informação.** Todo dado factual desta LP vem do briefing (abaixo). Onde houver `[PREENCHER: ...]`, o texto ainda **não existe** — deixe o placeholder visível/comentado no código para o Marcos preencher depois. Nunca substitua um placeholder por informação fictícia (números de clientes, anos de mercado, depoimentos, prêmios, nomes de famosos etc.).
2. **Responsividade mobile-first.** O público principal chega pelo celular. Construa mobile primeiro e escale para desktop. Teste em 360px, 390px e 768px no mínimo.
3. **Performance: carregamento ≤ 3 segundos** (ver seção 5 — Requisitos técnicos).
4. **CTA principal = WhatsApp.** É o canal real de atendimento do cliente. Todo CTA leva a um `wa.me` (número em placeholder até o Marcos confirmar).

---

## 1. Contexto do negócio (extraído do briefing)

- **Negócio:** Alfaiataria sob medida (moda masculina de alto padrão).
- **Localização:** Goiânia — GO. Público-alvo concentrado no **Setor Sul**.
- **Momento da empresa:** crescimento acelerado — faturamento cresceu **100% no último ano**.
- **Objetivo com o marketing:** aumentar o faturamento em **100%**.
- **Diferencial declarado:** **trabalho artesanal** e **tudo feito sob medida**.
- **Principal desafio operacional:** mão de obra especializada (não é dor do cliente final, é interna — **não usar na copy**).
- **Canal de atendimento/venda:** majoritariamente **WhatsApp**. Fecham vendas: Gaspar, Angélica e Giovana.
- **CRM:** Odoo.
- **Ciclo de venda curto:** um lead vira cliente em média em **2 a 3 dias**.
- **Principais objeções:** **preço** e **prazo** → a copy precisa endereçar valor percebido e previsibilidade de entrega.

### Produtos / serviços (todos sob medida)
- Camisa
- Paletó
- Calça
- Colete
- Ternos / costumes completos
- **Assinatura central:** *tudo feito sob medida*.

### Cliente ideal
- **Perfil:** classe A/AA.
- **Faixa etária:** 18 a 70 anos.
- **Localização:** Setor Sul (Goiânia) e região.
- **O que valoriza:** peça **feita sob medida** — caimento, exclusividade, personalização.

### Faixa de investimento (valores reais do briefing)
- Camisa: **a partir de R$ 589,00**
- Costume: **a partir de R$ 4.500,00**
- Terno: **a partir de R$ 5.500,00**

> **Decisão estratégica p/ o Marcos:** para público AA, mostrar preço pode ancorar exclusividade ("a partir de") **ou** filtrar curioso — mas também pode afastar. Deixei uma seção de investimento **opcional** (seção 4.6). Recomendo manter os valores "a partir de" como *âncora de qualidade*, não como tabela completa. Se preferir gerar mais lead e qualificar no WhatsApp, remova os valores e deixe só "orçamento sob consulta". A copy funciona nas duas versões.

---

## 2. Objetivo da landing page

**Objetivo primário:** gerar conversas qualificadas no **WhatsApp** com o time comercial (Gaspar / Angélica / Giovana) para agendamento de atendimento sob medida.

**Métrica de sucesso:** volume de cliques no CTA de WhatsApp → conversas iniciadas. (Ciclo de fechamento já é curto: 2–3 dias.)

**Ação única desejada (1 LP = 1 objetivo):** clicar em "Falar no WhatsApp / Agendar meu atendimento".

---

## 3. Princípios de copy e tom

- **Tom:** sofisticado, seguro, masculino, atemporal. Sem gírias, sem "promoção", sem gatilho de escassez barata. Elegância > agressividade.
- **Ângulo central:** *A roupa que veste exatamente você.* Sob medida = caimento perfeito + exclusividade + presença.
- **Endereçar objeções sem citá-las diretamente:** valor (justificar o investimento pela durabilidade/caimento/exclusividade) e prazo (transmitir previsibilidade e cuidado do processo).
- **Prova:** usar **provas visuais** (fotos reais das peças e do Gaspar) como principal prova, já que não temos depoimentos confirmados. Depoimentos entram como placeholder.

---

## 4. Estrutura de seções + COPY PRONTA

> Toda a copy abaixo usa **apenas** informações do briefing. Onde aparece `[PREENCHER]`, o dado não existe no briefing — não inventar.

### 4.1. Header (fixo/sticky)
- Logo (pasta `Logo`) à esquerda.
- Navegação enxuta (âncoras): `Peças` · `Sob medida` · `Investimento` (opcional) · botão **"Falar no WhatsApp"**.
- No mobile: logo + botão WhatsApp visível; menu recolhido.

---

### 4.2. Hero (primeira dobra)

**Imagem:** foto do Gaspar (pasta `Fotos Gaspar`) ou peça de destaque (pasta `Fotos - Produtos`), conforme a que tiver melhor qualidade/enquadramento vertical para mobile.

**Headline (H1):**
> Alfaiataria sob medida em Goiânia — feita para vestir exatamente você.

**Subheadline:**
> Camisas, ternos e costumes cortados à mão, no seu corpo e no seu estilo. Caimento perfeito, acabamento artesanal, presença em cada detalhe.

**CTA primário (botão):**
> Agendar meu atendimento

**Microcopy sob o botão:**
> Atendimento pelo WhatsApp com o time Gaspar Lopes.

**Selo de contexto (linha de apoio, opcional):**
> Sob medida · Setor Sul, Goiânia

---

### 4.3. Bloco de valor / "Por que sob medida"

**Título:**
> Roupa pronta veste "mais ou menos". Sob medida veste você.

**Texto de apoio:**
> Cada peça Gaspar Lopes nasce das suas medidas, do seu tecido e do seu estilo. É o corte artesanal que faz a diferença entre uma roupa que serve e uma roupa que valoriza quem a usa.

**3 pilares (cards com ícone):**

1. **Feito sob medida**
   Nada de padrão. Cada camisa, paletó, calça, colete ou terno é construído a partir das suas medidas.

2. **Trabalho artesanal**
   Acabamento feito à mão, com o cuidado que peça industrial nenhuma entrega.

3. **Exclusividade**
   Sua roupa, do seu jeito — tecido, corte e detalhes escolhidos por você.

---

### 4.4. Vitrine de peças (produtos)

**Imagens:** pasta `Fotos - Produtos`. Grid responsivo (2 colunas no mobile, 3–4 no desktop). Lazy-load nas imagens abaixo da dobra.

**Título:**
> O que criamos para você

**Itens (todos sob medida):**

- **Camisas** — O básico que deixa de ser básico quando é feito no seu corpo.
- **Ternos** — Presença e caimento impecável para os seus momentos mais importantes.
- **Costumes** — Composição completa, pensada nos mínimos detalhes.
- **Paletós** — A peça que estrutura o look e transforma qualquer ocasião.
- **Calças** — Corte e caimento sob medida, do casual ao formal.
- **Coletes** — O detalhe que eleva o conjunto.

**CTA da seção (botão):**
> Quero minha peça sob medida

---

### 4.5. Como funciona (processo)

> ⚠️ **ATENÇÃO — não inventar etapas.** O briefing **não descreve** o passo a passo do atelier. Deixei uma estrutura genérica de alfaiataria em placeholder. **Marcos: confirmar com o Gaspar as etapas reais** (ex.: consulta → medição → escolha de tecido → provas → entrega) antes de publicar. Se não confirmar, **suprimir esta seção** — não preencher com suposição.

**Título:**
> Do primeiro contato à peça pronta

**Etapas (PLACEHOLDER — validar com o cliente):**
1. `[PREENCHER: etapa 1 real — ex.: atendimento e agendamento]`
2. `[PREENCHER: etapa 2 real — ex.: tomada de medidas]`
3. `[PREENCHER: etapa 3 real — ex.: escolha de tecidos e detalhes]`
4. `[PREENCHER: etapa 4 real — ex.: prova]`
5. `[PREENCHER: etapa 5 real — ex.: entrega]`

**Apoio sobre prazo (endereça objeção "prazo") — validar prazo real antes de usar:**
> `[PREENCHER: prazo médio de entrega real]` — cada etapa é acompanhada de perto pelo time.

---

### 4.6. Investimento (SEÇÃO OPCIONAL — ver decisão na seção 1)

**Título:**
> Um investimento que veste por muito tempo

**Texto:**
> Peças sob medida duram, caem melhor e acompanham você. Veja por onde começa:

- **Camisas** — a partir de **R$ 589**
- **Costumes** — a partir de **R$ 4.500**
- **Ternos** — a partir de **R$ 5.500**

**Microcopy:**
> Valores iniciais. O orçamento final depende do tecido, do modelo e dos detalhes escolhidos.

**CTA:**
> Fazer meu orçamento no WhatsApp

> *Versão alternativa (sem preço):* trocar a lista por → "Cada peça tem um orçamento próprio, feito a partir das suas escolhas. Fale com a gente e monte o seu."

---

### 4.7. Autoridade / quem é o Gaspar Lopes

> ⚠️ **NÃO INVENTAR HISTÓRIA.** O briefing diz literalmente "VERIFICAR A HISTÓRIA NA REVISTA" — ou seja, a trajetória **existe mas não está neste material**. Marcos: extrair da revista e preencher. Nada de "há X anos" ou números inventados.

**Imagem:** foto do Gaspar (pasta `Fotos Gaspar`).

**Título:**
> Feito por quem vive a alfaiataria

**Texto (PLACEHOLDER):**
> `[PREENCHER: história/trajetória real do Gaspar Lopes — fonte: revista citada no briefing]`

**Ponto de apoio (pode usar, é do briefing):**
> Um trabalho artesanal, feito à mão, para quem entende que roupa boa é aquela feita sob medida.

---

### 4.8. Prova social (depoimentos)

> ⚠️ **NÃO INVENTAR DEPOIMENTOS.** O briefing não traz nenhum. Estrutura pronta para receber os reais.

**Título:**
> Quem já veste Gaspar Lopes

**Cards (PLACEHOLDER — mínimo 3 quando disponíveis):**
- `[PREENCHER: depoimento real 1 + nome/inicial do cliente]`
- `[PREENCHER: depoimento real 2 + nome/inicial do cliente]`
- `[PREENCHER: depoimento real 3 + nome/inicial do cliente]`

> Enquanto não houver depoimentos, **suprimir a seção** e reforçar as fotos reais das peças como prova.

---

### 4.9. FAQ (endereça objeções valor + prazo)

**Título:**
> Perguntas frequentes

- **Quanto tempo leva para ficar pronto?**
  `[PREENCHER: prazo real]` — do atendimento à entrega, com acompanhamento em cada etapa.

- **Por que sob medida vale mais a pena?**
  Porque a peça é feita no seu corpo e no seu estilo: cai melhor, dura mais e não tem igual. É trabalho artesanal, não produção em série.

- **Preciso ir até vocês?**
  `[PREENCHER: confirmar se atende presencial no Setor Sul / se vai até o cliente / etc.]`

- **Como faço para começar?**
  É só chamar no WhatsApp. O time Gaspar Lopes cuida do resto.

- **Quais peças posso encomendar?**
  Camisas, paletós, calças, coletes, ternos e costumes completos — tudo sob medida.

---

### 4.10. CTA final (fechamento)

**Título:**
> Sua próxima roupa pode ser feita só para você.

**Texto:**
> Camisas, ternos e costumes sob medida, com o caimento e o acabamento que só a alfaiataria artesanal entrega. Comece agora, pelo WhatsApp.

**CTA (botão grande):**
> Agendar meu atendimento

**Microcopy:**
> Atendimento com Gaspar, Angélica e Giovana.

---

### 4.11. Footer
- Logo (pasta `Logo`).
- Cidade: Goiânia — GO `[PREENCHER: endereço/Setor Sul se for divulgar]`.
- WhatsApp `[PREENCHER: número real → link wa.me]`.
- Instagram `[PREENCHER: @ real]`.
- Direitos autorais: `© Gaspar Lopes. Todos os direitos reservados.`
- Assinatura discreta: `Desenvolvido por M|P Assessoria` (opcional).

---

## 5. Requisitos técnicos

### 5.1. Stack sugerida
- HTML5 + CSS puro (ou Tailwind, se o design system favorecer) + JS mínimo. **Evitar frameworks pesados** — é uma LP de página única, priorize performance.
- Sem dependências desnecessárias. Nada de bibliotecas grandes de animação se um CSS resolver.

### 5.2. Performance — meta ≤ 3s (regra do projeto)
- **Imagens:** converter tudo para **WebP** (fallback JPG). Comprimir sem perder qualidade perceptível.
- `loading="lazy"` em toda imagem abaixo da primeira dobra.
- Servir imagens em tamanhos responsivos (`srcset`/`sizes`); nunca carregar imagem de 4000px num slot de 400px.
- Definir `width`/`height` nas imagens para evitar layout shift (CLS).
- **Fontes:** usar as do design system com `font-display: swap`; subsetar se possível; no máximo 2 famílias / poucos pesos.
- Minificar CSS/JS. Inline do CSS crítico da primeira dobra.
- Sem carrosséis pesados no Hero (imagem estática otimizada carrega mais rápido).
- Meta: **LCP < 2.5s**, **CLS < 0.1**, tempo total de carregamento **≤ 3s** em 4G mobile.

### 5.3. Responsividade (mobile-first)
- Construir do menor breakpoint para o maior.
- Testar: 360px, 390px, 768px, 1024px, 1440px.
- Botões WhatsApp com área de toque ≥ 44px.
- Tipografia fluida (`clamp()`), sem overflow horizontal.

### 5.4. SEO / metadados básicos
- `<title>`: `Alfaiataria Sob Medida em Goiânia | Gaspar Lopes`
- `meta description`: `Camisas, ternos e costumes sob medida em Goiânia. Trabalho artesanal, caimento perfeito. Agende seu atendimento.`
- `alt` descritivo em todas as imagens.
- Open Graph (título, descrição, imagem) para compartilhamento no WhatsApp.
- `lang="pt-BR"`.

### 5.5. Conversão / tracking
- CTA principal → `https://wa.me/55[PREENCHER-DDD-NUMERO]?text=` com mensagem pré-preenchida:
  `Olá! Vim pela landing page e quero fazer uma peça sob medida.`
- Botão flutuante de WhatsApp fixo no mobile (canto inferior).
- Deixar `[PREENCHER: Pixel/GA4/Google Tag]` — Marcos confirma qual tracking usar.

### 5.6. Acessibilidade
- Contraste conforme paleta do design system (validar AA).
- Navegação por teclado nos CTAs.
- `aria-label` nos botões de ícone (WhatsApp flutuante).

---

## 6. Checklist final antes de publicar

- [ ] Paleta e tipografia **puxadas do Design System Gaspar Lopes** (nada inventado).
- [ ] Layout alinhado às **Referências** da pasta.
- [ ] Fotos do **Gaspar** e dos **produtos** aplicadas e otimizadas (WebP).
- [ ] Logo no header e footer.
- [ ] Todos os `[PREENCHER]` resolvidos **ou** a seção suprimida (nunca inventada).
- [ ] Carregamento testado ≤ 3s em mobile 4G.
- [ ] Responsivo de 360px a 1440px, sem scroll horizontal.
- [ ] Todos os CTAs apontando para o WhatsApp correto.
- [ ] História do Gaspar validada na revista antes de publicar a seção de autoridade.

---

## 7. Resumo dos placeholders a preencher (para o Marcos)

| # | O que falta | Fonte |
|---|---|---|
| 1 | História / trajetória do Gaspar | Revista citada no briefing |
| 2 | Etapas reais do processo (atelier) | Confirmar com Gaspar |
| 3 | Prazo médio de entrega | Confirmar com Gaspar |
| 4 | Depoimentos reais de clientes | Coletar |
| 5 | Número de WhatsApp (link wa.me) | Cliente |
| 6 | Endereço / atende presencial no Setor Sul? | Cliente |
| 7 | @ do Instagram | Cliente |
| 8 | Ferramenta de tracking (Pixel/GA4) | Definir |
| 9 | Decisão: mostrar ou não os preços | Marcos |
