# Changelog — Base Inteligente

## 2026-07-01 (parte 9) — Score de preço ruim escondido atrás de um total 100

Usuário reportou: cliente CLI-10048 (precoLimite 600 mil) recebeu match de imóvel de R$420.000
(30% abaixo do limite) com score 100 — o mesmo valor de um match perfeito.

**Causa:** `scorePreco_` deu 60 pontos corretamente pros 30% de distância (correto, no limite da
margem), mas a soma `tipo(25) + preco(60) + quartos(12) + padrao(10) = 107` estourava o teto de
100 (`Math.min(total,100)`) e escondia que o preço estava ruim. Isso só passou a acontecer depois
que o preço virou uma escala de 0-100 (parte 2/margem de 30%) — antes ele valia no máximo 30
pontos no total, então não estourava.

**Fix:** a nota de preço exibida continua em 0-100 (como pedido), mas a contribuição dela pro
score total voltou a ser proporcional — até 30 pontos, como era antes:
`ptPrecoContrib = ptPreco * 0.3`. Testado: imóvel 30% abaixo do limite agora fica em 65 (abaixo
do corte de 70, não aparece mais como match); imóvel 8,3% acima continua qualificado (76); match
genuinamente perfeito continua 100.

**Efeito colateral esperado:** vários matches que hoje mostram "100" devem cair de score depois
de rodar `rodarMatching()` de novo (removendo os "falsos 100" que só pareciam perfeitos pela
soma, não pelo preço de verdade).

## 2026-07-01 (parte 10) — Nome completo em vez de só primeiro nome

**Migração (`processar_contatos_v3.py`)**: a limpeza do nome só reconhecia `-`/`–`/`—` como
separador entre o nome e a anotação do corretor. Nomes separados por `"//"` (muito comuns na
base, ex: `"Antônia // 15/4, CS ARUANA 3, 420K"`) não eram cortados — o campo `nome` ficava igual
ao `nome_bruto` inteiro. Corrigido: `re.split(r"\s*(?:[-–—]|//)\s*", nome_limpo)[0]` — testado
contra os exemplos reais do usuário, ambos batendo exatamente (`"Antônia"` e `"João Carlos"`).

**Dashboard (`Code.gs`)**: `dadosDashboard()`, `top20` e `empurrarMatch_()` cortavam o nome pro
primeiro nome só (`.split(' ')[0]`) antes de exibir nas listas — essa é exatamente a causa da
ambiguidade "Olinda" (48 registros diferentes com o mesmo primeiro nome) descoberta na parte 7.
Agora exibe o nome completo (`.trim()`, sem cortar), melhorando a identificação nas listas
quente/morno e na aba MATCHES.

Migração regenerada — 0 linhas com `//` sobrando no campo nome (confirmado por varredura
completa da base).

## 2026-07-01 (parte 8) — Editar não encontra cliente até o Code.gs ser reimplantado

Usuário testou o botão Editar: parou de abrir nova janela (fix da parte 7 funcionou), mas ainda
não encontra o cadastro. Causa: a ação `buscar_linha` só existe no `code.gs.txt` local — a
implantação em produção ainda não foi atualizada com esse trecho, então a chamada retorna
`{"status":"acao desconhecida"}` (confirmado via curl direto na URL do Web App).

`carregarClienteDaUrl()` tratava essa resposta como se fosse um cliente válido (só checava `!c`,
não o formato), preenchendo o formulário com campos vazios sem avisar o motivo. Agora valida
`c.status` (indica erro/ação não reconhecida) e `c.nome` (campo obrigatório que só existe num
cliente de verdade) antes de prosseguir, mostrando um toast claro em vez de falhar em silêncio.

**Ação pendente do usuário**: colar o trecho `buscar_linha` (parte 7) no Code.gs e reimplantar.

## 2026-07-01 (parte 7) — Botão "Editar" do dashboard não preenchia o formulário

Problema: botão Editar na página do cliente abria `index.html` em branco (às vezes pedindo login
de novo). Causas:
1. O link passava `?buscar=<nome>` mas o `index.html` nunca leu esse parâmetro — não existia
   nenhum código pra buscar/preencher automaticamente a partir da URL.
