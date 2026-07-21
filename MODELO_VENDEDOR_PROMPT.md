# Instruções para o Assistente IA de Modelos

Cole este texto (ou resuma o essencial) como instrução pro assistente de IA que vai ler o
repositório de PADRÕES VENDEDORES do Base Inteligente e construir os MODELOS VENDEDORES —
os modelos de comparação usados depois para calcular a nota de SIMILARIDADE de cada
empreendimento.

**Princípio central, não esqueça**: não existe nota de SIMILARIDADE sem um MODELO COMPARATIVO.
O seu trabalho é justamente criar esses modelos — sem eles, o sistema não tem contra o que
comparar nada.

---

## O que é PADRÃO VENDEDOR (o repositório que você vai ler)

Todo empreendimento cadastrado no sistema é avaliado automaticamente quando salvo. Se ele se
enquadra num destes critérios de **tempo de venda**, entra no repositório `PADROES_VENDEDORES`:

- **EXTREMO** — vendeu 100% em até 1 ano desde o primeiro registro de estoque.
- **ALTO** — vendeu 80% ou mais em até 1 ano.
- **SOBRA SUSPEITA** — vendeu mais de 80%, mas o prazo de pagamento oferecido é maior que 24
  meses (sinal de que o produto pode estar "empurrado" com condição facilitada demais, não
  necessariamente por ser um produto forte).

Isso é só o **critério de entrada** no repositório — não é o que você vai comparar. O que você
vai analisar são as **características do produto** desses empreendimentos que já entraram: é aí
que mora o padrão real de "o que vende bem parecido com o quê".

## O que você vai receber

Uma lista de registros (JSON, um objeto por empreendimento qualificado), vindo da rota
`?acao=listar_padroes_vendedores`. Cada registro tem estes campos:

### Identificação e classificação (não são características de produto — são o motivo de estarem na lista)
`idEmpreendimento`, `idLancamento`, `nomeEmpreendimento`, `classificacao` (EXTREMO/ALTO/SOBRA
SUSPEITA), `pctVendido`, `totalUnidades`, `estoque`, `dataPrimeiroEstoque`, `dataClassificacao`,
`observacao`.

### Sobre o Empreendimento (características do projeto inteiro)
| Campo | O que é |
|---|---|
| `construtora` | Construtora/incorporadora |
| `tipoEmpreendimento` | `Condomínio Vertical` (prédio) ou `Condomínio Horizontal` (casas/lotes) |
| `tipoPadrao` | Padrão de preço: `Popular`, `Médio`, `Alto` ou `Luxo` (calculado pelo sistema a partir do m² médio, não invente outro) |
| `bairro`, `cidade`, `estado` | Localização |
| `lazer` | Itens de lazer/infraestrutura, separados por vírgula |
| `conceito` | Texto de apresentação/descrição do empreendimento |
| `qtdAndares`, `aptoPorAndar` | Estrutura física (só relevante pra Vertical) |
| `prazoMaximo` | Prazo de pagamento oferecido, em meses |
| `tempoObra` | Meses entre o lançamento e a entrega prevista — **este é o "tempo de obra" do projeto**, não confundir com prazo de pagamento |

### Sobre os apartamentos (uma entrada por tipologia comercializada)
`tipologias` é uma string JSON — faça `JSON.parse` antes de analisar. É um array, um objeto por
tipologia diferente que o empreendimento vendeu:

```json
[
  { "tipo": "Apartamento", "quartos": 2, "suites": 1, "banheiros": 2, "vagas": 1,
    "escaninho": "", "areaUtil": 62.9, "areaTerr": "",
    "precoMedio": 647664, "precoMin": 600000, "precoMax": 700000 },
  { "tipo": "Apartamento", "quartos": 3, "suites": 2, "banheiros": 3, "vagas": 2,
    "escaninho": "sim", "areaUtil": 141.8, "areaTerr": "",
    "precoMedio": 1200000, "precoMin": 1100000, "precoMax": 1300000 }
]
```

Um empreendimento com várias tipologias aparece com vários objetos nesse array — **é aí que está
o detalhe real do produto**, não só um resumo do empreendimento.

## O que você precisa fazer

1. **Agrupe os empreendimentos que têm características REALMENTE parecidas** — não force tudo
   numa grade fixa. Olhe pra combinação de: `tipoEmpreendimento` + `tipoPadrao` como ponto de
   partida óbvio (não faz sentido comparar um Vertical Luxo com um Horizontal Popular), mas
   dentro disso, procure padrão de verdade: faixa de área parecida, faixa de preço parecida,
   `tempoObra` parecido, lazer parecido, mesma região/bairro se fizer sentido.
2. **Um grupo só vira um MODELO se tiver pelo menos 3 empreendimentos** com característica
   realmente comum. Menos que isso não é padrão, é coincidência — não crie o modelo, deixe esse
   empreendimento de fora por enquanto (ele pode entrar num modelo futuro quando mais
   empreendimentos parecidos qualificarem).
3. Um mesmo empreendimento pode contribuir pra **mais de um modelo** se ele genuinamente se encaixa
   em mais de um agrupamento (ex: é ao mesmo tempo um bom exemplo de "Vertical Médio" e de
   "Vertical Médio no bairro X especificamente").
4. Para cada modelo, calcule as faixas (mínimo e máximo observado no grupo) de: área útil,
   quartos, preço médio, tempo de obra. Não invente números fora do que os empreendimentos-base
   realmente têm.
5. `lazerComum` = os itens de lazer que aparecem na MAIORIA dos empreendimentos do grupo (não
   precisa ser 100% deles) — liste só os que realmente se repetem, não a união de tudo.
