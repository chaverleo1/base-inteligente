# Instruções para o Assistente IA de Modelos

Cole este texto (ou resuma o essencial) como instrução pro assistente de IA que vai ler o
repositório de PADRÕES VENDEDORES do Base Inteligente e construir os MODELOS VENDEDORES —
os modelos de comparação usados depois para calcular a nota de SIMILARIDADE de cada
empreendimento.

**Fluxo completo**: você baixa o CSV de `PADROES_VENDEDORES` (botão "⬇️ CSV" no painel Padrão
Vendedor, em Lançamentos), cola esse CSV numa conversa com esse assistente junto com este prompt,
o assistente devolve um CSV novo (formato descrito abaixo), e você importa esse CSV de volta no
Base Inteligente pela aba "Importar Modelos" (Lançamentos → Mapa Geral → Importar Modelos).

**Princípio central, não esqueça**: não existe nota de SIMILARIDADE sem um MODELO COMPARATIVO.
O seu trabalho é justamente criar esses modelos — sem eles, o sistema não tem contra o que
comparar nada.

**Como a nota de similaridade é calculada depois** (pra você entender por que a ordem dos critérios
de agrupamento importa): o sistema compara um empreendimento contra a base de modelos em cascata —
1º filtra por `tipoEmpreendimento`, 2º por `tipoImovel`, 3º por `tipoPadrao` (cada nível estreita
os candidatos; se nenhum modelo bater num nível, ele volta pro conjunto do nível anterior), e só
então, dentro do(s) modelo(s) que sobraram, calcula uma nota parcial por característica (área,
preço, tempo de obra, lazer) contra as faixas do modelo. Por isso os 3 primeiros campos
(`tipoEmpreendimento`, `tipoImovel`, `tipoPadrao`) precisam estar corretos acima de tudo — são o
que decide COM QUAL modelo o empreendimento vai ser comparado, antes de qualquer nota fina entrar
em jogo.

---

## O que é PADRÃO VENDEDOR (o repositório que você vai ler)

Todo empreendimento cadastrado no sistema é avaliado automaticamente quando salvo, usando a
**data de entrega** como referência de tempo (não mais a data de cadastro). Se ele se enquadra
num destes critérios, entra no repositório `PADROES_VENDEDORES`:

**Durante a obra** (o limiar foi atingido antes da entrega):
- **EXTREMO** — vendeu 100% em até 1 ano desde o lançamento.
- **FORTE** — vendeu 100% antes da entrega, mas levou mais de 1 ano desde o lançamento pra isso.
- **POTENCIAL** — vendeu 70% antes da entrega (sem necessariamente chegar a 100%).

**Depois da entrega**:
- **MODERADO** — vendeu 90% em até 1 ano depois da entrega.

Existe ainda um 4º sinal, **SOBRA SUSPEITA** (vendeu 80%, mas isso só aconteceu mais de 2 anos
depois da entrega) — **esse NÃO entra neste repositório**, é só um alerta calculado ao vivo no
Mapa Geral do sistema. Se você não ver nenhum registro com essa classificação na lista que
recebeu, é esperado — ela nunca é gravada aqui.

Isso é só o **critério de entrada** no repositório — não é o que você vai comparar. O que você
vai analisar são as **características do produto** desses empreendimentos que já entraram: é aí
que mora o padrão real de "o que vende bem parecido com o quê".

## O que você vai receber

Uma lista de registros (JSON, um objeto por empreendimento qualificado), vindo da rota
`?acao=listar_padroes_vendedores`. Cada registro tem estes campos:

### Identificação e classificação (não são características de produto — são o motivo de estarem na lista)
`idEmpreendimento`, `idLancamento`, `nomeEmpreendimento`, `classificacao`
(EXTREMO/FORTE/POTENCIAL/MODERADO — SOBRA SUSPEITA nunca aparece aqui, ver seção anterior),
`pctVendido`, `totalUnidades`, `estoque`, `dataPrimeiroEstoque`, `dataClassificacao`, `observacao`.

### Sobre o Empreendimento (características do projeto inteiro)
| Campo | O que é |
|---|---|
| `construtora` | Construtora/incorporadora |
| `tipoEmpreendimento` | `Condomínio Vertical` (prédio) ou `Condomínio Horizontal` (casas/lotes) |
| `tipoPadrao` | Padrão de preço: `Popular`, `Médio`, `Alto` ou `Luxo` (calculado pelo sistema a partir do m² médio, não invente outro) |
| `bairro`, `cidade`, `estado` | Localização |
| `lazer` | Itens de lazer/infraestrutura, separados por vírgula (nesse campo de ENTRADA, vírgula é normal) |
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