2. Identificar pelo nome é frágil — "Olinda" aparece em 48 registros diferentes na base (nome de
   bairro/empreendimento usado como texto no campo nome do contato).
3. O link abria em nova aba (`target="_blank"`); cópia de `sessionStorage` pra nova aba não é
   garantida em todos os navegadores, podendo pedir login de novo.

**Fix:**
- `dashboard.html`: botão Editar agora usa `_linha` (identificador único, já usado em
  editar/excluir no resto do app) em vez do nome, e não abre mais em nova aba.
- `index.html`: nova função `carregarClienteDaUrl()` lê `?linha=N` no load e busca+preenche via
  nova ação `buscar_linha` (Code.gs), reaproveitando `carregarContato()` que já existia pro fluxo
  de busca manual.
- `Code.gs`: nova ação `buscar_linha` no `doGet` — busca uma linha específica por índice (mais
  direto que o `buscar` por texto, que faz varredura completa).

Validado no preview: `carregarContato()` preenche nome/telefone/segmento corretamente e
`linhaAtual` fica setado pra apontar pra atualização (não criação de linha nova) ao salvar.

## 2026-07-01 (parte 6) — Investigação: só 261 de 5.715 contatos migrados com precoLimite

Usuário reportou só 263 contatos exportados com "preço limite". Investigação confirmou: **261
de 5.715** (bate com o número reportado). Causa raiz: `extrair_valores()` (em
`processar_contatos_v3.py`) só extrai preço do que está **literalmente escrito no nome do
contato** (padrões "250K", "3.900.000") — a grande maioria dos contatos simplesmente não tem
nenhum valor mencionado no nome. Isso não é bug, é limitação inerente da heurística (não há outro
campo com informação de preço pra contatos migrados).

Encontrado e corrigido um padrão real que a extração não reconhecia: notação **"Mi"** e
**"milhão"/"milhões"** usada por alguns corretores (ex: `"2.700Mi"`, `"1milhao"`, `"3mi"`).
Adicionado suporte com heurística de magnitude pra desambiguar "Mi": número < 100 é tratado como
milhão (`"3mi"` → R$ 3.000.000), número >= 100 é tratado como mil (`"2.700Mi"` → 2700 mil = R$
2.700.000) — testado contra os casos reais encontrados na base e todos batem com o valor
esperado. Também corrigido um falso positivo descoberto no teste: "123 Milhas" (nome de empresa)
estava sendo lido como R$ 123 milhões antes do regex exigir a palavra completa
(`MILHAO`/`MILHOES`, não só o prefixo `MILH`).

**Resultado:** 261 → 275 contatos com precoLimite (ganho pequeno, ~14 casos). Migração
regenerada em `planilha_modelo_contatos.xlsx`. Os ~5.440 restantes sem precoLimite é o
comportamento correto/esperado — não há preço nenhum escrito nesses nomes pra extrair.

## 2026-07-01 (parte 5) — Filtro de elegibilidade do matching excluía quase toda a base migrada

Após a correção da parte 4, `rodarMatching()` ainda gerou só 16 pares (log real da execução:
"Contatos: 5715 | Revenda: 495 | Construtora: 354 | Contatos aptos: 128 de 5715"). A causa não
era mais o tipo — era o filtro `contataveis`, que exigia `score >= 40` **e** alguma preferência
declarada. A base migrada tem score calculado por heurística de nome (script
`processar_contatos_v3.py`) e a maioria fica abaixo de 40 mesmo com segmento bem identificado
(estatística da migração: 127 "Média" + 1.622 "Baixa" + 3.966 "S/prio", quase tudo abaixo do
piso). Isso excluía ~97% da base do motor de matching, mesmo tendo estoque compatível.

**Decisão confirmada com o usuário:** remover o piso de score, manter só a exigência de
preferência declarada (segmento, precoLimite ou bairroInteresse). Volume de contatos elegíveis
deve subir de ~128 para a casa de milhares — **atenção a possível timeout** do
`rodarMatching()` no Apps Script (limite de 6 min de execução) com esse volume maior; se
acontecer, vai ser necessário processar em lotes/gatilhos.

