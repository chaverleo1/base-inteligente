# Changelog — Base Inteligente

## 2026-07-01 (parte 2) — Score Total: temperatura do match ≠ score do cliente

Problema identificado pelo usuário: um cliente com score de cadastro baixo mas com vários
imóveis ideais disponíveis é, na prática, um lead mais quente que um cliente com score alto e
nenhum produto compatível. A classificação quente/morno/frio do dashboard passou a refletir isso.

**Fórmula (`Code.gs`, funções novas `calcularScoreTotal_` / `classificarTemperatura_` em
`dadosDashboard()`):**

```
peso por posição no ranking de matches do cliente: 1º=5, 2º=4, 3º=3, 4º=2, 5º em diante=1
média ponderada = Σ(score_imóvel × peso) / Σ(peso)
Score Total = (score_cliente × 0.35) + (média_ponderada × 0.65)

Score Total ≥ 75        → 🔴 QUENTE
Score Total 50–74       → 🟡 MORNO
Score Total < 50        → 🔵 FRIO
Regra especial: qualquer match com score ≥ 85 força QUENTE, mesmo com Score Total abaixo de 75
Sem nenhum match: Score Total = score_cliente (fallback)
```

- `dadosDashboard()` agora lê a aba MATCHES **antes** de classificar cada contato (precisa dos
  scores dos matches pra calcular o Score Total), e monta `matchCounts`/`mc80`/`mc70` a partir
  dessa mesma leitura (removida a segunda leitura redundante da aba MATCHES que existia antes).
- **Decisão confirmada com o usuário**: contatos com `categoria` em `Corretor`, `Parceiro`,
  `Descartar` ou `Igreja` (campo que só existe em contatos migrados da base legada) continuam
  fora das listas quente/morno/frio — sem esse filtro, o Score Total classificaria por padrão
  qualquer contato sem info (score 0, sem matches) como "frio" (< 50), o que faria a lista
  "frios" incluir corretores e contatos descartados que antes eram excluídos pelo piso antigo de
  `score >= 60`.
- **Top 20 não mudou** — continua ordenado pelo score de cadastro puro (`obj.score`), não pelo
  Score Total. É uma métrica diferente ("maior score de cadastro" vs "temperatura de match").
- `dashboard.html`: as listas quente/morno/frio agora mostram o `scoreTotal` no badge (com o
  score de cadastro original em tooltip), e os limiares do drawer do cliente (badge de
  temperatura + "próximos passos") foram recalibrados de 80/70/60 para 75/50, pra ficar
  consistente com a nova classificação. O card individual de cada imóvel dentro do drawer
  (`m.scoreMatch`, dentro de `carregarMatchesDrawer`) **não mudou** — continua com os limiares
  80/70 antigos, porque é uma escala diferente (score do match individual, não a temperatura do
  cliente).

**Cancelado nesta sessão**: um pedido de botão "Atualizar" no dashboard (revenda → construtoras →
matching em sequência) foi cancelado pelo usuário antes da implementação, por falta de definição
de que função deveria rodar pra "atualizar construtoras" (não existe sync automático pra essa
aba hoje).

## 2026-07-01 (parte 1) — Características do imóvel, Preço Limite e classificação automática

Contexto: sessão de trabalho feita numa estação cliente (`C:\base_inteligente`), com deploy do
backend em Google Apps Script (arquivo `Code.gs`, não versionado neste repositório — vive só no
editor do Apps Script da planilha). Se você está lendo isso numa outra máquina, veja a seção
**"Code.gs — não está neste repo"** antes de mexer em qualquer coisa relacionada a backend/matching.

### 1. Novos campos de características do imóvel (`index.html`, Etapa 3 do formulário)

Adicionados após o campo "Tipo de imóvel":
- **Quartos** (chips: 1/2/3/4+), **Vagas de garagem** (chips: 0/1/2/3+) — sempre visíveis
- **Suítes** (chips: 0/1/2/3+) e **Andar alto** / **Elevador** (toggles) — visíveis só quando
  segmento = Apartamento
- **Área de terreno** (input numérico) e **Área adensável** / **Churrasqueira** (toggles) —
  visíveis só quando segmento = Casa/Sobrado/Lote em cond.
- **Área útil aproximada** — slider de 50m² a 500m²+
- **Comodidades** sempre visíveis: Aceita térreo, Piscina, Home office, Condomínio fechado,
  Acessibilidade

Implementação: `toggleBool(el, key)` é uma função nova, separada de `toggleChip` — ela alterna
cada chip **independentemente** (não desmarca os irmãos), porque várias comodidades podem estar
ativas ao mesmo tempo. `updateCamposImovel()` mostra/esconde os campos condicionais via
`display:none` nas classes `.campo-apto` / `.campo-casa`, chamada sempre que o segmento muda.

**Bug corrigido (não relacionado à feature):** havia duas declarações da função `goToStep()` no
arquivo; a segunda (mais simples) sobrescrevia a primeira e impedia que `buildSummary()` e a
barra de progresso rodassem ao navegar entre etapas. A duplicata foi removida.

### 2. Unificação de preço: `precoLimite` substitui `valorMin`/`valorMax`