1. **Agrupe os empreendimentos que têm características REALMENTE parecidas**, seguindo esta ordem
   de prioridade (é a mesma cascata que o sistema usa depois pra calcular a nota de similaridade,
   por isso o agrupamento precisa respeitar essa hierarquia):
   1. `tipoEmpreendimento` — não faz sentido comparar um Vertical com um Horizontal.
   2. **Tipo de Imóvel dominante** — olhe as `tipologias` de cada empreendimento-base e veja qual
      `tipo` (Apartamento, Casa, Studio, Terreno, etc.) é o mais comum entre elas. Empreendimentos
      com tipo de imóvel dominante diferente não deveriam entrar no mesmo modelo, mesmo que
      `tipoEmpreendimento` bata.
   3. `tipoPadrao` — Popular/Médio/Alto/Luxo.
   4. Só depois disso, veja se as **demais características** (faixa de área, faixa de preço,
      `tempoObra`, lazer, região/bairro) realmente convergem dentro do grupo já filtrado pelos 3
      critérios acima — é aqui que mora o "padrão real de produto".
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

Um arquivo **.csv** — esse é o arquivo final que será importado direto na aba "Importar Modelos"
do Base Inteligente (Lançamentos → Mapa Geral → Importar Modelos). Não devolva texto solto, não
devolva markdown, não devolva explicação fora do CSV — só o conteúdo do arquivo, pronto pra salvar
como `.csv` e importar.

**Primeira linha = cabeçalho, exatamente estes 20 nomes de campo, nesta ordem, separados por
vírgula:**

```
idModelo,nomeModelo,dataCriacao,criadoPor,tipoEmpreendimento,tipoPadrao,qtdEmpreendimentosBase,idsEmpreendimentosBase,faixaAreaUtilMin,faixaAreaUtilMax,faixaQuartosMin,faixaQuartosMax,faixaPrecoMedioMin,faixaPrecoMedioMax,faixaTempoObraMin,faixaTempoObraMax,lazerComum,criteriosComparacao,observacao,tipoImovel
```

Depois, **uma linha por modelo identificado**.

### Campo por campo

| Campo | Como preencher |
|---|---|
| `idModelo` | **Deixe em branco** — o sistema gera o código (MOD-NNN) sozinho na hora de importar |
| `nomeModelo` | Um nome descritivo curto, ex: `Vertical Médio Compacto — Parque Amazônia` |
| `dataCriacao` | Deixe em branco — o sistema preenche |
| `criadoPor` | Escreva `IA_ASSISTENTE_MODELOS` |
| `tipoEmpreendimento` | `Condomínio Vertical` ou `Condomínio Horizontal` |
| `tipoPadrao` | `Popular`, `Médio`, `Alto` ou `Luxo` |
| `tipoImovel` | O `tipo` de imóvel dominante entre as `tipologias` dos empreendimentos-base (ex: `Apartamento`, `Casa`, `Studio`, `Terreno`) — é o 2º critério da cascata de similaridade, preencha sempre que os empreendimentos-base tiverem um tipo claramente predominante |
| `qtdEmpreendimentosBase` | Quantos empreendimentos formaram esse modelo (mínimo 3) |
| `idsEmpreendimentosBase` | Os `idEmpreendimento` (código EMP-NNN) de cada um, **separados por ponto e vírgula (`;`), nunca por vírgula** — pra rastreabilidade, alguém precisa conseguir auditar depois de onde veio o modelo |
| `faixaAreaUtilMin` / `faixaAreaUtilMax` | Menor e maior área útil observada entre as tipologias dos empreendimentos-base |
| `faixaQuartosMin` / `faixaQuartosMax` | Menor e maior número de quartos observado |
| `faixaPrecoMedioMin` / `faixaPrecoMedioMax` | Menor e maior preço médio observado |
| `faixaTempoObraMin` / `faixaTempoObraMax` | Menor e maior `tempoObra` (meses) observado |
| `lazerComum` | Itens de lazer que se repetem na maioria do grupo, **separados por ponto e vírgula (`;`), nunca por vírgula** |
| `criteriosComparacao` | JSON de uma linha só (sem quebra de linha) com os pesos/regras que você usaria pra medir similaridade contra este modelo — **como esse campo tem vírgulas e aspas por causa do JSON, ele PRECISA vir entre aspas duplas no CSV, com as aspas internas dobradas** (ver exemplo abaixo) |
| `observacao` | 1-2 frases explicando o que caracteriza esse grupo — se a frase tiver vírgula, também precisa vir entre aspas duplas (regra padrão de CSV) |

