# Gaspar Lopes Alfaiataria — Design System

Sistema de design da marca **Gaspar Lopes Alfaiataria** (alfaiataria sob medida), construido a partir da logo oficial (monograma GL geometrico + lockup tipografico) e dos icones de destaques do Instagram fornecidos pelo usuario.

Fontes de origem: uploads/brancoPrancheta 1@2x.png (logo branca em fundo transparente) e uploads/pasted-1788192037746-0.png (destaques do Instagram).

## Content fundamentals
- Idioma: portugues (Brasil). Tom: elegante, direto, confiante — voz de atelier, nao de e-commerce.
- Tratamento: "voce". Frases curtas. Sem emoji, sem exclamacoes em serie.
- Caps largas para rotulos e navegacao (eco de "ALFAIATARIA"); titulos em caixa alta com tracking; corpo em sentence case.
- Rotulos reais dos destaques: "Clientes", "GASPAR", "Fica a dica!", "2026", "Palestras GL", "Depoimentos", "Horarios".
- Numerais em serifado italico (Cormorant) como acento editorial (ex.: "2026").

## Visual foundations
- **Cores**: quase-preto #0C0F14 de fundo; navy profundo #0A2453 (circulos de highlight) como cor de marca; branco/off-white para texto e CTA. Sem cores vivas — o contraste e claro-sobre-escuro.
- **Tipo**: Jost (geometrica, eco da logo) para display e corpo; Cormorant Garamond italico como acento serifado. Titulos em caps com tracking 0.06em; overlines 0.34em.
- **Fundos**: escuros e planos; no maximo vinheta radial navy sutil. Sem gradientes chamativos.
- **Bordas**: hairlines brancas translucidas (10–24%). Cantos quase retos (2–4px). Circulos so nos highlights/avatares.
- **Sombras**: profundas e difusas (0 20px 50px rgba(0,0,0,.45)); anel duplo nos circulos (gap escuro + hairline).
- **Hover**: clareamento sutil, 200ms ease. Press: opacity .85. Sem bounce.
- **Layout**: container 1140px, respiro de secao 96–128px.
- **Imagens**: fotografia escura de atelier/tecidos; sem ilustracao.

## Iconography
- Estilo: icones de linha fina branca (stroke 1.5–2) sobre circulo navy — ver assets/highlights/.
- Substituicao: nenhum SVG original fornecido; usar **Lucide** via CDN com stroke-width 1.5 em branco. FLAG: pedir SVGs originais se existirem.
- Sem emoji.

## Assets
- assets/logo-branco.png — logo completa branca (usar apenas sobre fundo escuro; nao ha versao para fundo claro).
- assets/highlights/highlight-0..6.png — capas de destaque recortadas (Clientes, Gaspar, Fica a dica!, 2026, Palestras GL, Depoimentos, Horarios).

## Substituicoes / caveats
- Fonte da logo nao fornecida; Jost e a aproximacao mais proxima no Google Fonts. Enviar arquivos da fonte original se existirem.
- Sistema dark-first: nao ha logo para fundo claro.

## Index
- styles.css — entrada global (importa tokens/).
- tokens/ — colors, typography, spacing, effects, fonts.
- components/core/ — Button, IconButton, Badge, Divider.
- components/forms/ — Input, Textarea.
- components/content/ — Card, HighlightCircle, SectionTitle.
- ui_kits/landing/ — landing page de exemplo (starting point).
- guidelines/ — cards de especimenes.

## Intentional additions
- HighlightCircle: derivado dos destaques do Instagram (motivo central da marca).
- SectionTitle: padrao overline + titulo caps + acento serifado, base das secoes da landing.