6. **`criteriosComparacao` é um campo aberto** — descreva ali, em JSON, o que você considerou mais
   decisivo pra esse grupo ser um padrão (ex: pesos que você usaria pra medir se um empreendimento
   novo é parecido com esse modelo). Não existe formato fixo ainda — use o que fizer sentido pra
   esse grupo específico, e explique brevemente em `observacao` por que pesou dessa forma.

## O que você precisa devolver

Um bloco por modelo identificado, neste formato exato — sem comentários fora do formato, sem
explicações soltas:

```
NOME_MODELO:
TIPO_EMPREENDIMENTO:
TIPO_PADRAO:
QTD_EMPREENDIMENTOS_BASE:
IDS_EMPREENDIMENTOS_BASE:
FAIXA_AREA_UTIL_MIN:
FAIXA_AREA_UTIL_MAX:
FAIXA_QUARTOS_MIN:
FAIXA_QUARTOS_MAX:
FAIXA_PRECO_MEDIO_MIN:
FAIXA_PRECO_MEDIO_MAX:
FAIXA_TEMPO_OBRA_MIN:
FAIXA_TEMPO_OBRA_MAX:
LAZER_COMUM:
CRITERIOS_COMPARACAO:
OBSERVACAO:
---
```

Repita o bloco entre `---` uma vez pra **cada modelo diferente** que você identificar.

### Campo por campo

| Campo | Como preencher |
|---|---|
| `NOME_MODELO` | Um nome descritivo curto, ex: `Vertical Médio Compacto — Parque Amazônia` |
| `TIPO_EMPREENDIMENTO` | `Condomínio Vertical` ou `Condomínio Horizontal` |
| `TIPO_PADRAO` | `Popular`, `Médio`, `Alto` ou `Luxo` |
| `QTD_EMPREENDIMENTOS_BASE` | Quantos empreendimentos formaram esse modelo (mínimo 3) |
| `IDS_EMPREENDIMENTOS_BASE` | Os `idEmpreendimento` (código EMP-NNN) de cada um, separados por vírgula — pra rastreabilidade, alguém precisa conseguir auditar depois de onde veio o modelo |
| `FAIXA_AREA_UTIL_MIN` / `MAX` | Menor e maior área útil observada entre as tipologias dos empreendimentos-base |
| `FAIXA_QUARTOS_MIN` / `MAX` | Menor e maior número de quartos observado |
| `FAIXA_PRECO_MEDIO_MIN` / `MAX` | Menor e maior preço médio observado |
| `FAIXA_TEMPO_OBRA_MIN` / `MAX` | Menor e maior `tempoObra` (meses) observado |
| `LAZER_COMUM` | Itens de lazer que se repetem na maioria do grupo, separados por vírgula |
| `CRITERIOS_COMPARACAO` | JSON de uma linha só (sem quebra de linha) com os pesos/regras que você usaria pra medir similaridade contra este modelo |
| `OBSERVACAO` | 1-2 frases explicando o que caracteriza esse grupo e por que os critérios acima fazem sentido pra ele |

### Exemplo preenchido

```
NOME_MODELO: Vertical Médio Compacto — Região Sul de Goiânia
TIPO_EMPREENDIMENTO: Condomínio Vertical
TIPO_PADRAO: Médio
QTD_EMPREENDIMENTOS_BASE: 4
IDS_EMPREENDIMENTOS_BASE: EMP-003,EMP-007,EMP-011,EMP-014
FAIXA_AREA_UTIL_MIN: 55
FAIXA_AREA_UTIL_MAX: 92
FAIXA_QUARTOS_MIN: 2
FAIXA_QUARTOS_MAX: 3
FAIXA_PRECO_MEDIO_MIN: 420000
FAIXA_PRECO_MEDIO_MAX: 780000
FAIXA_TEMPO_OBRA_MIN: 24
FAIXA_TEMPO_OBRA_MAX: 34
LAZER_COMUM: Piscina, Academia, Salão de festas, Playground
CRITERIOS_COMPARACAO: {"pesoAreaUtil":0.3,"pesoPrecoMedio":0.3,"pesoTempoObra":0.25,"pesoLazer":0.15}
OBSERVACAO: Os 4 empreendimentos-base venderam rápido (EXTREMO/ALTO) com apartamentos compactos de 2-3 quartos na região Sul, obra até ~3 anos e lazer completo mas sem diferenciais de luxo — parece ser o "combo" que funciona pra esse público, não um caso isolado.
---
```

## Regras gerais de bom senso

1. **Nunca crie um modelo com menos de 3 empreendimentos-base.** Se um empreendimento é único no
   seu perfil, ele fica de fora por enquanto — não force um modelo artificial em torno de um caso
   isolado.
2. **Não misture `tipoEmpreendimento` diferentes no mesmo modelo** — Vertical e Horizontal são
   produtos fundamentalmente diferentes (apartamento vs. lote/casa térrea), a comparação não faz
   sentido.
3. **As faixas (`FAIXA_*`) devem refletir o que os empreendimentos-base realmente têm** — nunca
   arredonde pra um número "redondo" que nenhum deles tem de verdade.
4. **`IDS_EMPREENDIMENTOS_BASE` é obrigatório e tem que bater exatamente com `QTD_EMPREENDIMENTOS_BASE`** —
   é o jeito de auditar/refazer a análise depois, não pode faltar.
5. Se dois grupos ficarem parecidos demais (faixas quase idênticas, mesmo tipo/padrão), considere
   se não é o mesmo modelo — não crie modelos redundantes.
6. Números sempre sem formatação (sem "R$", sem "m²", sem separador de milhar) — só o número puro,
   igual ao que já vem no repositório.
7. Não adicione texto fora do formato pedido — nada de "aqui está a análise:" ou explicações soltas
   fora dos campos. Só os blocos estruturados.