### ⚠️ Regra de CSV que mais gera erro — leia com atenção

Qualquer campo que contenha vírgula (`,`) ou aspas (`"`) **precisa** vir entre aspas duplas, e cada
aspas dupla interna vira duas (`""`). É exatamente por isso que `idsEmpreendimentosBase` e
`lazerComum` usam ponto e vírgula em vez de vírgula — assim quase nunca precisam de aspas. Mas
`criteriosComparacao` (JSON) e `observacao` (texto livre) frequentemente vão precisar. Se não tiver
certeza, coloque o campo entre aspas duplas sempre que ele tiver qualquer vírgula ou aspas dentro.

### Exemplo preenchido (2 linhas de dados)

```
idModelo,nomeModelo,dataCriacao,criadoPor,tipoEmpreendimento,tipoPadrao,qtdEmpreendimentosBase,idsEmpreendimentosBase,faixaAreaUtilMin,faixaAreaUtilMax,faixaQuartosMin,faixaQuartosMax,faixaPrecoMedioMin,faixaPrecoMedioMax,faixaTempoObraMin,faixaTempoObraMax,lazerComum,criteriosComparacao,observacao,tipoImovel
,Vertical Médio Compacto — Região Sul de Goiânia,,IA_ASSISTENTE_MODELOS,Condomínio Vertical,Médio,4,EMP-003;EMP-007;EMP-011;EMP-014,55,92,2,3,420000,780000,24,34,Piscina;Academia;Salão de festas;Playground,"{""pesoAreaUtil"":0.3,""pesoPrecoMedio"":0.3,""pesoTempoObra"":0.25,""pesoLazer"":0.15}","Os 4 empreendimentos-base venderam rápido (EXTREMO/FORTE) com apartamentos compactos de 2-3 quartos na região Sul, obra até ~3 anos e lazer completo mas sem diferenciais de luxo.",Apartamento
,Horizontal Popular — Lotes de Entrada,,IA_ASSISTENTE_MODELOS,Condomínio Horizontal,Popular,3,EMP-002;EMP-009;EMP-018,180,250,0,0,180000,260000,12,20,Portaria;Área verde,"{""pesoAreaUtil"":0.4,""pesoPrecoMedio"":0.4,""pesoTempoObra"":0.2}","Lotes pequenos com prazo de obra curto -- venda rapida por preco de entrada, nao por lazer.",Terreno
```

## Regras gerais de bom senso

1. **Nunca crie um modelo com menos de 3 empreendimentos-base.** Se um empreendimento é único no
   seu perfil, ele fica de fora por enquanto — não force um modelo artificial em torno de um caso
   isolado.
2. **Não misture `tipoEmpreendimento` diferentes no mesmo modelo** — Vertical e Horizontal são
   produtos fundamentalmente diferentes (apartamento vs. lote/casa térrea), a comparação não faz
   sentido.
3. **As faixas (`faixa*Min`/`faixa*Max`) devem refletir o que os empreendimentos-base realmente
   têm** — nunca arredonde pra um número "redondo" que nenhum deles tem de verdade.
4. **`idsEmpreendimentosBase` é obrigatório e a quantidade de IDs tem que bater exatamente com
   `qtdEmpreendimentosBase`** — é o jeito de auditar/refazer a análise depois, não pode faltar.
5. Se dois grupos ficarem parecidos demais (faixas quase idênticas, mesmo tipo/padrão), considere
   se não é o mesmo modelo — não crie modelos redundantes.
6. Números sempre sem formatação (sem "R$", sem "m²", sem separador de milhar) — só o número puro,
   igual ao que já vem no repositório.
7. Não adicione texto fora do CSV — nada de "aqui está a análise:", nem blocos de markdown
   (` ```csv `) envolvendo o conteúdo. Só o cabeçalho e as linhas de dados, prontos pra virar o
   arquivo `.csv` em si.
8. `idModelo` e `dataCriacao` sempre em branco — quem preenche esses dois é o sistema no momento
   da importação, não você.
