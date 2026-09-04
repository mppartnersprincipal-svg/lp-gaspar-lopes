# UTMs — Google Ads · Gaspar Lopes

Padrão do projeto (mesmo combinado da Sólida): **UTM manual na URL final de cada
grupo/anúncio**, nunca sufixo de URL final na conta. Marcação automática (gclid)
continua **ligada** no Ads.

```
utm_source=google
utm_medium=cpc
utm_campaign=<campanha>      slug sem acento/espaço
utm_content=<grupo-ou-anuncio>
utm_term={keyword}           ValueTrack: palavra-chave que acionou o anúncio
```

## Campanha 1 — `alfaiataria-goiania` (Pesquisa)

| Grupo de anúncios | `utm_content` | Palavras-chave |
|---|---|---|
| Alfaiate Goiânia | `alfaiate-goiania` | alfaiate goiania · alfaiataria em goiania |
| Alfaiataria geral | `alfaiataria-geral` | alfaiate · alfaiataria · alfaiateria |
| Alfaiataria masculina | `alfaiataria-masculina` | alfaiataria masculina online |
| Alfaiataria antiga | `alfaiataria-antiga` | alfaiataria antiga |
| Preço | `alfaiate-preco` | alfaiate preço |

### URLs finais (colar em cada grupo/anúncio)

```
https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiate-goiania&utm_term={keyword}

https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiataria-geral&utm_term={keyword}

https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiataria-masculina&utm_term={keyword}

https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiataria-antiga&utm_term={keyword}

https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiate-preco&utm_term={keyword}
```

Variante opcional para o grupo Preço (cai direto na seção Investimento):

```
https://www.gasparlopesalfaiataria.com.br/?utm_source=google&utm_medium=cpc&utm_campaign=alfaiataria-goiania&utm_content=alfaiate-preco&utm_term={keyword}#investimento
```

## Observações

- Se o nome da campanha no Ads for outro, troque só o valor de `utm_campaign`
  (slug sem acento/espaço) — o resto continua igual.
- Com marcação automática ligada, o GA4 usa o gclid e mostra a origem como
  Google Ads; as UTMs alimentam o dashboard first-party (`/dashboard`), que
  guarda `utm_campaign`, `utm_content` e `utm_term` por sessão.
- Conversão principal: evento `whatsapp_click` (GTM → GA4 → Ads
  `AW-17013001775` / `jp8ZCLLI4ewcEK-ct7A_`).
- QA: sessões de teste com `utm_content=qa-seed` e apagadas ao final.

## Negativas sugeridas (o termo "alfaiate" puxa muita busca fora de intenção)

curso, cursos, apostila, vaga, vagas, emprego, salario, quanto ganha, profissao,
significado, sinonimo, conserto, consertos, ajuste, bainha, costureira,
reforma de roupa, aluguel, aluguel de terno, fantasia, feminino, infantil,
atacado, maquina de costura, tecido por metro, moldes, sob medida online barato