**Resultado confirmado em produção** (execução real após o deploy): 2.983 contatos aptos (era
128), 1.450 pares gerados (era 16), rodou em ~25s sem timeout. Dashboard após o rerun: 227
quentes (era 3), 4 mornos (era 0), 4.279 frios — distribuição condizente com os matches reais
gerados (todo cliente quente tem `mc80`/`mc70` > 0 na amostra verificada).

## 2026-07-01 (parte 4) — Correção: tipo do imóvel não normalizado derrubava quase todos os matches

Depois da parte 3 (desqualificação por tipo incompatível), o número de matches despencou pra
quase zero em segmentos inteiros — ex: nenhum cliente de "Lote em cond." tinha qualquer match,
mesmo havendo estoque compatível.

**Causa:** `scoreTipo_` normalizava o tipo do **cliente** com `extrairTipo_()` (reduz pra um
vocabulário fixo: apartamento/casa/sobrado/lote/comercial/chacara), mas comparava contra o tipo
do **imóvel** só com `norm_()` (lowercase/sem acento, sem reduzir vocabulário). Resultado: cliente
que escolhe "Lote em cond." vira `'lote'`, mas um imóvel que a Imobzi rotula como `"Terreno"`
continuava literalmente `"terreno"` — as strings nunca batiam, e a desqualificação por tipo
incompatível (parte 3) descartava o par inteiro.

**Fix:** `tipoImo` agora também passa por `extrairTipo_()` primeiro (com fallback pro texto
normalizado bruto se não reconhecer nenhum padrão, preservando match exato por nome como
"Flat"). Testado com Lote em cond.×Terreno, Casa×Sobrado, Sala comercial×Loja, Apartamento×Casa
(desqualificado) — todos batendo como esperado.

**Novamente:** precisa rodar `rodarMatching()` manualmente após o deploy pra regerar a aba
MATCHES com a correção.

## 2026-07-01 (parte 3) — Correção: matches de tipo incompatível e temperatura sem produto

Dois bugs reais reportados pelo usuário em produção, encontrados logo após a implementação do
Score Total/margem de preço (parte 2):

**Bug 1 — cliente "morno" sem nenhum imóvel em match.** `calcularScoreTotal_` caía de volta pro
score de cadastro puro quando não havia matches (`return scoreCliente`), o que contrariava a
própria premissa da feature (cliente sem produto deveria ser mais frio, não mais quente).
Corrigido para `return scoreCliente * 0.35` — sem matches, o Score Total máximo possível é 35,
sempre "frio".

**Bug 2 — "Casa" aparecendo como oferta para cliente que quer Apartamento/Lote em cond.** Duas
causas somadas:
1. `scorePreco_` (parte 2) passou a valer até 100 pontos sozinho — suficiente pra ultrapassar o
   limite de 70 do match mesmo com tipo de imóvel completamente incompatível (`scoreTipo_`
   retornava 0, mas isso só zerava o componente, não desqualificava a soma final).
2. `scoreTipo_` extraía o tipo desejado do texto livre (conversa/observações) **antes** do campo
   estruturado `segmento` — uma observação mencionando "moramos numa casa alugada" sequestrava a
   detecção, ignorando o segmento real escolhido no formulário.

Corrigido: `scoreTipo_` agora prioriza `segmento` sobre texto livre; `calcularMatch_` desqualifica
o match inteiro (`score: 0`) quando `ptTipo === 0` (tipo genuinamente incompatível — grupos
vertical/horizontal/terra/comercial diferentes), em vez de deixar preço/bairro compensarem.

**Importante:** essas correções não retroagem sobre matches já gravados na aba MATCHES — foi
necessário rodar `rodarMatching()` manualmente uma vez após o deploy pra regerar os dados
corretos (confirmado em produção: matches de "Vinicius/CLI-10053" antes misturavam Casa e
Apartamento, depois do rerun ficaram 100% Apartamento).

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