Motivação (definida pelo usuário): quando o cliente informa um valor no cadastro (ex: "quero até
250 mil"), esse valor é um **teto de referência**, não uma faixa mín/máx. O motor de matching
agora calcula a proximidade percentual entre o preço do imóvel e esse teto.

- **Formulário (`index.html`)**: campo único "Preço limite" (`id="precoLimite"`), formatado como
  moeda. Substituiu os dois campos antigos "Valor mínimo"/"Valor máximo".
- **Dashboard (`dashboard.html`)**: no drawer do cliente, "Faixa de preço" virou "Preço limite".
- **Novo campo `margem_preco`**: percentual de tolerância por cliente (padrão 30% se vazio).
  Não tem campo próprio no formulário ainda — é editável só direto na planilha, caso algum
  cliente precise de margem diferente da padrão.

### 3. Classificação automática — `tipo_contato`

Todo cadastro novo enviado pelo formulário grava `tipo_contato = "LEAD INTERESSADO"`
automaticamente (hardcoded na função `salvar()` do Code.gs). Ao **editar** um contato existente
(`atualizar()`), o valor de `tipo_contato` já cadastrado é preservado — o formulário não tem
campo para editá-lo, então não deve sobrescrever classificações manuais feitas depois (ex.
"COMPRADOR", "PROPRIETÁRIO VENDEDOR").

### 4. Motor de matching — score de preço por margem percentual

Nova função `scorePreco_(valorImo, precoLimite, margemPerc)` no Code.gs, substituindo a lógica
antiga de faixa min/max:

```
distância% = |preço_imóvel - precoLimite| / precoLimite × 100

  0–5%    → 100 pts
  6–10%   →  95 pts
  11–15%  →  85 pts
  16–20%  →  75 pts
  21–25%  →  70 pts
  26–30%  →  60 pts
  > margem (30% padrão) → 0 pts, excluído do match
```

Score mínimo pra aparecer nos matches continua 70 (já existia, em `rodarMatching()`).

### 5. Code.gs — não está neste repo (importante!)

O backend (Google Apps Script) é editado direto no editor do Apps Script vinculado à planilha
(`SHEET_ID = 1cr1Qs9o9_4mFXy0fZmVx-54xYiBNF6Vx5fHcIsiAkNI`), **não faz parte deste repositório
git**. Uma cópia de trabalho ficou salva em `C:\Users\Lider\Downloads\code.gs.txt` na máquina
cliente durante esta sessão, já com todas as mudanças abaixo aplicadas:

- `CABECALHO` (schema da aba CONTATOS, 54 colunas): adicionados quartos/suites/vagas/areaUtil/
  areaTerreno/adensavel/andarAlto/aceitaTerreo/churrasqueira/piscina/homeOffice/condFechado/
  elevador/acessibilidade (entre `segmento` e `padrao`), e `precoLimite`/`margem_preco` no lugar
  de `valorMin`/`valorMax`. Também foram adicionados `tipo_contato`/`tags` que já eram usados
  pelo dashboard mas não estavam nesta constante.
- `salvar()` / `atualizar()`: lógica do `tipo_contato` descrita acima.
- `scorePreco_()`: nova fórmula de margem, descrita acima.
- `calcularMatch_()`, `empurrarMatch_()`: atualizados para usar `precoLimite`/`margem_preco`.
- `CABECALHO_MATCHES`: perdeu `cliValorMin`/`cliValorMax`, ganhou `cliPrecoLimite` (37 colunas,
  era 38).
- `rodarMatching()`: os índices fixos da coluna `scoreMatch` (antes hardcoded como 35/36) agora
  são calculados dinamicamente via `CABECALHO_MATCHES.indexOf('scoreMatch')`, porque a posição
  da coluna mudou com a remoção do valorMin/valorMax.

**⚠️ Se for reimplantar o Code.gs**: use sempre "Gerenciar implantações → editar (lápis) → Nova
versão", nunca "Nova implantação" — isso muda a URL do Web App (`AKfycb...`) e quebra o
`WEBHOOK_URL` hardcoded em `index.html`, `dashboard.html` e `reset.html`. Nesta sessão isso
aconteceu 2 vezes sem querer; a URL final ficou:
`https://script.google.com/macros/s/AKfycbzK3KMdPy6OMYscvGwF8pFjMXjhdkl1zkJb0sMQvlB4ze_Pm7loa2fZhSK6SQpfc7vd/exec`
(já commitada nos 3 arquivos HTML).

### 6. Migração da base legada de contatos

`scripts/processar_contatos_v3.py` e `scripts/importar_base_local.py` atualizados para o novo
schema (coluna `precoLimite` no lugar de `valorMin`/`valorMax`).

Rodada a migração a partir de `C:\Users\Lider\Downloads\contacts.csv` (export do Google
Contatos): 5.630 contatos brutos → 5.715 linhas processadas (um telefone por linha). Gerado
`C:\Users\Lider\Downloads\planilha_modelo_contatos.xlsx` (54 colunas, mesma ordem do `CABECALHO`
do Code.gs).

**⚠️ Status no fim desta sessão: a planilha CONTATOS em produção AINDA TEM os 5.547 contatos
antigos** (confirmados como descartáveis pelo usuário) — **a substituição pela planilha migrada
ainda não tinha sido confirmada como feita**. Antes de rodar `rodarMatching()` ou confiar nos
dados do dashboard, confirme com o usuário se esse import (Arquivo → Importar → Substituir
planilha atual → aba CONTATOS) já foi concluído.

### 7. Notas de infraestrutura (específico da máquina cliente, não precisa replicar)

O `.git` local foi corrompido pela sincronização do Google Drive (a pasta do projeto é
sincronizada pelo Google Drive para computador) e teve que ser recuperado via `git fetch` +
reconstrução manual de refs a partir do reflog. Para evitar recorrência, o `.git` real foi movido
para `C:\GitRepos\base_inteligente.git`, deixando em `C:\base_inteligente\.git` apenas um arquivo
texto (`gitdir: C:/GitRepos/base_inteligente.git`). Isso é transparente pro Git e não afeta quem
clona o repositório normalmente — só é relevante se você estiver na mesma máquina cliente.
