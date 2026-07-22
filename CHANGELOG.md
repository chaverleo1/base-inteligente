# Changelog — Base Inteligente

## 2026-07-22 (parte 80) — Botão "🎯 Estratégias" em Contatos abre o mix de 7 ofertas do cliente

Pedido do usuário: coluna "Estratégias" na tabela de Contatos com botão de destaque que abre uma
página com o mix de 7 ofertas montado a partir do perfil do cliente (se ele optou por imóvel Novo
e/ou Na planta), no mesmo formato das tabelas de `estrategias.html`.

**`contatos.html`** — coluna "Estratégias" nova (antes de "Ações") com botão destacado
(`.btn-estrategias`, âmbar cheio — mais forte que os demais botões da linha, pedido explícito de
destaque). Abre `estrategias.html?cliente=CTT-NNN`. Contato sem `idCliente` mostra "—".

**`estrategias.html`** — novo modo cliente (`?cliente=`):
- Busca o cliente (`acao=buscar`, que já aceita idCliente) e monta UM mix de 7 papéis a partir do
  perfil, na mesma tabela dos blocos por segmento (extraída pra `tabelaMixHtml_` compartilhada;
  carregamento de dados também unificado em `carregarItensScored_`).
- Cascata de filtros do perfil: **Situação do imóvel** (Novo → Pronto/Pronto novo/Entregue; Na
  planta → Em planta/Em obras; sem opção marcada → considera as duas, com aviso visível),
  **Padrão** (Econômico→Popular, Médio padrão→Médio, Alto padrão→Alto, Luxo→Luxo; multi-select),
  **Preço limite** (quem passa do limite sai do mix principal mas vira candidato natural de
  ÂNCORA SUPERIOR — produto acima da faixa só pra ancoragem de preço).
- Cabeçalho vira "🎯 Estratégias para [nome]", sub descreve os filtros aplicados, filtro de Padrão
  da página some, botão "← Voltar pra Contatos".

Testado ao vivo no navegador com fetch mockado (cliente "Na planta" + "Médio padrão" + limite
R$ 500k sobre 8 lançamentos): o "Pronto novo" ficou de fora, o acima do limite apareceu só como
Âncora Superior, os 7 papéis preencheram no formato idêntico ao dos segmentos. Render da tabela de
Contatos testado em Node (coluna nova alinhada, link certo, "—" sem idCliente). Regressão das
suítes de Mix/paridade sem quebras. Pego durante o teste: plural errado "compatívelis" no subtítulo
— corrigido pra "compatíveis".

100% frontend — sem alterações em `code.txt`.

## 2026-07-22 (parte 79) — Coluna "Situação" (Novo/Na planta) nas tabelas de Estratégias

Pedido do usuário: coluna nova nas tabelas de Mix Estratégico (`estrategias.html`) informando se o
empreendimento é Novo ou Na planta — mesma terminologia do campo "Situação do imóvel" de Contatos
(parte 75; "Usado" não se aplica a lançamento).

Derivada do estágio já cadastrado (`status`), sem campo novo: Em planta/Em obras → **Na planta**
(azul); Pronto/Pronto novo/Entregue → **Novo** (verde). Posicionada entre Estoque e Tabela
(`situacaoBadgeHtml_` + `.situacao-badge`).

Testado ao vivo no navegador com fetch mockado cobrindo os 5 estágios: cada um mapeia pro badge
certo, estágio desconhecido/vazio cai em "—".

100% frontend — sem alterações em `code.txt`.

## 2026-07-22 (parte 78) — Botão "🏷️ Vendedor" na tabela de Vendedor Sem Avaliação

Pedido do usuário: na tabela "Lançamentos com Vendedor Sem Avaliação" (`insight-detail.html`,
aberta pelo card novo da Visão Geral), a coluna "Vendedor" ganha um botão que abre o cadastro de
avaliação direto dali, sem precisar ir em Lançamentos primeiro.

`insight-detail.html` passou a carregar `perfil-vendedor.js` (mesmo modal usado em
lancamentos.html/busca.html/revendas-construtoras.html) — precisou de 2 funções globais que essa
página ainda não tinha e o `perfil-vendedor.js` exige: `tokenSessao()` e `trataNaoAutenticado()`
(usada internamente pra detectar sessão expirada e redirecionar). Sem elas, o modal abria mas
travava com "Erro ao carregar: trataNaoAutenticado is not defined" — encontrado e corrigido durante
o teste.

Diferente de `abrirPvLanc` (lancamentos.html), que recarrega a página inteira ao salvar (porque o
score entra no Score de Tração e reordena o ranking inteiro), aqui o callback só atualiza o badge
da célula na hora (`abrirAvaliacaoVendedor_`) — essa tela mostra um snapshot congelado em
`sessionStorage`, recarregar não traria dado novo nenhum de qualquer forma.

Testado ao vivo no navegador: botão abre o modal com o título certo ("Perfil do Vendedor — [nome]");
confirmado que o fluxo de sessão expirada agora redireciona corretamente em vez de travar com erro
de JS (só não deu pra testar o fluxo completo de salvar, que exige sessão autenticada de verdade).

100% frontend — sem alterações em `code.txt`.

## 2026-07-22 (parte 77) — Ajustes na tabela de Estratégias: coluna Tabela, remove Similaridade/Ação, destaca Tração

Pedido do usuário, na tabela de Mix Estratégico (`estrategias.html`):
- Coluna **Tabela** nova — badge com destaque (✓ Atualizada / ⚠ Desatualizada), mesmo campo
  `statusTabela` que já alimenta o card "Tabela desatualizada" da Visão Geral.
- Coluna **Similaridade** removida (continua no CSV exportado, só saiu da tela).
- Coluna **Ação** (botão "Detalhes") removida — `verDetalhesItem_()` ficou sem uso, deletada.
- Nota de **Tração** ganhou destaque visual: badge colorido (`.tracao-badge`) usando os mesmos
  limiares de `classeScoreTracao_` em `lancamentos.html` (verde ≥7, âmbar ≥5, vermelho ≥3, cinza
  abaixo) — antes era só texto plano.

Testado ao vivo no navegador com fetch mockado: coluna Tabela aparece e alterna corretamente
Atualizada/Desatualizada por item, Similaridade e Ação sumiram da tabela, badge de Tração aparece
com a classe de cor certa. Regressão das suítes de Mix Estratégico/paridade do motor sem quebras.

100% frontend — sem alterações em `code.txt`.

## 2026-07-22 (parte 76) — 3 cards novos na Visão Geral + coluna Estoque em Estratégias + fix do alerta de Vendedor Sem Avaliação

Lista de tarefas do usuário, 4 itens:

**1. Card "Estoque pronto"** (Visão Geral, `dashboard.html`) — soma o `estoque` de todos os
empreendimentos já "Pronto"/"Pronto novo"/"Entregue" (agrupados por `idLancamento`, já que
LANCAMENTOS tem 1 linha por unidade/tipologia). "Ver →" abre `insight-detail.html` com a lista dos
empreendimentos que compõem o total.

**2. Coluna "Estoque"** nas tabelas de Mix Estratégico (`estrategias.html`) — adicionada entre
Preço e Ação, mostra `item.e.estoque` de cada papel preenchido.

**3. Card "Tabela desatualizada"** (Visão Geral) — conta empreendimentos com
`statusTabela === 'Desatualizada'` (mesmo campo que já gera o badge "⚠ Tabela desatualizada" nos
cards de `lancamentos.html`). "Ver →" mesmo mecanismo do card acima.

**4. Card "Vendedor sem avaliação"** (Visão Geral) + revisão + fix do alerta:
- Card novo conta lançamentos com score de vendedor = 0 (busca `listarPerfisVendedor`, mesmo
  endpoint usado pelos badges de urgência — score ausente ou 0 explícito contam igual, mesma
  convenção já usada em `pvSetBotaoScore_`).
- **Revisão pedida**: conferido que a nota do vendedor SÓ aparece no botão "🏷️ Vendedor" dos cards
  quando `scoreVendedor > 0` (`pvSetBotaoScore_` em `perfil-vendedor.js`, comportamento já
  existente e intencional — "sem isso, ficava um '0' pendurado" — não precisou de mudança).
- **Fix**: `ALERTAS_TRACAO` (`lancamentos.html`) tratava `scoreVendedor <= 30` como "risco de
  qualidade", incluindo o caso `=== 0` — que na real significa "perfil nunca avaliado", não
  "avaliado como péssimo". Cenário `risco_vendedor` agora exige `scoreVendedor > 0`, e um cenário
  novo (`vendedor_sem_avaliacao`) cobre exatamente o caso `=== 0` com a mensagem
  "⚠️ Vendedor Sem Avaliação!" em vez de "⚠️ Risco de Qualidade do Vendedor".

`insight-detail.html`: `tableLancamentos()` ganhou 3 colunas opcionais (Estoque/Vendedor/Tabela),
cada uma só aparece se pelo menos 1 item da lista trouxer aquele dado — os usos antigos (entrega
≤180 dias, padrões sem demanda) continuam com a tabela original, sem coluna a mais.

Testado em Node: lógica do novo cenário de alerta (8 casos: score=0 dispara Sem Avaliação, score
15/30 dispara Risco, score 31 não dispara nenhum, score=0 sem as outras condições não dispara,
oportunidade continua igual). Regressão completa das suítes anteriores sem quebras. Testado ao
vivo no navegador com fetch mockado: os 3 valores dos cards batem exatamente com os dados de teste
(estoque somado, contagem de tabela desatualizada, contagem de sem-avaliação incluindo os 2 casos
— sem perfil e score=0 explícito), "Ver →" abre `insight-detail.html` com as colunas certas, coluna
Estoque aparece na tabela de Estratégias, e o card do lançamento mostra "Vendedor Sem Avaliação!"
em vez do alerta antigo quando aplicável.

100% frontend — sem alterações em `code.txt`, não precisa reimplantar o Apps Script.

## 2026-07-22 (parte 75) — Novo campo "Situação do imóvel" em Contatos

Pedido do usuário: campo novo na etapa "O que essa pessoa quer comprar?" de `contatos.html`, antes
de "Padrão" — chips de múltipla escolha: Usado, Novo, Na planta.

Seguido o mesmo padrão já usado por "Padrão"/"Finalidade" (chip multi-select via `toggleChip`, sem
afetar o motor de Busca Aberta/matching, que não foi tocado — só um campo de perfil novo, não um
critério de pontuação):
- `code.txt`: `situacaoImovel` adicionado ao final de `CABECALHO` (migração via
  `migrarCabecalhoContatos()`, que só sabe anexar colunas — mesmo padrão de sempre).
- `contatos.html`: chip-group novo antes de "Padrão"; incluído no resumo (`buildSummary`), no
  payload de salvar/atualizar, no carregamento pra edição (`ativarChip`) e na tela de detalhe do
  contato (drawer).
- `dashboard.html`: mesmo campo adicionado na tela de detalhe do contato (drawer espelhado, mesma
  função `campo()`) — mantém as duas telas de detalhe consistentes.

Testado: sintaxe de `contatos.html`/`code.txt` sem erros; lógica de `toggleChip`/`ativarChip`
testada isoladamente no navegador (multi-seleção acumula, desmarcar remove, `ativarChip` restaura
a seleção certa ao editar um contato existente).

⚠️ **Backend**: `code.txt` mudou (`situacaoImovel` em `CABECALHO`) — precisa colar
`code.gs.txt` no Apps Script e reimplantar como nova versão pra o campo persistir de verdade
(sem isso, o valor é enviado mas a coluna não existe na planilha ainda).

## 2026-07-22 (parte 74) — Novo módulo ESTRATÉGIAS: Mix de 7 ofertas + Tráfego Pago

Usuário compartilhou um estudo ("MODULO_ESTRATEGIAS_Especificacao.txt", feito por uma IA MENTORA
externa) propondo um módulo novo de Estratégias. Boa parte do estudo redefinia conceitos já
construídos e validados nesta sessão com dado real (Modelo Vendedor, Nota de Similaridade, Score
de Tração, schema de MODELOS_VENDEDORES) de forma DIFERENTE e conflitante — inclusive citando o
conceito "Indicador de Aceitação" que o usuário já tinha mandado abandonar. Combinado com o
usuário: implementar só as partes genuinamente novas (Mix Estratégico de 7 papéis, Estratégias de
Tráfego Pago, exportação pra IA de Campanhas), reaproveitando o Score de Tração/Similaridade/
Padrão Vendedor/Modelos Vendedores já existentes — sem recriar essas fórmulas do zero.

**Nova página `estrategias.html`** (Subseção B — Tráfego Pago, primeira fase acordada; Subseção A —
Clientes fica pra depois):

- **Faixas de preço dinâmicas** — em vez de uma aba CONFIGURACOES com valores fixos em R$ (como o
  estudo sugeria), Médio e Alto Padrão são divididos em Faixa A/B pela MEDIANA do menor preço da
  carteira atual (`organizarPorSegmento_`/`calcularFaixaPreco_`) — se ajusta sozinho conforme a
  base muda. Popular e Luxo ficam numa faixa única cada. 6 segmentos ao todo: Popular, Médio B/A,
  Alto Padrão B/A, Luxo (`ORDEM_SEGMENTOS_`).
- **Mix Estratégico de 7 papéis** (`selecionarMixEstrategico_`) — por segmento: ISCA/ÂNCORA
  INFERIOR (menor preço), ALVO 1-2-3 (maior Score de Tração), COMPLEMENTAR (melhor Tração de Tipo
  de Imóvel diferente do Alvo Primário, ou o melhor restante), ÂNCORA SUPERIOR (menor preço do
  segmento imediatamente acima, sem consumir produto do segmento atual). Mínimo de 5 produtos com
  Score de Tração > 0 pro mix funcionar — abaixo disso, aviso claro em vez de mix incompleto
  silencioso.
- **Score de Cobertura do Mix** (`calcularCoberturaMix_`, semáforo 🟢/🟡/🔴) — mede papéis
  preenchidos, quantos com Tração ≥6, presença das duas âncoras, diversidade de construtoras.
- **Exportação CSV + prompt pra IA de Campanhas** (`exportarCSV_`/`montarPromptEstrategia_`) — CSV
  com só campos que o sistema realmente tem (sem inventar colunas tipo VSO/margem_estimada/
  tem_decorado que o estudo sugeria mas não existem na base), botão "🤖 Enviar para IA de
  Campanhas" abre modal com prompt completo + CSV, pronto pra copiar e colar numa conversa com
  Claude/ChatGPT.
- **Nav "Estratégias"** adicionado em todas as páginas do sistema (10 arquivos).

**Duplicação deliberada do motor de cálculo** — `estrategias.html` tem sua própria cópia das
funções de Score de Tração/Similaridade/Padrão Vendedor (mesmas de `lancamentos.html`), em vez de
extrair pra um arquivo compartilhado: `lancamentos.html` está em produção sendo validado com dado
real agora, e um refactor grande ali tinha risco desnecessário pra esta entrega. Mitigação: criado
`test_paridade_motor_estrategias.js` (scratchpad da sessão), que roda as duas cópias com os mesmos
dados e compara resultado — já pegou 1 divergência real (texto de `observacao` diferente entre os
dois arquivos) antes de ir pro ar. Qualquer mudança futura de critério precisa espelhar nas duas
cópias e rodar esse teste.

Testado em Node: lógica de faixas/segmentação, seleção dos 7 papéis (grupo válido, grupo pequeno
demais com aviso, preenchimento sem duplicar produto, Complementar com/sem tipo diferente
disponível, Âncora Superior puxando do segmento de cima), Score de Cobertura, e paridade completa
do motor duplicado. Testado ao vivo no navegador com fetch mockado: página carrega, filtro por
Padrão funciona, blocos renderizam com os 7 papéis, exportação CSV gera arquivo bem formado, modal
de exportação mostra prompt+CSV corretos.

100% frontend — sem alterações em `code.txt`, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 73) — Bug: previsaoEntrega em formato ISO travava a classificação inteira

Usuário reportou: 3 obras já entregues ("Pronto novo"), com Data de Entrega preenchida e % vendido
alto (97%, 99%, 81%), continuavam sem nenhuma classificação de Padrão Vendedor. Pedi o dado bruto
de uma delas (Near Lourenzzo) via console e encontrei a causa: `previsaoEntrega` veio como
`"2012-12-30T02:00:00.000Z"` (ISO 8601) em vez de `"30/12/2012"` — o Google Sheets tinha formatado
essa célula como Data em vez de texto puro (mesmo problema que `dataLancamento` já tinha antes),
então `getValues()` devolve um objeto Date que vira ISO 8601 ao passar pelo JSON de resposta. Nem
`parseDataFlexivel_` (backend) nem `parseDataFlexivelParaDate_` (frontend) reconheciam esse
formato — a classificação inteira parava de cara (`if (!dataEntrega) return null`), pra QUALQUER
lançamento com esse problema.

**Correção**: `parseDataFlexivel_` (code.txt) e `parseDataFlexivelParaDate_` (lancamentos.html)
ganharam um terceiro padrão de reconhecimento (`/^(\d{4})-(\d{2})-(\d{2})/`), extraindo ano/mês/dia
direto da string ISO sem reconstruir um objeto `Date` (evita reinterpretar o "Z" e mudar o dia por
fuso horário). `calcularTempoObraEntreDatas_` foi simplificada pra reaproveitar
`parseDataFlexivelParaDate_` nos dois lados (antes tinha um regex próprio duplicado, sem suporte a
ISO). No backend, `previsaoEntrega` entrou na lista de colunas que recebem `setNumberFormat('@')`
ao salvar (mesma proteção que `dataLancamento` já tinha) — evita esse problema em cadastros novos.

⚠️ **Efeito colateral esperado, não é bug**: como o `historicoEstoque` dessas obras antigas só tem
1 snapshot (hoje, capturado na reimportação), o sistema não sabe QUANDO elas realmente venderam
70-97% no passado — só sabe que, comparando "hoje" contra uma entrega de 2012, já se passaram anos.
Isso as classifica como **SOBRA SUSPEITA** (alerta no Mapa Geral, não entra na tabela Padrão
Vendedor) em vez de FORTE/POTENCIAL — tecnicamente correto dado o critério definido (>2 anos depois
da entrega), mas pode surpreender quem esperava ver essas obras antigas e bem vendidas como padrão
positivo. Não tem solução sem histórico real de estoque anterior a hoje.

Testado em Node: `parseDataFlexivelParaDate_`/`calcularTempoObraEntreDatas_` reconhecem o formato
ISO corretamente (ano/mês/dia batendo), e o dado real do Near Lourenzzo (que antes retornava `null`)
agora retorna um resultado válido. Regressão completa (todas as suítes anteriores) sem quebras.

⚠️ **Backend**: `code.txt` mudou (`parseDataFlexivel_` + `setNumberFormat('@')` em
`previsaoEntrega`) — precisa colar `code.gs.txt` no Apps Script e reimplantar como nova versão.

## 2026-07-21 (parte 72) — Tabela "Modelos Vendedores" move pra cima do Padrão Vendedor no Mapa Geral

Pedido do usuário: a tabela de Modelos Vendedores (importados + automáticos, parte 71) estava só
na aba "Importar Modelos" — pediu pra ela aparecer acima da tabela "Padrão Vendedor", na aba
"Mapa Geral" (fluxo mais natural: ver primeiro os modelos de referência, depois quem se classifica
contra eles).

`#modelosPainel` movido do HTML de `#tabPainelImportar` pra `#tabPainelMapa`, logo antes de
`#padroesPainel`. A aba "Importar Modelos" mantém só o formulário de upload/colar CSV — nenhuma
função JS mudou (`renderModelosVendedores_`/`recarregarModelosMesclados_` continuam usando os
mesmos ids `modelosPainel`/`modelosBody`, independente de qual aba os contém).

Testado ao vivo no navegador: painel renderiza dentro de `#tabPainelMapa`, sem duplicar o id, na
ordem certa (Modelos Vendedores antes de Padrão Vendedor).

100% frontend — sem alterações em `code.txt`.

## 2026-07-21 (parte 71) — Modelos Vendedores construídos automaticamente ("Opção A")

Pedido do usuário, depois de discutir como fazer o Modelo Vendedor deixar de depender de curadoria
manual (exportar CSV → IA externa → importar): montar a estrutura que constrói a lista de Modelos
Vendedores de forma dinâmica, sem precisar de nenhuma etapa manual.

**`construirModelosVendedoresDinamicos_(empsBrutos)`** (nova, `lancamentos.html`) — roda 100% no
cliente, a cada carregamento de página, sem gravar nada:
1. Filtra os empreendimentos que JÁ qualificam como Padrão Vendedor ao vivo
   (`avaliarPadraoVendedorAoVivo_`, parte 70) — EXTREMO/FORTE/POTENCIAL/MODERADO (SOBRA SUSPEITA
   nunca vira modelo).
2. Agrupa por Tipo de Empreendimento + Tipo de Imóvel dominante + Padrão — mesma cascata de 3
   níveis que a Similaridade já usa, e o mesmo critério que `MODELO_VENDEDOR_PROMPT.md` pedia pra
   IA assistente seguir manualmente.
3. Só vira modelo se o grupo tiver 3+ empreendimentos-base (mesma regra do prompt).
4. Faixas (área útil/quartos/preço médio/tempo de obra) = min/max observado no grupo, só
   considerando unidades do Tipo de Imóvel dominante do grupo. `lazerComum` = itens presentes em
   mais de 50% dos empreendimentos-base. `criteriosComparacao` fica vazio de propósito —
   `calcularSimilaridadeModelo_` já aplica os pesos padrão nesse caso, evita duplicar a lógica.

**`mesclarModelosVendedores_(importados, dinamicos)`** — modelos importados manualmente (via CSV/
IA, fluxo antigo) continuam tendo PRIORIDADE sobre um dinâmico do mesmo segmento — a curadoria
manual, quando existe, nunca é descartada; o dinâmico só preenche lacunas.

`carregarLancamentos()` recalcula os modelos dinâmicos a partir de `agruparPorEmpreendimento_(_todos)`
(não de `_mapaRows`, que só existe depois — evitaria dependência circular) ANTES de
`renderLista`/`atualizarMapaGeral_` rodarem, então a nota de Similaridade já considera os modelos
automáticos desde o primeiro render da página. Tabela "Modelos Vendedores" ganhou um selo "⚙️
auto" pros modelos dinâmicos (sem botão de excluir — eles são recalculados do zero a cada
carregamento, não haveria o que excluir).

Testado em Node: grupo com 4 membros gera 1 modelo com faixas/lazerComum corretos; grupo com só 2
membros não gera nada; empreendimento sem Padrão/Tipo definido é ignorado; empreendimento que não
qualifica (50% vendido) é ignorado; modelo importado tem prioridade sobre dinâmico do mesmo
segmento; sem sobreposição, os dois aparecem. Testado ao vivo no navegador com o fluxo completo
(`carregarLancamentos()` mockado ponta a ponta): 4 lançamentos fictícios geram 1 modelo automático,
que entra em `_listaModelos`, aparece na tabela com o selo "auto", e já é usado pela Similaridade
no mesmo carregamento (nota 100% pros 4 empreendimentos que formaram o próprio modelo).

100% frontend — sem alterações em `code.txt`, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 70) — Classificação de Padrão Vendedor 100% ao vivo (tabela + badge no card)

Pedido do usuário: a coluna "Classificação" (painel Padrão Vendedor) deve recalcular sempre que a
página carrega, e a classificação também deve aparecer com destaque no card do empreendimento.
Resolve de vez o problema da parte 69 (snapshot desatualizado até rodar recálculo manual) — agora
nem precisa mais rodar o recálculo em lote pra ver a classificação certa na tela.

**`avaliarPadraoVendedorAoVivo_(e)`** (nova, `lancamentos.html`) — espelho EXATO em JS de
`avaliarPadraoVendedor_` (code.txt), reaproveitando os helpers já existentes
(`acharDataCruzamentoEstoque_`, `parseDataFlexivelParaDate_`). Testado em Node com paridade
1-a-1 contra o backend em 10 cenários (EXTREMO/FORTE em 2 variações/POTENCIAL/MODERADO/SOBRA
SUSPEITA/zona cinzenta/sem entrega/abaixo do piso/caso real dos 98% do Vivah) — mesma
classificação, mesmo % vendido, mesmo apenasAlerta nos dois lados.

**Tabela "Padrão Vendedor"** (`renderPadroesVendedores_`) — a LISTA de quais empreendimentos
aparecem continua vindo do snapshot em `PADROES_VENDEDORES` (mesma fonte de sempre, é o que
alimenta o CSV pra IA assistente de modelos), mas a coluna Classificação/% Vendido agora é
recalculada ao vivo a partir do lançamento atual (`_mapaRows`) sempre que ele ainda existe — só
cai pro valor congelado do snapshot se o lançamento foi excluído ou a reavaliação não bate em
nada.

**Badge no card** (`renderLista`) — novo banner `.card-padrao-vendedor` no topo do card (mesmo
tratamento visual do alerta de Score de Tração), mostrando "⚡ PADRÃO VENDEDOR: EXTREMO/FORTE/
POTENCIAL/MODERADO" quando o empreendimento se qualifica, sempre calculado ao vivo. SOBRA
SUSPEITA não aparece aqui (já tem o próprio alerta separado, `sobra-flag`).

Testado ao vivo no navegador: card renderiza o banner corretamente (98% vendido → "PADRÃO
VENDEDOR: FORTE"), e a tabela do painel mostra a classificação ao vivo mesmo passando um
snapshot propositalmente desatualizado (POTENCIAL) — a tela mostra FORTE.

100% frontend — sem alterações em `code.txt`, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 69) — Ação de recálculo em lote de PADROES_VENDEDORES

Usuário reportou: depois do ajuste de limiares (parte 68), a classificação de empreendimentos já
importados (ex: Vivah Condomínio Clube, 98% vendido) continuou mostrando POTENCIAL em vez de
FORTE. Causa: `PADROES_VENDEDORES` é uma FOTO gravada no momento do cadastro — mudar o critério no
código não reclassifica linhas já existentes, só um novo `salvarLancamento_` faz isso (já
documentado como limitação conhecida na parte 67, mas sem solução até agora).

**`recalcularPadroesVendedores_()`** (nova, `code.txt`) — lê todos os lançamentos ATIVOS (agrupados
por `idLancamento`, um por empreendimento), usa o `historicoEstoque` JÁ GRAVADO de cada um (preserva
a granularidade real das datas de cruzamento — ao contrário de apagar e recadastrar, que perde isso
e cai no fallback "hoje"), roda `avaliarPadraoVendedor_` de novo com o critério ATUAL, e:
- se qualificar (EXTREMO/FORTE/POTENCIAL/MODERADO) → grava/atualiza via `registrarPadraoVendedor_`
- se NÃO qualificar mais (nem SOBRA SUSPEITA) → remove a linha antiga via `removerPadraoVendedor_` (nova)
- SOBRA SUSPEITA nunca é gravada (mesma regra de sempre)

Rota nova: `?acao=adm_recalcular_padroes_vendedores` (GET, mesmo padrão dos `adm_migrar_cabecalho_*`
já existentes — sem botão na UI, dispara colando a URL no navegador). Retorna
`{ok, avaliados, classificados, removidos}`.

Testado em Node com planilhas mockadas (LANCAMENTOS + PADROES_VENDEDORES em memória): um
empreendimento novo que passa a qualificar (EXTREMO), um que tinha classificação ANTIGA ('ALTO') e
foi corretamente reclassificado pro critério novo (FORTE), um que não qualifica mais e teve a linha
removida, e um excluído que corretamente não entrou na conta.

⚠️ **Backend**: `code.txt` mudou (`removerPadraoVendedor_`, `recalcularPadroesVendedores_`, rota
`adm_recalcular_padroes_vendedores`) — precisa colar `code.gs.txt` no Apps Script e reimplantar como
nova versão. Depois de reimplantar, acesse
`<WEBHOOK_URL>?acao=adm_recalcular_padroes_vendedores&token=<seu token>` no navegador uma vez pra
corrigir as classificações já importadas.

## 2026-07-21 (parte 68) — Ajuste dos limiares de FORTE (≥90%) e MODERADO (≥80%)

Pedido do usuário: depois de validar as primeiras obras importadas (ver parte 67), ajustar 2
limiares — FORTE deixa de exigir 100% (agora ≥90% antes da entrega) e MODERADO deixa de exigir
90% (agora ≥80% em até 1 ano depois da entrega). EXTREMO (100% em ≤1 ano do lançamento) e SOBRA
SUSPEITA (80%+ mais de 2 anos depois da entrega, alerta) continuam iguais.

`avaliarPadraoVendedor_()` (code.txt) reordenada: checa EXTREMO primeiro (subconjunto mais estrito
de FORTE), depois FORTE contra o cruzamento de 90%, depois POTENCIAL contra 70% -- e Cenário 2
(MODERADO) e Cenário 3 (SOBRA SUSPEITA) passam a compartilhar o MESMO cruzamento de 80% (só o
prazo depois da entrega muda: ≤1 ano vs. >2 anos), simplificando o que antes eram 2 buscas
separadas (90% e 80%).

Efeito prático: uma obra com 98% vendido ainda em obra, que antes ficava em POTENCIAL (não bate
100% cravado), agora corretamente vira FORTE.

Testado em Node: 11 cenários (EXTREMO/FORTE em 2 variações/POTENCIAL/MODERADO/SOBRA SUSPEITA/zona
cinzenta/sem entrega/abaixo do piso/caso real dos 98%) — todos passando.

⚠️ **Backend**: `code.txt` mudou (limiares de `avaliarPadraoVendedor_`) — precisa colar o
`code.gs.txt` atualizado no Apps Script e reimplantar como nova versão.

## 2026-07-21 (parte 67) — Critério de PADRÃO VENDEDOR redefinido (referência vira a data de entrega)

Pedido do usuário: substituir o critério antigo (ALTO/EXTREMO baseado no 1º registro de estoque,
SOBRA SUSPEITA baseado em prazo de pagamento >24 meses) por um critério novo, com a **data de
entrega** como referência central:

- **Cenário 1 — durante a obra** (limiar cruzado ANTES da entrega):
  - **EXTREMO** — 100% vendido em até 1 ano do lançamento
  - **FORTE** — 100% vendido antes da entrega, mas levou mais de 1 ano do lançamento
  - **POTENCIAL** — 70% vendido antes da entrega
- **Cenário 2 — depois da entrega**: **MODERADO** — 90% vendido em até 1 ano depois da entrega
- **Cenário 3 — NÃO é PADRÃO VENDEDOR**, não entra em `PADROES_VENDEDORES` — só um alerta ao vivo
  no Mapa Geral: **SOBRA SUSPEITA** — 80% vendido, mas isso só aconteceu mais de 2 anos depois da
  entrega

**Backend (`code.txt`)** — `avaliarPadraoVendedor_()` reescrita: novas funções `acharCruzamentoEstoque_()`
(acha a primeira data em `historicoEstoque` que já implicava um limiar de %, não só o valor atual),
`parseDataHistorico_()` e `dataFlexivelParaDate_()`. O call site em `salvarLancamento_` passou a
checar `resultado.apenasAlerta` antes de chamar `registrarPadraoVendedor_` — SOBRA SUSPEITA nunca
mais é gravada na planilha.

**Frontend (`lancamentos.html`)** — o alerta de SOBRA SUSPEITA no Mapa Geral/cards (`isSobraSuspeita`,
dentro de `calcularSimilaridadePadrao_`) foi reescrito pra espelhar a mesma regra nova
(`calcularSobraSuspeita_()`, `acharDataCruzamentoEstoque_()`, `parseDataFlexivelParaDate_()`) —
antes usava `prazoMaximo > 24`, que não existe mais nessa conta. Tabela "Padrão Vendedor" ganhou
badges/cores novas pra FORTE/POTENCIAL/MODERADO (`.padrao-forte`, `.padrao-potencial`,
`.padrao-moderado`), além do já existente EXTREMO/SOBRA SUSPEITA. `MODELO_VENDEDOR_PROMPT.md`
atualizado com os novos rótulos de classificação.

**Bug pego durante o teste, antes de ir pra produção**: a primeira versão de `acharCruzamentoEstoque_`
comparava o valor do estoque contra um limiar calculado como `total * (1 - limiarPct/100)` — para
90%, isso dá `total * 0.09999999999999998` em ponto flutuante (não exatamente `total * 0.1`), o que
fazia o limiar de 90% falhar bem em cima da borda em alguns casos. Corrigido comparando em %
arredondado (mesma conta de `pctVendido` usada no resto do arquivo) em vez de estoque bruto contra
um limiar fracionário.

Testado em Node: os 6 cenários (EXTREMO/FORTE/POTENCIAL/MODERADO/SOBRA SUSPEITA/zona cinzenta sem
classificação) mais os casos de borda (sem data de entrega, sem histórico, abaixo de 70%, data de
entrega em formato mês/ano abreviado) — todos passando, no backend e no espelho do frontend.

⚠️ **Backend**: `code.txt` mudou (critério de `avaliarPadraoVendedor_` totalmente reescrito) —
precisa colar o `code.gs.txt` atualizado no editor do Apps Script e reimplantar como **nova
versão** pra valer. Entradas já gravadas em `PADROES_VENDEDORES` com a classificação antiga (ALTO)
só serão substituídas pela nova classificação quando aquele empreendimento for salvo de novo — não
há uma migração automática das linhas antigas nesta parte.

## 2026-07-21 (parte 66) — Diagnóstico do erro de importação + excluir Modelo Vendedor

Usuário reportou: importação de Modelos Vendedores "falhando" e a tabela de modelos já cadastrados
não aparecendo, sem nenhuma explicação na tela. Investigando o `doGet`/`doPost` do `code.txt`,
confirmado: quando uma rota não está implantada no Apps Script (ex: backend antigo, sem colar o
`code.gs.txt` mais recente), o servidor responde `{status: 'acao desconhecida'}` — e o frontend
tratava isso como uma falha genérica e **silenciosa**: `buscarModelosVendedores_()` só devolvia
`[]` (tabela some sem aviso nenhum) e `importarModelosCsv_()` só contava "falha" sem dizer o
motivo. Sintoma bate exatamente com o relato: tudo aponta pra **backend ainda não reimplantado**
com as rotas de MODELOS_VENDEDORES adicionadas nas partes anteriores.

**Diagnóstico visível agora**:
- `buscarModelosVendedores_()` — loga um aviso claro no console quando o backend responde "ação
  desconhecida", explicando que falta reimplantar.
- `importarModelosCsv_()` — o toast final agora mostra o motivo real da falha (sessão expirada,
  rota não implantada, ou o erro exato devolvido pelo servidor), em vez de só "N falha(s)".

**Excluir Modelo Vendedor** (pedido do usuário) — botão 🗑 em cada linha da tabela "Modelos
Vendedores": `excluirModeloVendedor_()` (frontend, pede confirmação antes) → nova rota
`excluir_modelo_vendedor` (POST) → `excluirModeloVendedor_()` (backend, `code.txt`, apaga a(s)
linha(s) com aquele `idModelo` em `MODELOS_VENDEDORES`). Recarrega a tabela automaticamente depois
de excluir.

Testado ao vivo no navegador: botão de exclusão dispara o payload correto
(`acao: excluir_modelo_vendedor`), e a simulação de uma resposta "ação desconhecida" do backend
confirma que o toast de erro agora mostra a mensagem de diagnóstico certa.

⚠️ **Backend**: `code.txt` mudou (`excluirModeloVendedor_` + rota `excluir_modelo_vendedor`) — soma
com o `tipoImovel` da parte 65, que **ainda não tinha sido reimplantado**. Precisa colar o
`code.gs.txt` atualizado no editor do Apps Script e reimplantar — isso resolve tanto a importação
quanto a tabela não aparecendo.

## 2026-07-21 (parte 65) — Tabela de Modelos importados + nota de Similaridade agora usa cascata contra MODELOS_VENDEDORES

Pedido do usuário: (A) mostrar, acima do formulário "Importar Modelos", uma tabela com os MODELOS
VENDEDORES já gravados; (B) redefinir a nota de Similaridade pra seguir uma ordem de prioridade
estrita — 1º Tipo de Empreendimento, 2º Tipo de Imóvel, 3º Padrão, 4º "todas as demais
características" — comparando contra a base de MODELOS_VENDEDORES (não mais contra
PADROES_VENDEDORES), tanto pra empreendimentos já cadastrados quanto ao vivo durante a extração
(Orulo ou "Outros").

**(A) Tabela "Modelos Vendedores"** (`lancamentos.html`, dentro de `#tabPainelImportar`, acima do
formulário de importação) — `buscarModelosVendedores_()`/`carregarModelosVendedores_()` (mesmo
padrão de `buscarPadroesVendedores_`), renderizada por `renderModelosVendedores_()`. Carregada
eagerly junto com o resto da página (`carregarLancamentos()`) e recarregada depois de uma
importação bem-sucedida.

**(B) Cascata de Similaridade** — `calcularSimilaridadeModelo_()` (nova, `lancamentos.html`):
1. Filtra modelos pelo mesmo `tipoEmpreendimento` do empreendimento — **obrigatório**: sem isso,
   não existe MODELO COMPARATIVO válido (regra do usuário), retorna nota 0.
2. Dentro do que sobrou, prefere modelos com o mesmo Tipo de Imóvel **dominante**
   (`tipoImovelDominante_()` — moda do campo `tipo` entre as unidades). Se nenhum bater, cai pro
   conjunto do nível anterior (nunca fica sem candidato só por um critério secundário).
3. Mesma lógica de fallback pro `tipoPadrao`.
4. Só então calcula uma nota parcial por característica (`scoreFaixa_()` pra área útil/quartos/
   preço médio/tempo de obra contra as faixas do modelo, `scoreLazer_()` pra sobreposição de
   lazer) contra cada modelo que sobreviveu à cascata, pega o de maior nota (`modeloRef` no
   retorno, pra saber COM QUAL modelo bateu).

`calcularSimilaridadePadrao_()` foi reescrita pra usar essa cascata quando existe pelo menos 1
modelo gravado; **enquanto a base de MODELOS_VENDEDORES estiver vazia, continua caindo no cálculo
antigo** (comparação contra o melhor % vendido do mesmo `tipoPadrao` em PADROES_VENDEDORES) — só
uma ponte de transição, pra não zerar a nota de todo mundo antes da IA assistente entregar os
primeiros modelos. Já entra automaticamente no Score de Tração (mesmo peso `PESO_SIMIL=5` de
antes, só mudou a fonte da nota).

**Nota de similaridade ao vivo durante a extração** — `atualizarResumoEPadrao()` agora também
chama `atualizarSimilaridadeEstimada_()`, que roda a mesma cascata sobre os dados ainda não salvos
(Orulo ou "Outros", ambos convergem pro mesmo preview) e mostra um badge abaixo do resumo:
"Similaridade estimada: XX% · aproxima do modelo NOME", ou avisa quando não há modelo comparável
ainda pro Tipo de Empreendimento em questão.

**Campo novo `tipoImovel` em MODELOS_VENDEDORES** — 2º critério da cascata. Acrescentado no FIM de
`CABECALHO_MODELOS_VENDEDORES` (`code.txt`) e de `CSV_CAMPOS_MODELOS_` (frontend) de propósito —
migração só adiciona coluna no fim da planilha, nunca reordena as existentes.
`MODELO_VENDEDOR_PROMPT.md` atualizado: cabeçalho do CSV de saída passa a ter 20 campos, nova
seção explicando a cascata (pra IA entender por que a ordem dos 3 primeiros campos importa), e
instrução de agrupamento revisada pra considerar o Tipo de Imóvel dominante antes do Padrão.

Testado em Node (helpers de score/cascata, `calcularTempoObraEntreDatas_`, fallback pro cálculo
antigo sem modelos, `isSobraSuspeita` independente da cascata) e ao vivo no navegador: tabela de
Modelos Vendedores renderiza acima do formulário de importação, e o badge de similaridade estimada
aparece corretamente durante a extração ao preencher Tipo de Empreendimento + unidades.

⚠️ **Backend**: `code.txt` mudou (campo `tipoImovel` em `CABECALHO_MODELOS_VENDEDORES` +
`salvarModeloVendedor_`) — precisa colar o conteúdo atualizado no editor do Apps Script e reimplantar
pra valer no ambiente publicado.

## 2026-07-21 (parte 64) — Nova aba "Importar Modelos" + saída em CSV no prompt da IA de modelos

Pedido do usuário: instruções pra IA assistente de modelos gerar um arquivo final pronto pra importar
na base, e uma aba nova em Lançamentos (depois de "Mapa Geral") com tela de importação desse arquivo.

**`MODELO_VENDEDOR_PROMPT.md` revisado** — a seção "O que você precisa devolver" trocou de blocos
`CHAVE: valor` pra um **.csv** de verdade: cabeçalho com os 19 campos de
`CABECALHO_MODELOS_VENDEDORES` na ordem exata, uma linha por modelo. `idModelo`/`dataCriacao` ficam
em branco (o sistema preenche na importação). `idsEmpreendimentosBase`/`lazerComum` passam a usar
`;` como separador interno em vez de `,` — evita que a IA precise lembrar de colocar esses 2 campos
entre aspas só por causa de vírgula. Adicionada uma seção só sobre a regra de escape de CSV
(campo com vírgula/aspas precisa de aspas duplas, aspas internas dobram), com exemplo completo de
2 linhas incluindo `criteriosComparacao` (JSON) devidamente escapado. Fluxo completo documentado no
topo: baixar CSV de Padrão Vendedor → IA analisa → IA devolve CSV de modelos → importar pela aba nova.

**Nova aba "Importar Modelos"** (`lancamentos.html`), depois de "Mapa Geral" na barra de abas —
upload de arquivo `.csv` ou colar o conteúdo direto, com pré-visualização antes de gravar qualquer
coisa na base:
- `parseCsv_()` — parser CSV próprio (não um `split(',')` ingênuo), respeita campos entre aspas que
  contêm vírgula/aspas duplicadas/quebra de linha — necessário porque `criteriosComparacao` é JSON.
- `analisarModelosCsv_()` + `validarModeloImportado_()` — valida cada linha independente (nome
  obrigatório, `criteriosComparacao` precisa ser JSON válido, contagem de
  `idsEmpreendimentosBase` bate com `qtdEmpreendimentosBase`) — um modelo com erro não trava os
  outros, cada um é avaliado por conta própria.
- Pré-visualização em tabela (reaproveita `.mapa-tabela`) com status por linha (✓ ok / ⚠ N erro(s),
  detalhe no `title`) — só os válidos entram no botão "Importar todos".
- `importarModelosCsv_()` — uma chamada a `salvar_modelo_vendedor` (endpoint já existente da parte
  59) por modelo válido; campos vazios do CSV não entram no payload, deixando o backend
  auto-gerar `idModelo`/`dataCriacao` normalmente.

Testado em Node (parser CSV com aspas/BOM/JSON aninhado; validação com CSV limpo e com 3 tipos de
erro simultâneos; `limparImportarModelos_`) e ao vivo no navegador: aba troca corretamente,
pré-visualização renderiza os dados parseados, e a chamada de importação interceptada confirma o
payload exato (`acao: salvar_modelo_vendedor`, campos vazios omitidos) enviado ao backend.

100% frontend + documentação — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 63) — Painel Padrão Vendedor volta compacto; CSV busca dado fresco do lançamento

Pedido do usuário: a tabela em tela ficou com linhas altas demais depois da expansão pra 20 colunas
(parte 61) — voltar ao formato compacto de 11 colunas. Mas o CSV exportado (parte 62) continua
precisando de todas as características, buscando a informação nos campos do empreendimento **já
cadastrado**, não só no snapshot congelado.

**Tabela em tela**: revertida pras 11 colunas originais (ID, Empreendimento, Construtora, Tipo,
Classificação, % Vendido, Estoque, Total, PV, 1º Estoque, Bairro) e fonte/padding de volta ao
tamanho normal. `formatarTipologiaResumo_` removida (ficou sem uso depois da reversão).

**CSV — busca dado fresco**: um registro em `PADROES_VENDEDORES` é um snapshot, gravado só no momento
em que o empreendimento qualificou — se ele for salvo de novo depois (reextração, edição), o
snapshot antigo não se atualiza sozinho. Registros criados antes da expansão de campos (parte 59)
ficam com as colunas novas vazias pra sempre, a menos que o empreendimento seja resalvo.

`montarLinhaCsvPadrao_(p, porIdLancamento)` (nova) busca o lançamento **já cadastrado** que gerou
aquele Padrão Vendedor (via `_mapaRows`, que já tem os dados atuais + `prazoLancEntrega` calculado) e
usa os campos de lá — nome, construtora, estoque, prazo, bairro, tipo de empreendimento, cidade,
estado, lazer, conceito, andares, tempo de obra e tipologias (reconstruídas das unidades atuais).
Só cai de volta pro snapshot congelado quando o lançamento não existe mais (ex: foi excluído desde
que qualificou) — nesse caso é o único dado que resta.

Testado em Node (dado fresco prevalece quando o lançamento existe; fallback pro snapshot quando não
existe mais) e ao vivo no navegador: tabela em tela confirmada com 11 colunas, CSV exportado
confirmado com os 24 campos usando os valores atuais do lançamento (não os do snapshot antigo
passado de propósito no teste).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 62) — Botão "⬇️ CSV" no painel Padrão Vendedor

Pedido do usuário: um botão/ícone pra baixar a tabela completa de Padrão Vendedor em .csv, pra enviar
à IA assistente de modelos.

Botão "⬇️ CSV" no cabeçalho do painel, ao lado do título. `exportarPadroesVendedorCSV_()` gera o CSV
com os mesmos 24 campos e a mesma ordem de `CABECALHO_PADROES_VENDEDORES` — de propósito o MESMO
formato que `MODELO_VENDEDOR_PROMPT.md` já documenta como entrada esperada pela IA (1 linha por
empreendimento, `tipologias` como JSON bruto numa célula só), pra não ter 2 formatos diferentes dos
mesmos dados circulando.

Escapamento de CSV correto (`csvEscapar_`): valores com vírgula, aspas ou quebra de linha entram
entre aspas duplas, com aspas internas duplicadas — cobre o JSON de `tipologias`, que sempre tem
aspas internas. BOM UTF-8 no início do arquivo (via `String.fromCharCode(0xFEFF)`, não um caractere
literal no código-fonte) — sem isso o Excel abre acento/ç errado num CSV UTF-8.

Testado em Node (escapamento em todos os casos, ordem/contagem dos 24 campos) e ao vivo no navegador,
interceptando `URL.createObjectURL` e `HTMLAnchorElement.click` pra inspecionar o Blob gerado sem
precisar confiar num download real: conteúdo do CSV conferido linha a linha, e os 3 primeiros bytes
do arquivo confirmados como `ef bb bf` (BOM UTF-8 correto) via `Blob.arrayBuffer()`.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 61) — Painel Padrão Vendedor mostra todas as características (pra enviar à IA de modelos)

Bug reportado pelo usuário: a tabela do painel "Padrão Vendedor" (acima do Mapa Geral) não mostrava
todas as características que a parte 59 passou a gravar em `PADROES_VENDEDORES` — faltavam justamente
os campos que `MODELO_VENDEDOR_PROMPT.md` pede pra enviar à IA assistente de modelos.

Painel foi de 11 pra 20 colunas. Adicionado: Tipo de Empreendimento, Padrão (renomeado de "Tipo" pra
não confundir com a coluna nova de Tipo de Empreendimento), Cidade, UF, Tempo Obra, Qtd Andares,
Apto/Andar, Lazer/Diferenciais, Conceito, e Tipologias — esta última mostra, um por linha, TODAS as
características de cada tipologia comercializada (tipo, quartos/suítes/banheiros/vagas, escaninho,
área útil/terreno, preço médio com faixa mín–máx), lendo o JSON já gravado por
`registrarPadraoVendedor_` (parte 59).

`formatarTipologiaResumo_(t)` (nova) monta essa linha compacta por tipologia — nada fica escondido
atrás de tooltip, tudo visível direto na célula (`<br>` entre tipologias do mesmo empreendimento).

Fonte reduzida (12px→11px tabela, 10px→9px cabeçalho) pra caber as 20 colunas — mesmo tratamento já
usado no Mapa Geral quando ele cresceu de 8 pra 11 colunas.

Testado ao vivo no navegador: 20 cabeçalhos na ordem certa, linha renderizada com um empreendimento
de 2 tipologias mostrando todas as características de cada uma corretamente.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 60) — MODELO_VENDEDOR_PROMPT.md — instruções pra IA assistente de modelos

Pedido do usuário: um relatório de orientações pra outra IA (IA ASSISTENTE DE MODELOS) ler o
repositório `PADROES_VENDEDORES`, entender o projeto, e devolver as informações certas pra compor
`MODELOS_VENDEDORES`. Mesmo padrão já usado em `ORGANIZADOR_PROMPT.md` (instruções pro assistente
que organiza texto bruto pra aba "Outros").

Cobre: o que é o critério de entrada em PADRÕES VENDEDORES (EXTREMO/ALTO/SOBRA SUSPEITA, por tempo
de venda — não é o que se compara) vs. o que realmente forma um modelo (características de produto:
"Sobre o Empreendimento" + "Sobre os apartamentos", incluindo o JSON de tipologias); formato exato
de entrada (schema completo de `listar_padroes_vendedores`) e de saída (blocos `---`-delimitados
com todos os campos de `CABECALHO_MODELOS_VENDEDORES`); regra de amostra mínima (3+ empreendimentos
por modelo, mesmo piso já usado na análise do Indicador de ACEITAÇÃO); proibição de misturar
`tipoEmpreendimento` diferentes no mesmo modelo; exemplo completo preenchido.

Documento apenas — sem mudança de código.

## 2026-07-21 (parte 59) — PADROES_VENDEDORES vira repositório completo + nova aba MODELOS_VENDEDORES

Redefinição do usuário: PADRÃO VENDEDOR é só um painel informativo de quem qualifica por "tempo de
venda" — quem realmente vai alimentar o MODELO VENDEDOR são as características completas do projeto
("Sobre o Empreendimento") e das tipologias comercializadas ("Sobre os apartamentos"). A nota de
SIMILARIDADE não existe sem um MODELO COMPARATIVO — e o modelo é construído por uma IA assistente
separada, lendo o repositório de PADROES_VENDEDORES. Não existe similaridade sem modelo.

**`PADROES_VENDEDORES` expandido** — de 15 pra 24 colunas. Novo em "Sobre o Empreendimento":
`tipoEmpreendimento`, `cidade`, `estado`, `lazer`, `conceito`, `qtdAndares`, `aptoPorAndar`, e o campo
novo `tempoObra` (meses entre `dataLancamento` e `previsaoEntrega`, calculado uma vez e congelado no
snapshot). Novo em "Sobre os apartamentos": `tipologias` — JSON com uma entrada POR tipologia
comercializada (tipo, quartos, suítes, banheiros, vagas, escaninho, área útil, área terreno, preço
médio/mín/máx) — guardado bruto de propósito, não resumido em faixa min-max, porque a análise de
padrão comum entre vários empreendimentos precisa da característica de cada tipologia individual.

**`mesesEntreDatas_(dataInicioStr, dataFimStr)`** (nova) — diferença em meses entre duas datas
quaisquer (não "até hoje" como as funções equivalentes já existentes no front-end), aceita
`DD/MM/AAAA` e `mês/AAAA` abreviado nos dois lados.

**Nova aba `MODELOS_VENDEDORES`** — o repositório dos MODELOS DE COMPARAÇÃO. Este código só lê e
grava (`listarModelosVendedores_`/`salvarModeloVendedor_`, rotas `listar_modelos_vendedores` GET e
`salvar_modelo_vendedor` POST) — quem PREENCHE cada modelo é o processo externo (IA assistente de
modelos) analisando `PADROES_VENDEDORES`. Schema: identificação (`idModelo` MOD-NNN, `nomeModelo`),
critérios de agrupamento (`tipoEmpreendimento`, `tipoPadrao`), rastreabilidade (`qtdEmpreendimentosBase`,
`idsEmpreendimentosBase`), faixas típicas do grupo (área útil, quartos, preço médio, tempo de obra),
`lazerComum`, e um campo aberto `criteriosComparacao` (JSON) para os pesos/regras que a análise externa
decidir usar — estrutura de comparação ainda não definida, então não trava o formato agora.

`calcularSimilaridadePadrao_` (frontend) **ainda não foi alterada** — continua comparando contra o
melhor `pctVendido` já arquivado em `PADROES_VENDEDORES`, não contra `MODELOS_VENDEDORES` (que começa
vazio). Recalcular a similaridade contra modelos reais é o próximo passo, assim que os primeiros
modelos existirem.

Também adicionadas: `migrarCabecalhoPadroesVendedores`/`migrarCabecalhoModelosVendedores` (mesmo
padrão de `migrarCabecalhoVendedoresPerfil`, anexam colunas novas numa aba já existente) e as rotas
admin correspondentes.

Testado em Node (mock de planilha): `mesesEntreDatas_` nos 2 formatos de data; `registrarPadraoVendedor_`
populando todos os campos novos corretamente, incluindo o JSON de tipologias; upsert por
`idEmpreendimento` continua funcionando; as 2 migrações anexando colunas certas numa aba antiga;
`salvarModeloVendedor_` criando, gerando ID sequencial, fazendo upsert por `idModelo`, e exigindo
`nomeModelo`.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão", e
rodar as duas migrações (`adm_migrar_cabecalho_padroes_vendedores`,
`adm_migrar_cabecalho_modelos_vendedores`) uma vez pra atualizar/criar as abas.

## 2026-07-21 (parte 58) — Mapa Geral: coluna "Tipo/S%" + verificação da coluna PV

Pedido do usuário: (1) na coluna S%, mostrar também o Tipo (padrão de preço) — renomeada pra "Tipo/S%",
plotando as duas informações juntas (ex: "Médio/88%"); (2) na coluna PV, plotar
"(diferença lançamento→entrega + resultado)=(prazo de venda)" com verde se a entrega ainda não passou,
vermelho se já passou.

**Item 1 — implementado**: `_mapaRows` ganhou o campo `padrao` (extraído de `e.padrao`, já existente em
cada lançamento); a célula agora mostra `Tipo/S%` junto (`Médio/88%`), com tooltip explicando as duas
partes separadamente. Fallback `—` quando não há nem tipo nem similaridade calculada.

**Item 2 — já estava correto, nenhuma mudança de código necessária**: conferido com os números exatos
do exemplo do usuário (prazo de venda 56, diferença 48, resultado 8) — a coluna PV já produzia
`(48+8)=56` na cor vermelha. A regra de cor atual (`prazoVenda > prazoLancEntrega`) é matematicamente
equivalente a "hoje já passou da data de entrega", que é exatamente a regra pedida — só descrita de um
jeito diferente. Confirmado também o caso inverso (entrega ainda no futuro → verde).

Testado ao vivo no navegador: cabeçalho "Tipo/S%" correto, badge "Médio/88%" com tooltip, fallback "—"
quando faltam os dois dados, e a coluna PV reproduzindo exatamente o exemplo do usuário (cor e formato).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-21 (parte 57) — Sincronização com sessão paralela (PADRÃO VENDEDOR) + reconciliação de code.txt

O usuário tinha feito uma edição manual local em `code.txt` (não commitada) e pediu pra puxar as
atualizações que outra sessão (rodando na máquina servidor) já tinha publicado no GitHub — 20 commits
à frente, adicionando um sistema inteiro de **PADRÃO VENDEDOR**.

**O que a sessão paralela construiu** (resumo, commits já documentados individualmente no git log):
- `idEmpreendimento` (EMP-NNN) — ID estável por par NOME+CONSTRUTORA, sobrevive a recadastro/reextração
  (diferente de `idLancamento`, que é por importação/sessão).
- `historicoEstoque` — JSON `[{data, valor}]`, uma entrada nova só quando o estoque realmente muda ao
  salvar. É a peça de infraestrutura que eu tinha apontado como faltante na proposta do Indicador de
  ACEITAÇÃO (ver artefato compartilhado antes) — já existe, ainda que disparada por salvamento manual,
  não por um gatilho periódico automático.
- **PADRÃO VENDEDOR**: aba `PADROES_VENDEDORES` nova, classificação automática ao salvar
  (`avaliarPadraoVendedor_`) — EXTREMO (100% vendido em ≤1 ano), ALTO (≥80% em ≤1 ano), SOBRA SUSPEITA
  (>80% vendido + prazo de pagamento >24 meses) — e painel acima do Mapa Geral.
- `calcularSimilaridadePadrao_()` — motor de similaridade (frontend) que compara o empreendimento atual
  contra os padrões já arquivados do mesmo tipo; vira novo eixo `PESO_SIMIL=5` no Score de Tração
  (peso total 15→20). Isto é, na prática, uma primeira versão funcionando do "motor de comparação" que
  eu tinha proposto como item novo a construir na mesma nota do Indicador de ACEITAÇÃO — vale reler os
  dois lados juntos antes de continuar aquele desenvolvimento, pra não duplicar trabalho.
- Extração da Orulo agora também captura andares, apto/andar e data de atualização; formulário ganhou
  campos de Novo Estoque (com diff "antes → atual") e Observação; Mapa Geral ganhou colunas ID, S% e
  PG/PV (prazo de pagamento/prazo de venda, com indicador vermelho/verde vs. prazo até a entrega).

**Reconciliação**: a edição manual local tinha uma versão mais antiga do mesmo
`avaliarPadraoVendedor_` (calculando o prazo a partir do primeiro registro de `historicoEstoque`, em
vez de `dataLancamento`) — divergência real de comportamento, não só conflito mecânico de merge.
Resolvido mantendo a versão já publicada/testada pela sessão paralela (10+ commits de ajuste fino em
cima dela); a única peça da edição local preservada foi uma correção defensiva não conflitante
(`setNumberFormat('@')` na coluna `dataLancamento`, evita que o Sheets converta o texto em Date
automaticamente).

Sintaxe validada em `code.txt`, `lancamentos.html` e `lancamentos-editar.html` após o merge.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão" —
inclui tanto as mudanças da sessão paralela quanto a correção defensiva preservada da edição local.

## 2026-07-17 (parte 56) — Mapa Geral: título da coluna "% Estoque / Estoque" → "Estoque"

Pedido do usuário: renomear o cabeçalho da coluna, mantendo o mesmo conteúdo (badge % vendido | estoque).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 55) — Mapa Geral: colunas T (Tração), V (Vendedor) e Prazo

Pedido do usuário: acrescentar as colunas Prazo, T (nota de Tração) e V (nota do Vendedor), e
reordenar a tabela na sequência EMPREENDIMENTO|T|CONSTRUTORA|V|FAIXA DE ÁREAS|MENOR PREÇO|R$/M²|
%ESTOQUE/ESTOQUE|PRAZO|ESTÁGIO|ALERTA — reduzindo a fonte se necessário (foi).

**Colunas T e V**: reaproveitam a caixa `.tv-score-badge` já usada no quadrado [T|V] dos cards
(mesma cor via `classeScoreTracao_`, baseada no score composto), agora cada nota na sua própria
coluna em vez de um badge combinado — "T 6.6" e "V 71" separados, exatamente como pedido. `—` quando
não há dado suficiente (sem score de tração ou sem vendedor cadastrado).

**Coluna Prazo**: mostra `prazoMaximo` em meses (ex: "30 meses"), mesmo campo usado nos 3 cenários de
Alerta de Tração — `—` quando vazio.

**Fonte reduzida**: tabela foi de 12px pra 11px, cabeçalho de 11px pra 10px, padding das células de
6px/8px pra 5px/7px, e as caixas T/V ganharam uma variante compacta (`padding:1px 6px`, sem o
`margin-top` que fazia sentido no card mas não numa linha de tabela) — necessário pra caber 11 colunas
sem quebrar linha.

`_mapaRows` agora guarda `comp` (score de tração), `scoreVendedor` e `prazo` — já vinham calculados
por `calcularScoreTracao`/`calcularAlertaTracao_`, só não estavam sendo salvos na linha. Ordenação por
T/V/Prazo funciona igual às demais colunas (desc no 1º clique, asc no 2º).

Testado em Node (valores de T/V/Prazo por linha, formatação das caixas, ordenação nas 3 colunas
novas) e ao vivo no navegador: HTML renderizado confere exatamente com o exemplo do usuário
("T 6.6"/"V 71" pro Louvre du Parc), ordem das 11 colunas confirmada, fonte reduzida confirmada
(11px/10px).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 54) — Botão "Todos" + quantitativo|percentual nos botões de Estágio

Pedido do usuário: acrescentar um botão "Todos" na barra de Estágio, e mostrar em todos os botões o
total quantitativo junto do percentual (formato "quantidade|%").

**Botão "Todos"**: primeiro botão da barra, mesmo padrão do filtro de status já existente na lista de
cards (fica "on" quando nenhum Estágio individual está selecionado, clicar limpa qualquer seleção
ativa via `limparMapaEstagioFiltro_()`). Mostra "Todos (N|100%)", N = total de empreendimentos.

**Formato dos botões de Estágio**: mudou de "Nome (pct%)" pra "Nome (qtd|pct%)" — mesma convenção de
separador `|` já usada no quadrado [T|V] dos cards de Score de Tração. Ex: "Em obras (12|50%)".

Percentual sempre calculado sobre o TOTAL geral, não sobre o resultado já filtrado — continua correto
com qualquer combinação de Estágios ligados.

Testado em Node: botão "Todos" presente e com contagem/percentual corretos, fica "on" no estado
inicial (nenhum Estágio individual fica), cada botão mostra "qtd|pct%", clicar em "Todos" zera a
seleção e volta a mostrar tudo. Verificação ao vivo no navegador não foi possível nesta rodada — a
ferramenta de browser ficou temporariamente indisponível; vale conferir visualmente na tela.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 53) — Botões de Estágio mostram o % de cada um

Pedido do usuário: os botões de Estágio (Mapa Geral) devem mostrar o percentual quantitativo de cada
um — ex: "Em obras (50%)".

`renderMapaEstagioFiltros_` agora calcula, pra cada Estágio, quantos empreendimentos têm aquele
Estágio sobre o total carregado em `_mapaRows`, e mostra o percentual arredondado no próprio botão.
Recalcula sozinho a cada `atualizarMapaGeral_` (dado novo) e continua correto com o filtro
ligado/desligado, já que a % é sempre sobre o total, não sobre o resultado já filtrado.

Testado ao vivo no navegador: 4 empreendimentos (2 Em obras, 1 Pronto, 1 Entregue) geram
"Em obras (50%)", "Pronto (25%)", "Entregue (25%)" corretamente.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 52) — Botões de Estágio e PDF movidos pra dentro da aba Mapa Geral, compactos

Pedido do usuário: os botões de Estágio (ao lado do título) e o "🖨️ PDF" (na barra de abas, sempre
visível) deviam aparecer só na aba "Mapa Geral", logo abaixo da linha de descrição, com altura
reduzida.

**Antes**: PDF ficava fixo na barra de abas (visível em todas as 4 abas, mesmo Novo Lançamento/Outros
onde não fazia sentido); Estágio ficava ao lado do título "Mapa Geral".

**Agora**: os dois vivem juntos numa nova `.mapa-toolbar`, dentro do `sec-header` da aba Mapa Geral,
logo depois da linha "Todos os lançamentos cadastrados lado a lado — clique numa coluna pra
ordenar...". Botões bem mais baixos que o padrão do resto da tela (padding vertical 3px, contra 10px
antes). A barra de abas voltou a ser só os 4 botões de aba, sem nada mais junto.

`@media print` atualizado pra esconder `.mapa-toolbar` (não faz sentido a barra de filtro/PDF aparecer
no papel) em vez do wrapper antigo `.lanc-tabs-row`, que deixou de existir.

Testado ao vivo no navegador: só existe 1 botão PDF na página inteira, e ele — junto com os botões de
Estágio — só existe dentro de `#tabPainelMapa`; ordem confirmada (título → descrição → barra de
ferramentas); altura reduzida confirmada (3px de padding); e ambos continuam funcionando
(`imprimirListaAtiva_`/`toggleMapaEstagioFiltro_`) depois da mudança de posição.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 51) — Mapa Geral: filtro de Estágio multi-seleção ao lado do título

Pedido do usuário: botões de Estágio ao lado do título "Mapa Geral", múltipla escolha — clicar
liga/desliga aquele estágio, a tabela só mostra o que está selecionado, pode combinar vários ao
mesmo tempo.

Botões gerados dinamicamente a partir dos Estágios que realmente existem nos dados carregados (mesma
convenção do filtro-bar de status já usado na lista de cards, ver `renderFiltros`), mas em
multi-seleção em vez de escolha única: `_mapaEstagiosAtivos` é um `Set`, cada clique
(`toggleMapaEstagioFiltro_`) adiciona/remove daquele conjunto. Nenhum selecionado = mostra tudo
(mesmo "Todos" implícito do filtro de card). Reaproveita a classe `.filtro-chip` já existente, sem CSS
novo.

Filtro roda antes da ordenação em `renderMapaGeral_` — cuidado técnico: o índice de cada linha
(`editarEmpMapa_(i)`) continua apontando pro índice ORIGINAL em `_mapaRows`, não pro índice dentro do
resultado filtrado, senão clicar numa linha depois de filtrar abriria o empreendimento errado na
Editar.

Seleção reseta a cada recarregamento de dados (`atualizarMapaGeral_`) — evita ficar preso num Estágio
que talvez nem exista mais no dataset novo.

Testado em Node (geração dos botões, toggle ligando/desligando, combinação de 2 estágios ao mesmo
tempo, volta a mostrar tudo quando todos são desligados, e o índice pós-filtro continua apontando pro
empreendimento certo) e ao vivo no navegador (multi-seleção confirmada via `toggleMapaEstagioFiltro_`,
já que a página de login intercepta cliques reais sem sessão autenticada).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 50) — Botão "🖨️ PDF" imprime a lista ativa em paisagem

Pedido do usuário: um botão pra imprimir/gerar PDF da lista que estiver ativa no momento (cards ou
Mapa Geral), em modo paisagem.

Botão "🖨️ PDF" adicionado ao lado das abas (sempre visível), chama `imprimirListaAtiva_()` — abre o
diálogo de impressão nativo do navegador (`window.print()`), onde "Salvar como PDF" já é uma das
impressoras disponíveis por padrão em qualquer navegador moderno, sem precisar de biblioteca extra de
geração de PDF no cliente.

**"A lista que estiver ativa" acontece de graça**: cada aba já se controla via `style.display` inline
(`mudarAbaLancamentos`), então a aba inativa já não está no fluxo do documento — o CSS de
`@media print` só precisa esconder o chrome (header, barra de abas, filtros, botões de ação de cada
card) e o que sobra é exatamente a lista visível na tela.

**Paisagem**: `@page { size: landscape; margin: 10mm; }` — pedido de orientação direto no CSS, o
navegador honra por padrão no diálogo de impressão (usuário ainda pode trocar se quiser).

Guarda-corrimão: clicar em "🖨️ PDF" nas abas "Novo Lançamento"/"Outros" (que são formulários, não
listas) mostra um toast pedindo pra abrir uma aba de lista primeiro, em vez de imprimir um formulário
vazio sem sentido.

Testado ao vivo no navegador: botão presente, bloqueio correto fora das abas de lista,
`window.print()` disparado nas abas Lista/Mapa, e as regras `@page`/`@media print` confirmadas
carregadas no stylesheet do navegador.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 49) — Nova aba "Mapa Geral": tabela compacta de todos os lançamentos

Pedido do usuário: em Lançamentos, uma nova aba "Mapa Geral" (depois de "Outros") listando todos os
empreendimentos cadastrados em formato de tabela — colunas Construtora, Faixa de áreas, Menor preço,
R$/m², %Estoque/Estoque, Estágio, Alerta — cada coluna com seta de ordenação, espaçamento otimizado
(resumido).

**Coluna extra**: adicionei "Empreendimento" (nome) como primeira coluna, não pedida explicitamente —
sem ela, várias linhas da mesma construtora ficariam indistinguíveis. Removível se não for útil.

Reaproveita 100% do que já existe, nenhum critério novo: mesmo Score de Tração/Alertas de Tração dos
cards (`calcularScoreTracao`/`calcularAlertaTracao_`), mesmo badge `%|estoque` (`badgeVendidoHTML`),
mesma faixa de área/menor preço/m² médio do painel resumo (`calcularM2Medio`). É só uma segunda forma
de visualizar o mesmo dado, lado a lado numa tabela em vez de cards.

**Diferente da lista de cards**: Mapa Geral sempre mostra TODOS os lançamentos, sem respeitar o filtro
de status da aba "Empreendimentos Cadastrados" — por isso a busca do score de vendedor foi movida pra
`carregarLancamentos()` (buscada uma vez só, compartilhada entre `renderLista` e o novo
`atualizarMapaGeral_`, evitando 2 fetches redundantes no carregamento inicial).

**Ordenação**: clique numa coluna ordena descendente (maior→menor / Z→A) na primeira vez, ascendente
na segunda — funciona em todas as 8 colunas, inclusive Estágio (ordem de progresso: planta→obras→
pronto→entregue) e Alerta (positivo→negativo→sem alerta), não só as numéricas. Seta muda de direção
(▾/▴) e fica destacada na coluna ativa.

Clique numa linha abre a Editar do empreendimento (mesmo destino do botão "✏️ Editar" dos cards).

Testado em Node (agrupamento por idLancamento, cálculo de cada coluna, ordenação nas 8 colunas, ida e
volta desc/asc) e ao vivo no navegador (troca de aba, render da tabela com dado real formatado,
clique em coluna alternando a ordem, seta mudando de direção).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 48) — "Prazo máximo (meses)" calculado automaticamente na extração

Pedido do usuário: na aba "Novo Lançamento", calcular o campo "Prazo máximo (meses)" automaticamente
como a diferença entre a data atual e a "Data de entrega" extraída — antes esse campo nem existia
nessa aba (só existia em `lancamentos-editar.html`, calculado a partir de "Financiamento em", um campo
diferente), então todo lançamento novo nascia sem prazo até alguém abrir a Editar manualmente. Isso
deixava o eixo "Prazo de Pgt" do Score de Tração e os 3 cenários de Alertas de Tração sem dado logo
na criação.

**Campo novo**: "Prazo máximo (meses)" adicionado ao formulário da aba "Novo Lançamento", ao lado de
"Previsão de entrega" — mesmo padrão visual dos demais campos, continua editável manualmente depois.

**`calcularMesesAteEntrega_(previsaoEntrega)`** — calcula a diferença em meses (só ano/mês, mesma
granularidade do cálculo equivalente em `lancamentos-editar.html`/`calcularPrazoMaximoAuto`, que usa
"Financiamento em" como origem) entre hoje e a data extraída. Aceita os 2 formatos que a extração pode
gerar pra "Previsão de entrega": `DD/MM/AAAA` (Orulo, ex: "31/12/2028") e `mês/AAAA` (fallback
genérico, ex: "dez/2026", "dezembro de 2026"). Data no passado clampa em 0.

Roda automaticamente logo após a extração (dentro de `renderB1`) e de novo sempre que o usuário editar
"Previsão de entrega" manualmente (`onchange`) — cobre tanto o texto colado quanto uma correção manual
depois, sem exigir que o usuário abra a Editar só pra preencher esse campo.

Testado em Node: os 2 formatos de data, data passada (clampa em 0), entrada vazia/inválida (retorna
null, não sobrescreve o campo), e o fluxo de integração completo (texto da Orulo colado → extração →
campo preenchido automaticamente → edição manual da entrega recalcula).

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 47) — Excluir imóvel remove o perfil de vendedor vinculado

Bug reportado pelo usuário: excluiu um lançamento já cadastrado, recadastrou com o mesmo nome, e o
card voltou mostrando a nota do vendedor antigo (herdada em silêncio) mas sem atualizar o "Alerta de
Oportunidade" — sinal de que o cadastro novo estava reaproveitando dado de um vendedor de um anúncio
que já tinha sido excluído. O usuário pediu explicitamente: ao excluir um empreendimento, excluir
também o perfil de vendedor vinculado a ele.

**`removerPerfilVendedor_(codigo, origemImovel)`** (nova, `code.txt`) — remove da aba
`VENDEDORES_PERFIL` a(s) linha(s) cujo `codigo`+`origemImovel` batem exatamente com o imóvel excluído.

**`setStatusImovel_(d)`** — chama `removerPerfilVendedor_` sempre que `statusAtivo` vira `'Excluído'`
(nunca em `'Ativo'` ou outro status), tanto pro branch de LANCAMENTO (usa o `idLancamento` encontrado,
`origemImovel='LANCAMENTOS'`) quanto pro branch de REVENDA/REVENDA_CONSTRUTORA (usa
`fonteParaOrigemImovel_`, a mesma função corrigida na parte 45 — ganha a correção de graça). Coberto
pra qualquer fonte, não só Lançamentos: excluir uma revenda ou revenda-construtora agora também limpa
o perfil de vendedor associado, mesmo risco de herança silenciosa existia lá.

Testado em Node (mock de planilha): excluir um Lançamento remove só o perfil daquele
`idLancamento` (outro empreendimento não é afetado); reativar (`statusAtivo='Ativo'`) NÃO remove nada;
excluir REVENDA e REVENDA_CONSTRUTORA também removem o perfil certo, com o `origemImovel` resolvido
corretamente pra cada fonte.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-17 (parte 46) — Corrige extração "Tipo de Imóvel"/"Tipo de Empreendimento" errados na colagem da Orulo

Bug reportado pelo usuário: colando o texto padrão de uma página da Orulo (aba "Novo Lançamento",
Bloco 1), um prédio de apartamento vertical (ex: Louvre du Parc) vinha extraído como "Tipo de Imóvel"
errado e "Tipo de Empreendimento" = Horizontal, quando deveria ser Apartamento / Condomínio Vertical.

**Causa raiz**: o fallback `/\bterreno\b/i.test(txt)` rodava em cima do texto colado inteiro e
**sobrescrevia** um tipo já detectado corretamente pela seção "Tipologias disponíveis" — toda página da
Orulo lista `Área do Terreno: -` em "Outras informações" (metadado genérico, presente até em prédio
vertical), e isso sozinho já disparava o fallback e virava "Lote Condomínio Horizontal" por engano.

**Correções** (`extrairBloco1`, `lancamentos.html`):
1. O fallback de terreno agora só roda quando `Tipologias disponíveis` não achou nada (`!b.tipo`), em
   vez de sempre — deixa de sobrescrever um tipo já corretamente identificado.
2. **Novo sinal de reforço**: `Unidades por andar: N` (Orulo, "Outras informações") só existe em
   prédio com pavimentos — sinal forte e inequívoco de Condomínio Vertical. Quando presente com N>0,
   força `tipoEmpreendimento = 'Condomínio Vertical'` e corrige `tipo` pra Apartamento se ainda estiver
   vazio ou tiver caído no fallback de Lote por engano — dupla proteção mesmo que outro sinal falhe.

**"Data de Lançamento"**: já existia (campo `f-dataLancamento` + regex `Lançamento: DD/MM/AAAA`) —
conferido contra o texto exato que o usuário colou, capturando "01/09/2025" corretamente. Nenhuma
mudança necessária nessa parte, só confirmação.

Testado em Node com o texto exato colado pelo usuário (Louvre du Parc): tipo, tipoEmpreendimento,
dataLancamento, nome, construtora, estoque e totalUnidades todos corretos. Regressão testada: um Lote
genuíno (Tipologias = "Lote") continua classificado como Lote Condomínio Horizontal; um texto sem seção
"Tipologias disponíveis" que menciona "terreno" em prosa ainda cai no fallback original.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-17 (parte 45) — Matriz de Eisenhower: calcularEisenhower_ + Triângulo de Oportunidade estendido a Lançamentos

Primeiros 2 itens da proposta da Matriz de Eisenhower (5 dimensões — Lead/Cliente/Produto/Vendedor/
Corretor, ver artefato compartilhado na conversa): a função de classificação e a extensão do motor de
matching pra cobrir Lançamentos, que hoje ficavam de fora.

**Bug estrutural encontrado e corrigido**: `fonteParaOrigemImovel_()` só sabia mapear
`'REVENDA_CONSTRUTORA' → 'REVENDAS_CONSTRUTORAS'` — qualquer outra fonte (inclusive `'LANCAMENTO'`)
caía no default `'REVENDA'`. Resultado: `listarTriangulosOportunidade_()` nunca conseguia achar o
perfil de vendedor de nenhum Lançamento (buscava em `VENDEDORES_PERFIL` com `origemImovel='REVENDA'`
em vez de `'LANCAMENTOS'`), então nenhum Lançamento jamais entrava no Triângulo de Oportunidade — não
era falta de dado, era o mapeamento errado. Corrigido, e `fontesValidas` em
`listarTriangulosOportunidade_()` agora inclui `'LANCAMENTO'`.

**`calcularEisenhower_(tipo, idEntidade, idProduto)`** (nova, `code.txt`) — não recalcula nenhum score
de base, só combina o que já existe em 2 eixos:
- Importância = score do cliente×0.40 + scoreMatch×0.35 + scoreVendedor×0.25
- Urgência = urgência do comprador×0.65 + urgência do vendedor (derivada do scoreVendedor)×0.35
- Quadrante: Importância≥70 + Urgência≥70 → `FAZER_AGORA` · só Importância≥70 → `AGENDAR` · só
  Urgência≥70 → `DELEGAR` · nenhum → `ELIMINAR`

Só `tipo='CLIENTE'` está implementado — `tipo='LEAD'` retorna erro explícito em vez de inventar um
resultado, porque leads ainda não passam por `rodarMatching()` (fica pro próximo passo, junto com a
dimensão Corretor/check-in diário). Exposta via `?acao=calcularEisenhower&tipo=CLIENTE&idEntidade=...
&idProduto=...`.

**Limpeza colateral**: a fórmula de nível de urgência do vendedor (`scoreVendedor >= 70 ? 'ALTA' :
>= 40 ? 'MEDIA' : 'BAIXA'`) estava duplicada em 2 lugares (`listarTriangulosOportunidade_` e
`listarJanelaAberta_`) — extraída pra `vendedorUrgenciaNivel_()`/`vendedorUrgenciaScore_()`,
comportamento idêntico, agora compartilhado (e é o que `calcularEisenhower_` usa também).

Testado em Node com dados mockados (CONTATOS/MATCHES/VENDEDORES_PERFIL): mapeamento de fonte,
inclusão de Lançamento no Triângulo com scoreTriplo correto, os 4 quadrantes do Eisenhower, e os dois
casos de erro explícito (LEAD, par sem match).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 44) — Salvar "Novo Lançamento" fecha a aba e recarrega a página

Pedido do usuário: depois de cadastrar um lançamento pela aba "Novo Lançamento", fechar o formulário e
recarregar a página — mesmo padrão já usado ao salvar o Perfil do Vendedor (`abrirPvLanc`).

`salvarLancamento()` agora, com sucesso: mostra o toast, limpa o formulário, troca pra aba
"Empreendimentos Cadastrados" e recarrega a página inteira (`location.reload()`) depois de 1,2s — em
vez de só re-buscar a lista via fetch (`carregarLancamentos()`). Garante que o card novo aparece com
dado 100% fresco da planilha, sem depender do timing do fetch/render assíncrono da lista.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-16 (parte 43) — Correção: "Novo Lançamento" nascia Excluído se o nome já tinha sido usado

Bug reportado pelo usuário: cadastrava um novo empreendimento pela aba "Novo Lançamento", o backend
respondia "salvo com sucesso" e a linha aparecia na planilha, mas o card **nunca aparecia** na lista —
nem depois de um F5 completo.

**Causa raiz** (`salvarLancamento_`, code.txt): saves vindos da aba "Novo Lançamento" nunca mandam
`idLancamento` (esse campo só existe depois, vindo da Editar), então o backend cai no dedup por
**nome** pra decidir se é uma atualização de um empreendimento já existente. Esse dedup por nome também
copiava o `statusAtivo` do registro encontrado — e se o usuário já tinha excluído (🗑) um empreendimento
com aquele mesmo nome antes, o cadastro novo nascia com `statusAtivo = 'Excluído'` **em silêncio**: o
backend confirmava sucesso, a linha ia pra planilha certinha, só que já escondida pelo filtro de
excluídos do `listarLancamentos_()`.

**Correção**: o dedup por nome (branch sem `idLancamento`) não copia mais `statusAtivo` do registro
encontrado — todo cadastro novo pela aba "Novo Lançamento" nasce `Ativo`, mesmo reusando um nome já
excluído antes. O dedup por `idLancamento` explícito (usado pela Editar) continua preservando o
`statusAtivo` normalmente — só esse branch tinha a garantia de "é o MESMO registro sendo atualizado",
o de nome era só uma tentativa de recuperar o ID certo pra reaproveitar.

Também corrigido um bug secundário introduzido na parte 42: `carregarLancamentos()` chamava
`renderLista()` (agora `async`, por causa dos Alertas de Tração) sem `await` — não era a causa deste
bug específico, mas deixava a lista podendo re-renderizar fora de ordem/silenciosamente engolir erros.

Testado em Node (mock do Google Sheets): recadastro com nome de empreendimento excluído agora nasce
Ativo e aparece na listagem; fluxo de Editar (por ID) confirmado sem regressão, continua preservando
`statusAtivo` normalmente.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão" —
sem isso, novos cadastros com nome repetido de algo já excluído continuam nascendo escondidos.

## 2026-07-16 (parte 42) — Alertas de Tração (cenários combinados) + reordenação dos cards por alerta

Pedido do usuário: cruzar os eixos do score de Tração pra emitir alertas destacados no topo do card de
cada empreendimento, em 3 cenários exatos fornecidos por ele, e reordenar TODOS os cards por prioridade
de alerta (positivo → negativo → score de tração), não mais por preço/m².

**Cenários implementados** (`ALERTAS_TRACAO` em lancamentos.html), cruzando 4 sinais: Vendedor (score
bruto 0-100), Força de Venda (eixo normalizado 0-10, % vendido), Prazo de pagamento (bruto, em meses) e
Estoque (bruto, em unidades):
- 🚀 **Oportunidade** (positivo): Vendedor ≥70, Força ≥3, Prazo ≥24 meses, Estoque ≥20 unidades.
- ⏳ **Estoque de Qualidade se Esgotando** (positivo): mesmos Vendedor/Força/Prazo, mas Estoque ≤15.
- ⚠️ **Risco de Qualidade do Vendedor** (negativo): Vendedor ≤30, Força ≥3, Prazo ≥24, Estoque ≥20.

Só o primeiro cenário que bater "ganha" (1 alerta por card); sem dados suficientes pro score composto
(comp = 0), nunca dispara alerta. Banner exibido no topo do card (`.card-alerta`), verde para positivo
e vermelho para negativo.

**Reordenação**: `renderLista` virou `async` (precisa do score do vendedor, já buscado via
`buscarScoreVendedorPorLancamento_`, ANTES de ordenar). Sort de 3 níveis: alertas positivos primeiro
(por score de tração desc entre eles), depois negativos (idem), depois sem alerta (idem) — substitui o
sort antigo por m² médio.

Simplificação de arquitetura: removidas as funções antigas de "pintura em 2 passadas"
(`carregarScoreTracaoDosCards_`/`atualizarScoreTracaoCards_`, que preenchiam divs-placeholder depois do
render síncrono) — agora o alerta e o quadrado [T|V] são calculados ANTES do sort e renderizados
diretamente no template do card, sem passada assíncrona posterior.

Testado em Node: os 3 cenários disparam exatamente como especificado; casos de fronteira (força de
venda <3, prazo <24, ou sem dados suficientes) corretamente não disparam alerta; ordenação de 3 níveis
confirmada com 4 empreendimentos (2 positivos em qualquer ordem interna, depois o negativo, depois o
sem-alerta). Página carrega sem erros de console; verificação visual completa (renderização de dados
reais) não foi feita porque a sessão de navegador não tinha um token de login salvo — a lógica é 100%
coberta pelos testes automatizados acima.

Sugestões de outros cenários (positivos/negativos) usando dados de produto/vendedor/clientes e prevendo
dados futuros de campanhas: apresentadas separadamente na conversa, aguardando o usuário escolher quais
implementar.

100% frontend (lancamentos.html) — sem alterações em code.txt, não precisa reimplantar o Apps Script.

## 2026-07-16 (parte 41) — Perfis Pessoa Física e Corretor reorganizados (mesmo padrão do PJ)

Pedido do usuário: revisar TODOS os critérios de PF e CORRETOR e reorganizar em grupos objetivos/
subjetivos, mesmo tratamento visual da reorganização do PJ (partes 35/38) — badge de peso ao lado do
rótulo, grupos temáticos, escala rotulada pros critérios subjetivos.

**Pessoa Física** — reorganizado em 4 grupos: 🏠 Situação do imóvel (Dias no mercado até +15,
Prazo declarado +10, Histórico de reduções até +18 — campos comuns já existentes, agora com badge de
peso), ✅ Condições aceitas (FGTS/Permuta/Financiamento/Parcelamento, +4 cada), 📋 Motivação e perfil
do proprietário (Motivo da venda até +20, Perfil do proprietário até +5 — já existentes), e **3
critérios subjetivos NOVOS** (esse perfil não tinha nenhum antes): Confiabilidade/cumpre o combinado
(peso 3), Urgência percebida além dos dias no mercado (peso 3), Facilidade de negociação (peso 2).
Diferente de PJ, aqui não há duplicação com "dado de produto": PF é dono de UM imóvel só, então
preço/dias/reduções continuam sendo sinais legítimos do próprio vendedor.

**Corretor** — reorganizado em 4 grupos: 🤝 Parceria e exclusividade (Exclusividade até +20 e
Relacionamento histórico +15, já existentes, + **Tempo de parceria em meses, novo**, até +10, espelhando
o campo equivalente de PJ), 💰 Comercial (Comissão negociável +15, já existente, + **Comissão
oferecida %, novo**, até +15), 📞 Responsividade e urgência (Dias desde última resposta até +15,
Urgência do vendedor original +15 — já existentes), e **3 critérios subjetivos NOVOS**: Confiabilidade
(peso 3), Qualidade da comunicação (peso 2), Facilidade de negociação (peso 2).

**Campos comuns "Situação do imóvel"/"Condições aceitas" agora só aparecem pro PF** (antes apareciam
também pro Corretor, sem função nenhuma — nenhuma das duas fórmulas de score usa esses campos pra
Corretor, exatamente o mesmo problema já corrigido pra PJ nas partes 35/37): Corretor é perfil de
PARCEIRO (o outro corretor/imobiliária, não o imóvel que ele representa), mesma lógica de PJ.

Testado em Node: PF vazio → 0; só os 3 subjetivos "Excelente" → 32 (4×3+4×3+4×2); PF completo → 100
(clampado); Corretor vazio → 0; só os 3 subjetivos "Excelente" → 28 (4×3+4×2+4×2); Corretor completo
(com os 2 campos novos) → 100 (clampado, soma bruta 133). Testado ao vivo no navegador: PF com 5
seções e 9 badges de peso; Corretor com 5 seções e 10 badges, sem "Situação do imóvel"/"Condições
aceitas"; coleta de formulário confirmada nos campos novos dos dois; PJ conferido intacto.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 40) — Correção: quadrado [T|V] no card em vez do botão + remoção do Ranking de Tração

Correção da parte 39, mesmo dia: usuário pediu formato diferente do que eu tinha implementado.

**1. Removida a seção "Ranking de Tração"** inteira (painel colapsável com Top 10, header, legenda) —
o cálculo do Score de Tração continua rodando nos bastidores (`carregarScoreTracaoDosCards_`, renomeada
de `renderRankingTracao`), só não tem mais painel próprio na tela; ele agora só alimenta os cards.

**2. Badge "🎯 Tração N.N" (da parte 39) removido do card** — substituído por um quadrado `[T|V]`
mostrando as duas notas lado a lado, no formato exato pedido: `T 6.9|V 78`. Posicionado logo abaixo do
nome do empreendimento e "Construtora · Bairro" (antes ficava na linha do gerente comercial).

**3. Badge de % vendido (`63% | 70`) com letra maior** (16px, era 11px) e agora numa linha própria
acima do nome, em vez de lado a lado com ele.

**4. Eixos que compõem o composto (Prazo/Força de Venda/Atratividade/Estoque) aparecem pequenos e
sem destaque** logo abaixo do quadrado `[T|V]` — texto simples 9px cor `text3`, sem badge/cor/negrito
("sem destaque" — nada mais que informação de referência).

CSS morto do painel de ranking removido (`.tracao-panel/-header/-title/-row/-rank/-nome/-sub/-eixo*/
-bar-*/-score-col/-legend*`, classes `.bar-vendedor/-trac/-prazo/-atrat/-disp`); `.tp-hot/-warm/-esgot/
-cold` mantidas — ainda usadas na cor do quadrado `[T|V]`.

Testado em Node com DOM simulado: `atualizarScoreTracaoCards_` (nova, renomeada de
`pvAtualizarTracaoCards_`) pinta cada card com a nota do SEU próprio empreendimento (mapeamento
sobrevive à reordenação por score), card sem dados fica sem quadrado, formato de texto conferido
caractere a caractere (`T 6.9|V 78`, pipe ASCII simples — corrigido de um traço vertical incorreto que
eu tinha usado por engano na primeira tentativa). Desta vez também verificado ao vivo no navegador:
badge-vendido em 16px, quadrado exato "T 6.9|V 78" com os mesmos dados do exemplo do usuário, painel
de ranking confirmado ausente da tela.

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 39) — Nota de Tração no card + reload ao salvar vendedor + remove "Prazo declarado" do PJ

**1. "Prazo declarado para venda" sai do perfil PJ** — é dado de PRODUTO (urgência do próprio
anúncio), mesmo motivo dos outros 3 campos de mercado removidos na parte 37. Entrou no mesmo
`mostrarCamposMercado` (os 2 blocos condicionais adjacentes viraram um só): continua aparecendo pro
PF — onde ainda vale +10 em `calcularScoreVendedor_PF_` — e pro CORRETOR.

**2. Salvar o perfil do vendedor fecha o modal e recarrega a página de lançamentos** — feito no
callback `onSave` de `abrirPvLanc` (lancamentos.html), não em `pvSalvar_`: o módulo é compartilhado
com busca/revendas-lista/revendas-construtoras/dashboard, que atualizam badge e botão em tempo real
e não devem recarregar. Motivo do reload: o score do vendedor tem peso 5 no Score de Tração (o
maior), então salvar muda a nota do card, a posição no ranking e o composto dos OUTROS
empreendimentos (Preço Médio é relativo ao conjunto) — recarregar é mais confiável que repintar
cada pedaço. Delay de 1200ms (mesmo padrão de `lancamentos-editar.html`) pra dar tempo de ver o
score calculado e o toast "✓ Perfil salvo".

**3. Nota de Tração no card, ao lado do nome do vendedor** — badge `🎯 Tração N.N` na linha do
gerente comercial, com as mesmas cores por faixa do ranking (`tp-hot`/`tp-warm`/`tp-esgot`/`tp-cold`,
agora via helper compartilhado `classeScoreTracao_`, sem duplicar a regra). Pintado por
`pvAtualizarTracaoCards_`, chamado de `renderRankingTracao` — que já buscava os scores de vendedor e
calculava o composto pro Top 10; agora calcula pra todos e só fatia depois. A posição do card vem de
`emps.indexOf(s.e)`, já que o array pontuado vem reordenado por score. Empreendimento sem dados
(comp = 0, "Sem dados") não ganha badge — "Tração 0.0" seria ruído. Card sem gerente cadastrado tem a
linha escondida por padrão e só aparece se a nota vier, pra não abrir espaço vazio.

Testado em Node: (a) render do formulário nas 3 categorias — "Prazo declarado" ausente só no PJ,
presente em PF/CORRETOR; (b) `pvAtualizarTracaoCards_` com DOM simulado — cada card recebe a nota do
SEU empreendimento (mapeamento sobrevive à reordenação), card "Sem dados" fica sem badge e com a
linha escondida, classe de cor correta por faixa.

⚠️ **Não verificado no navegador**: a ferramenta de browser ficou indisponível durante toda esta
rodada. A lógica foi coberta por testes em Node com DOM simulado e a sintaxe validada, mas o
resultado visual do badge no card e o fluxo de fechar+recarregar ao salvar não foram vistos rodando —
vale conferir na tela.

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 38) — Perfil do Vendedor (PJ): novo grupo Logística + reorganização completa

**2 critérios novos**, grupo "📍 Logística e operação":
- **Proximidade do stand de vendas com sua empresa** (select: Muito próxima/Moderada/Distante — até
  +10 pts) — atendimento mais ágil e menor custo logístico.
- **Permite plantão no decorado** (checkbox — +15 pts) — alta oportunidade de conversão direta.

**Reorganização completa** de todos os critérios objetivos e subjetivos do perfil PJ, a pedido do
usuário ("marcação intuitiva e lógica"): 5 grupos temáticos em vez de uma lista solta —
💰 Comercial (comissão/pagamento) → 🤝 Relacionamento e parceria → 📍 Logística e operação →
🔥 Sinais de urgência e prontidão para negociar → ⭐ Critérios subjetivos. Cada campo agora mostra um
badge de peso/pontuação ao lado do rótulo (ex: "Comissão oferecida (%) `até +20`"), pra deixar visível
na hora de preencher o quanto cada critério pesa no score final — novo helper `_pvLbl_()` e classe
`.pv-peso`. Backend (`calcularScoreVendedor_PJ_`) reescrito com a mesma ordem/agrupamento dos 5 grupos,
pra código e tela ficarem espelhados.

Testado em Node (proximidade+plantão isolados → 25 pts exatos; perfil completo "tudo excelente" →
score 100 clampado) e ao vivo no navegador (7 seções na ordem certa, 21 badges de peso visíveis,
2 campos novos presentes e coletando corretamente).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 37) — Perfil do Vendedor (PJ): remove 4 campos residuais de produto

Pedido do usuário: remover do perfil PJ/Construtora — "Preço anunciado (R$)", "Dias no mercado",
"Histórico de reduções de preço" e "Reserva de unidade sem custo (dias)".

Os 3 primeiros vivem na seção comum "Contato e Mercado" (compartilhada entre PF/PJ/CORRETOR) — são
dado de PRODUTO (preço e tempo do próprio anúncio), o mesmo motivo por trás de toda a redefinição do
perfil PJ nas partes 35/36 (o eixo "Vendedor" deve medir o vendedor como parceiro, não o produto).
Escondidos especificamente pra PJ (`mostrarCamposMercado = cat !== 'PJ'`) — continuam aparecendo
normalmente pro PF, onde são sinais legítimos de urgência do proprietário e ainda alimentam
`calcularScoreVendedor_PF_` (nada mudou lá). "Reserva de unidade sem custo" era um campo específico do
PJ (adicionado na parte 35) — removido por completo, junto com sua pontuação (+5) em
`calcularScoreVendedor_PJ_`.

Testado ao vivo no navegador: perfil PJ confirmado sem os 4 campos; perfil PF confirmado com os 3
campos comuns intactos (Preço/Dias/Reduções).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 36) — Perfil do Vendedor (PJ): 5 sinais de prontidão para negociar

Novos critérios no perfil "Construtora/Incorporadora (PJ)", a pedido do usuário — todos sinais fortes
de que o vendedor está pronto pra ceder em preço e condições de pagamento:

- Está dando premiação por venda (+10)
- Foi à imobiliária promover o produto (+10)
- Está pagando escritura e/ou ITBI (+12)
- Está querendo queimar estoque (+15)
- Aceita permuta com facilidade (+10)

Nova subseção "Sinais de prontidão para negociar" no formulário, logo abaixo do checkbox de urgência
de venda já existente. Todos checkbox sim/não, mesmo padrão dos demais critérios objetivos do PJ.

Testado em Node (perfil só com os 5 sinais marcados → score 57, exatamente 10+10+12+15+10) e ao vivo
no navegador (5 campos presentes no formulário, coleta capturando "sim" nos 5 corretamente).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 35) — Perfil do Vendedor: categoria única "Construtora/Incorporadora (PJ)"

Pedido do usuário: as categorias "PJ" e "CONSTRUTORA" tinham critérios quase todos sobre o PRODUTO
(unidades restantes, meses desde Habite-se, % vendido, prazo de entrega, unidade decorada parada,
campanha por bloco/torre...) — dado que já mora no cadastro do empreendimento (`lancamentos-editar.html`)
e já alimenta outros eixos do Score de Tração (Estoque/Força de Venda/Prazo de Pgt). Isso duplicava
informação e desvirtuava o que o eixo "Vendedor" deveria medir: a qualidade da construtora **como
parceira de negócio**, não do produto que ela vende.

**Categoria única "🏢 Construtora / Incorporadora (PJ)"**, com critérios redesenhados:

**Objetivos**: comissão oferecida (%), comissão negociável, prazo de pagamento da comissão (na
assinatura / no Habite-se / após financiamento), exclusividade da parceria, tempo de relacionamento
(meses), volume de vendas fechadas nos últimos 12 meses, agilidade documental (dias médios), material
comercial disponível, política de reserva de unidade (dias sem custo).

**Subjetivos** (avaliação do corretor, escala rotulada Ruim/Regular/Bom/Ótimo/Excelente — mais rápido
de preencher e mais consistente entre corretores do que uma nota solta 1-5): confiabilidade/cumpre
prazos, qualidade do suporte do gerente comercial, facilidade de negociar condições especiais,
reputação no mercado, clima geral da parceria — mais um checkbox de urgência de venda sinalizada.

**Backend**: `calcularScoreVendedor_PJ_` reescrita com a nova régua de pontos; `calcularScoreVendedor_CONSTRUTORA_`
removida. Dispatcher `calcularScoreVendedor_` normaliza `categoriaVendedor === 'CONSTRUTORA'` → `'PJ'`
automaticamente (perfis antigos continuam pontuando, só que pela régua nova — os campos antigos de
produto não têm mapeamento na fórmula nova e contam como 0, mas nada se perde no `camposEspecificos`
bruto salvo). Categorias `['PJ','CONSTRUTORA']`/`['PJ','CONSTRUTORA','CORRETOR']` viram `['PJ']`/
`['PJ','CORRETOR']` nos 3 lugares que abrem o modal (dashboard.html ×2, lancamentos.html,
revendas-construtoras.html).

Testado em Node (perfil novo com tudo "Excelente" → score 100; perfil vazio → score 0; perfil antigo
categoria CONSTRUTORA → normaliza pra PJ sem erro, score 0 pelos campos não mapeados) e ao vivo no
navegador (aba única "Construtora / Incorporadora (PJ)", campos antigos de produto confirmados
ausentes, escala rotulada com as 5 opções certas, coleta de formulário capturando os valores certos).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 34) — Plano de Pagamento: reposicionado + campos "Captação %" e "Anuais"

`lancamentos-editar.html`, seção "Dados Gerais":

**1. Painel movido**: "Plano de Pagamento" saiu de baixo de "Prazo máximo (meses)" e agora fica logo
abaixo do resumo em destaque (fundo verde) que mostra "Faixa de áreas / Menor preço / Metro quadrado
médio" — antes mesmo dos campos "Nome do empreendimento"/"Construtora".

**2. Novo campo "Captação (%)"**: percentual do valor total que o cliente paga direto até o imóvel
ficar pronto (Condomínio Vertical) — o restante é financiamento bancário após o Habite-se. Quanto
MENOR esse %, mais acessível o produto pro cliente (geralmente ~30%). Nota explicativa incluída no
próprio painel. Campo colocado em destaque, acima da grade de parcelas.

**3. Novo campo "Anuais (parcelas)"**: mesma lógica de quantidade de parcelas de Sinal/Mensais/
Semestrais — Sinal, Mensais, Semestrais e Anuais são as parcelas em que o total do "% de Captação" é
fracionado.

**Backend**: 2 campos novos no fim de `CABECALHO_LANCAMENTOS` — `planoAnuaisParcelas`,
`planoCaptacaoPerc` — depois de `planoFinanciamentoEm` (que era o último até agora). `salvarLancamento_`
grava os 2 valores nessa mesma posição.

Nota: o "% de Captação" foi explicado pelo usuário como algo relevante pra qualificar a acessibilidade
do produto — não foi pedido explicitamente pra entrar na fórmula do Score de Tração nesta rodada, só
o campo em si. Fica registrado como possível próximo passo se o usuário quiser.

Testado em Node (salvarLancamento_ + listarLancamentos_ com os 2 campos novos, 64 colunas no total,
alinhamento confirmado) e ao vivo no navegador: painel confirmado imediatamente após `resumoExtracao`
e antes de "Nome do empreendimento" (via inspeção do DOM), valores populando corretamente ao carregar
um lançamento existente.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 33) — Score de Tração: 2ª rodada de pesos + reordenação

Correção da parte 32, mesmo dia: usuário refez a ordem/pesos. Novos pesos (soma continua 15):

| Ordem na tela | Eixo | Peso | Peso anterior (parte 32) |
|---|---|---|---|
| 1º | Vendedor | 5 | 5 (sem mudança) |
| 2º | Força de Venda | 4 | 4 (sem mudança) |
| 3º | Prazo de Pgt | 3 | 1 |
| 4º | Preço Médio *(era "Atratividade")* | 2 | 3 |
| 5º | Estoque | 1 | 2 |

Prazo de Pgt e Preço Médio trocaram de peso/posição entre si (Prazo sobe de peso 1→3, Preço Médio
desce de peso 3→2); Estoque cai de peso 2→1, mas continua por último. Fórmula de cada eixo (parte
30/31) não mudou, só peso/rótulo/ordem — mesmo padrão da parte 32.

Testado em Node (composto recalculado: 7,667 pro caso de exemplo) e ao vivo no navegador desta vez —
`renderRankingTracao` chamado com dados mockados, ordem confirmada "Vendedor → Força Venda → Prazo
Pgt → Preço Méd. → Estoque", subtítulo do painel e score final (7,7) conferidos.

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 32) — Score de Tração: novos pesos + renomeação + reordenação dos eixos

Pedido do usuário: novos pesos e nova ordem de exibição pros 5 eixos do ranking (`lancamentos.html`).
Pesos (partes inteiras, soma agora 15 em vez de 14):

| Eixo (novo nome) | Peso | Nome antigo |
|---|---|---|
| Vendedor | 5 | Vendedor (era 4) |
| Força de Venda | 4 | Tração (era 1) |
| Atratividade (Preço Médio) | 3 | Atratividade (era 2) |
| Estoque | 2 | Disponibilidade (era 3) |
| Prazo de Pgt | 1 | Prazo (era 4) |

Só o RÓTULO e o PESO mudaram — a fórmula de cada eixo (a mesma variável interna, só renomeada na
tela) continua a mesma das partes 30/31: Vendedor = scoreVendedor/10; "Força de Venda" (antiga
Tração) = % de unidades já vendidas; Atratividade = m² médio comparado ao lote carregado; Estoque
(antiga Disponibilidade) = estoque absoluto contra teto por tipo (CV=150/CH=300); Prazo de Pgt
(antigo Prazo) = prazo máximo contra teto por tipo (CV=36m/CH=240m).

Ordem de exibição no painel (colunas do ranking) também mudou pra bater com a ordem pedida: Vendedor
→ Força de Venda → Atratividade → Estoque → Prazo de Pgt (era Prazo → Disponib. → Atrativ. → Tração
→ Vendedor).

Testado em Node (soma de pesos = 15, composto recalculado corretamente com um caso de exemplo
completo) — a verificação visual ao vivo no navegador não pôde ser concluída nesta rodada
(instabilidade temporária do classificador de segurança da ferramenta de browser), mas o template
HTML foi conferido por leitura direta do arquivo (ordem e rótulos das colunas corretos).

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 31) — Score de Tração: eixo Disponibilidade também diferenciado por tipo

Continuação da parte 30, mesmo padrão de teto fixo por tipo de empreendimento aplicado agora ao eixo
"Disponibilidade": antes era `(estoque ÷ total daquele empreendimento) × 10` — um percentual relativo
só ao próprio empreendimento, que tratava um Condomínio Vertical pequeno e um Condomínio Horizontal
grande como "iguais" na mesma proporção, mesmo tendo escalas de estoque bem diferentes.

Agora usa o ESTOQUE (unidades ainda disponíveis, valor absoluto) contra um teto fixo por tipo,
confirmado com o usuário: **Condomínio Vertical = 150 unidades = 100%**, **Condomínio Horizontal =
300 unidades = 100%** (loteamentos costumam ser maiores). Capado em 10, mesmo fallback conservador
(teto de Vertical) sem `tipoEmpreendimento` definido — mesmo padrão do eixo Prazo (parte 30).

Peso do eixo (3, dentro do total de 14) não mudou — só a fórmula interna de cálculo.

Testado em Node (teto exato, metade do teto, acima do teto capado, sem tipo definido — pros dois
tipos) e ao vivo no navegador: CV com 75 de estoque (metade de 150) e CH com 150 de estoque (metade
de 300) — ambos corretamente normalizados pra 5,0, apesar do CH ter o dobro do estoque absoluto.

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 30) — Score de Tração: prazo por tipo de empreendimento + eixo Vendedor (peso 4)

Duas mudanças na regra do "Score de Tração" (lancamentos.html), a pedido do usuário:

**1. Eixo Prazo deixa de ser relativo, vira absoluto por tipo de empreendimento.** Antes, o prazo
máximo era normalizado por min-max contra o LOTE de empreendimentos carregados no momento (um mesmo
prazo podia pontuar diferente dependendo do que mais estava na tela). Agora usa um teto FIXO por
`tipoEmpreendimento`: **Condomínio Vertical = 36 meses (3 anos de obra, prazo típico até liberar
financiamento bancário) = 100%**; **Condomínio Horizontal = 240 meses (média — pode chegar a 420 em
casos pontuais, mas 240 é a referência) = 100%**. Score sempre capado em 10 (não deixa um prazo bem
acima do teto típico desbalancear a soma ponderada). Empreendimento sem `tipoEmpreendimento` definido
cai no teto de Vertical (mais conservador). Exemplo confirmado com o usuário: 29 meses num Vertical
agora pontua ~8,1/10 (muito alta, como esperado — antes dependia do que mais estivesse carregado).

**2. Novo eixo "Vendedor" (nota do Perfil do Vendedor, peso 4).** Busca `scoreVendedor` em lote via
`listarPerfisVendedor` (mesmo endpoint já usado pros badges de urgência nos cards), indexado por
`idLancamento`. Pesos reescritos como partes inteiras (os mesmos 40/30/20/10% de sempre = 4/3/2/1,
mais Vendedor=4) — soma 14, cada eixo contribui `eixo × peso ÷ 14`. `renderRankingTracao` virou
assíncrona pra buscar o score antes de renderizar; painel ganha uma 5ª coluna de eixo (roxo,
`.bar-vendedor`) com o valor bruto (0-100) ao lado da barra.

Testado em Node (prazoScore isolado pros 2 tipos + caso sem tipo + caso capado em 420m; composto final
com score de vendedor influenciando corretamente o ranking) e ao vivo no navegador (5 eixos renderizando
com os valores certos, ranking reordenando pelo novo composto).

100% frontend, sem mudança no backend (só consome campos/endpoints que já existiam).

## 2026-07-16 (parte 29) — Fix: "Única" e "Financiamento em" não gravavam (conflito com auto-formatação de data do Sheets)

Bug reportado: depois de cadastrar um empreendimento, os campos "Única" e "Financiamento em" (Plano de
Pagamento) não ficavam gravados.

Causa raiz: os dois campos são `input type=month` (valor "AAAA-MM", ex: "2028-12"). Sem forçar o
formato da célula ANTES de escrever, o Google Sheets auto-detecta esse padrão como data e converte
pra um valor Date interno — na leitura de volta (`listarLancamentos_`), esse Date vira uma string ISO
completa (ex: "2028-12-01T00:00:00.000Z"), que não bate com o formato exato "AAAA-MM" que o
`<input type=month>` exige pra exibir um valor. O campo aparecia vazio na tela, dando a impressão de
que "não gravou" — mesmo bug clássico do Sheets auto-formatando texto parecido com data.

Fix: `salvarLancamento_` agora chama `setNumberFormat('@')` (texto puro) nas colunas
`planoUnicaData`/`planoFinanciamentoEm` da(s) linha(s) recém-inseridas, ANTES do `setValues()` — sem
isso a ordem inversa não adianta nada (o Sheets já teria convertido o valor no mesmo `setValues`).

Confirmado que "Prazo máximo" já atualiza automaticamente a partir de "Financiamento em"
(`calcularPrazoMaximoAuto`, implementado na parte 27) — isso já estava funcionando; o problema era só
o campo de origem ("Financiamento em") não persistir.

Testado em Node com um espião em `setNumberFormat` confirmando que é chamado nas colunas certas
(índices 61/62), na ordem certa (antes do `setValues`), sem desalinhar nenhum outro campo.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".
**Atenção**: qualquer empreendimento que você já tentou salvar com esses 2 campos antes desse fix
provavelmente ficou com a data corrompida/vazia na planilha — depois de reimplantar, reabra esse
empreendimento em "Editar" e preencha "Única"/"Financiamento em" de novo pra gravar corretamente.

## 2026-07-16 (parte 28) — Correção: "Única" é data, não quantidade de parcelas

Correção da parte 27, ainda no mesmo dia: "Única" no Plano de Pagamento é um pagamento pontual numa
data específica (ex: "nov/28" no padrão LOUVRE), não uma contagem de parcelas — sempre 1x por
definição, então a informação que importa é QUANDO, não QUANTAS. Campo renomeado de
`planoUnicaParcelas` (number) pra `planoUnicaData` (input type=month, mesmo padrão de
`planoFinanciamentoEm`) em `lancamentos-editar.html` e em `CABECALHO_LANCAMENTOS`/`salvarLancamento_`
no backend. Sinal/Mensais/Semestrais continuam quantidade de parcelas (numéricos), sem mudança.

Testado em Node (alinhamento de colunas ainda correto após o rename) e no navegador (campo renderiza
como seletor de mês/ano com o rótulo certo).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no Apps Script e reimplantar como "Nova versão".

## 2026-07-16 (parte 27) — Painel "Plano de Pagamento" em Dados Gerais (lancamentos-editar.html)

Novo painel destacado (mesmo estilo visual do resumo de área/preço/m²) dentro da seção "Dados Gerais",
logo abaixo de "Prazo máximo (meses)": Sinal, Mensais, Semestrais, Única (todos QUANTIDADE DE
PARCELAS, confirmado com o usuário — não % nem R$) e "Financiamento em" (mês/ano).

"Financiamento em" preenche "Prazo máximo (meses)" automaticamente ao mudar (`calcularPrazoMaximoAuto`
— meses entre HOJE e a data informada, confirmado com o usuário; nunca negativo, trava em 0 se a data
já passou). O campo "Prazo máximo" continua editável manualmente depois, se o usuário quiser ajustar.

**Backend**: 5 campos novos no fim de `CABECALHO_LANCAMENTOS` (depois de `statusAtivo`, que era o
último até agora) — `planoSinalParcelas`, `planoMensaisParcelas`, `planoSemestraisParcelas`,
`planoUnicaParcelas`, `planoFinanciamentoEm`. Nomes com prefixo "plano" de propósito: já existem
campos por-UNIDADE chamados `sinal`/`mensais`/`anuais` (de um plano de pagamento antigo removido da UI
— ver "Remover Qd/Lt e plano de pagamento por unidade"), sem esse prefixo haveria colisão de nome no
array (dois campos com a mesma chave string quebraria a conversão linha→objeto). `salvarLancamento_`
grava os 5 valores nessa mesma posição (fim do array) — testado que isso NÃO desalinha nenhum campo
já existente (construtora, unidades, statusAtivo etc. continuam batendo certinho).

Testado em Node (salvarLancamento_ + listarLancamentos_ com os campos novos, confirmando alinhamento)
e ao vivo no navegador (painel renderiza, populate ao carregar um lançamento existente, cálculo de
29 meses pra uma data ~2,5 anos no futuro, e trava em 0 pra data no passado).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no editor do Apps Script e reimplantar como "Nova
versão" pra funcionar em produção (a planilha ganha as 5 colunas novas automaticamente no próximo
login, via a migração `migrar_cabecalho_lancamentos` que já roda no init).

## 2026-07-16 (parte 26) — Fix: botão "Excluir" de empreendimentos não removia da lista

Bug reportado: em `lancamentos.html`, clicar "🗑 Excluir" num empreendimento cadastrado não tinha
efeito visível nenhum.

Causa raiz: `excluirEmp()` (frontend) e `excluirLancamento_()`/`setStatusImovel_()` (backend) já
faziam a parte deles corretamente — gravavam `statusAtivo = 'Excluído'` em todas as linhas daquele
`idLancamento` na aba LANCAMENTOS (soft-delete, sem apagar a linha de verdade). O problema estava em
`listarLancamentos_()`: nunca filtrava por `statusAtivo`, então `carregarLancamentos()` (chamado logo
depois de excluir, pra atualizar a tela) buscava a lista de novo e o empreendimento "excluído" voltava
do mesmo jeito — o botão parecia não fazer nada.

Fix: `listarLancamentos_()` agora filtra fora qualquer linha com `statusAtivo === 'Excluído'`. Essa
mesma rota (`listar_lancamentos`) também alimenta o BaseImob público — o bug também fazia anúncios
excluídos continuarem visíveis lá, o que também fica corrigido.

Testado em Node (mock de planilha): 2 empreendimentos cadastrados (um com 2 linhas/unidades), exclui
um deles, confirma que ele some da lista COM o outro permanecendo intacto, e confirma que `statusAtivo`
foi gravado corretamente em ambas as linhas do empreendimento excluído na planilha simulada.

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no editor do Apps Script e reimplantar como "Nova
versão" pra corrigir em produção.

## 2026-07-16 (parte 25) — Novo padrão LOUVRE: revendas-construtoras + tabela CSV no extrator "Outros" de lançamentos

Padrão de tabela de vendas por unidade da LOUVRE (colunas: Unidade, Area_Total_Apto_m2,
Area_Garagem_m2, Area_Escaninho_m2, Nº_Vaga, Local_Vaga, Nº_Escaninho, Sinal_3x, Mensais_27x,
Semestrais_4x_janXX, Unica_1x_novXX, Financiamento_dezXX, Valor_Unidade) — diferente dos padrões de
revenda anteriores, é uma tabela de PREÇO POR UNIDADE de lançamento (sem bairro/tipo/quartos/suítes).

**`revendas-construtoras.html`**: 2 rótulos novos em `SINONIMOS_COLUNA_RC` — `area_total_apto_m2` →
`area`, `valor_unidade` → `valor`. `Nº_Vaga` (ex: "VAGA 27/ VAGA 27A") de propósito NÃO mapeado pra
contagem de vagas — é um identificador de texto, não um número; forçar `parseInt` nisso daria "0
vagas" errado. Tipo/bairro ficam vazios (a fonte não tem essa informação) — texto original preservado
igual sempre.

**`lancamentos.html`, aba "Outros"** (mudança maior): até agora esse extrator só aceitava texto no
formato "CAMPO: valor" pré-organizado (ver `ORGANIZADOR_PROMPT.md`) — colar uma tabela CSV bruta
resultava em 0 tipologias detectadas, silenciosamente. Nova capacidade: **detecção automática** —
`extrairOutrosFormato()` agora reconhece se a 1ª linha colada tem cara de cabeçalho delimitado (vírgula
ou TAB, sem os dois-pontos de "CAMPO:") e, se sim, usa um extrator CSV novo (`extrairOutrosTabelaCsv_`),
reaproveitando o mesmo princípio "cabeçalho → campo interno" já usado em revendas-construtoras.html
(`SINONIMOS_COLUNA_OUTROS`), mas com vocabulário próprio pro schema de unidade de lançamento. O
formato "CAMPO: valor" original continua funcionando exatamente como antes (código original preservado
em `extrairOutrosCampoValor_`, só a lógica de triangulação de preço/filtro foi extraída pra um helper
compartilhado `finalizarUnidadesOutros_` entre os dois caminhos).

Numa tabela CSV pura (sem "NOME:"/"CONSTRUTORA:"/"BAIRRO:"), o Bloco 1 (dados do empreendimento) fica
vazio — o usuário preenche manualmente na prévia, já sinalizado pelo aviso "⚠ NÃO DETECTADO" que já
existia na tela. `Nº_Escaninho` (número, ex: "26") mapeado pro campo escaninho existente. As colunas de
plano de pagamento por unidade (Sinal/Mensais/Semestrais/Única/Financiamento) e `Nº_Vaga` (identificador,
mesmo motivo do RC) **não têm campo correspondente no schema atual e não são importadas** — não se
perdem tecnicamente (o texto pode ser consultado na fonte original), mas não ficam estruturadas; se
isso for necessário no futuro, precisa de um campo novo dedicado (não implementado agora, fora do
pedido original).

Testado em Node (extração da LOUVRE + regressão do formato CAMPO:valor + detecção automática dos dois
casos) e ao vivo no navegador (aba Outros → colar CSV → extrair → prévia mostra área/preço/m² corretos
e o aviso de campos não detectados).

100% frontend, sem mudança no backend.

## 2026-07-16 (parte 24) — Score do vendedor dentro do botão "Vendedor" (todas as telas)

Todo botão que abre o Perfil do Vendedor agora mostra o score numérico dentro do próprio botão (ex:
"🏷️ Vendedor 76"), em vez de só num badge separado — sem score cadastrado ainda (perfil vazio ou
score 0), mantém só o rótulo, sem "0" pendurado. Aplicado nas 5 telas que têm esse botão:

- **`revendas-lista.html`** (pedido original): score já vinha pronto por linha (`listarRevendaLista_`
  no backend), só precisou entrar no template do botão + atualizar após salvar no modal.
- **`busca.html`, `lancamentos.html`, `revendas-construtoras.html`**: já buscavam o perfil em lote
  (`pvCarregarBadgesBatch_`, endpoint `listarPerfisVendedor`) pra pintar um badge de urgência nos
  cards — o mesmo carregamento agora também atualiza o botão.
- **`dashboard.html`** (2 templates: linha compacta de "Matches do momento" e o drawer de cards por
  cliente — nenhum dos dois buscava o perfil em lote antes): novo `pvAtualizarScoresDash_()`, que
  reaproveita o mesmo `pvCarregarBadgesBatch_` compartilhado, mas com origem dinâmica por card
  (Revenda/Lançamento/Revenda-construtora) em vez de fixa — chamado após cada um dos 2 renders.
  `abrirPvDash_` (antes não atualizava nada após salvar) agora atualiza TODOS os botões daquele
  imóvel na tela ao mesmo tempo (ex: se o mesmo imóvel aparece na tabela E no drawer simultaneamente).

Novo helper compartilhado em `perfil-vendedor.js`: `pvSetBotaoScore_(btn, baseLabel, score)`.

Testado ao vivo no navegador (mock de `fetch`) nas 2 telas mais arriscadas: `revendas-lista.html`
(render inicial com/sem score + atualização pós-save) e `dashboard.html` (batch com item sem perfil
mantendo o rótulo puro, e `abrirPvDash_` atualizando os 2 botões do mesmo imóvel simultaneamente).

100% frontend, sem mudança no backend (os endpoints já retornavam `scoreVendedor`).

## 2026-07-14 (parte 23) — Checagem de saúde do backend na tela de login (ponto único de falha)

Problema identificado: todas as 16 páginas apontam pra uma única `WEBHOOK_URL` em `config.js`. Se a
reimplantação do Apps Script for feita errado ("Nova implantação", que gera uma URL nova, em vez de
"Editar implantação → Nova versão", que mantém a mesma URL), a plataforma inteira para — sem fallback,
sem detecção automática. Agravante encontrado ao investigar: o `fetch` do botão "Entrar" em
`index.html` não tinha timeout nenhum — se o backend travasse, o botão ficava preso em
"Verificando..." indefinidamente, sem nenhum aviso. Era exatamente esse silêncio que fazia o corretor
só perceber a falha na hora de tentar usar de verdade.

**Backend (`code.txt`)**: nova rota `acao=ping`, deliberadamente sem tocar em `PropertiesService`/
Spreadsheet — mede só "o deploy está no ar", nunca lentidão de planilha/quota.

**Frontend (`index.html`)**:
1. Checagem proativa (`checarSaudeBackend_`): dispara em paralelo assim que a tela de login aparece
   (não atrasa nem bloqueia nada) — se `acao=ping` não responder em 5s (`AbortController`) ou a
   resposta não for o JSON esperado, mostra um banner vermelho fixo acima do formulário: "Backend
   inacessível — verifique se a reimplantação do Apps Script foi feita como 'Nova versão' (não 'Nova
   implantação')." Roda só quando a tela de login vai mesmo aparecer (não quando já autenticado e
   redirecionando direto).
2. Timeout de 5s adicionado ao próprio botão "Entrar" (`acao=verificar_senha`) — se abortar por
   timeout, mostra a mesma mensagem de backend inacessível; qualquer outro erro de rede continua com
   a mensagem genérica "Erro de conexão. Tente novamente." (evita alarmar o usuário com um diagnóstico
   específico quando pode ser só a internet dele).

Testado no navegador simulando os 3 cenários (mock de `fetch`): timeout de ~5s exibe o banner e a
mensagem certa; resposta `{ok:true}` esconde o banner; erro de rede comum (não-timeout) mantém a
mensagem genérica no botão "Entrar", sem travar o botão desabilitado.

**Escopo**: cobre só o momento de login — uma sessão já aberta em outra página (dashboard, contatos
etc.) que perde o backend no meio do uso não é avisada por este banner (fora do que foi pedido).

⚠️ Backend: precisa colar `Downloads/code.gs.txt` no editor do Apps Script e reimplantar como "Nova
versão" pra rota `ping` existir em produção.

## 2026-07-14 (parte 22) — Seção "Novas ofertas" renomeada pra "Novidades" + painel de portfólio movido pra dentro

Rebatiza a seção "Novas ofertas" para "Novidades" (id interno `novasOfertasSection` mantido, só o
texto visível mudou). O bloco "Imóveis novos" continua aparecendo só quando há novidades nos últimos
3 dias (comportamento já existente, preservado).

Move o painel "📋 Atualização do portfólio" (antes solto lá embaixo, dentro de "Portfólio de
revendas") pra dentro da seção "Novidades", logo abaixo do bloco "Imóveis novos" — mas o painel
continua **sempre visível**, independente de haver imóveis novos ou não, porque é ele quem dá acesso
ao botão "Sincronizar revenda" (não pode ficar escondido).

Painel comprimido em ~50% de altura: paddings/margens/fontes reduzidos (`.revenda-diff`,
`.revenda-diff-tbl`, `.diff-box`) e as 2 linhas de meta-informação (última sincronização + registro
"Último" congelado) viraram uma linha só, sem perder nenhum dado. O badge de matches (`⋯`/contagem)
ficou menor só DENTRO deste painel (`.revenda-diff .diff-match-badge`), sem afetar o mesmo badge
usado nas linhas de "Imóveis novos" (compartilhava a mesma classe base).

Testado ao vivo no navegador: com sincronização mas sem imóveis novos, "Imóveis novos" some e o
painel de portfólio continua visível; com os dois presentes, aparecem juntos na ordem correta;
título "Novidades" confirmado; meta-info numa linha só confirmada.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 21) — Ajustes em "Top favoritos" (dashboard)

Dois ajustes pedidos na seção "Top favoritos": (1) coluna 1 não mostra mais o score do imóvel
(`melhorScore`) — no lugar, destaca o total de clientes que marcaram aquele imóvel como favorito,
num badge maior/em negrito (`.tf-fav-count`/`.tf-fav-label`, com "favorito"/"favoritos" no singular/
plural); (2) proporção das colunas mudou de 40/60 (herdada de "Novas ofertas") para 60/40 — nova
classe `.tf-layout` (grid `3fr 2fr`) isolada de `.no-layout`, pra não afetar "Novas ofertas" nem o
outro uso de `.no-layout` no dashboard.

Testado ao vivo no navegador: colunas renderizando em 441px/294px (60%/40% exatos), badge de
favoritos aparecendo no lugar do score, singular/plural corretos ("1 favorito" vs "7 favoritos").
`melhorScore` continua calculado no backend (ainda usado como critério de desempate no ranking),
só não é mais exibido.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 20) — Novo padrão REVENDASGYN (variante "casa") no extrator Colar/Extrair

Terceiro padrão de tabela enviado pela REVENDASGYN (empresa parceira) — desta vez uma variante pra
casas em loteamento, com colunas diferentes do padrão de apartamento já suportado: `TIPO DE IMOVEL`,
`IMOVEL`, `DORMITORIOS` (ex: "3Q 1 SUÍTE"), `CONSTRUCAO M2` e `TERRENO M2` **separadas** (ao
contrário do formato combinado "387 T / 286 C" da CITY, que fica num campo só), `QD/LT` (identifica a
unidade dentro do loteamento, ex: "QD. 09 LT. 16") e `VAGAS`.

Rótulos novos incorporados em `SINONIMOS_COLUNA_RC`: `construcao m2`/`terreno m2` → dois buckets
próprios (`areaConstrucaoCol`/`areaTerrenoCol`), checados independente um do outro (mesmo padrão de
`quartosCol`/`vagasCol`) quando não há o campo combinado `area`; `qd/lt` → bucket `unidade` (mesmo
papel que tem nos outros padrões). `TIPO DE IMOVEL`, `IMOVEL` e `DORMITORIOS` já eram reconhecidos
pelo extrator (nenhuma mudança neles).

A mojibake do texto de exemplo ("TÃ‰RREA", "SUÃTE") já é coberta pelo tratamento existente (bytes
especiais CP1252 + correção pontual de "su[í]te") — nenhum ajuste novo necessário aí.

Testado em Node com o exemplo real enviado: tipo "Casa", 97,71 m² de construção, 150 m² de terreno,
3 quartos, 1 suíte, R$ 450.000, unidade "QD. 09 LT. 16", mojibake corrigido — e reconfirmado que os
padrões anteriores (CTTY, BRASAL v1/v2, CITY) continuam OK (suite de regressão).

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 19) — Redesign da "Visão geral" (dashboard): painel unificado, mais largura que altura

Redesign completo dos 7 blocos de resumo do topo do dashboard (Contatos/Novos leads/Ganhos/
Revendas/Empreendimentos/Revendas-construtoras/Novos imóveis) — antes 5 "cards" soltos por linha
(grid `repeat(5,1fr)`), sobravam 2 numa 2ª linha quase vazia. Escopo isolado só em `#cardsRow`; as
outras seções que reaproveitam `.cards-row`/`.card` (Composição, Portfólio de revendas, Lançamentos)
não foram tocadas.

**Painel único em vez de cards soltos** (`.vg-panel`/`.vg-stat`, novas classes): grid com
`auto-fit`+`minmax(140px,1fr)` e `gap:1px` (a cor do fundo do container vira as linhas divisórias
finas entre os blocos, sem precisar gerenciar borda por célula) — os 7 blocos cabem numa linha só em
telas normais, em vez de sobrar espaço vazio numa 2ª linha. Em telas estreitas (< 640px), cai pra 2
colunas automaticamente.

**Tamanho reduzido**: padding 20×18px → 12×14px, valor 32px → 21px, label/sub também menores —
somado ao fim da 2ª linha vazia, o espaço vertical total ocupado cai bem mais que 50% na prática.

**Leitura reorganizada em 2 blocos lógicos**: primeiro o funil de CLIENTES (Contatos → Novos leads →
Ganhos, uma sequência de base→entrada→resultado), depois o INVENTÁRIO de imóveis (Revendas →
Empreendimentos → Revendas-construtoras → Novos imóveis) —ždantes a ordem misturava os dois
assuntos sem critério aparente.

**Extensível de propósito**: `auto-fit` reflui sozinho se blocos novos forem adicionados no futuro
(não precisa mexer no CSS de novo pra caber um 8º/9º bloco).

**Melhorias extras**: ícone 👥 adicionado no card "Contatos" (não tinha nenhum antes, agora todo
bloco tem um, mais consistente visualmente); botão "Ver →" injetado dinamicamente em "Novos imóveis"
(só aparece quando há novidades) ajustado pro mesmo padrão compacto dos outros.

Testado ao vivo no navegador: 7 blocos cabem numa única linha em desktop (confirmado via
`getComputedStyle` — 7 colunas de ~149px), altura por bloco caiu de ~110px pra 82px, ordem lógica
confirmada (Contatos → Novos leads → Ganhos → Revendas → Empreendimentos → Rev.-construtoras → Novos
imóveis), responsivo em mobile (375px: cai pra 2 colunas, sem overflow horizontal).

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 18) — Nova seção "Top favoritos" no Dashboard

Nova seção no Dashboard, logo abaixo de "Novas ofertas" e com a mesma estrutura visual (2 colunas):
coluna 1 = ranking de imóveis por total de favoritos (1º critério) e, empatado, pelo melhor
`scoreMatch` já visto pra esse imóvel em qualquer cliente (2º critério, desempate); coluna 2 = ao
clicar num imóvel do ranking, lista os clientes que o favoritaram, ordenada pelo score ATUAL de cada
cliente (busca ao vivo em CONTATOS — não confia no score congelado em FAVORITOS/MATCHES).

**Backend**: nova `listarTopFavoritos_()` — agrupa a aba FAVORITOS por (fonte + imoCodigo), conta
quantos clientes favoritaram cada imóvel, cruza com MATCHES pra achar o melhor scoreMatch de cada
imóvel e com CONTATOS pra pegar o score atual de cada cliente favoritador. Nova rota
`listar_top_favoritos`. Limitado aos 15 primeiros do ranking.

**Frontend**: HTML/CSS 100% reaproveitados de "Novas ofertas" (`.no-layout`, `.no-imoveis-col`,
`.match-table`, `.match-row`, etc.) — mesma "cara" da seção existente, só invertendo o que cada
coluna representa (lá é imóvel→clientes com perfil; aqui é imóvel→clientes que favoritaram).
`carregarTopFavoritos()` chamada no bootstrap do dashboard, junto das outras seções independentes.

Testado em Node (backend: 2 imóveis com 3 e 2 favoritos — o de 3 fica em 1º mesmo tendo score menor
que o de 2, confirmando que total de favoritos manda mais que score; clientes de cada imóvel
corretamente ordenados por score) e ao vivo no navegador (seção renderiza, contadores corretos,
clicar em cada imóvel troca a coluna de clientes com a ordenação certa).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-14 (parte 17) — Tabela de Construtoras: remove coluna Total, data com hífen

Dois ajustes pedidos pelo usuário na tabela de Construtoras (`revendas-construtoras.html`):

**1. Coluna "Total de imóveis" removida** — era redundante com a nova coluna "Status" (parte 13),
cuja soma já dá o total. Pra não perder a função de "ver todos os imóveis dessa construtora sem
filtro de status", o próprio nome da construtora virou o botão clicável (reaproveita
`abrirImoveisConstrutoraRC(nome)` sem 2º argumento = sem filtro). Cabeçalho e linhas ajustados de 8
pra 7 colunas.

**2. "Última Atualização" no formato `14/07/2026-19:00`** (data-hífen-hora), mesmo padrão da coluna
"Atualizado em" em contatos.html. Nova `fmtDataHoraTracoRC_()` — o valor já vem gravado como
"dd/MM/yyyy HH:mm" (espaço) desde o backend, só precisa trocar o separador.

Testado ao vivo no navegador: cabeçalho da tabela sem "Total de imóveis" (7 colunas), data exibida
como "14/07/2026-19:00", clique no nome "CITY" abre a lista completa de imóveis sem nenhum filtro de
status aplicado (2 imóveis, status misto).

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 16) — Padrão REVENDASGYN + fix crítico de mojibake com bytes especiais do CP1252

Novo padrão, da empresa parceira **REVENDASGYN** (17 colunas: `REFERENCIA,GERENTE1,CONTATO1,
GERENTE2,CONTATO2,TIPO DE IMOVEL,IMOVEL,DORMITORIOS,SETOR,UNIDADE,M2,VALOR,CONDICAO,CONDOMINIO,
OCUPACAO,VAGA/BOX,ENDERECO`) — correção de nome: identificado inicialmente por engano como um "2º
padrão BAMBUI"; confirmado pelo usuário que é da REVENDASGYN, empresa parceira diferente. Expôs um
bug real na correção de mojibake que passou despercebido em todos os padrões anteriores.

**BUG achado: mojibake com bytes especiais do Windows-1252 corrompia em vez de corrigir.**
"VIDA MILÃƒO" devia virar "VIDA MILÃO" — o byte 0x83 (parte da letra "Ã" maiúscula original) vira
"ƒ" (U+0192) quando mal-interpretado como Windows-1252, não um caractere Latin-1 comum. Minha
correção anterior só sabia reconstruir bytes na faixa Latin-1 direta (0x80-0xBF); pra esse caso
específico, ela reconstruía o byte errado e **corrompia o nome pra "MILÒO"** em vez de corrigir —
pior que não tentar nada. Nova tabela `CP1252_ESPECIAIS_RC` mapeia de volta os ~27 símbolos que o
Windows-1252 remapeia nesses bytes (€, ", ', •, ƒ, etc.) — cobre esse caso e qualquer outro símbolo
dessa faixa que aparecer no futuro.

**Segundo problema, relacionado: "SUÃTE" não tinha como ser reconstruído por byte** (perdeu o byte
do "Í" de vez na fonte, não sobrou informação suficiente) — precisou de um patch específico pra essa
palavra (comum em composição de imóveis), preservando maiúsculas/minúsculas. Descoberta importante
de ORDEM: esse patch específico precisa rodar DEPOIS da reconstrução geral por bytes, nunca antes —
rodando antes, a reconstrução geral reinterpretava o "í" que acabara de ser corrigido como se fosse
mais um byte de mojibake, corrompendo de novo (bug que só apareceu ao testar os dois problemas juntos
no mesmo texto).

**Terceiro problema: "CONDOMINIO" é ambíguo entre construtoras** — no BAMBUI (parte 15, hoje) é o
nome do empreendimento; na REVENDASGYN, a mesma palavra é a TAXA mensal em R$. Mesma
classe de conflito já resolvida uma vez pra "descricao" (parte 12) — corrigido do mesmo jeito:
`condominio` vira um bucket à parte (`condominioNome`), só usado como último recurso pro nome do
empreendimento na cascata, nunca sobrepondo uma fonte melhor (aqui, a coluna "IMOVEL"). Resultado:
funciona certo nos dois formatos sem um quebrar o outro.

**Novos mapeamentos**: `"TIPO DE IMOVEL"` (já suportado, parte 14) → tipo; `"SETOR"` → bairro (forma
goianiense de "bairro", ex: "Setor Bueno"); `"DORMITORIOS"` → reaproveita o parser de texto livre
(`config`), com um ajuste novo: aceita "2Q" como sinônimo compacto de "2 quartos" (só tenta esse
padrão quando a palavra "quartos" por extenso não aparece). `"VAGA/BOX"`, `"CONDICAO"`, `"OCUPACAO"`,
`"GERENTE1/2"`, `"CONTATO1/2"` deliberadamente não mapeados (texto solto demais pra extrair com
segurança, ou sem uso claro no sistema ainda).

Testado com os dados exatos do usuário: "VIDA MILÃO" corrigido certo (não mais "MILÒO"), "SUÍTE"
recuperado corretamente (suítes=1), unidade/bairro/quartos/valor certos nas 2 linhas. Suíte de
regressão completa (CTTY, BRASAL 1º, CITY, AVALON, BAMBUI 1º) rodada de novo depois da reordenação
da correção de mojibake — nenhuma quebra.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 15) — Padrão BAMBUI: bairro de verdade, quartos avulso, unidade embutida em campo composto

Novo padrão da construtora BAMBUI (14 colunas: `REFERENCIA,GERENTE DE REVENDAS,CONTATO,COMISSAO
PERMUTA,TIPO,CIDADE,BAIRRO,QUARTOS,CONDOMINIO,AREA,VALOR DE VENDA,CONDOMINIO (R$),OCUPACAO,
ENDERECO/UNIDADE`). Duas novidades reais em relação a tudo suportado até aqui:

**1. Primeiro padrão com "Bairro" de verdade** — nenhum formato anterior tinha essa coluna; o campo
sempre saía vazio (`bairro: ''` fixo no retorno do extrator, nunca lido de lugar nenhum). Agora
`bairro` é lido normalmente como qualquer outro campo mapeado. Efeito prático: `scoreBairro_()` no
motor de matching usa `imovel.bairro` pra pontuar compatibilidade de localização — pra imóveis desse
formato, o matching passa a considerar bairro de verdade em vez de cair sempre no caso neutro (sem
info = pontuação neutra).

**2. "ENDERECO/UNIDADE" combina 3 informações numa coluna só**, separadas por `|` — ex: `"UNIDADE
501 | BOX 71/71A | Rua 12-A, Vila São João, Goiânia-GO - CEP: 74075130"`. Nova função
`extrairUnidadeCompostaRC_()`: pega só o 1º trecho (antes do primeiro `|`) e tira o prefixo
"UNIDADE " — vira só "501" (ou "1203 B", incluindo sufixo de bloco/torre quando presente). Mesma
cascata de prioridade já usada pra empreendimento (só entra em ação quando não há coluna "Unidade"
mais direta).

**3. "CONDOMINIO" (sem sufixo) é o NOME do empreendimento** (ex: "ORBY FLAMBOYAT"), diferente de
"CONDOMINIO (R$)" (a taxa mensal, string de cabeçalho diferente, continua não mapeada de propósito).
`"QUARTOS"` — coluna numérica avulsa, sem suítes/vagas — mapeada à parte, checada independente de
`vagasCol`/`config` (que outros formatos usam), já que aqui as duas nunca vêm juntas.

Campos não mapeados de propósito (ficam só em `textoOriginal`, mesma lógica de sempre pra info sem
uso claro no sistema ainda): `GERENTE DE REVENDAS`, `CONTATO`, `COMISSAO PERMUTA`, `CIDADE`,
`OCUPACAO` — se algum desses vier a ser útil como campo de primeira classe, é só pedir.

Testado com os dados exatos do usuário: unidade "501"/"1203 B" extraída certa do campo composto,
empreendimento "ORBY FLAMBOYAT"/"MOOVE" da coluna Condominio, bairro preenchido pela primeira vez
("Vila São João...", "Bueno"), 3/2 quartos, valores corretos, mojibake resolvido em tudo. Suíte de
regressão completa (CTTY, BRASAL 1º/2º, CITY, AVALON) rodada de novo — nenhuma quebra.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 14) — Padrão "print de tabela" livre: área com ponto decimal, tipo/composição em colunas próprias

Usuário mandou mais um padrão pro extrator de Colar/Extrair, dessa vez sem origem em PDF — um print
de tabela colado (11 colunas: `EMPREENDIMENTO,UNIDADE,TIPO DE IMOVEL,AREA,MES SINAL,VALOR SINAL,
FINANCIAMENTO,VALOR FINANCIAMENTO,VALOR TOTAL,COMPOSICAO,ENDERECO`). Confirmado com o usuário: mesmo
tendo campos de condição de pagamento (sinal/financiamento, mais típicos de tabela de lançamento),
fica dentro do extrator de Revendas-Construtoras mesmo — só os campos que o sistema já usa
(tipo/área/valor/composição) alimentam o motor de matching; sinal/financiamento ficam preservados
só no `textoOriginal`, sem virar campo novo.

**Bug novo encontrado: área com ponto decimal** ("81.78 m²", formato internacional/planilha) —
`parseAreaRC_` removia TODO ponto assumindo que era sempre separador de milhar (convenção BR),
transformando 81.78 m² em 8178 m² (100x maior). Nova função `parseNumeroFlexivelRC_()`: detecta
qual separador (`,` ou `.`) aparece mais à direita na string — esse é o decimal, o outro (se
aparecer antes) é milhar e é descartado. Funciona pros dois formatos (BR: "347,12" | internacional:
"81.78") sem precisar saber de antemão qual a fonte está usando — usada agora em toda a lógica de
área, incluindo o caso "387 T / 286 C" (CITY, parte 12) que também depende dela.

**Novos mapeamentos**: `"TIPO DE IMOVEL"` → tipo explícito (mesmo bucket de `"Tipo"`/`"Tipo_Imovel"`
já suportados); `"VALOR TOTAL"` (com espaço, diferente do `"valor_total"` com underscore da BRASAL
2º padrão) → valor; `"COMPOSICAO"` → reaproveita o mesmo parser de "Configuração" (CTTY) pra extrair
quartos/suítes de texto livre — a regex já entendia números com zero à esquerda ("03 quartos",
"01 suíte"), não precisou de ajuste.

Testado com os dados exatos do usuário: área 81.78 preservada certinha (não virou 8178), tipo
"Apartamento" direto da coluna, 3 quartos/1 suíte extraídos da composição em texto livre, valor
390000 (centavos descartados certo), mojibake corrigido em todos os campos (inclusive dentro do
texto livre de composição/endereço). Suíte de regressão completa (CTTY, BRASAL 1º/2º, CITY) rodada
de novo depois da mudança no parser de área — nenhuma quebra.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 13) — Coluna "Status" na tabela de Construtoras (breakdown por estágio)

Nova coluna "Status" na tabela de Construtoras (`revendas-construtoras.html`), mostrando — por
construtora — quantos imóveis tem em cada estágio de triagem (Importada/Válida/Potencial/
Oportunidade), como contadores clicáveis coloridos (mesma cor já usada em toda a página pra cada
status). Clicar em qualquer um abre a mesma página de imóveis (já com "← Voltar" desde a parte 9),
só que **filtrada** só pro estágio clicado — o título mostra o filtro aplicado (ex: "CITY · Válida").
Clicar no "Total de imóveis" continua abrindo sem filtro, como antes.

**Backend**: `listarConstrutorasParceiras_()` agora calcula `contagemStatus` (por construtora) e
`semConstrutoraStatus` (pra linha "Sem construtora") numa mesma passada que já existia pra contar o
total — sem leitura extra da planilha. Linha antiga sem status gravado conta como IMPORTADA, mesma
regra já usada em `listarRevendasConstrutoras_`.

**Frontend**: `abrirImoveisConstrutoraRC(nome, statusFiltro)` ganhou um 2º parâmetro opcional;
`carregarImoveisConstrutoraRC()` aplica o filtro de status além do filtro de construtora já
existente; "Voltar" limpa o filtro.

Testado em Node (backend: contagem por status batendo certo pra 2 construtoras com estágios
diferentes) e ao vivo no navegador (frontend: os 3 contadores aparecem com as cores certas, clicar
em "Válida: 1" filtra a lista pra só esse imóvel com o título certo, "Voltar" limpa o filtro e volta
pra aba Construtoras, "Total" continua mostrando todos sem filtro).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-14 (parte 12) — Padrão CITY: TAB como separador, "Casa condominio", área terreno/construção com rótulo

Usuário mandou um novo padrão de tabela, da construtora CITY (10 colunas: `Sessao,Unidade_Endereco,
Descricao,m2,Suites_Vagas,Valor,Valor_m2,Taxa_Cond,Vagas,Tipo_Imovel`), colado direto de uma planilha
— **separado por TAB, não vírgula**. O parser só entendia vírgula até agora; colar esse formato
faria a linha inteira virar um campo só, sem nenhuma coluna reconhecida.

**Fix 1 — delimitador automático**: `detectarDelimitadorRC_()` conta quantos TABs vs. vírgulas
aparecem na linha de cabeçalho e usa o que for mais frequente — não precisa perguntar ao usuário
qual é nem ele escolher manualmente. `parseCSVLinha_()` ganhou um parâmetro de delimitador.

**Fix 2 — "CASA DE CONDOMINIO" virava "Casa" genérico**: a coluna "Tipo_Imovel" desse formato traz
o tipo explícito, mas o reconhecedor de palavra-chave (`mapTipoExplicitoRC_`) testava `/^casa\b/`
antes de checar "condomínio" — qualquer coisa começando com "casa" virava só "Casa", nunca "Casa
condominio" (que é um dos tipos válidos do sistema). Checagem de "casa + condomínio" movida pra
antes da checagem genérica de "casa".

**Fix 3 — área terreno/construção com rótulo de letra** (`"387 T / 286 C"`, T=terreno/C=construção)
— formato diferente do "387/286 m²" (CTTY) já suportado. `parseAreaRC_` agora remove rótulos de
letra isolada antes de separar pelo "/", tratando os dois formatos com a mesma lógica.

**Fix 4 — conflito de rótulo ambíguo entre construtoras**: ao adicionar suporte à coluna
"Descrição" da CITY (que de fato é o nome do empreendimento, ex: "COBERTURA Mobiliada - TORRE DEL
PARC"), quebrei sem querer o 2º padrão BRASAL (parte 11, hoje) — lá "Descrição" é só uma observação
solta ("murado do lado esquerdo"), sem relação com o empreendimento. Corrigido tratando "descricao"
como um bucket próprio (`descricaoLivre`), usado como **último recurso** pro nome do empreendimento
— só entra em ação quando nenhuma fonte melhor (`empreendimento`/`imovelComTipo`) já preencheu isso,
então nunca sobrepõe o BRASAL. Suíte de regressão com os 4 padrões (CTTY, BRASAL 1º e 2º, CITY)
criada e passando, exatamente pra pegar esse tipo de conflito antes de virar bug em produção de novo.

**Confirmado com o usuário**: sem coluna "Código" na tabela de origem (caso da CITY), `codigoFonte`
fica em branco — comportamento esperado, não é erro.

Testado com os dados reais enviados: TAB detectado corretamente, tipo "Apartamento"/"Casa
condominio" certo pelas 3 linhas, área terreno/construção separada (387/286), quartos/suítes/vagas
extraídos do texto livre "Suites_Vagas" (reaproveitando `parseConfigRC_`, sem mudança), valor sem
bug de centavos (formato CITY não usa centavos, então já funcionava, só confirmado).

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 11) — 2º padrão BRASAL: código fonte, mojibake e bug de centavos no valor

Usuário mandou um novo padrão de tabela da BRASAL (10 colunas: `CODIGO,IMOVEL,UNIDADE,ENDERECO,
VAGAS,AREA_PRIVATIVA,VALOR_TOTAL,SITUACAO,VALOR_CONDOMINIO,DESCRICAO`) pra testar. Três problemas
reais apareceram nesse teste, além de um pedido explícito:

**1. Mojibake (texto colado com acentuação corrompida)** — "IpÃª" devia ser "Ipê", "GoiÃ¢nia" devia
ser "Goiânia", "mÂ²" devia ser "m²" — clássico UTF-8 lido como Latin-1/CP1252 (comum quando o texto
vem de extração de PDF colada no navegador). Nova função `corrigirMojibakeRC_()`: detecta o padrão
característico ("Ã"/"Â" seguido de outro caractere alto) e, só quando encontra, reconstrói o texto
correto (reinterpreta os caracteres como bytes e decodifica como UTF-8) — texto já correto passa
direto, sem risco de estragar acentos que já estavam certos. Aplicado no início da extração, cobre
cabeçalho e todas as linhas de uma vez.

**2. BUG real e grave: `parseValorRC_` multiplicava o valor por ~100 quando tinha centavos.**
"R$ 80.000,00" virava 8.000.000 em vez de 80.000 — o parser antigo removia TODO caractere não-dígito
(incluindo a vírgula) e concatenava os "00" de centavos como se fossem parte do valor. Corrigido:
mantém a vírgula na limpeza e corta nela antes de converter — "R$ 3.900.000" (formato antigo, sem
centavos) continua funcionando igual. Esse bug já existia desde os primeiros padrões suportados,
só não tinha aparecido porque nenhum exemplo anterior tinha centavos.

**3. Coluna "IMOVEL" combinada (tipo + nome grudados, ex: "Lote Residencial Flor do Ipê II")** — novo
padrão não separa Tipo do nome do empreendimento como o 1º padrão BRASAL fazia. Nova função
`separarTipoNomeRC_()`: reconhece um prefixo de tipo (mesmas palavras de `mapTipoExplicitoRC_`) e
separa do resto do nome — resultado: tipo "Lote em cond." detectado corretamente, e o nome do
empreendimento mostrado limpo ("Residencial Flor do Ipê II", sem o "Lote" grudado).

**4. Pedido explícito do usuário: não perder o código do imóvel na tabela de origem** ("CODIGO" —
DF1020, BR2020 — diferente do código interno RC-NNNNN que o sistema gera). Novo campo
`codigoFonte` em `CABECALHO_REVENDAS_CONSTRUTORAS` (aba se autocorrige sozinha, mesmo mecanismo já
existente), capturado pelo extrator e **exibido**, não só guardado: nova coluna "Cód. construtora"
na prévia de extração, e como linha secundária abaixo do código interno na lista de imóveis
importados de cada construtora.

Testado com os dados exatos enviados pelo usuário: mojibake corrigido em todos os campos, tipo
"Lote em cond." detectado e nome limpo, área com vírgula decimal correta (250 / 347,12 / 373,3),
valor correto (80000 / 165000 / 195000 — não mais ×100), código fonte capturado (DF1020/BR2020).
Reconfirmado sem regressão nos dois padrões anteriores (BRASAL 1º padrão e CTTY) — como bônus, o 1º
padrão BRASAL (que também tinha coluna "Código") passa a capturar `codigoFonte` também, que antes
só ficava em `textoOriginal`.

Mojibake, bug de centavos e separação de tipo são 100% frontend, funcionam sem reimplantar nada.
⚠️ Mas o campo `codigoFonte` só é GRAVADO na planilha depois de reimplantar o Apps Script (o backend
antigo não conhece essa coluna nova e descarta o valor silenciosamente ao importar) — a prévia
mostra o código certo de qualquer forma, mas ele só sobrevive ao "Importar" com o backend
atualizado. Mesma auto-correção de cabeçalho já existente cobre a coluna nova, sem migração manual.

## 2026-07-14 (parte 10) — Badge Potencial/Oportunidade faltando na tabela compacta de "Matches do momento"

A parte 9 cobriu 4 pontos de renderização de card nos 3 arquivos (contatos/dashboard×2/favoritos),
mas ficou de fora um 5º ponto: a coluna 2 de "Matches do momento" no dashboard (`#matchTableBody`)
usa um template de **linha de tabela** próprio e diferente (foto pequena + nome + badges + score +
valor + estrela), não o `imovel-card` grande — por isso o imóvel RC-00011 (Village do Bosque,
marcado como Potencial) não mostrava nenhum destaque ali, mesmo já aparecendo corretamente na janela
de detalhes em Revendas-Construtoras.

**Fix**: mesmo badge colorido/clicável (`⭐ Potencial` / `🔥 Oportunidade`) adicionado nessa linha,
ao lado do badge de origem. Como a linha inteira já tem `onclick` pra abrir o drawer de detalhes do
match, o clique no badge usa `event.stopPropagation()` pra não disparar os dois drawers ao mesmo
tempo.

Testado no navegador: mockei `matches_cliente` retornando o mesmo imóvel do relato do usuário
(RC-00011, CITY, status Potencial) e chamei `selecionarCliente()` direto — o HTML da linha renderiza
com a classe `status-rc-badge-potencial` e o texto certo.

100% frontend, sem mudança no backend.

## 2026-07-14 (parte 9) — Badge de destaque Potencial/Oportunidade nos cards + imóveis vira página inteira

Dois ajustes pedidos pelo usuário depois de testar a parte 8 ao vivo:

**1. Badge de destaque nos cards de match** — o botão "🔍" que indicava Potencial/Oportunidade nos
cards de match (Contatos, Dashboard, Favoritos) era pequeno demais e passava despercebido; o usuário
marcou um imóvel como "Potencial" e não viu nenhuma mudança visível no card. Substituído por um badge
colorido e clicável, ao lado do badge de origem ("🏢 revenda-CITY"): `⭐ Potencial` (âmbar) ou
`🔥 Oportunidade` (vermelho) — mesmo esquema de cor da tabela de imóveis em Revendas-Construtoras.
Clicar no badge abre o mesmo drawer de detalhes da visita de antes. Aplicado nos 4 pontos de
renderização de card (contatos.html, dashboard.html × 2, favoritos.html).

**2. "Total" de imóveis da construtora abre página inteira, não mais drawer lateral** — o drawer
lateral escondia a tabela de Construtoras atrás de uma sobreposição estreita; trocado por uma
"página" própria dentro da mesma tela (esconde as abas Construtoras/Colar-Extrair/Cadastrar, mostra
a lista de imóveis em largura total, com um botão "← Voltar" no topo que retorna pra aba
Construtoras). O drawer de "Detalhes da visita" (Potencial/Oportunidade) continua sendo um drawer de
verdade — agora abre por cima dessa página em vez de por cima do drawer antigo.

100% frontend, sem mudança no backend. Sintaxe validada nos 4 arquivos; a conversão pra página
inteira em revendas-construtoras.html não pôde ser testada ao vivo no navegador desta vez (o
classificador de segurança da ferramenta de preview ficou indisponível durante a sessão) — revisão
estática completa foi feita (sem IDs duplicados, rastreamento de toda a lógica de mostrar/esconder
seções), mas vale conferir na tela real depois do deploy.

## 2026-07-14 (parte 8) — Drawer "Detalhes da visita" pra imóveis Potencial/Oportunidade

Imóveis de revenda-construtora marcados como **Potencial** ou **Oportunidade** (pós-visita) ganham
um botão "🔍 Detalhes" — tanto na linha da tabela de imóveis dentro de Revendas-Construtoras quanto
nos cards de match em Contatos, Dashboard (2 pontos: "Matches do Momento" e drawer de imóvel) e
Favoritos. O botão abre uma janela lateral com:

- **Link de fotos/vídeo**
- **Data da visita**
- **Observações**

**Sugestão aceita pelo usuário**: "Data da visita" — além dos dois campos pedidos (link + obs),
ajuda a saber se um Potencial/Oportunidade está ficando desatualizado sem revisita.

**Backend**: `CABECALHO_REVENDAS_CONSTRUTORAS` ganha `linkFotos`, `obsVisita`, `dataVisita`
(autoheal do cabeçalho, parte 4, cobre a coluna nova sem precisar de nada manual). Duas funções
novas: `buscarRevendaConstrutoraPorCodigo_()` (leitura ao vivo por `idImovel` — nunca confia em
dado congelado de MATCHES/FAVORITOS pra esses campos, que mudam com frequência) e
`atualizarDetalhesVisitaRevendaConstrutora_()` (grava os 3 campos, também por `idImovel`, mais
robusto que `_linha` porque sobrevive a exclusões de outras linhas). `revendaConstrutoraParaImovel_`
passa a preencher `foto: row.linkFotos` — reaproveita o slot `imoFoto`/`imoUrl` que MATCHES/FAVORITOS
já tinham, sem precisar de coluna nova ali.

Pra o botão saber quando aparecer nos cards de match, `CABECALHO_MATCHES` e `CABECALHO_FAVORITOS`
ganham `imoStatusRC` (sempre no fim do array, nunca inserido no meio). MATCHES é reescrita inteira a
cada `rodarMatching()`, então pega o campo novo automaticamente; `obterAbaFavoritos_()` ganhou o
mesmo autoheal de cabeçalho de `obterAbaRevendasConstrutoras_()` (parte 4) — só cosmético (as
leituras/escritas de FAVORITOS já são por posição, não por nome de cabeçalho), mas mantém a
planilha legível.

Testado via smoke test em Node (busca por código, atualização de detalhes, mapeamento linkFotos→foto,
autoheal do cabeçalho de FAVORITOS com dado pré-existente) e ao vivo no navegador em
revendas-construtoras.html e contatos.html (mock de fetch): botão só aparece pros status certos,
drawer abre, busca o imóvel certo por código, formulário preenche, salvar manda o payload correto
com data já convertida BR↔ISO.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-14 (parte 7) — Status de revenda-construtora agora pesa no score de matches

O status de triagem (parte 6 de hoje) passa a influenciar diretamente a pontuação de match, como
pedido: quanto mais avançado o estágio, maior o bônus, `IMPORTADA` sem bônus nenhum (nível mais
baixo) até `OPORTUNIDADE` com o bônus máximo (nível mais alto).

**Fix/feature**: nova função `scoreStatusRC_(statusRC)`, com tabela de pontos
`PONTOS_STATUS_REVENDA_CONSTRUTORA = { IMPORTADA:0, VALIDA:3, POTENCIAL:6, OPORTUNIDADE:10 }` —
escala parecida com os outros sub-scores existentes (bairro chega a 15, padrão a 10), pra ser um
empurrão real sem dominar tipo/preço, que continuam os fatores principais. `calcularMatch_()` soma
esse bônus ao total (antes do cap em 100) e expõe no `detalheMatch` (ex: `statusRC:6`), mesmo padrão
de tipo/preco/quartos/bairro/padrao já expostos ali. `revendaConstrutoraParaImovel_()` agora repassa
`statusRC: row.status || ''` no objeto de produto usado pelo motor de matching.

Produtos de outras origens (REVENDA normal, CONSTRUTORA-APARTAMENTOS, LANCAMENTOS) não têm esse
campo — `imovel.statusRC` vem `undefined`, `scoreStatusRC_` retorna 0, zero efeito nesses matches.
Imóvel de revenda-construtora com status vazio (legado, antes do campo existir) também pontua 0 —
mesmo efeito de estar em `IMPORTADA`, sem precisar de nenhum tratamento especial extra.

Testado via smoke test em Node: mesmo imóvel/cliente, variando só o status — score sobe
75→78→81→85 conforme Importada→Válida→Potencial→Oportunidade; imóvel sem `statusRC` (outra origem)
mantém score idêntico ao caso Importada/vazio, confirmando que não há efeito colateral.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`). Depois de reimplantado, rodar
"↻ Atualizar" pra recalcular o `MATCHES` com a pontuação nova.

## 2026-07-14 (parte 6) — Status de triagem pra imóveis de revenda de construtoras

Novo campo `status` em `REVENDAS_CONSTRUTORAS` (14ª→15ª coluna, apêndice no
`CABECALHO_REVENDAS_CONSTRUTORAS` — a aba se autocorrige sozinha, ver parte 4 de hoje), com 4
estágios de triagem: `IMPORTADA` (padrão, entrada de toda importação nova), `VALIDA` (confirmada e
disponível), `POTENCIAL` (pós-visita, pode ter fotos vinculadas) e `OPORTUNIDADE` (pós-visita,
excelente negócio). Linha antiga sem valor gravado nessa coluna conta como `IMPORTADA` por padrão
(`listarRevendasConstrutoras_`), sem precisar de backfill.

**Interface**: nova coluna "Status" na tabela de imóveis do drawer (por construtora), com uma caixa
de listagem (`<select>`) por linha pra trocar o status na hora (`mudarStatusRC` → nova rota
`atualizar_status_revenda_construtora` → `atualizarStatusRevendaConstrutora_`), cor por estágio
(neutro/verde-água/âmbar/vermelho, do menos pro mais "quente").

**Regra de exclusão em lote**: "Excluir todos" (por construtora ou da linha "Sem construtora") agora
só apaga imóveis com status `IMPORTADA` — uma vez que o usuário mudou manualmente pra Válida/
Potencial/Oportunidade, esse imóvel só sai individualmente, pelo botão 🗑️ na lista (mesma trava já
existia pra "sem construtora" vazia, agora combinada com a checagem de status). Efeito colateral
esperado e correto: um imóvel marcado como "Válida" nunca é apagado por uma reimportação/limpeza em
lote, então pode aparecer de novo como um registro `IMPORTADA` separado numa reextração futura do
mesmo lote — não é duplicata a fundir, é o comportamento pretendido (a linha antiga "Válida"
continua existindo, intacta).

Testado via smoke test em Node: import → status inicial IMPORTADA em todas as linhas; mudança de
status individual persiste e é lida de volta corretamente; status inválido é rejeitado;
"excluir todos" preserva a linha marcada como Válida e remove só as duas ainda em Importada.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`). Não precisa rodar nenhuma
migração manual — o autoheal do cabeçalho (parte 4) cobre a coluna nova também.

## 2026-07-14 (parte 5) — Extrator de Colar/Extrair vira genérico por cabeçalho (multi-construtora)

O parser de `extrairRevendasConstrutoras()` só reconhecia UM formato de CSV, fixo por posição
(`[unidade, empreendimento, areaRaw, configRaw, valorRaw]`) — exatamente o padrão da CTTY. Colar o
CSV de outra construtora com colunas diferentes (ex: BRASAL, que manda `Código, Tipo, Empreendimento
/ Imóvel, Unidade, Área, Vagas, Valor, Situação`) produzia dados todos errados, e nem a linha de
cabeçalho era reconhecida (a checagem de header só testava `/^unidade\s*,/i`).

**Fix**: extrator reescrito pra ler a 1ª linha como cabeçalho e mapear cada coluna reconhecida (via
novo dicionário `SINONIMOS_COLUNA_RC`) pro campo interno certo, em vez de depender da posição/ordem
fixa. Suporta tanto uma coluna "Configuração" com quartos/suítes/vagas embutidos em texto livre
(CTTY) quanto colunas "Tipo" e "Vagas" separadas, sem quartos/suítes (BRASAL — só lotes). Tipo agora
usa a coluna "Tipo" explícita quando existe (`mapTipoExplicitoRC_`), caindo pra detecção por
palavra-chave (`detectarTipoRC_`) só quando não há essa coluna.

Combinar formatos de construtoras novas no futuro deve normalmente exigir só adicionar o(s) rótulo(s)
de coluna novo(s) em `SINONIMOS_COLUNA_RC`, não reescrever o parser inteiro — desde que o CSV sempre
venha com uma linha de cabeçalho na primeira linha.

Testado via smoke test em Node com os dois formatos reais colados pelo usuário (BRASAL e CTTY):
ambos extraem corretamente tipo, área (incluindo área com vírgula decimal entre aspas e área
terreno/construção separada por "/"), configuração/vagas e valor.

Mudança 100% front-end (`revendas-construtoras.html`) — não precisa reimplantar o Apps Script.

## 2026-07-14 (parte 4) — Cabeçalho da REVENDAS_CONSTRUTORAS se autocorrige sozinho (sem função manual)

A função de migração manual `migrarCabecalhoRevendasConstrutoras_()` (parte 2, hoje) não estava
aparecendo no dropdown "Executar" do editor do Apps Script pro usuário, mesmo com o código já colado
— provável staleness do próprio editor do Google, que não é confiável de pedir pra recarregar toda
vez. Substituída por uma correção que roda sozinha, sem depender do editor.

**Fix**: `obterAbaRevendasConstrutoras_()` — chamada em toda ação que toca essa aba (listar,
importar, excluir, matching) — agora compara o conteúdo real da linha 1 da planilha com o array
`CABECALHO_REVENDAS_CONSTRUTORAS` esperado. Se divergir (cabeçalho desatualizado), reescreve a
linha 1 automaticamente, sem tocar nas linhas de dados. Roda de forma idempotente — só reescreve
quando realmente diverge, senão é só uma leitura extra e barata.

Detalhe da primeira tentativa (corrigido antes de commitar): comparar `aba.getLastColumn()` não
funciona pra esse caso, porque linhas de dados já gravadas por posição (a importação escreve por
índice do array, não pelo nome do cabeçalho) já tinham mais colunas do que a linha 1 rotulada —
`getLastColumn()` olha a planilha inteira, não só o cabeçalho. Trocado por comparação direta do
conteúdo da linha 1 contra o array esperado.

Testado via smoke test em Node simulando exatamente o cenário real (cabeçalho de 13 colunas, dado
real já gravado na 14ª coluna por uma importação anterior): uma única chamada normal (ex: listar)
já corrige a linha 1 sozinha, `lerAba_()` passa a enxergar `construtora` corretamente, e uma segunda
chamada não reescreve de novo (idempotente).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`). Depois disso, **nenhuma ação
manual extra é necessária** — a correção acontece sozinha na primeira vez que a página de
Revendas-Construtoras for aberta.

## 2026-07-14 (parte 3) — "Excluir todos" também pra linha "(Sem construtora)"

A coluna "Excluir todos" na tabela de Construtoras mostrava "—" (sem botão) pra linha especial
"⚠️ (Sem construtora)" — proteção proposital, já que o backend recusava `construtora` vazia como
guarda contra apagar tudo por engano. Só que com dezenas de imóveis órfãos acumulados (importados
antes do campo existir), excluir um por um pelo drawer é inviável.

**Fix**: `excluirTodosRevendasConstrutora_()` aceita agora um flag explícito `semConstrutora: true`
que autoriza o alvo vazio (bypassa só a checagem "obrigatória", o filtro continua batendo
exatamente com `construtora === ''`, não afeta nenhuma construtora nomeada). A linha "(Sem
construtora)" na interface ganhou um botão real de "Excluir todos" que manda esse flag.

Testado via smoke test em Node: exclusão em lote dos órfãos remove só as linhas com `construtora`
vazia, preserva as demais; chamada sem o flag (acidental) continua sendo recusada.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-14 (parte 2) — Fix: coluna "construtora" invisível na aba REVENDAS_CONSTRUTORAS (cabeçalho desatualizado)

Usuário identificou a causa raiz de tabela de Construtoras aparecer sempre com total zerado e sem
data de última atualização, mesmo com dados corretos na planilha: colou o cabeçalho real da aba
`REVENDAS_CONSTRUTORAS` no Google Sheets e ele tinha só 13 colunas (`dataCadastro` até
`textoOriginal`) — sem "construtora" como 14ª coluna.

**Causa raiz confirmada**: `obterAbaRevendasConstrutoras_()` só escreve a linha de cabeçalho quando
a aba é **criada pela primeira vez** (`if (!aba) { aba.appendRow(CABECALHO_REVENDAS_CONSTRUTORAS); ... }`).
A aba já existia antes de "construtora" ser adicionada ao array `CABECALHO_REVENDAS_CONSTRUTORAS`
(commit `507efdb`), então a linha 1 da planilha ficou congelada em 13 colunas — mesmo o array no
código já tendo 14. A importação (`importarRevendasConstrutoras_`) grava os dados corretamente na
14ª coluna (escreve por posição, usando o tamanho atual do array), mas `listarConstrutorasParceiras_()`
lê via `lerAba_()`, que mapeia os campos usando os **nomes da linha 1 da planilha** (não o array do
código) — então `r.construtora` sempre voltava `undefined`, e todo imóvel contava como "sem
construtora" (`semConstrutora++` disparava pra 100% das linhas).

**Fix**: nova função `migrarCabecalhoRevendasConstrutoras_()`, mesmo padrão já usado pra
`LANCAMENTOS` (`migrarCabecalhoLancamentos()`) — insere colunas faltantes se necessário e reescreve
a linha 1 com o array `CABECALHO_REVENDAS_CONSTRUTORAS` atual, sem tocar nas linhas de dados.
Função de execução manual, única vez, via editor do Apps Script.

Testado com smoke test em Node simulando planilha com cabeçalho de 13 colunas + dados já presentes
na 14ª coluna: após rodar a migração, `lerAba_()` passa a enxergar `construtora` corretamente em
todas as linhas, e os dados das outras colunas (idImovel, valorVenda etc.) permanecem intactos.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`) **e depois** rodar
`migrarCabecalhoRevendasConstrutoras_()` uma única vez pelo editor do Apps Script (selecionar a
função no dropdown → Executar). Só depois disso a tabela de Construtoras deve mostrar total e
última atualização corretos.

## 2026-07-14 — Fix: imóveis importados antes do campo "Construtora" ficavam invisíveis

Bug relatado pelo usuário: um imóvel específico ("Village do Bosque", `RC-00011`) continuava
mostrando o badge "🏢 REVENDA-CONSTRUTORA" (fallback genérico) em vez do nome real da construtora,
mesmo depois de reimplantar o Apps Script e rodar o matching de novo. Investigação (com smoke test
em Node cobrindo `revendaConstrutoraParaImovel_` → `empurrarMatch_` → `MATCHES`) confirmou que o
código está correto ponta a ponta — o problema era um dado real: esse imóvel foi importado **antes**
do campo "Construtora" existir na aba Colar/Extrair, então a coluna `construtora` dele na planilha
REVENDAS_CONSTRUTORAS está genuinamente vazia (não é cache nem falta de deploy).

**Problema maior descoberto**: não havia NENHUMA forma de ver esses imóveis pela interface — a aba
"Lista de Imóveis" foi removida numa mudança anterior (substituída pelo drawer por construtora), e
um imóvel com `construtora` vazia não bate com o filtro de nenhuma construtora cadastrada. Ficava
invisível — sem forma de identificar ou excluir pra reimportar corretamente.

**Fix**: `listarConstrutorasParceiras_()` agora também conta quantos imóveis têm a coluna
`construtora` vazia (`semConstrutora`) — cálculo movido pra ANTES do early-return de "nenhuma
construtora cadastrada ainda", porque esses imóveis órfãos podem existir mesmo sem nenhuma
construtora registrada. Na aba "Construtoras", uma linha extra em destaque (âmbar) **"⚠️ (Sem
construtora)"** aparece no topo da tabela quando há algum, com o total clicável abrindo o mesmo
drawer já usado pras outras construtoras (o filtro por string vazia já funcionava sem mudança —
`String(imo.construtora||'') === ''` bate certinho). De lá, cada imóvel pode ser excluído
individualmente pelo botão 🗑️ já existente — "Excluir todos" fica desabilitado nessa linha de
propósito, pois o backend recusa apagar em lote sem uma construtora definida (proteção contra
apagar tudo por engano).

Testado via smoke test em Node: `semConstrutora: 1` contado corretamente com 1 imóvel órfão + 2 da
CITY; e no preview: linha "(Sem construtora)" renderiza com o total certo, abre o drawer filtrado
mostrando só o imóvel órfão (excluindo os de construtora definida).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 12) — Aba "Cadastrar" separada de "Construtoras"

Em `revendas-construtoras.html`, o formulário de cadastro de construtora (Nome/Gerente
Comercial/Fone/URL/Obs) — que até agora vivia junto com a tabela na aba "Construtoras" — virou uma
aba própria, "Cadastrar", terceira na ordem pedida pelo usuário:

**Construtoras → Colar/Extrair → Cadastrar**

- Aba **"Construtoras"**: só a tabela agora (nome, gerente, fone, total de imóveis, última
  atualização, ações) — sem o formulário misturado.
- Aba **"Cadastrar"** (nova, 3ª): só o formulário de cadastro/edição de construtora.
- Botão "✏️ Editar" de uma linha da tabela agora troca pra aba "Cadastrar" automaticamente antes de
  carregar os dados no formulário (antes ficava tudo na mesma aba, só dava scroll pro topo).
- Depois de salvar uma construtora (nova ou editada), a página volta sozinha pra aba
  "Construtoras" já atualizada, em vez de ficar na aba "Cadastrar".

Nenhuma mudança de lógica de backend ou nos parsers — só reorganização de onde cada peça de UI
mora. Verificado por checagem de sintaxe e auditoria de todas as referências de ID (`subtabX`/
`secaoXRC`) pra garantir que nada ficou órfão após mover o formulário de seção.

## 2026-07-13 (parte 11) — Campo "Construtora" em Colar/Extrair vira lista de seleção

Na aba "Colar / Extrair" de `revendas-construtoras.html`, o campo "Construtora" era um texto livre
— trocado por um `<select>` ("caixa de lista"), populado com as construtoras já cadastradas na aba
"Construtoras". Evita nomes divergentes ("CITY" x "City" x "city ltda") que fariam a contagem de
imóveis por construtora (feita no backend por comparação normalizada) não bater direito, e elimina
o risco de digitar errado o nome de uma construtora que já existe.

Se a construtora ainda não estiver cadastrada, um aviso abaixo do campo linka direto pra aba
"Construtoras" pra cadastrá-la primeiro — não dá mais pra digitar um nome novo direto na hora da
importação.

A lista do select é populada reaproveitando a mesma chamada que já carrega a aba "Construtoras"
(`listar_construtoras_parceiras`), sem fetch duplicado — atualizada automaticamente sempre que uma
construtora é cadastrada/editada, preservando a seleção atual se ela continuar na lista.

Testado no preview: select populado corretamente e ordenado por nome; seleção preservada depois de
recarregar a lista (mesmo com uma construtora nova adicionada); link "Cadastre primeiro" troca pra
aba Construtoras corretamente.

## 2026-07-13 (parte 10) — Fix: 2º pedido de interesse do mesmo cliente Imobzi era descartado

Bug relatado pelo usuário: quando o mesmo cliente manifestava interesse em um imóvel e, depois, em
OUTRO imóvel diferente, o segundo pedido desaparecia — o sistema reconhecia "mesmo telefone/email"
e descartava como duplicado, mesmo sendo um imóvel completamente diferente.

**Causa** (`salvarLeadImobzi_` em `code.txt`, chamada tanto pelo fluxo de "Deal" quanto pelo
legado "contact_type=lead"): a checagem de duplicidade em LEADS_IMOBZI comparava só telefone/email
— achar QUALQUER lead anterior do mesmo cliente (por tel/email) já retornava `duplicado: true` e
descartava o novo lead inteiro, independente de qual imóvel fosse.

**Fix**: duplicado de verdade agora é só:
1. **Mesmo negócio** (`idLeadImobzi` igual — a Imobzi reenviando o webhook do mesmo deal), OU
2. **Mesmo cliente + mesmo imóvel** (telefone/email batem E `codigoImovel` bate, com fallback pra
   `nomeImovel` quando nenhum dos dois lados tem código).

Mesmo cliente + imóvel DIFERENTE deixa de ser descartado — vira uma nova linha em LEADS_IMOBZI, e
os dois (ou mais) imóveis de interesse desse cliente passam a aparecer como leads separados nas
telas de Leads Imobzi (cada linha já é renderizada como um card próprio — não precisou de UI nova).

Testado via smoke test em Node com 3 cenários:
- Cliente novo, interesse no imóvel A → grava normalmente.
- Mesmo deal reenviado (mesmo `idLeadImobzi`) → duplicado, não duplica a linha.
- Mesmo cliente, imóvel B diferente (deal novo) → grava como lead novo (não descarta). Resultado:
  2 leads gravados, um pra cada imóvel.
- Cenário extra: mesmo cliente, MESMO imóvel mas com `idLeadImobzi` diferente (Imobzi recriando o
  deal pro mesmo interesse) → ainda reconhecido como duplicado corretamente (evita lead repetido
  só porque o deal mudou de ID).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 9) — Coluna "Última Atualização" + destaque de cadastro desatualizado (>45 dias)

**Item 1**: nova coluna **"Última Atualização"** na tabela da aba "Construtoras" — data da importação
mais recente daquela construtora (a mais nova entre os imóveis dela em REVENDAS_CONSTRUTORAS).
Calculada no backend (`listarConstrutorasParceiras_`, junto com a contagem de `totalImoveis` que já
existia), reaproveitando `diasDesdeData_` (helper já existente, usado em outros lugares do projeto
pra "dias desde uma data BR"). A mesma data de atualização/importação também aparece por imóvel no
drawer (coluna "Importado em", que já existia) — em ambos os lugares, **destaque em vermelho** quando
passar de **45 dias** sem reextração (`.data-antiga-rc`).

**Item 2**: o card "Revendas-Construtoras" na Visão Geral do Dashboard, que mostrava "novas" como
"importados nas últimas 12h", mudou pra **"importados nos últimos 45 dias"** — mesmo limiar usado
no destaque de desatualização do item 1, pra manter os dois conceitos consistentes (um imóvel que
já passou da janela de "novo" também é candidato a aparecer como "desatualizado" se ninguém
reextraiu a construtora dele). Legenda do card atualizada de "(12h)" pra "(45 dias)".

Testado: smoke test em Node confirma `diasDesdeUltimaAtualizacao`/`diasDesdeCadastro` corretos
(construtora com importação há 50 dias → 50; há 5 dias → 5). No preview: tabela de Construtoras
mostra a data certa com vermelho só na desatualizada; drawer de imóveis também destaca em vermelho
o imóvel de 50 dias; card do Dashboard testado com o mesmo exemplo do usuário (120 total, 5 dentro
da janela de 45 dias, 115 fora) → "120 | 5" com legenda "(45 dias)".

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 8) — Card no Dashboard + reestruturação das abas de Revendas-Construtoras

**Card "🏢 Revendas-Construtoras" na Visão Geral do Dashboard** ("item 2" do pedido): mostra
"atuais | novas" (ex: `120 | 5`) — atuais é o total de imóveis cadastrados na aba
REVENDAS_CONSTRUTORAS, novas é quantos desses têm `dataCadastro` dentro das últimas 12 horas.
Botão "Ver →" leva pra `revendas-construtoras.html`. Cálculo 100% no front-end
(`carregarRevendasConstrutorasDash()`), reaproveitando `parseDataCadastroBR_` (já existente, trata
o formato BR e o fallback ISO que o Sheets pode gerar sozinho) — sem rota nova no backend.

**Reestruturação de `revendas-construtoras.html`** — só 2 abas agora, nessa ordem:
1. **"Construtoras"** (1ª aba, antes "Cadastrar", movida pra frente): mesmo formulário de cadastro
   (Nome/Gerente Comercial/Fone/URL/Obs), mas a listagem virou **tabela** (Nome, Gerente Comercial,
   Fone, Total de imóveis, Ações) em vez dos cards anteriores. O número na coluna "Total de
   imóveis" agora é **clicável** — abre um drawer lateral (deslizando da direita, mesmo padrão
   visual já usado em `contatos.html`/`leads-imobzi.html`) com a lista de imóveis só daquela
   construtora, cada um com botão de excluir.
2. **"Colar / Extrair"** (2ª aba, sem mudanças na lógica de extração/importação).

**Removida**: a aba "Lista de Imóveis" (que mostrava todos os imóveis de todas as construtoras
juntos) deixou de existir como aba separada — sua função foi absorvida pelo drawer acima, que já
nasce filtrado por construtora (não existe mais visão "todos os imóveis sem filtro").

Achado durante o teste no preview: a aba "Construtoras" virou a primeira/padrão da página, mas
nada chamava `carregarConstrutorasRC()` no carregamento inicial (antes, cada aba só carregava
dados quando clicada) — sem isso a tabela ficava travada em "Carregando construtoras..." pra
sempre no primeiro acesso. Corrigido com uma chamada de bootstrap no fim do script.

Testado no preview: card do Dashboard confirmado com o exemplo exato do usuário (120 total, 5
novas nas últimas 12h → "120 | 5"); tabela de Construtoras renderiza ordenada por nome com botões
corretos; clicar no Total abre o drawer já filtrado (testado com imóveis de 2 construtoras
diferentes — só os da construtora clicada aparecem); fechar o drawer funciona; troca entre as 2
abas funciona. Nenhum erro de console.

## 2026-07-13 (parte 7) — Nova aba "Cadastrar" em Revendas-Construtoras

Terceira aba em `revendas-construtoras.html`, ao lado de "Colar / Extrair" e "Lista de Imóveis" —
cadastro das construtoras parceiras propriamente ditas (dados gerais + contato), separado do
cadastro em lote dos imóveis.

**Formulário** ("item 13" do pedido): Nome*, Gerente Comercial, Fone, URL (pra acessar o PDF
online) e Obs — mesmo padrão visual dos outros formulários do projeto. Nome é a chave de dedup: se
já existe uma construtora com esse nome (comparação normalizada — minúsculo, sem espaço nas
pontas), salvar de novo **atualiza** o cadastro em vez de duplicar (mesmo padrão de
`salvarLancamento_`), preservando `idConstrutora` e a data de cadastro original.

**Cards abaixo do formulário** (um por construtora, grid responsivo — "semelhante ao cadastro de
empreendimentos" pedido pelo usuário): nome, gerente comercial, fone, observações, **total de
imóveis cadastrados** (contado cruzando com a aba REVENDAS_CONSTRUTORAS pelo campo `construtora`,
calculado no backend), botão **"📋 Ver todos"** (muda pra aba "Lista de Imóveis" já filtrada só com
os imóveis dessa construtora — filtro em memória, sem nova chamada ao servidor), botão **"✏️
Editar"** (carrega os dados no formulário pra atualizar) e link **"🔗 Ver PDF"** quando a URL foi
informada.

**Backend (`code.txt`)**: nova aba `CONSTRUTORAS_PARCEIRAS` (`dataCadastro`, `idConstrutora` —
`CP-NNNNN` —, `nome`, `gerenteComercial`, `fone`, `url`, `obs`). Rotas
`cadastrar_construtora_parceira` (POST, com dedup por nome), `listar_construtoras_parceiras` (GET,
já retorna `totalImoveis` calculado), `excluir_construtora_parceira` (POST).

Testado via smoke test em Node: cadastro novo (`CP-00001`), contagem de imóveis correta (3),
re-cadastro com nome em case/espaçamento diferente (`"  city  "`) atualiza em vez de duplicar
(preserva `idConstrutora`), exclusão funciona. No navegador: card renderiza com todos os campos e
botões corretos, "Editar" recarrega o formulário certo, e "Ver todos" troca de aba e filtra
corretamente (testado com 2 imóveis de construtoras diferentes — só o da construtora certa aparece
depois do filtro, e "✕" no filtro volta a mostrar todos).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 6) — Campo "Construtora" + badge "REV-CONSTRUTORA" + coluna "Importado em"

Complemento da área Revendas-Construtoras (parte 5): agora cada lote importado registra de qual
construtora parceira ele veio (ex: "CITY"), e isso aparece tanto na listagem quanto nos cards de
match do cliente — igual já acontecia com os badges "Revenda"/"Construtora"/"Lançamento".

**`revendas-construtoras.html`**:
- Novo campo "Construtora" na aba "Colar / Extrair" — preenchido uma vez por importação (o lote
  colado costuma ser inteiro da mesma construtora), obrigatório antes de importar.
- Aba "Lista de Imóveis": novas colunas "Construtora" e "**Importado em**" (data do dia da
  importação, extraída de `dataCadastro` — só a data, sem hora, conforme pedido).

**Backend (`code.txt`)**: coluna `construtora` adicionada ao final de
`CABECALHO_REVENDAS_CONSTRUTORAS` (convenção do projeto — nunca inserir no meio). O valor do campo
é aplicado a todas as linhas do lote em `importarRevendasConstrutoras_()`, e `revendaConstrutoraParaImovel_()`
agora propaga `row.construtora` pro motor de matching (antes ficava sempre vazio).

**Cards de match** (`contatos.html`, `dashboard.html` — 3 pontos de renderização —, `favoritos.html`
— 2 pontos, incluindo a tabela do PDF exportado): novo caso `isRevConst` ao lado de
`isConst`/`isLanc` já existentes, com:
- Badge de fonte **"🏢 REV-CONSTRUTORA"** (cor lilás, nova classe `.fonte-revconst`), no lugar de
  "🔑 Revenda"/"🏗️ Construtora"/"🚀 Lançamento".
- Badge separado com o nome da construtora (`.imovel-construtora-badge`) quando presente — ex:
  "CITY" — ao lado do badge de fonte.
- Ícone de placeholder (sem foto) trocado pra 🏢, borda do card em lilás
  (`.imovel-card-revconst`), e o "🏢 nome" que já aparecia nas condições de pagamento pra qualquer
  fonte com `imoConstrutora` preenchido passou a ser suprimido quando `isRevConst` (evita duplicar
  a mesma informação — agora aparece só como badge, não mais como linha de texto também).

Fora do escopo desta mudança (não alterado): `busca.html` — os badges de fonte ali existem pra
resultados de uma busca ao vivo (`buscaAberta_` no backend), que ainda não inclui
REVENDAS_CONSTRUTORAS como fonte. Só os imóveis que aparecem via MATCHES (cards de cliente/dashboard/
favoritos) mostram o novo badge por enquanto.

Testado: payload de importação confirmado com `construtora` no corpo do POST; renderização da
Lista de Imóveis confirmada com colunas Construtora/Importado em corretas; renderização do card de
match em `contatos.html` confirmada via harness Node (badge REV-CONSTRUTORA, badge CITY, classe do
card e ícone — todos corretos). `dashboard.html`/`favoritos.html` receberam o mesmo padrão de
código, verificado por sintaxe e revisão (não reexecutado em harness isolado, por serem arquivos
maiores com o mesmo template já validado em contatos.html).

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 5) — Nova área "Revendas-Construtoras"

Nova fonte de imóveis: revendas captadas por construtoras parceiras, coladas em CSV já organizado
por um assistente de IA externo ("ORGANIZADOR"), mesmo espírito da aba "Outros" de Lançamentos
(colar texto → extrair → revisar → salvar), mas em lote (múltiplos imóveis de uma vez, sem tela
de edição individual) e com cada imóvel ganhando um **código único** (`RC-NNNNN`) e sendo
identificado pelo seu **segmento** (tipo de imóvel).

**Formato escolhido**: CSV (`Unidade,Empreendimento / Imóvel,Área,Configuração,Valor`) em vez do
formato de tabela markdown alternativo — uma linha por imóvel, delimitador único, muito mais
simples e confiável de parsear que múltiplas tabelas markdown misturadas com texto solto.

**Nova página `revendas-construtoras.html`** (decisão do usuário: página nova e dedicada, não aba
dentro de Lançamentos):
- Aba "Colar / Extrair": textarea pra colar o CSV + botão "Extrair Dados" → parser 100% no
  front-end (`extrairRevendasConstrutoras()`, mesmo padrão de `extrairOutrosFormato()` em
  lancamentos.html — o back-end só recebe o array já estruturado). Prévia em tabela antes de
  importar, com um `<select>` de tipo por linha pra corrigir a detecção automática quando o nome
  do imóvel é ambíguo (ex: "Country Ville" não indica sozinho se é apartamento, casa etc.).
- Aba "Lista de Imóveis": tabela com todos os imóveis já importados (código, unidade,
  empreendimento, tipo, área, valor) + botão excluir por linha.

**Parser** (`extrairRevendasConstrutoras`): parser de CSV com suporte a campos entre aspas
(necessário pra valores como `"41,6 m²"`, onde a vírgula é separador decimal, não de coluna).
Deriva o tipo pelo prefixo da "Unidade" (AP→Apartamento, Casa→Casa, Lote→Lote em cond.,
Área→Terreno, Sala→Sala comercial) ou por palavra-chave no nome do empreendimento quando a
unidade é ambígua (ex: "QD.13 LT.08" + "Sobrado Jardins Madri" → Sobrado). Área com "/"
(`"387/286 m²"`) vira `areaTerreno`/`areaUtil` separados (ordem terreno/construção, mesma
convenção do texto de referência do usuário). Configuração tipo "4 suítes • 5 vagas" (sem
"quartos" explícito) assume quartos = suítes. Testado com o CSV real de exemplo do usuário: as 23
linhas parseiam corretamente (só "Country Ville" fica sem tipo detectado — nome não indica
segmento, corrigível na prévia).

**Backend (`code.txt`)**: aba nova `REVENDAS_CONSTRUTORAS`, rotas `importar_revendas_construtoras`
(POST, recebe array já parseado), `listar_revendas_construtoras` (GET), `excluir_revenda_construtora`
(POST). Participa do motor de matching (`rodarMatching()`) como uma 4ª fonte de imóvel, ao lado de
REVENDA/CONSTRUTORA-APARTAMENTOS/LANÇAMENTOS (decisão do usuário) — `revendaConstrutoraParaImovel_()`
mapeia pro mesmo formato usado por `calcularMatch_`.

**Bug encontrado e corrigido no smoke test**: a numeração `RC-NNNNN` inicialmente chamava "próximo
código disponível" (reescaneando a planilha) DENTRO do loop de importação — como nenhuma linha
nova tinha sido gravada ainda quando a linha seguinte perguntava "qual o maior número atual", todo
o lote saía com o MESMO código. Corrigido lendo o maior número usado UMA VEZ antes do loop (sob
lock) e incrementando um contador local por linha — testado importando 3 imóveis: códigos
`RC-00001`/`RC-00002`/`RC-00003`, todos únicos.

Cabeçalho: nova aba "Revendas-Construtoras" adicionada nas 9 páginas (entre "Lançamentos" e
"BaseImob"), auditada item a item pra confirmar mesma ordem/destino/estado "active" em todas.

⚠️ Precisa reimplantar o Apps Script (mudança no backend, `code.txt`).

## 2026-07-13 (parte 4) — "Formulário" vira aba dentro de "Contatos"; cabeçalho unificado

Pedido do usuário: tirar o botão "Formulário" do cabeçalho e colocar no lugar um botão "Contatos"
(abre `contatos.html`), sem mais os botões "Novo"/"Buscar" separados no cabeçalho — em vez disso,
`contatos.html` ganhou 3 abas internas: **"Todos os contatos"**, **"Criar NOVO"** e **"Buscar"**.

**O que mudou:**
- `formulario.html` (cadastro novo + busca/edição, ~1300 linhas de wizard) foi **incorporado
  inteiro dentro de `contatos.html`**, como as abas "Criar NOVO"/"Buscar" — mesmo padrão de seções
  alternáveis via JS já usado em `dashboard.html` (Dashboard/BaseImob/Leads Imobzi/ADM), em vez de
  duas páginas separadas. As duas abas reaproveitam o MESMO wizard (mesmo HTML/JS) — a única
  diferença é o modo inicial (`setMode('novo')` vs `setMode('atualizar')`), já que era exatamente
  assim que "Novo"/"Buscar" funcionavam dentro do formulário original.
- `formulario.html` virou um **redirect fino**: só existe pra não quebrar links/favoritos antigos
  (inclusive com `?linha=X`, usado pelos links de "Editar"), redirecionando na hora pra
  `contatos.html` (`?linha=X` ou `?tab=novo`).
- Ao mesclar os dois arquivos, várias classes/IDs/consts colidiam entre si e precisaram ser
  renomeados ou consolidados pra não quebrar nada (`const` duplicado no mesmo escopo é
  `SyntaxError` e mata o script inteiro — mesmo bug do `top` reservado visto antes nesta sessão):
  - `.search-bar`/`.search-icon`/`#searchInput` (usados por `contatos.html` no filtro da lista
    "Todos") → renomeados pra `.wiz-search-bar`/`.wiz-search-icon`/`#wizSearchInput` dentro do
    wizard, pra não colidir.
  - `.score-num` (usado por `contatos.html` nas cores quente/morno/frio da tabela) → renomeado pra
    `.wiz-score-num` dentro do círculo de score do wizard.
  - `PIP_STAGES`/`PIP_COLORS`/`pipSelectHtml`/`salvarPipelineRapido` — eram quase idênticos nos
    dois arquivos; mantida só a versão de `contatos.html` (com pequeno ajuste: `pipSelectHtml` ganhou
    `onclick="event.stopPropagation()"`, necessário pros cards de resultado de busca do wizard, que
    ficam dentro de um `onclick` do card inteiro).
  - Todo o bloco de login-overlay/autenticação próprio do `formulario.html` (`SESS_TOKEN_KEY`,
    `entrar()`, `sair()`, etc.) foi descartado — `contatos.html` já usa o padrão mais simples de
    redirecionar pra `index.html` quando não autenticado, igual as outras páginas.
- Os 4 links de "Editar" que apontavam pra `formulario.html?linha=X` (2 em `contatos.html`, 2 em
  `dashboard.html`) agora apontam pra `contatos.html?linha=X` — a página detecta o parâmetro na URL,
  abre direto na aba "Buscar" e já carrega o contato.
- Cabeçalho ("Formulário" → "Contatos") atualizado nas 8 páginas que têm o menu completo:
  `contatos.html`, `dashboard.html`, `busca.html`, `favoritos.html`, `insight-detail.html`,
  `lancamentos.html`, `lancamentos-editar.html`, `leads-imobzi.html` — auditado item a item pra
  confirmar que as 7 abas (Contatos/Dashboard/Busca Aberta/Lançamentos/BaseImob/Leads
  Imobzi/ADM) batem em ordem, destino e estado "active" em todas.

Testado no preview: as 3 abas de `contatos.html` alternam corretamente (Todos/Criar NOVO/Buscar),
busca + seleção de contato preenche o wizard com os chips certos (inclusive múltipla escolha,
ex: "Casa, Apartamento" — os dois marcados), resumo/score no step 5 funciona, a lista "Todos os
contatos" continua funcionando, o link `?linha=X` abre direto na aba Buscar com o contato carregado,
e o redirect de `formulario.html?linha=X` chega corretamente em `contatos.html?linha=X` (confirmado
pelo rastro de requisições de rede). Nenhum erro no console em nenhum dos fluxos.

## 2026-07-13 (parte 3) — Fix: "re-lead-imobzi" perdia o idCliente original

Correção do usuário: um "re-lead-imobzi" **não é um lead novo nem um cliente novo** — é o MESMO
cliente numa configuração diferente (de volta pra base de leads pra ser requalificado). O sistema
não estava preservando essa identidade.

Causa: `reverterContatoParaLeadImobzi_()` (chamada quando o corretor leva o pipeline de um contato
de volta pro estágio "Lead Imobzi") apagava a linha de CONTATOS e criava uma linha nova em
LEADS_IMOBZI sem gravar `idClienteBase` — o vínculo com o `idCliente` original se perdia. Quando
esse lead fosse futuramente migrado de volta pra CONTATOS (`atualizarPipelineLeadImobzi_`), como
não havia `idClienteBase`, o sistema tratava como cliente novo e gerava um `idCliente` novo
(`CLI-<timestamp>`) — o cliente virava, pro sistema, uma pessoa diferente da que ele era antes.

Fix:
- `reverterContatoParaLeadImobzi_()` agora recebe o `idCliente` do contato e grava em
  `idClienteBase` na linha nova de LEADS_IMOBZI.
- `atualizarPipelineLeadImobzi_()`: a condição que decide se recria a linha em CONTATOS mudou de
  "não tem `idClienteBase`" pra "não tem `idClienteBase` **OU** `statusBase === 'RE-LEAD-IMOBZI'`"
  — porque só o caso "JÁ NA BASE" (achado por telefone/email no webhook) tem o contato genuinamente
  ainda existindo em CONTATOS; um "RE-LEAD-IMOBZI" teve a linha apagada e precisa ser recriada, só
  que reaproveitando o `idClienteBase` como `idCliente` em vez de gerar um código novo.

Testado com smoke test em Node simulando o ciclo completo: contato `CLI-99999` → vira lead (Lead
Imobzi) → migra de volta pra CONTATOS. Resultado: `idCliente` final continua `CLI-99999` (mesmo de
antes) e não há duplicação de linha em CONTATOS.

⚠️ Precisa reimplantar o Apps Script (mudança só no backend, `code.txt`).

## 2026-07-13 (parte 2) — Fix: "Lote" e "Lote Comercial" tratados como o mesmo tipo no match

Bug relatado: na coluna 2 de "Matches do momento" no Dashboard, um imóvel do tipo "Lote Comercial"
aparecia como match para clientes que só tinham interesse em lote residencial (e vice-versa) — os
dois tipos não estavam sendo diferenciados no score.

Causa: `extrairTipo_()` (`code.txt`) testa o texto do tipo contra uma sequência de regex em ordem,
retornando no primeiro que bater. O teste de `\blote\b` vinha ANTES do teste de `\bcomercial\b`, e
"Lote Comercial" contém a palavra "lote" — então caía sempre no grupo `'lote'` (mesmo grupo de
Terreno/Lote em cond., que é residencial) antes mesmo de chegar no teste comercial. "Lote Comercial"
já era reconhecido como categoria própria em outro lugar do sistema (faixas de R$/m², ver entrada
2026-07-03 pt.4), só a extração usada no match cliente×imóvel não diferenciava.

Fix: teste de `comercial` (sala/loja/comercial) movido pra ANTES do teste de `lote` em
`extrairTipo_()` — "Lote Comercial" agora cai no grupo `'comercial'` (junto com Sala/Loja comercial),
separado do grupo `'terra'` (Lote/Terreno residencial). Testado via smoke test em Node:
"Lote Comercial" x cliente que quer "Lote em cond." → score 0 (antes dava 25/compatível);
"Lote Comercial" x cliente que quer "Sala comercial" → score 25 (compatível, correto);
casos já validados antes (Lote em cond. x Terreno, Lote em cond. x Lote em Condomínio Horizontal)
seguem com score 25, sem regressão.

⚠️ Precisa reimplantar o Apps Script (mudança só no backend, `code.txt`).

## 2026-07-13 — Fix: chip de "Tipo de imóvel" desmarcava ao reabrir cadastro pra edição

Bug relatado: ao editar um contato já salvo (abrindo pelo link "Editar" do Dashboard) para
acrescentar mais um tipo de imóvel de interesse, o(s) tipo(s) já salvo(s) apareciam **sem** o
botão marcado — mesmo o valor estando correto na planilha.

Causa: desde que o campo "Tipo de imóvel" passou a ser dinâmico (carregado via `opcoes_filtro`,
ver entrada de 2026-07-09), o carregamento dos botões (`carregarTiposImovel()`) e o carregamento
do contato pela URL (`carregarClienteDaUrl()` → `carregarContato()`) passaram a ser dois fetches
assíncronos independentes, correndo em paralelo. Se o contato terminava de carregar **antes** dos
botões existirem no DOM, `ativarChip('segmento', ...)` gravava o valor certo em `chipState` mas não
achava nenhum botão pra marcar visualmente (ainda só existia o placeholder "Carregando tipos...").
Quando os botões de verdade chegavam logo depois, nenhum vinha marcado — o valor ficava certo por
baixo dos panos, mas visualmente parecia que tinha "desmarcado".

Fix: nova função `sincronizarSelecaoSegmento_()`, chamada ao final de `carregarTiposImovel()` (depois
que os botões são renderizados), que reaplica a classe `.selected` em cima do `chipState` atual —
cobre as duas ordens possíveis da corrida. Testado simulando ambas as ordens (contato antes dos
tipos e tipos antes do contato) no preview: o tipo salvo aparece marcado corretamente nos dois casos.

## 2026-07-09 — Tipo de imóvel dinâmico no Formulário + "Lead Imobzi" só nas caixas de listagem

**Item 9**: o campo "Tipo de imóvel" do Formulário tinha 6 botões fixos digitados à mão (Casa,
Sobrado, Apartamento, Lote em cond., Sala comercial, Indefinido) — trocado por uma lista
**dinâmica**, buscada da mesma rota (`opcoes_filtro`) que a página Busca Aberta já usa, sempre
refletindo os tipos que existem de verdade na base (ex: Cobertura, Loft, Studio, Terreno, Lote
Condomínio Horizontal, Comercial — nenhum desses existia como botão antes). "Indefinido" continua
sempre disponível como opção (sentinela do score, não é um tipo real).

Como o tipo deixou de ser um conjunto fixo de 6 rótulos, a lógica que mostra/esconde campos
específicos de apartamento (suítes, elevador, andar alto) vs. casa/lote (área de terreno,
churrasqueira, área adensável) mudou de comparação exata pra correspondência por palavra-chave
(contains, case-insensitive) — senão "Lote Condomínio Horizontal" ou "Cobertura" nunca bateriam com
os valores fixos de antes.

**Item 10**: removida a coluna "Lead Imobzi" do funil visual "Pipeline de Negociações" no
Dashboard (volta a ter 5 colunas) — ela só existia há pouco tempo e passou a poluir o funil
principal. Continua existindo normalmente como opção nas caixas de listagem (selects de
contatos.html/formulario.html/dashboard), igual já acontecia com "Ganhos".

## 2026-07-09 — "Re-lead Imobzi" + nova página "Todos os Leads Imobzi"

**Item 8 — reversão automática pra Lead Imobzi**: quando o corretor leva o pipeline de um contato
já existente de volta pro estágio "Lead Imobzi" (pelo select rápido ou pelo formulário completo),
o cadastro sai de CONTATOS de vez e volta a existir em LEADS_IMOBZI, reaparecendo na lista de leads
pendentes — identificado com o status **"RE-LEAD-IMOBZI"**. O círculo com a inicial do nome (avatar)
fica **amarelo** nesse caso, com prioridade sobre o esquema vermelho/azul de novo/já visto.

Novo backend: `reverterContatoParaLeadImobzi_` (integrado em `salvarPipeline_` e `atualizar`) —
detecta a transição de qualquer estágio PARA "Lead Imobzi" e faz a troca de base. Não preserva
observações/histórico do CONTATOS (decisão explícita), nem faz cascata de limpeza em
FAVORITOS/MATCHES (mesmo comportamento de excluir_ contato).

**Item 9 — nova página dedicada `leads-imobzi.html`**: "Todos os Leads Imobzi" — lista completa
(pendentes, migrados e re-leads, com filtros), busca, edição (nome/telefone/email) e exclusão.
Leads e Contatos são bases conceitualmente separadas, não uma extensão uma da outra — por isso uma
página própria em vez de reaproveitar `contatos.html`.

- O botão "✏️ Editar" nos cards de lead do Dashboard agora abre essa página nesse lead específico
  (`leads-imobzi.html?id=...`) em vez do drawer embutido no Dashboard, que foi removido.
- O link "Leads Imobzi" no cabeçalho das outras páginas agora aponta pra cá (antes ia pra
  `dashboard.html?secao=imobzi`); a seção rápida do Dashboard continua existindo, com um novo link
  "📋 Ver todos os leads Imobzi →" pra esta página.

**Backend**: `listarLeadsImobzi_` aceita `{todos:true}` (rota GET `listar_todos_leads_imobzi`) pra
retornar tudo, inclusive migrados — a lista rápida do Dashboard continua só com pendentes.

Testado de ponta a ponta no preview: reversão em `salvarPipeline_`/`atualizar` (harness Node),
carregamento/ordenação/filtros/busca/edição/exclusão/deep-link `?id=` na nova página. ⚠️ precisa
reimplantar o Apps Script.

## 2026-07-09 — Novo estágio "Lead Imobzi" no Pipeline de Negociações

Novo estágio **"Lead Imobzi"** — todo lead com origem Imobzi entra primeiro nesse estágio ao ser
migrado pra CONTATOS, independente do que o corretor selecionar no dropdown "Estágio do pipeline"
do painel de detalhe (esse select continua servindo só pra disparar a migração). Fica como a
primeira coluna do funil no Dashboard; o corretor move manualmente pra outro estágio depois de
qualificar o lead.

Atualizado em todos os lugares onde os estágios são enumerados: array do funil + grid CSS (6
colunas) e mapa de cores no `dashboard.html`; `stages_`/`keyMap_` no backend; `PIP_STAGES`/
`PIP_COLORS` e os selects em `contatos.html` e `formulario.html`. ⚠️ precisa reimplantar o Apps
Script.

## 2026-07-09 — Botão "Editar" nos cards de Leads Imobzi

Cada card na coluna de novos leads Imobzi ganha um botão **"✏️ Editar"**, que abre uma janela
lateral pra corrigir Nome/Telefone/Email direto — útil quando esses dados chegam incompletos ou
com erro de digitação da sincronização com a API do Imobzi. Salva sem precisar recarregar a lista
inteira.

**Backend** (`code.txt`): nova função `atualizarLeadImobzi_` + rota `atualizar_lead_imobzi`
(POST). Só altera nome/telefone/email — não mexe em pipeline, código do imóvel ou outros campos.
⚠️ precisa reimplantar o Apps Script.

## 2026-07-09 — Fix: link "Leads Imobzi" faltava no cabeçalho das outras páginas

A aba "Leads Imobzi" só existia no cabeçalho do próprio `dashboard.html` — Formulário, Busca
Aberta, Lançamentos, Editar Lançamento, Contatos, Favoritos e Insight nunca ganharam esse link
quando a seção Imobzi foi criada. Adicionado nas 7 páginas, entre "BaseImob" e "ADM", apontando
pra `dashboard.html?secao=imobzi` — mesmo padrão já usado por "BaseImob" e "ADM" (o dashboard já
sabia abrir direto na seção Imobzi com esse parâmetro, só faltava o link apontando pra lá).

## 2026-07-09 — Fix: migração de lead Imobzi não ativava o chip "Imobzi / CRM"

**Pedido**: ao migrar um lead Imobzi pra CONTATOS (mudando o pipeline), o campo "Canal de Origem"
do cadastro deve ficar gravado como "Imobzi / CRM" — o mesmo botão/chip que já existe no
formulário — e esse botão deve aparecer ativado ao abrir o cadastro depois.

**Causa raiz**: a migração gravava o `canal` bruto vindo da API do Imobzi (ex: "Facebook Ads",
"Portal") ou o texto genérico "Imobzi" como fallback — nenhum dos dois batia com o texto exato do
chip "Imobzi / CRM" (a função `ativarChip()` do formulário só ativa por igualdade exata de string).
Resultado: nenhum chip de canal aparecia selecionado nesses cadastros.

**Fix**: `atualizarPipelineLeadImobzi_` agora grava `canal` como o literal `'Imobzi / CRM'`, sempre.
O canal mais específico que veio da Imobzi (Facebook Ads, Portal, etc.) continua preservado no
campo Observações, junto com o código do imóvel e a mensagem do lead.

**Bônus (achado testando o fix acima)**: o mesmo trecho gravava numa coluna chamada `obs`, que não
existe em CONTATOS (o nome real é `observacoes`) — o texto de origem/mensagem do lead nunca era
salvo, silenciosamente. Corrigido junto. ⚠️ precisa reimplantar o Apps Script.

## 2026-07-09 — Cards de Leads Imobzi: avatar vermelho/azul, código em destaque, remove endereço e WhatsApp

Coluna de leads Imobzi no dashboard:

- **Avatar (círculo com a inicial)**: vermelho enquanto o lead não foi aberto; muda pra azul assim
  que o corretor clica no card pra ver o imóvel de interesse — sinal visual de "já olhei este
  aqui". Não é gravado na planilha, é só estado da sessão atual no navegador.
- **Código do imóvel de interesse** movido pra logo depois do nome do cliente, em destaque (badge
  azul monoespaçado), em vez de aparecer numa linha separada com o nome do imóvel.
- Removida a linha de endereço/nome do imóvel abaixo do nome do cliente.
- Removido o botão de WhatsApp do card (o telefone já aparece na linha de baixo).

## 2026-07-09 — Fix: formato de data dos leads Imobzi não mudava com dados reais

**Bug**: a ordenação/destaque de data implementados no commit anterior funcionavam nos meus testes
(dados simulados), mas continuavam aparecendo no formato antigo com os leads reais.

**Causa raiz**: `dataCadastro` é gravado como texto "dd/MM/yyyy HH:mm", mas o Google Sheets pode
reconhecer esse texto como data ao salvar e converter a célula sozinho — nesse caso o Apps Script
devolve um `Date` de verdade, que vira string ISO ("2026-07-13T22:25:00.000Z") ao passar por
`JSON.stringify`, não mais "dd/MM/yyyy HH:mm". O parser só reconhecia o formato BR — pra qualquer
lead cuja célula tivesse sido auto-convertida, caía no `null` e mostrava o texto cru.

**Fix**: `parseDataCadastroBR_` tenta o formato BR primeiro e cai pro parser nativo do JS (`new
Date(str)`, entende ISO e a maioria dos outros formatos) como fallback. Testado com uma lista
misturando os dois formatos (BR e ISO) — ordenação e "Em dd/MM/aa - HH:mm" corretos nos dois casos.

## 2026-07-09 — Leads Imobzi: ordenação por mais recente + data em destaque

Coluna de novos leads Imobzi no dashboard:

- Ordenação agora é do lead **mais recente pro mais antigo** (antes seguia a ordem que vinha do
  backend, sem garantia de ordem cronológica).
- Data de entrada exibida em destaque, badge vermelho com o formato pedido:
  **"Em 13/07/26 - 19:25"** (antes era um texto cinza discreto "13/07/2026 19:25").

## 2026-07-09 — Fix: excluir lead Imobzi deslogava em vez de excluir

**Bug**: clicar em excluir um lead na aba Imobzi do dashboard tirava o usuário da página e mostrava
a tela de login, sem excluir nada e sem qualquer confirmação visível de erro.

**Causa raiz**: `excluirLeadImobzi_` (e outras ~6 chamadas do dashboard/contatos, ex: `migrarLead`,
`excluirCliente_`) montam o corpo do POST com `new FormData()`, que o navegador envia como
`multipart/form-data`. O backend (`doPost`) só sabia interpretar JSON puro ou
`application/x-www-form-urlencoded` (via `parseBody(e.postData.contents)`) — pra multipart, esse
conteúdo bruto vem delimitado por boundary e é ilegível por esse parser, então `d` virava `{}`,
`d.token` ficava `undefined`, e a checagem de sessão barrava a chamada como se o usuário não
estivesse logado — daí o "logout" ao clicar em excluir.

**Fix**: `doPost` agora prioriza `e.parameter.dados` quando presente — o Apps Script já popula esse
campo automaticamente pra POSTs `multipart/form-data` (mesmo mecanismo que já usa pro `doGet`),
então não precisa reparsear o corpo bruto. JSON puro e `URLSearchParams` continuam passando pelo
`parseBody(contents)` de sempre, sem mudança de comportamento. Testado via harness Node nos 4
cenários (multipart válido, urlencoded válido, token inválido, multipart sem `e.parameter`) — todos
corretos, nenhuma regressão na rejeição de token realmente inválido. ⚠️ precisa reimplantar o Apps
Script — esse fix corrige de uma vez TODAS as chamadas via `FormData` no projeto, não só a de
excluir lead Imobzi.

## 2026-07-09 — Aba "Landing Pages" na página ADM

Nova sub-aba **"🌐 Landing Pages"** ao lado de "ATIVAR FUNÇÕES" e "Links Úteis" — catálogo das
páginas BaseImob, uma por tipo de produto. Cadastro fixo no HTML (não é um CRUD do corretor, é uma
lista que a própria equipe atualiza ao publicar uma nova landing page), com botão **"👁 Ver"** que
abre a página em outra aba.

Primeira entrada: **Lote em Condomínio** → `baseimob-funil.html`.

## 2026-07-09 — Novo BaseImob: Configurador de Lote (`baseimob-funil.html`), fase 1

Nova página, separada de `baseimob-landing.html`/`baseimob-total.html` (não mexe nas que já
estão no ar). Converte o protótipo `baseimob-funil.jsx` (estudo de redesign premium enviado pelo
usuário) de React/JSX pra HTML+CSS+JS puro — mesmo padrão do resto do projeto, sem build/bundler —
usando Tailwind via CDN pra preservar a identidade visual (dourado/creme, DM Serif Display) sem
reescrever centenas de classes na mão.

**Fase 1 — interação com a base real** (comunicação/design ficam pra próxima fase, combinado com
o usuário):
- Array `CONDOS` mockado do protótipo → substituído por `listar_lancamentos` real, filtrado a
  unidades com `tipo === 'Lote Condomínio Horizontal'` dentro de empreendimentos com
  `tipoEmpreendimento === 'Condomínio Horizontal'`, agrupadas por `idLancamento` (mesmo
  agrupamento de `lancamentos.html`).
- Faixas dos sliders (metragem e preço/m²) calculadas dinamicamente a partir dos dados reais, não
  mais fixas como no protótipo.
- Captura de WhatsApp grava um interesse de verdade via `interesse_lancamento` (mesma rota já
  usada por `baseimob-total.html`) — não precisou de rota nova no backend.
- Campo "Valorização" do protótipo (ex: "12% ao ano") não tem equivalente na base hoje —
  substituído por "A partir de" (menor preço real do grupo) até a fase de design decidir o que
  fazer com esse dado.

Testado de ponta a ponta com dados reais (11 empreendimentos "Lote Condomínio Horizontal"
encontrados na base atual): sliders recalculando o match ao vivo, tela de revelação mostrando
nome/região/padrão/diferenciais reais, e envio de interesse com payload correto.

## 2026-07-09 — Fix: renomear empreendimento na Editar não salvava

**Bug**: ao mudar o "Nome do empreendimento" na página Editar e clicar em Salvar, aparecia
"salvo com sucesso" mas o nome antigo continuava aparecendo — o cadastro renomeado nunca
sobrescrevia o antigo.

**Causa raiz**: o backend (`salvarLancamento_`) decidia "qual lançamento é esse" comparando o
**nome novo** digitado contra os nomes já salvos na planilha. Isso funciona ao reextrair o mesmo
empreendimento (nome igual), mas quebra exatamente ao **renomear**: a busca pelo nome novo não
encontra nada, gera um `idLancamento` novo do zero, salva como se fosse outro empreendimento — e o
registro antigo (com o nome velho) fica órfão na planilha, intocado.

**Fix**: a página Editar agora manda o `idLancamento` (estável, não muda) junto no payload de
salvar; o backend passa a usar esse ID pra achar e substituir o registro certo quando ele vier
preenchido, caindo pro dedup por nome (comportamento original) só quando não vier — que é o caso do
fluxo de extração nova em "Novo Lançamento"/"Outros", sem ID ainda. ⚠️ precisa reimplantar o Apps
Script.

## 2026-07-09 — Botão "Excluir" na lista de Links Úteis

Ao lado do botão "✏️ Editar" em cada link, novo botão **"🗑 Excluir"** — pede confirmação
(`confirm()` nativo, mesmo padrão usado em Empreendimentos/Contatos) antes de apagar
permanentemente o link.

**Backend** (`code.txt`): nova função `excluirLinkUtil_` + rota `excluir_link_util` (POST).
⚠️ precisa reimplantar o Apps Script.

## 2026-07-09 — Formulário: botão "Atualizar" renomeado pra "Buscar" + cores fixas

No seletor de modo do Formulário (`formulario.html`):

- Botão "Atualizar" renomeado pra **"Buscar"** (o rótulo não refletia bem a ação — é onde o
  corretor busca um contato já cadastrado antes de editar).
- Cores fixas por botão, em vez do azul genérico de "ativo": **"Novo"** fundo verde
  (`var(--success)`), **"Buscar"** fundo branco com letra escura. O botão selecionado fica em
  opacidade cheia; o outro, esmaecido — mesma lógica de antes, só que sem depender de uma cor
  compartilhada.

## 2026-07-09 — Botão "Editar" na lista de Links Úteis

Cada linha da lista de "Links Úteis" (aba ADM) ganha um botão **"✏️ Editar"**, que abre o mesmo
drawer lateral já usado pra cadastrar, só que pré-preenchido com os dados daquele link. Ao salvar,
atualiza a linha existente na planilha em vez de criar uma duplicata — a `dataCadastro` original é
preservada.

**Backend** (`code.txt`): `salvarLinkUtil_` agora aceita `idLink` opcional no payload — com ele,
atualiza a linha correspondente; sem ele, cadastra novo (comportamento de sempre). ⚠️ precisa
reimplantar o Apps Script.

## 2026-07-09 — Fix: link "ADM" no cabeçalho + renomeia sub-aba pra "ATIVAR FUNÇÕES"

- **Bug de navegação**: o link "ADM" no cabeçalho de Formulário, Busca Aberta, Lançamentos,
  Editar Lançamento, Contatos, Favoritos e Insight sempre caía na aba "Dashboard" (seção padrão)
  em vez de já abrir a seção ADM — mesmo bug que já tinha sido corrigido pro link "BaseImob" antes.
  Corrigido do mesmo jeito: os links agora apontam pra `dashboard.html?secao=adm`, e o `dashboard.html`
  lê esse parâmetro no carregamento e chama `mostrarAdm()` automaticamente.
- Sub-aba "Funções manuais" (dentro de ADM) renomeada pra **"ATIVAR FUNÇÕES"**.

## 2026-07-09 — Aba "Links Úteis" na página ADM

Na página ADM (`dashboard.html`), nova sub-aba **"🔗 Links Úteis"** ao lado de "Funções manuais":

- Lista os links cadastrados (Nome, URL, OBS) — clicar no nome abre a URL em outra aba.
- Botão **"+ Cadastrar Link"** abre uma janela lateral (mesmo padrão de drawer já usado no projeto)
  com campos Nome/URL/OBS. Nome e URL são obrigatórios.

**Backend** (`code.txt`): nova aba **LINKS_UTEIS** na planilha (criada automaticamente na primeira
gravação), com `idLink`/`nome`/`url`/`obs`/`dataCadastro`. Rotas novas: `adm_listar_links_uteis`
(GET) e `salvar_link_util` (POST) — ⚠️ precisa reimplantar o Apps Script.

## 2026-07-09 — Botão URL e dados do Gerente nos cards de Empreendimentos

Cada card de "Empreendimentos Cadastrados" (`lancamentos.html`) agora mostra, quando cadastrados:

- **🔗 URL**: botão ao lado do badge de status da tabela de preços, abre `urlSite` (URL/pasta
  digital do empreendimento) em outra aba.
- **Gerente Comercial**: nome + botão "💬 WhatsApp" (mesmo padrão `wa.me/55...`) logo no topo do
  corpo do card, usando os campos `gerenteNome`/`gerenteTelefone` cadastrados no drawer da página
  Editar (ver item abaixo). Nenhum dos dois aparece se o campo correspondente estiver vazio.

## 2026-07-09 — Gerente Comercial do Produto (painel + cadastro em drawer lateral)

Na página "Editar Lançamento" (`lancamentos-editar.html`), novo painel acima de "Dados Gerais"
mostrando o contato do gerente comercial responsável por aquele empreendimento específico:

- **Painel**: Nome, telefone (com botão "💬 WhatsApp" ao lado, mesmo padrão `wa.me/55...` usado em
  Contatos/Dashboard) e OBS. Mostra "Nenhum gerente cadastrado" quando ainda não preenchido.
- **Botão "📇 Cadastrar Gerente"** (vira "✏️ Editar Gerente" quando já existe um) abre uma janela
  lateral (drawer) reaproveitando o padrão visual já usado em Contatos/Dashboard, com campos
  editáveis de Nome/Telefone/OBS.
- Os dados do gerente são gravados junto com o resto do lançamento — não têm salvamento próprio;
  clicar em "Salvar dados do gerente" no drawer só atualiza o painel, e "Salvar alterações" (botão
  principal da página) é quem grava tudo no backend.

**Backend** (`code.txt`): novos campos `gerenteNome`, `gerenteTelefone`, `gerenteObs` no final de
`CABECALHO_LANCAMENTOS` (nível do lançamento inteiro, não por unidade) — ⚠️ precisa reimplantar o
Apps Script.

## 2026-07-08 — Badge de status da tabela de preços nos cards de Empreendimentos

Cada card de "Empreendimentos Cadastrados" (`lancamentos.html`) agora mostra se a tabela de preços
está atualizada, a partir do campo `statusTabela` (já existia no backend, vindo do rádio
"Atualizada/Desatualizada" preenchido na extração/edição):

- **Desatualizada**: botão piscando (`⚠ Tabela desatualizada`), clicável — leva direto pro
  "Editar" do empreendimento (mesma função `editarEmp()` do botão "✏️ Editar").
- **Atualizada**: selo verde discreto (`✓ Tabela atualizada`), sem animação.
- **Sem status definido**: não mostra nada (não força uma opinião sobre dado que não existe).

Reaproveita o mesmo estilo de alerta (`⚠ VERIFICAR PREÇOS`) já usado no formulário de extração,
agora também visível na lista, sem precisar abrir cada empreendimento pra saber.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: os 3 cenários (desatualizada, atualizada, sem status) renderizam certo;
animação `pisca-badge` confirmada via computed style; botão de "desatualizada" clicável
(`cursor:pointer`, `onclick` chamando o índice correto do card). Sem erros no console.

## 2026-07-08 — "Data da tabela de preços" (Bloco 1) também preenchida na aba "Outros"

Usuário reportou de novo que "Data da Tabela" não capturava — dessa vez era o campo **geral** "Data
da tabela de preços" (Bloco 1, junto com Nome/Bairro/Cidade), não a coluna por unidade (essa já
tinha sido corrigida no commit anterior e continuava funcionando certo). O formato "Outros" só
tinha `DATA_TABELA` por tipologia; nada populava o campo geral de Bloco 1, que também aciona o
alerta visual "⚠ VERIFICAR PREÇOS".

`extrairOutrosFormato()` agora usa a `DATA_TABELA` da primeira tipologia como referência pro campo
geral do empreendimento também — mesmo padrão já usado pro "Tipo de imóvel" (que também deriva da
primeira tipologia).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: campo "Data da tabela de preços" preenchido com "06/2026" e o alerta "⚠
VERIFICAR PREÇOS" ativo, ao mesmo tempo em que as colunas por unidade continuam corretas. Sem
erros no console.

## 2026-07-08 — Parser da aba "Outros" mais tolerante a variações do assistente organizador

Usuário testou a aba "Outros" com um texto real gerado pelo assistente organizador e reportou que
"Tipo de Imóvel", "Padrão", "Data da Tabela" e a lista de tipologias não foram capturados. Causa
raiz: o texto usava `## TIPOLOGIAS:` (prefixo markdown) e **não tinha nenhum `---`** separando os
7 blocos de tipologia — o parser antigo dependia estritamente desses dois formatos exatos, então
todos os campos repetidos (`TIPO_PRODUTO`, `DESCRICAO`, etc.) colapsavam num objeto só, com apenas
o último valor de cada campo sobrevivendo. "Tipo de Imóvel"/"Padrão" vinham vazios como
consequência direta disso (são derivados da primeira tipologia e do m² médio de todas — sem
tipologias capturadas, não tem como calcular nenhum dos dois).

Duas mudanças em `extrairOutrosFormato()` (lancamentos.html) pra não depender de o assistente
seguir o formato à risca:

1. **Remove prefixo markdown** (`#`, `##`, `-`, `*`) de toda linha antes de tentar casar
   `CAMPO: valor` — resolve `## TIPOLOGIAS:` e `## DATA_TABELA: ...`.
2. **Detecta o início de cada tipologia pela linha `TIPO_PRODUTO:`**, em vez de depender do
   separador `---` — é um campo obrigatório em toda tipologia, serve de âncora confiável mesmo
   quando o assistente esquece de colocar o separador. Um `---` eventual continua sendo tolerado
   (só é ignorado, não quebra nada).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview com o texto real enviado pelo usuário (Parqville Figueira, 7 tipologias de
lote, formato com `##` e sem `---`): as 7 linhas da tabela saem certas, Tipo de Imóvel = "Lote
Condomínio Horizontal", Tipo de Empreendimento = "Condomínio Horizontal", Padrão calculado
("Alto"), Estoque/Total de unidades, Data da Tabela em cada linha ("06/2026"), painel resumo com
badge "91% | 28" — tudo batendo. Testado também o formato antigo (com `---`, sem markdown) pra
confirmar que não regrediu. Sem erros no console.

## 2026-07-08 — ORGANIZADOR_PROMPT.md: seção sobre "tabelas digitais" (planilha de unidades)

Usuário reportou que os dados gerais do empreendimento saem bem organizados, mas dados vindos de
**tabela digital de preços** (exportação tipo planilha, uma linha por unidade — ex: "Tabela
Digital" da Orulo, colunas `Status | Unid. | Tipo | Área | Valor | Valor Promo`) não estavam sendo
bem aproveitados pelo assistente organizador. Adicionada uma seção nova ao
`ORGANIZADOR_PROMPT.md` com passo a passo específico pra esse formato, usando um trecho real
enviado pelo usuário como exemplo:

- Como reconhecer e ignorar ruído de interface (filtros repetidos, menus, "limpar filtros" etc.)
  que aparece misturado com os dados reais da tabela.
- `TOTAL_UNIDADES` = contar todas as linhas da tabela; `ESTOQUE` = contar só as linhas com status
  `Disponível` — usar a tabela pra calcular esses dois campos quando não vierem informados em
  outro lugar do material.
- Agrupar unidades por área igual/parecida em vez de criar uma tipologia por linha (uma tabela com
  50 lotes do mesmo tamanho vira 1 bloco de tipologia, não 50).
- Ignorar unidades `Vendido`/`Reservado` no cálculo de preço (só contam pro total, não pra
  faixa de preço da tipologia).
- Usar "Valor Promo" no lugar de "Valor" quando presente (preço promocional).
- Exemplo completo com números, mostrando o resultado esperado a partir de um trecho de tabela.

Só documentação (`ORGANIZADOR_PROMPT.md`) — nenhum código mudou, não precisa reimplantar nada.

## 2026-07-08 — Nova aba "Outros": lançamentos a partir de texto organizado por IA

Nova aba "Outros" em `lancamentos.html`, ao lado de "Novo Lançamento", pra cadastrar
empreendimentos a partir de material que não segue o formato da Orulo (fichas técnicas, books de
vendas, sites, PDFs colados etc.) — textos assim variam demais de formato pra um parser de regex
dar conta como faz com a Orulo.

**Fluxo pensado**: o usuário passa o material bruto pra um assistente de IA separado (o
"organizador"), que devolve um texto num formato fixo e previsível; esse texto é colado na aba
"Outros"; o Base Inteligente extrai dali com um parser simples (`extrairOutrosFormato`, chave:valor
+ blocos de tipologia delimitados por `---`) e alimenta o **mesmo** formulário de revisão da aba
"Novo Lançamento" — a aba "Outros" é só uma entrada de texto alternativa, não duplica nada do
formulário/tabela/salvamento.

Criado `ORGANIZADOR_PROMPT.md` na raiz do projeto — texto pronto pra colar como instrução nesse
assistente organizador, com a listagem completa de todos os campos (Dados Gerais e por tipologia),
os valores válidos de Tipo de Empreendimento/Tipo de Produto, e as regras de captura já
estabelecidas no projeto (terreno → Lote Condomínio Horizontal, área útil só pra apartamento/casa,
Padrão não deve ser calculado pelo organizador — o sistema já faz isso automaticamente pelo m²
médio).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: texto de exemplo (Condomínio Vertical, 2 tipologias de apartamento) extrai
todos os dados gerais corretamente, calcula Padrão "Médio" automaticamente, e povoa a tabela com as
2 tipologias; texto de lote (Condomínio Horizontal, área terreno) extrai `areaTerr` no campo certo
(não `areaUtil`) e classifica Padrão pela faixa horizontal; painel resumo com badge "[90%|18]"
funcionando igual à extração da Orulo; texto sem tipologias e texto vazio tratados sem quebrar
(toast de erro amigável). Sem erros no console.

## 2026-07-08 — Pipeline: segmento no card + novo estágio "Fechamento"

**5. Segmento ao lado do nome** — cada card do funil (`dashboard.html`) agora mostra o segmento de
interesse do cliente (Casa/Sobrado/Apartamento/Lote em cond./Sala comercial/Indefinido) ao lado do
nome, estilo discreto (`.pip-segmento`, texto pequeno e apagado). A rota `pipeline_dados`
(`code.txt`) não trazia esse campo antes — só `nome`/`nomeCompleto`/`idCliente`/`dias` — agora
inclui `segmento` também.

**6. Novo estágio "Fechamento"** — adicionado como primeira coluna do funil (à esquerda de
"Urgentes"), fundo azul (`rgba(52,120,246,.15)` / `#3478f6`, tom diferente do azul já usado em
"Ganhos" pra não confundir visualmente). Grid do funil passou de 5 pra 6 colunas
(`grid-template-columns:repeat(6,1fr)`). Atualizado em todo lugar que enumera os estágios do
pipeline, pra manter consistência entre o funil e as caixas de seleção:

- `dashboard.html`: array `cfg` do funil + CSS do grid.
- `code.txt` (rota `pipeline_dados`): `stages_`, `keyMap_` e o fallback do `catch` ganharam a
  chave `fechamento`; comentário do cabeçalho `pipeline` atualizado.
- `contatos.html` e `formulario.html`: `PIP_STAGES`/`PIP_COLORS` (usados nas caixas de seleção de
  estágio da tabela de contatos e do próprio formulário) e o `<select id="pipeline">` do
  formulário ganharam a opção "Fechamento".

⚠️ Precisa reimplantar o Apps Script (mudança em `code.txt`).

Testado: suite Node confirmando que a rota `pipeline_dados` devolve `fechamento` com o cliente e o
`segmento` certos, e que "Perda" continua de fora de qualquer coluna do funil; preview confirmando
6 colunas no funil (desktop) com "Fechamento" primeiro e fundo azul, segmento aparecendo no card, e
2 colunas no mobile (media query já existente); `PIP_STAGES`/`PIP_COLORS`/select de
`contatos.html`/`formulario.html` conferidos direto no HTML servido.

## 2026-07-08 — Cards ordenados por metro quadrado (mais barato primeiro)

Cards de "Empreendimentos Cadastrados" (`lancamentos.html`) agora ordenam do m² médio mais barato
pro mais caro (mesmo `calcularM2Medio` usado no painel resumo de cada card). Empreendimento sem
área/preço suficiente pra calcular o m² vai pro final da lista, não pro topo — senão pareceria
erroneamente "o mais barato".

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: 4 empreendimentos de teste (2.000, 3.500, 5.000 R$/m² e um sem dados)
renderizaram na ordem exata esperada. Sem erros no console.

## 2026-07-08 — "Alterações 08/07 parte 3": remove plano de pagamento/Qd/Lt, cards com resumo, fix 100%

1. **Removidos** de `lancamentos.html` e `lancamentos-editar.html` (UI, coleta de dados e payload):
   Qd (quadra), Lt (lote) e todo o plano de pagamento por unidade (Ato/Entrada, Sinal, Mensais,
   Anuais, cada um com Qtd). Em `lancamentos-editar.html`, o campo "Unidade" volta a usar só a
   "Descrição/nome" digitada (a derivação automática "Qd X - Lt Y" foi removida junto). Tabela do
   Bloco 2 em `lancamentos.html` caiu de 25 pra 15 colunas (min-width ajustado de 1550px pra
   1050px).

   **Sobre "excluir na base"**: as colunas continuam existindo em `CABECALHO_LANCAMENTOS`
   (`code.txt`) — **não foram removidas do backend**. Elas ficam no MEIO do array (antes de
   `precoTotal`/`tipoEmpreendimento`), então removê-las desalinharia todas as colunas seguintes
   pra linhas já salvas na planilha (o array é posicional, sem uma migração real de dados a
   remoção quebraria dados existentes). A partir de agora essas colunas simplesmente não são mais
   preenchidas por nenhuma das duas páginas — ficam vazias em qualquer lançamento novo/reeditado,
   sem risco pros dados antigos. Nenhuma mudança em `code.txt`, não precisa reimplantar.

2. Label "Área" no painel resumo (Dados Gerais / extração) renomeada pra **"Faixa de áreas"**
   (`montarResumoAreaPrecoHTML`, config.js) — nota do usuário: esses três dados (faixa de área,
   preço mínimo, m² médio) vão virar filtros pro cliente na próxima fase do projeto ("Tração de
   Leads via Landing Pages"), planejamento a ser enviado depois.

3. Cards de "Empreendimentos Cadastrados" (`lancamentos.html`) agora mostram o **painel resumo
   completo** (faixa de área, a partir de R$ X, m² médio) no lugar da faixa de preço simples
   ("R$ 733.200 – R$ 1.281.032"). Nova classe `.emp-resumo` reaproveitando os itens do mesmo
   `montarResumoAreaPrecoHTML` usado na extração e no Editar.

4. **Bug corrigido**: `calcularPercentualVendido` (config.js) podia arredondar pra 100% mesmo com
   estoque > 0 em empreendimentos grandes (ex: 2 restantes de 839 unidades = 99,76%, `Math.round`
   fechava em 100). Reproduzido exatamente o caso relatado ("100% | 2 Parqville Jacarandá") e
   corrigido: só fecha em 100% quando o estoque é exatamente 0; caso contrário, o teto é 99%,
   mesmo que o cálculo bruto arredonde mais alto.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: tabela do Bloco 2 com 15 colunas (14 campos + botão remover) e sem nenhum
resquício de Qd/Lt/plano de pagamento no payload; card reproduzindo o cenário exato do bug (estoque
2, total 839) mostra "99% | 2" em vermelho, não mais "100%" em preto; card mostra o painel resumo
completo com faixa de área, menor preço e m² médio. Sem erros no console (à parte de um cache
teimoso do `config.js` no próprio ambiente de preview durante os testes — o arquivo em disco já
está correto, confirmado lendo o conteúdo servido via fetch com cache-busting).

## 2026-07-08 — Badge "[90%|18] Nome" também no painel da extração

O quadro "[90%|18] Nome do empreendimento" já existia no título de `lancamentos-editar.html` e em
cada card de "Empreendimentos Cadastrados" — agora aparece também dentro do painel resumo da
extração (`lancamentos.html`), como primeira linha, antes da faixa de área/preço/m². Atualiza ao
vivo enquanto o usuário edita Nome, Estoque ou Total de unidades (novos `oninput` nesses três
campos, chamando `atualizarResumoEPadrao()`). Sem Estoque/Total preenchidos, mostra só o nome, sem
o badge.

`renderResumoExtracao()` monta esse título a partir de `f-nome`/`f-estoque`/`f-totalUnidades` e
antepõe ao HTML do painel; nova classe `.resumo-titulo` (largura cheia dentro do flex do painel,
pra ficar numa linha própria acima dos itens de área/preço).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: extração com Estoque/Total preenchidos mostra "[90%|18] Vinhas Flamboyant"
igual ao exemplo pedido; editar Estoque pra 0 atualiza pra "100% | 0" (preto) ao vivo; limpar
Estoque/Total mostra só o nome, sem badge, sem quebrar o resto do painel. Sem erros no console.

## 2026-07-08 — Padrão passa a depender de "Tipo de Empreendimento" (Horizontal x Vertical)

A regra por m² médio agora usa duas faixas diferentes, dependendo do "Tipo de Empreendimento" —
apartamento (vertical) custa estruturalmente mais por m² que lote/casa térrea (horizontal):

- **Condomínio Vertical**: reativa a faixa antiga (a mesma de antes de existir a classificação por
  m², restrita agora só a esse tipo): até R$ 4.999/m² Popular, R$ 5.000–9.999 Médio, R$
  10.000–14.999 Alto, R$ 15.000+ Luxo.
- **Condomínio Horizontal** (ou tipo não informado): mantém a faixa nova do commit anterior (até
  1.000 Popular, 1.001–2.000 Médio, 2.001–3.000 Alto, acima de 3.001 Luxo).

`classificarPadraoPorM2Medio_` (config.js) ganhou um segundo parâmetro (`tipoEmpreendimento`).
Mudar o select "Tipo de Empreendimento" agora recalcula o Padrão na hora, nas duas páginas.

**Bug real encontrado e corrigido durante o teste**: o `<select>` "Padrão" em
`lancamentos-editar.html` tinha a opção **"Econômico"**, enquanto a função sempre retornou
**"Popular"** (nome usado em `lancamentos.html`) — como não batia com nenhuma `<option>`, o
`.value =` do select falhava silenciosamente (comportamento padrão do DOM: atribuir a um `<select>`
um valor sem `<option>` correspondente simplesmente não faz nada, sem erro no console), deixando o
campo em branco toda vez que a classificação calculava "Popular". Corrigido renomeando a opção pra
"Popular", igual à extração.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: as duas faixas (vertical e horizontal) batem em todos os limites; extração de
apartamento com R$/m² de 2.500 classifica "Popular" (regra vertical) e recalcula pra "Alto" ao
trocar manualmente pro tipo Horizontal; mesmo teste replicado em `lancamentos-editar.html` após a
correção do select. Sem erros no console.

## 2026-07-08 — Novas faixas de "Padrão" pelo m² médio

Limites da classificação (`classificarPadraoPorM2Medio_`, em `config.js`) atualizados pra:

- até R$ 1.000/m² → Popular
- R$ 1.001 a 2.000/m² → Médio
- R$ 2.001 a 3.000/m² → Alto
- acima de R$ 3.001/m² → Luxo

(substituindo as faixas anteriores: 1.001–1.500 médio, 1.501–2.300 alto). Vale pra todo tipo de
empreendimento, sem exceção — mesmo comportamento de antes, só os números mudaram.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: os 6 limites (1.000/1.001/2.000/2.001/3.000/3.001) batem exatamente com
Popular/Médio/Alto/Luxo. Sem erros no console.

## 2026-07-08 — Remove a exceção "Lote Condomínio Horizontal sempre Médio"

Causa raiz do relato anterior (Padrão preso em "Médio" mesmo com painel mostrando um m² médio de
Luxo): o desenvolvimento era mesmo um Lote Condomínio Horizontal, e existia uma regra antiga
(Alterações 08/07, item 2, de alguns dias atrás — antes de existir a classificação por m²) forçando
"Médio" sempre pra esse tipo, sem olhar pro m² calculado. Confirmado com o usuário: essa exceção foi
**removida** — Lote Condomínio Horizontal agora é classificado pelo m² médio como qualquer outro
tipo, sem exceção.

Removido: o bloco em `extrairBloco1()` (lancamentos.html) que fixava `b.padrao = 'Médio'`; o `if`
especial em `atualizarResumoEPadrao()` (lancamentos.html) e em `atualizarResumoAreaPreco()`
(lancamentos-editar.html); e a função `aoMudarTipoUnidade()` inteira (lancamentos-editar.html, só
existia pra forçar essa exceção ao trocar o tipo de uma tipologia).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: extração de um Lote Condomínio Horizontal com R$/m² de 3.000 classifica "Luxo"
(antes ficava travado em "Médio"); em `lancamentos-editar.html`, um lançamento salvo como Lote
Condomínio Horizontal com R$/m² de 2.000 classifica "Alto" corretamente. Sem erros no console.

## 2026-07-08 — Padrão recalcula ao editar a tabela na extração (não só ao clicar "Extrair")

Mesmo depois da correção anterior, o usuário reportou que editar manualmente um valor na tabela do
Bloco 2 (ex: aumentar o preço médio até o R$/m² cruzar de "Alto" pra "Luxo") não atualizava o campo
"Padrão" em `lancamentos.html`. Causa: a classificação só rodava uma vez, dentro de
`extrairDados()`, no momento do clique em "Extrair Dados" — nenhuma edição posterior na tabela
recalculava.

Nova função `atualizarResumoEPadrao()` (lê o estado ATUAL da tabela via `lerPreview().unidades`,
não o que foi extraído originalmente) chamada em todo ponto que muda as tipologias: `oninput` na
tabela inteira (`#unidades-tbody`, delegação — cobre editar qualquer célula), `onchange` no select
"Tipo de imóvel" (mudar pra/de Lote Condomínio Horizontal reclassifica na hora), e explicitamente
em `addLinhaUnidade()` e no botão de remover linha (adicionar/remover não dispara "input").

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: extração inicial classifica "Alto" (R$/m² ~1.886); editar o preço médio na
tabela pra R$/m² ~2.452 reclassifica "Luxo" ao vivo (o cenário exato relatado); mudar "Tipo de
imóvel" pra Lote Condomínio Horizontal força "Médio" mesmo com esse m² de Luxo; adicionar e depois
remover uma linha não quebra nada. Sem erros no console.

## 2026-07-08 — Classificação de "Padrão" pelo m² médio também no Editar

A regra oficial de "Padrão" pelo Metro Quadrado Médio (parte 5) só tinha sido aplicada na
extração (`lancamentos.html`) — usuário reportou que, mesmo com o m² médio calculado corretamente
(ex: R$ 2.452,02/m²) e visível no painel resumo, o campo "Padrão" não mudava. Causa: essa regra
nunca tinha sido replicada em `lancamentos-editar.html`.

`classificarPadraoPorM2Medio_` movida pra `config.js` (compartilhada) e agora
`atualizarResumoAreaPreco()` em `lancamentos-editar.html` também reclassifica "Padrão" toda vez
que recalcula o painel — ou seja, ao abrir um lançamento salvo, e ao vivo sempre que uma tipologia
é adicionada/removida/editada. Como "tipo" é por tipologia nessa página (diferente da extração,
onde é um valor só pro lançamento inteiro), só força "Médio" se **todas** as unidades forem Lote
Condomínio Horizontal; havendo mistura de tipos, usa o m² médio geral normalmente.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: abrir um lançamento com R$/m² de 2.000 classifica "Alto" automaticamente;
editar o preço pra R$/m² ~2.426 reclassifica pra "Luxo" ao vivo; mudar o tipo da unidade pra Lote
Condomínio Horizontal força "Médio" mesmo com esse m² alto. Sem erros no console.

## 2026-07-08 — Painel resumo (área/preço/m²) também na página de Editar

O painel resumo (faixa de área, "a partir de", metro quadrado médio) só existia na extração
(`lancamentos.html`) — ao salvar um empreendimento e voltar depois clicando em "Editar", o painel
sumia, porque a lógica de cálculo só existia ali, com uma cópia local. Movido pra `config.js`
(`calcularM2Medio`, `montarResumoAreaPrecoHTML`) e agora `lancamentos-editar.html` também mostra o
mesmo painel, no topo de "Dados Gerais" — calculado a partir das tipologias que estão no
formulário no momento (mesma função `coletarUnidades()` usada pra montar o payload de salvar),
recalculado ao vivo sempre que uma tipologia é adicionada, removida ou tem área/preço editado.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: abrir "Editar" com um lançamento salvo já mostra o painel corretamente; editar
a área de uma unidade recalcula o painel na hora; `lancamentos.html` continua funcionando igual
depois da função de cálculo ter sido movida pra `config.js`. Sem erros no console.

## 2026-07-08 — "Alterações 08/07 parte 5": regra oficial de "padrão" pelo m² médio

A classificação de "padrão" na extração da Orulo (`lancamentos.html`) usava faixas de R$/m²
provisórias por tipo de imóvel (5.000/10.000/15.000 — nunca confirmadas de verdade) e dependia de
achar um "(R$ x/m²)" solto no texto bruto, que nem sempre existia. Substituída pela regra oficial,
confirmada pelo usuário, aplicada sobre o **Metro Quadrado Médio já calculado com as tipologias
extraídas** (mesmo valor mostrado no painel resumo — parte 2, item 3):

- até R$ 1.000/m² → Popular
- R$ 1.001 a 1.500/m² → Médio
- R$ 1.501 a 2.300/m² → Alto
- acima de R$ 2.301/m² → Luxo

"Lote Condomínio Horizontal" continua sempre "Médio" por regra própria (Alterações 08/07, item 2),
sem passar por essa classificação. O cálculo roda automaticamente ao clicar "Extrair Dados" e
sobrescreve o campo Padrão (ainda editável manualmente depois, como os demais campos detectados).

Funções novas/renomeadas em `lancamentos.html`: `classificarPadraoPorM2Medio_` (regra fixa acima,
substitui `classificarPadraoPorM2_` e as faixas provisórias por tipo, removidas) e `calcularM2Medio`
(extraída do painel resumo pra ser reaproveitada também na classificação de padrão).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: os 4 limites da regra (1.000/1.001/1.500/1.501/2.300/2.301) batem exatamente
com Popular/Médio/Alto/Luxo; extração com R$/m² calculado em 2.500 preenche "Luxo" corretamente;
Lote Condomínio Horizontal continua fixo em "Médio" mesmo com R$/m² de 3.000 (que cairia em Luxo
pela regra geral). Sem erros no console.

## 2026-07-08 — "Alterações 08/07 parte 2": percentual vendido + painel resumo da extração

1. **Percentual vendido** — derivado de Estoque/Total de unidades (não é uma coluna nova no
   backend, é calculado na hora a partir dos dois campos que já existiam). Novas funções
   compartilhadas em `config.js`: `calcularPercentualVendido`, `corPercentualVendido`,
   `badgeVendidoHTML`.
2. **Quadro "[90%|18]"** ao lado do nome do empreendimento: em `lancamentos-editar.html` (no
   cabeçalho da página, atualiza ao vivo quando Estoque/Total de unidades mudam) e em
   `lancamentos.html` (em cada card de "Empreendimentos Cadastrados"). Regras de cor: até 50%
   verde/letra branca, 51–70% amarelo/letra escura, 71–90% laranja/letra escura, 91–99%
   vermelho/letra branca, 100% preto/letra branca.
3. **Painel resumo na extração** (`lancamentos.html`, ao lado do "Nome do empreendimento"):
   calcula, a partir das tipologias já extraídas no Bloco 2, a faixa de área ("371,1m² a
   583,5m²"), o menor preço entre as unidades ("A partir de R$ 902.524,00") e o metro quadrado
   médio ("R$ 2.427,00") — média do R$/m² de cada tipologia. **Observação para o futuro**: esse
   R$/m² médio ainda não alimenta a classificação de "padrão" automaticamente — fica só
   informativo por enquanto; qualificar o "padrão" com base nele é um próximo passo combinado
   com o usuário, não implementado nesta etapa.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: badge "90% | 18" com cor laranja batendo com o exemplo do usuário; 100%
vendido vira preto; badge some quando não há Estoque/Total de unidades preenchidos (sem quebrar o
card); painel resumo calcula área/preço/m² médio corretamente a partir de texto de teste, some ao
limpar o motor, e não quebra com lista de unidades vazia. Sem erros no console.

## 2026-07-08 — Padrão "553.235,00" em todos os campos de preço (lançamentos)

Campos de preço em `lancamentos.html` e `lancamentos-editar.html` (Preço médio/mínimo/máximo,
Ato-Entrada, Sinal, Mensais, Anuais) mostravam número cru ("553235"). Agora seguem o padrão
brasileiro "553.235,00": agrupam milhar ao vivo enquanto digita, e fecham com ",00" ao sair do
campo — mesmo formato aplicado automaticamente aos valores capturados da Orulo (extração já
preenche os campos formatados). Três funções novas e compartilhadas em `config.js`
(`formatarPrecoBR`, `normalizarPrecoBR`, `exibirPrecoBR`) e uma de conversão (`valorPrecoBR`, que
sempre lê o número puro na hora de montar o payload — a planilha continua guardando número, nunca a
string formatada).

Corrigido de passagem: `lerPreview()` em `lancamentos.html` usava uma regra herdada estranha
(`n<10000 ? n*1000 : n`) pra "adivinhar" se o valor digitado estava em milhares — trocada pelo
parser correto, e os campos Ato/Entrada, Sinal, Mensais e Anuais (que antes nem eram convertidos
pra número) passaram a ser parseados também. Adicionado ainda `onfocus="this.select()"` em todo
campo de preço — sem isso, reabrir um campo já fechado em "553.235,00" e digitar mais um dígito no
final absorvia o ",00" como dígito de verdade, inflando o valor.

**Revisão geral**: os únicos campos de preço com o problema (número cru, sem máscara) eram os de
`lancamentos.html`/`lancamentos-editar.html`. "Preço limite" (`formulario.html`) e o campo de preço
com slider (`busca.html`) já tinham máscara própria (agrupamento de milhar, sem ",00") — não foram
alterados: são um conceito diferente (teto de orçamento do cliente, sempre em reais inteiros,
sincronizado com um slider) e adicionar centavos ali só criaria risco de quebrar esse sincronismo
sem ganho real. Os demais lugares que mostram "R$" no projeto (dashboard, contatos, insight-detail,
favoritos, BaseImob) são exibição somente-leitura, já formatada — não precisam de máscara de
digitação.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: extração da Orulo preenche os campos já formatados; digitação simulada
tecla-a-tecla confirma que o valor não "explode" a cada tecla nem a cada blur repetido
(idempotente); reabrir um campo já fechado e digitar mais um dígito substitui o valor inteiro (via
`select()`) em vez de grudar no ",00"; `lerPreview()`/`coletarUnidades()` devolvem o número puro
correto em ambas as páginas. Sem erros no console.

## 2026-07-08 — "URL do Empreendimento" captura em "URL do site / Orulo"

Em `lancamentos.html`, a "URL do Empreendimento" (topo da página, usada só pro botão "↗ Abrir")
nunca preenchia o campo "URL do site / Orulo" do Bloco 1 — que é o que de fato vai salvo no
backend. O usuário tinha que colar o link duas vezes. Agora, ao clicar "Extrair Dados", o valor da
URL do topo é capturado automaticamente em "URL do site / Orulo" (renderB1 também ganhou esse
campo, que não era populado por ele antes).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: URL preenchida no campo do topo aparece em "URL do site / Orulo" após
"Extrair Dados", com a classe visual "ok", e `lerPreview()` retorna o valor correto. Sem erros no
console.

## 2026-07-08 — Bloqueia salvar sem marcar status da "Data da tabela de preços"

Em `lancamentos.html`, dava pra salvar um lançamento sem marcar "Atualizada" ou "Desatualizada" no
campo "Data da tabela de preços" — o valor simplesmente ia em branco pro backend. Agora
`salvarLancamento()` bloqueia o salvamento (com toast de erro) se nenhuma das duas opções estiver
marcada, mesmo padrão de validação já usado pra nome do empreendimento/bairro/unidades.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: salvar sem marcar nenhuma opção mostra o toast de erro e não chega a chamar o
backend; marcando "Atualizada" o `lerPreview()` retorna `statusTabela` preenchido e o salvamento
segue normalmente. Sem erros no console.

## 2026-07-08 — Mesmo espelhamento em lancamentos-editar.html

O ajuste anterior ("Preço Total" = "Preço Máximo") só tinha sido aplicado em `lancamentos.html`.
Aplicado agora em `lancamentos-editar.html` também: "Preço total (R$)" de cada tipologia fica
somente leitura, sincroniza ao vivo com "Preço máximo / tabela (R$)", e o valor salvo vem direto de
`precoMax` (não do input).

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: `u1-precoTotal` nasce com o mesmo valor de `u1-precoMax`, é `readonly`, edição
manual em `u1-precoMax` propaga ao vivo, e `coletarUnidades()` retorna `precoTotal` igual a
`precoMax`. Sem erros no console.

## 2026-07-08 — "Preço Total" passa a espelhar "Preço Máximo" (lancamentos.html)

Na tabela "Bloco 2 — Unidades Referência", "Preço Total" era um campo manual independente. Agora é
somente leitura e sempre reflete o valor de "Preço Máximo" — atualiza ao vivo enquanto o usuário
digita no Máximo, e ao salvar o valor gravado vem direto de `precoMax` (não depende do campo
visual). Confirmado que "Plano de pagamento" já tinha sido removido dessa página no commit
anterior — nada a fazer ali.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: campo Preço Total nasce com o mesmo valor de Preço Máximo após extração,
`readonly` confirmado, edição manual em Preço Máximo propaga ao vivo pro Preço Total, e
`lerPreview()` retorna `precoTotal` igual a `precoMax` na unidade. Sem erros no console.

## 2026-07-08 — Paridade estrutural da página de extração da Orulo (lancamentos.html)

As mudanças estruturais de "Alterações 08/07" e da separação Tipo de Empreendimento/Tipo de
Produto tinham sido aplicadas só na página de Editar (`lancamentos-editar.html`). Agora
`lancamentos.html` (extração/captura de texto bruto da Orulo) tem a mesma estrutura:

- **Bloco "Plano de pagamento" removido** (Entrada, Parcelas em obra/entrega, Avaliação banco,
  FGTS, Outros planos) — mesmo campo que foi eliminado como "Dados comerciais" na Editar.
- **Tabela "Bloco 2 — Unidades Referência" reestruturada**: cada linha ganhou um seletor "Tipo de
  produto" (pré-preenchido com o tipo detectado no Bloco 1, editável por linha — permite misturar
  tipos na mesma tabela), campos Qd/Lt, Preço Total, Data da Tabela (pré-preenchida a partir da
  "Data da tabela de preços" detectada), e o plano de pagamento por tipologia (Ato/Entrada, Sinal,
  Mensais, Anuais, cada um com preço + quantidade). A coluna "Preço Manual" foi removida — "Preço
  máximo" agora manda pros dois campos (`precoMax` e `preco`), mesmo critério da Editar.
- Tabela ficou bem mais larga (25 colunas) — like antes, rola horizontalmente dentro do card.

Bug corrigido de passagem: os inputs da tabela eram lidos por **posição** (`v[0]`, `v[1]`...) —
frágil e já teria quebrado com as colunas novas. Trocado por seletor de classe CSS por campo
(`.t-tipo`, `.t-qd`, `.t-precoMedio` etc.), mais robusto a mudanças futuras na tabela.

Só frontend — não precisa reimplantar o Apps Script.

Testado no preview: extração com texto contendo "terreno" (tipo de produto e tipo de empreendimento
corretos, área jogada pra "Área terreno", campos "Outras informações" capturados); preenchimento
manual de Qd/Lt e plano de pagamento numa linha, refletido corretamente em `lerPreview()`; botão "+
Linha" cria linha nova com tipo/data da tabela pré-preenchidos a partir do Bloco 1; sem erros no
console em nenhum dos passos.

## 2026-07-08 — Campo "Tipo de Empreendimento" separado do "Tipo de Produto"

Em Empreendimentos, "Tipo" (Apartamento/Casa/Terreno/etc) descrevia o produto de cada tipologia,
mas ficava no nível do empreendimento inteiro — não dava pra ter, por exemplo, lotes e casas
prontas no mesmo condomínio com tipos diferentes. Agora:

- **"Tipo de Empreendimento"** (novo campo, em "Dados Gerais"): "Condomínio Horizontal" ou
  "Condomínio Vertical" — classificação do empreendimento inteiro.
- **"Tipo de Produto"** (renomeado de "Tipo", movido pra dentro de cada tipologia em
  "Tipologias / Unidades"): Apartamento/Casa/Sobrado/Cobertura/Loft/Studio/Terreno/Lote Condomínio
  Horizontal/Comercial — agora pode variar por tipologia.

Na extração de texto da Orulo (`lancamentos.html`), o tipo de produto detectado deriva o tipo de
empreendimento automaticamente: "terreno" → Condomínio Horizontal (assim como Casa/Sobrado);
"apartamento" → Condomínio Vertical (assim como Cobertura/Loft/Studio/Comercial). O campo fica
editável no preview antes de salvar, como os demais.

Corrigido de passagem: `lerPreview()` só considerava uma unidade da tabela do BOX 2 se "Área útil"
estivesse preenchida — unidades de Lote Condomínio Horizontal (só "Área terreno", sem área útil)
estavam sendo descartadas silenciosamente ao salvar. Agora aceita qualquer uma das duas áreas.

Backend (`code.txt`): `tipo` passou a ser lido por unidade (`u.tipo`) em vez de uma vez só pro
empreendimento inteiro; nova coluna `tipoEmpreendimento` anexada no fim de `CABECALHO_LANCAMENTOS`.

⚠️ Precisa reimplantar o Apps Script (mudança em `code.txt`) e rodar `migrarCabecalhoLancamentos()`
uma vez pra `tipoEmpreendimento` aparecer no cabeçalho da planilha.

Testado: suite Node atualizada confirmando `tipo` por unidade e `tipoEmpreendimento` no nível do
empreendimento; preview do formulário de edição com o novo select "Tipo de Empreendimento" em
Dados Gerais e "Tipo de Produto" dentro da tipologia; extração de texto com "terreno" (→ Condomínio
Horizontal) e "apartamento" (→ Condomínio Vertical), incluindo o caso antes quebrado de unidade só
com área terreno.

## 2026-07-08 — "Alterações 08/07": Lote Condomínio Horizontal, footer BaseImob, bug nav

Pacote de 8 mudanças pedidas pelo usuário:

1. **`lancamentos-editar.html` reestruturado**: "Identificação" + "Localização" viraram uma seção
   única "Dados Gerais", que também ganhou os campos antes em "Dados comerciais" (URL do site,
   foto, lazer, conceito) e os campos novos (Estoque, Total de unidades, Data de lançamento). Tipo
   ganhou a opção "Lote Condomínio Horizontal".
2. A seção "Dados comerciais" foi eliminada — entrada, parcelas em obra/entrega, avaliação
   bancária, FGTS, plano longo e status da tabela não existem mais no formulário nem são mais
   gravados.
3. "Tipologias / Unidades" ganhou: Qd (quadra) + Lt (lote) — juntos formam a "Unidade" — e um
   plano de pagamento por tipologia (Ato/Entrada, Sinal, Mensais, Anuais — cada um com preço e
   quantidade —, Preço Total e Data da Tabela, essa última agora por unidade em vez de por
   empreendimento inteiro). "Preço máximo" e "Preço tabela" viraram o mesmo campo.
4. **`lancamentos.html`** (extração de texto bruto da Orulo): "terreno" no texto sempre classifica
   o tipo como "Lote Condomínio Horizontal" (em vez do "Terreno" genérico), que por sua vez sempre
   entra como padrão "Médio". Estoque, Total de unidades e Data de lançamento passaram a ser
   extraídos do bloco "Outras informações". Quando o tipo é Lote Condomínio Horizontal, a metragem
   detectada vai para "Área terreno (m²)" em vez de "Área útil (m²)" (que só se aplica a
   apartamento/casa).
5. **BaseImob** (`baseimob-landing.html`, `baseimob-total.html`): rodapé fixo com aviso de juros e
   correções, mais uma nota por card citando o código da unidade específica (idOferta).
6. **Bug de navegação corrigido**: clicar em "BaseImob" no cabeçalho de qualquer página (Lançamentos,
   Busca Aberta, Formulário, Contatos, Favoritos, Insight) abria o Dashboard em vez da seção
   BaseImob — o link agora manda `?secao=baseimob` e `dashboard.html` lê esse parâmetro no
   carregamento pra abrir a seção certa.

Backend (`code.txt`) ganhou 14 colunas novas em `CABECALHO_LANCAMENTOS` (estoque, totalUnidades,
dataLancamento no nível do empreendimento; qd, lt, atoEntrada/Qtd, sinal/Qtd, mensais/Qtd,
anuais/Qtd, precoTotal por unidade) — como sempre, colunas só se ANEXAM no fim, sem desalinhar
dados existentes. **Depois de reimplantar, rode `migrarCabecalhoLancamentos()` uma vez no editor do
Apps Script** pra essas colunas aparecerem no cabeçalho da planilha (linhas já salvas continuam
intactas; só o cabeçalho de exibição precisa desse passo).

⚠️ Precisa reimplantar o Apps Script (mudança em `code.txt`).

Testado: suite Node (`eval` do `code.txt`) cobrindo o novo mapeamento de colunas em
`salvarLancamento_`; preview do formulário de edição com todos os campos novos preenchidos e
`coletarUnidades()` retornando o payload esperado; `extrairBloco1`/`extrairBloco2` com texto de
teste contendo "terreno" e o bloco "Outras informações"; navegação `dashboard.html?secao=baseimob`
abrindo a seção BaseImob direto.

## 2026-07-07 — Abas em Lançamentos: "Empreendimentos Cadastrados" | "Novo Lançamento"

`lancamentos.html` mostrava o formulário de extração ("Novo Lançamento") e a lista de
empreendimentos cadastrados sempre juntos, um embaixo do outro, na mesma rolagem. Agora são duas
abas separadas no topo da página — "Empreendimentos Cadastrados" (aba padrão ao abrir a página) e
"Novo Lançamento". Salvar um lançamento com sucesso volta automaticamente pra aba de
"Empreendimentos Cadastrados", pra já mostrar o item recém-criado na lista.

Só mudança de frontend (`lancamentos.html`) — não precisa reimplantar o Apps Script.

Testado no preview: aba "Empreendimentos Cadastrados" visível por padrão com a lista real
carregada; alternar pra "Novo Lançamento" mostra o formulário e esconde a lista; alternar de volta
funciona nos dois sentidos.

## 2026-07-07 — Card só considera a ação Ativa mais recente por cliente

Com o histórico permanente, um cliente pode acumular mais de uma entrada com `status='Ativa'` (se o
corretor cadastrar uma nova ação sem desativar a anterior). O card do Dashboard agora considera só a
**mais recente** por cliente — as demais, mesmo ativas, não aparecem mais (evita duplicar/confundir
com uma ação já superada). Se a mais recente estiver desativada mas existir uma mais antiga ainda
Ativa, essa mais antiga aparece (é a única Ativa que sobrou); se não houver nenhuma Ativa, o cliente
simplesmente não aparece no card.

Implementado com um map idCliente→linha em `adm_dados_insights`: como a aba é sempre preenchida em
ordem cronológica (`appendRow`), a última ocorrência Ativa lida pra um cliente já é a mais recente,
sobrescrevendo qualquer anterior no map antes do filtro de janela (vencida/hoje/próximos 7 dias) ser
aplicado.

Testado via Node: cliente com 2 Ativas mostra só a mais nova; cliente cuja mais nova foi desativada
mas tem uma mais antiga Ativa mostra essa antiga; cliente só com Inativa não aparece em lugar nenhum.

## 2026-07-07 — Fix: backfill das ações planejadas que existiam antes do histórico

Causa raiz do card sumir de novo: quando o histórico (`ACOES_PLANEJADAS`) foi introduzido, as ações
que o usuário já tinha cadastrado nos clientes (via os campos antigos `proximaAcao`/`proximaAcaoData`
em CONTATOS) nunca foram migradas pra lá — `registrarAcaoPlanejada_()` só dispara quando o valor
MUDA numa edição, e esses clientes não foram editados de novo depois da mudança de modelo. Card
ficava vazio porque a fonte nova (`ACOES_PLANEJADAS`) realmente não tinha nada.

Nova função `migrarAcoesPlanejadasExistentes_()` (rota `adm_migrar_acoes_planejadas`): varre CONTATOS
por linhas com `proximaAcaoData` preenchida e cria a entrada correspondente no histórico, usando
idCliente+data como chave pra não duplicar se rodar mais de uma vez. Adicionada à lista `FUNCOES` de
`index.html`, roda automaticamente a partir do próximo login "fresco" (sessão nova).

Testado via Node: primeira rodada migra os clientes com ação pendente, ignora os sem ação; segunda
rodada (idempotência) não duplica nada.

## 2026-07-07 — Reorganização visual do card "Ações Planejadas": "Hoje" em destaque

Reordenado e redesenhado: **Hoje** (esquerda, em destaque — número maior, caixa com fundo/contorno
próprio) com uma **lista embutida** mostrando nome do cliente + ação cadastrada direto no card (até
4 itens, "+N mais →" se houver mais); **Próximos dias** no meio; **Atrasadas** à direita. Antes as 3
colunas tinham o mesmo peso visual e nenhuma mostrava conteúdo sem clicar em "Ver" — agora o que
precisa de atenção imediata (hoje) já aparece resumido sem precisar navegar pra outra tela.

Só mudança de frontend (`dashboard.html`) — não precisa reimplantar o Apps Script.

Testado no preview: contagens corretas, lista embutida de "hoje" limitada a 4 itens com "+N mais"
levando à lista completa, ordem das colunas confirmada no DOM (hoje → próximos dias → atrasadas).

## 2026-07-07 — Histórico de "Ações Planejadas" na ficha do cliente + desativação sem perder o registro

Mudança de modelo de dados: até aqui `proximaAcao`/`proximaAcaoData` em CONTATOS guardavam só "a
ação atual", sobrescrita a cada edição — sem histórico. Nova aba **ACOES_PLANEJADAS** é um log
permanente: toda vez que o corretor define ou troca a próxima ação planejada de um cliente (via
`formulario.html`), uma linha NOVA é adicionada, para sempre. "Desativar" só muda o `status` da
linha pra `'Inativa'` — nunca apaga, então o histórico completo continua visível na ficha do cliente
mesmo depois de desativado.

- `salvar()`/`atualizar()` chamam `registrarAcaoPlanejada_()` só quando a ação ou a data realmente
  mudou nesta edição (mesmo padrão de "só loga quando muda" já usado em `pipelineData`) — evita
  duplicar entradas a cada save que não mexeu nisso.
- `adm_dados_insights` (card do Dashboard) passou a ler de ACOES_PLANEJADAS filtrando
  `status='Ativa'`, em vez de CONTATOS diretamente — uma ação desativada some do card imediatamente,
  sem precisar apagar nada.
- Nova seção **"Ações Planejadas"** no drawer do cliente (`dashboard.html` e `contatos.html`), logo
  abaixo de "Próximos passos": lista todo o histórico daquele cliente, mais novo primeiro, com botão
  "Desativar" em cada entrada ativa (atualiza a linha na hora, sem recarregar a página).
- Novas rotas: `listar_acoes_planejadas&idCliente=X` (GET) e `desativar_acao_planejada` (POST).

Testado via Node: registro na criação e na edição (só quando muda), não duplica em edições que não
mexem na ação, histórico ordenado mais novo→mais antigo, desativar marca só a linha certa (as
demais do mesmo cliente continuam Ativa), e `adm_dados_insights` ignora corretamente entradas
Inativas. Testado no preview: seção do drawer renderiza histórico completo, botão "Desativar"
atualiza a entrada in-place em `dashboard.html` e `contatos.html`.

## 2026-07-07 — Card "Ações planejadas" ganha 3 colunas (atrasadas / hoje / próximos 7 dias)

Reformulado de um número único ("urgentes" + texto mencionando futuras) pra 3 colunas
independentes, cada uma com sua contagem e seu próprio "Ver →": **Atrasadas** (vermelho),
**Hoje** (âmbar) e **Próximos 7 dias** (verde-água). Clicar em qualquer "Ver" filtra a mesma lista já
carregada (sem nova chamada ao backend) e abre `insight-detail.html` só com aquela categoria. Coluna
com contagem 0 fica com o "Ver" desabilitado (cinza, sem clique). O card inteiro continua oculto
quando as 3 contagens são zero.

Só mudança de frontend (`dashboard.html`) — não precisa reimplantar o Apps Script.

Testado no preview: contagens corretas por categoria, cada "Ver" filtra exatamente o subconjunto
certo, colunas zeradas ficam desabilitadas, card oculto quando não há nenhuma ação nas 3 categorias.

## 2026-07-07 — Fix crítico: `adm_dados_insights` quebrado em produção (afetava todos os cards de Insights, não só "Ações planejadas")

Causa raiz do card "Ações planejadas" nunca aparecer: a rota `adm_dados_insights` usava
`SpreadsheetApp.getActiveSpreadsheet()`, que devolve `null` quando o script roda como Web App (fora
do contexto de "planilha aberta" no navegador). Isso derrubava a rota inteira logo na primeira linha
(`ss_.getSheetByName('CONTATOS')` em cima de `null`), capturado silenciosamente pelo `catch` — sem
nenhum aviso visível. **Isso significa que os cards de Insights v2 (Dormentes, Esfriando, bairro top,
canal top, leads) também estavam quebrados**, não só o novo card de Ações planejadas — só não tinha
sido notado ainda.

Fix: trocado por `SpreadsheetApp.openById(SHEET_ID)`, o mesmo padrão usado em todo o resto do projeto
(`getAba()` e as demais rotas). Diagnosticado com a ajuda do usuário chamando `adm_dados_insights`
direto pela URL e vendo o erro cru: `TypeError: Cannot read properties of null (reading
'getSheetByName')`.

Testado via Node (mock de `SpreadsheetApp.openById` no lugar de `getActiveSpreadsheet`, mesma
suíte de testes de `acoesPlanejadas` já existente, todos passando).

## 2026-07-07 — Bloco de destaque para pipeline/relacionamento na Etapa 1 do formulário

Os campos "Estágio no pipeline", "Próxima ação planejada" e "Data planejada" ganharam um bloco
visual próprio (`.bloco-relacionamento`) no topo da Etapa 1 — fundo e contorno em âmbar, separado
dos dados básicos do cliente (Nome, Telefone, etc.) logo abaixo. Objetivo: deixar claro que esses
campos são sobre gestão do relacionamento/funil, não sobre a identificação do cliente em si — visual
consistente com a cor já usada pra "Modificado"/"Perda" em outras partes do app.

Só mudança de frontend (`formulario.html`) — não precisa reimplantar o Apps Script.

## 2026-07-07 — Fix: "Data planejada" não aparecia ao reabrir o cliente

Causa raiz: mesmo problema de auto-conversão do Sheets já visto antes neste projeto
(`dataAtualizacao`/`pipelineData`). O Sheets converte "15/07/2026" gravado em `proximaAcaoData` pra
um Date de verdade sozinho; ao voltar pro navegador pela rota `buscar` (usada por `carregarContato`),
o `JSON.stringify` do backend serializa esse Date como ISO ("2026-07-15T00:00:00.000Z"), não como
"dd/MM/yyyy". `dataBrParaIso_` só reconhecia o formato BR — falhava silenciosamente (`set()` não
atribui valor vazio) e deixava o campo em branco ao reabrir o formulário, mesmo com o dado gravado
corretamente na planilha.

Fix: `dataBrParaIso_` agora aceita os dois formatos (ISO e "dd/MM/yyyy"), mesmo padrão dual-format
já usado em `parseDataBr_` (contatos.html/dashboard.html). Só mudança de frontend — não precisa
reimplantar o Apps Script.

Testado no preview: conversão cobre ISO com hora/timezone, ISO sem hora, "dd/MM/yyyy" puro e
vazio/nulo; `carregarContato()` com uma data simulando exatamente o retorno real (ISO) agora
preenche o campo corretamente.

## 2026-07-07 — Card "Ações planejadas" ganha destaque próprio abaixo do Pipeline

Usuário achou o card difícil de achar — estava misturado na grade genérica de "Insights" (mesmo
nível visual de Dormentes/Esfriando/canal top/etc, bem abaixo na página). Virou um card único, de
largura cheia, direto abaixo de "🔥 Pipeline de Negociações": ícone + número + rótulo + "Ver →",
borda de destaque, clicável. Fica oculto quando não há nenhuma ação vencida/hoje/próximos 7 dias
(não aparece um card vazio "0"). A entrada correspondente na grade genérica de Insights foi removida
(não fica duplicado em dois lugares).

Só mudança de frontend (`dashboard.html`) — não precisa reimplantar o Apps Script, só aguardar o
GitHub Pages.

## 2026-07-07 — Card "Ações planejadas" também mostra prévia dos próximos 7 dias

Usuário agendou 2 ações pra semana seguinte e o card não mudou — comportamento esperado (só contava
vencidas/hoje), mas o usuário pediu pra também mostrar uma prévia da semana. `adm_dados_insights`
passou a trazer vencidas + hoje + próximos 7 dias (`diasAteVencimento_(...) >= -7`, antes era `>= 0`)
numa lista só. O Dashboard separa em duas leituras a partir do sinal de `dias`: número principal do
card = urgentes (vencida ou hoje, `dias >= 0`); rótulo ganha "· +N nos próximos 7 dias" quando há
itens futuros na janela. Em `insight-detail.html`, `tableAcoes` ganhou o terceiro estado de badge:
vermelho "Venceu há N dias" (dias>0), âmbar "Vence hoje" (dias=0), azul "Em N dias" (dias<0).

Testado via Node (janela de 7 dias inclui a de 5 dias no futuro, exclui a de 10 dias) e via preview
(card com as duas contagens, lista de detalhe com os 3 estados de badge).

## 2026-07-07 — Remove caixa de diagnóstico do painel de atualização do portfólio

A caixa "🔍 Consultar na Imobzi" (campo de código + resultado JSON) era uma ferramenta temporária de
diagnóstico, adicionada só pra investigar o imóvel Cód. 3468 sem precisar de F12/Console. O problema
já foi identificado e corrigido (retry em `buscarPaginaImobzi_`), então ela não tinha mais função —
removida do painel "Atualização do portfólio" (HTML, CSS e a função `consultarImovelDiag`). A rota
de backend `adm_debug_imovel_revenda` foi mantida (não afeta a UI, pode ser útil de novo no futuro).

## 2026-07-07 — "Próxima ação planejada" + card de lembretes (Etapa 7 · Relacionamento)

Campo simples na ficha do cliente — sem estrutura complexa de propósito: `proximaAcao` (texto livre)
+ `proximaAcaoData` (data). Adicionado na Etapa 1 do formulário, ao lado do estágio do pipeline.
Data gravada como "dd/MM/yyyy" (mesma convenção do resto do projeto — evita o parser ambíguo do JS
pra string não-ISO); o `<input type="date">` nativo usa "yyyy-MM-dd", então o formulário converte
nos dois sentidos (`dataIsoParaBr_`/`dataBrParaIso_`) na hora de salvar/carregar.

Novo card "📅 Ações planejadas" na seção de Insights do Dashboard, mesmo padrão de "Esfriando"/
"Dormentes": mostra quantos clientes têm ação vencida ou vencendo hoje (`adm_dados_insights` calcula
isso no backend, com `diasAteVencimento_` — comparação por dia, não por timestamp, pra "vence hoje"
não oscilar entre 0 e 1 dependendo da hora em que a rota roda). Clicar abre a lista completa em
`insight-detail.html` (novo `type: 'acoes'`), com badge vermelho "Venceu há N dias" ou âmbar "Vence
hoje" por cliente.

Testado via Node (`adm_dados_insights` retorna só as ações vencidas/de hoje, ignora as futuras e as
sem data, ordena da mais atrasada pra mais recente) e via preview (card no Dashboard, navegação pra
lista detalhada, round-trip completo do formulário incluindo a conversão de formato de data).

## 2026-07-07 — Sinal de estagnação no pipeline (!/!!) + estágio "Perda"

Etapa 6 (Ação) do framework de decisão de compra: o pipeline (Urgentes→Ganhos) já existia, mas não
tinha nenhum sinal de que um cliente travou num estágio. Agora:

- Novo campo `pipelineData` em CONTATOS — registra quando o cliente ENTROU no estágio atual (não
  confundir com `dataAtualizacao`, que muda em qualquer edição do cadastro). `salvar()`/`atualizar()`
  só reiniciam essa data quando o campo `pipeline` de fato muda; `salvarPipeline_()` (troca rápida
  pela lista/tabela) sempre reinicia, já que é sempre uma mudança intencional.
- Funil do Dashboard mostra `!` ao lado do nome com 5+ dias no mesmo estágio, `!!` com 15+ dias
  (tooltip com a contagem exata). Cliente sem `pipelineData` (cadastro antigo, migrado antes desse
  campo existir) não recebe sinal nenhum — não acusa estagnação sem dado real.
- Novo estágio **"Perda"** disponível nos seletores de pipeline (`formulario.html`, `contatos.html`)
  — de propósito **sem card no funil do Dashboard**: serve só pra registrar o motivo sem perder o
  dado do cliente, para análises futuras, sem poluir a visão operacional do funil ativo.

Testado via Node: `salvar()` com pipeline definido na criação já marca `pipelineData`; `atualizar()`
sem mudar o estágio preserva a data antiga; mudando o estágio, reinicia; `salvarPipeline_()` idem;
`pipeline_dados` calcula os dias corretos por cliente e confirma que "Perda" nunca aparece em nenhuma
coluna do funil. Testado também no preview: sinal `!`/`!!` renderizando certo por cliente, e "Perda"
presente nos dois seletores de pipeline (round-trip salvar → carregar confirmado).

## 2026-07-07 — Responsividade mobile em todas as páginas internas

Passada completa de responsividade, testada em viewport 375×812 (mobile) em todas as 12 páginas do
projeto. Duas classes de problema apareciam repetidas em quase toda página (o header é copiado em
cada arquivo, não existe CSS compartilhado):

1. **Cabeçalho cortado**: `.nav-tabs` (Formulário/Dashboard/Busca Aberta/Lançamentos/BaseImob/ADM)
   não cabia ao lado da logo + botões da direita, cortando abas sem nenhum jeito de alcançá-las.
   Fix aplicado em `dashboard.html`, `contatos.html`, `busca.html`, `formulario.html`,
   `insight-detail.html`, `favoritos.html`, `lancamentos.html` e `lancamentos-editar.html`:
   `.nav-tabs` ganhou `overflow-x:auto` + scroll suave (rola por dentro, sem quebrar a página),
   `.logo`/botões da direita ganharam `flex-shrink:0` (não encolhem, sobra espaço garantido pro
   nav-tabs). Em `formulario.html`, que tem um terceiro bloco concorrendo no header (toggle
   Novo/Atualizar), isso ainda deixava o nav-tabs com ~10px de largura — cabeçalho passou a quebrar
   em 2 linhas nesse caso (`flex-wrap` + nav-tabs em `flex-basis:100%`).

2. **Tabelas largas**: `dashboard.html` (tabela Último/Modificado/Novo/Variação) ganhou um wrapper
   com `overflow-x:auto` — as demais (`contatos.html`, `insight-detail.html`, `lancamentos.html`) já
   tinham esse padrão implementado corretamente.

Bug real encontrado e corrigido em `busca.html`: `.painel` (coluna de filtros) usa `position:sticky`
pensado pro layout desktop de 2 colunas — empilhado numa coluna só no mobile (breakpoint já existente
`max-width:900px`), isso fazia o painel "flutuar" por cima dos resultados ao rolar a página. Vira
bloco estático nesse breakpoint.

Cards (`.cards-row` no Dashboard) ganharam breakpoint extra em telas muito estreitas (1 coluna abaixo
de 420px) e `.card-label` ganhou `padding-right` pra não ficar embaixo do badge "Ver →" quando o
texto quebra em 2 linhas.

`busca.html`, `formulario.html`, `insight-detail.html`, `favoritos.html`, `lancamentos.html` e
`lancamentos-editar.html` já tinham a maior parte do layout preparado pra mobile (grids com
`auto-fill`/breakpoints, painéis com `max-width:100%`, tabelas com wrapper de scroll) — só faltava o
cabeçalho. `index.html`, `reset.html`, `baseimob-landing.html` e `baseimob-total.html` já estavam
bem construídas pra mobile e não precisaram de nenhuma mudança.

Testado via preview em 375×812 em todas as páginas (sem overflow horizontal de página em nenhuma,
confirmado por `document.documentElement.scrollWidth === clientWidth`), incluindo fluxos com dados
reais/simulados: cards do Dashboard, funil do pipeline, tabela de variação, drawer de cliente,
resultados e painel de favoritar da Busca Aberta, todas as 5 etapas do formulário, lista de
favoritos, cards e tabela de unidades de lançamentos.

## 2026-07-07 — Causa raiz do imóvel Cód. 3468 ausente: retry na busca da Imobzi + painel de diagnóstico no Dashboard

Investigação concluída: `adm_debug_imovel_revenda&codigo=3468` mostrou o imóvel com `status:
"available"`, `active: true`, `sale_value: 7400000` — passa no filtro atual sem problema.
`site_publish: false`, mas isso nunca bloqueou nada no nosso código (nem deveria — controla só a
publicação no site público da imobiliária, não o portfólio interno). A causa real era outra:
`buscarTodosImoveis_()` desistia da sincronização inteira (silenciosamente, só com `Logger.log`) no
primeiro erro de rede/timeout numa página da API da Imobzi — o que podia deixar de fora qualquer
imóvel que estivesse nas páginas seguintes, sem avisar ninguém.

Fix: nova função `buscarPaginaImobzi_(url, headers)` com até 3 tentativas (backoff de 1s/2s) antes
de desistir de uma página, usada tanto em `buscarTodosImoveis_()` quanto em `debugImovelRevenda_()`.
Comentário adicionado explicando por que `site_publish` é intencionalmente ignorado no filtro.

Também adicionado um painel de diagnóstico direto no Dashboard (dentro de "Atualização do
portfólio"): campo pra digitar o código do imóvel + botão "🔍 Consultar na Imobzi", mostrando o JSON
cru na própria tela — evita precisar usar F12/Console do navegador pra rodar `adm_debug_imovel_revenda`
manualmente.

Testado via Node (retry com falha-depois-sucesso e com 3 falhas seguidas, sem travar) e via preview
(painel de diagnóstico exibindo o JSON formatado na tela).

## 2026-07-07 — Rota de diagnóstico para imóvel ausente na sincronização (ex: Cód. 3468)

Usuário relatou que imóveis ativos na Imobzi mas não marcados "publicar no site" também deveriam
entrar como disponíveis (ex: código 3468). Conferindo o código: `publicadoSite` NUNCA é usado como
filtro em `buscarTodosImoveis_()` — o filtro atual é só `saleValue > 0 && status === 'available' &&
active !== false`. Ou seja, a causa real provavelmente não é `site_publish` diretamente, e sim algum
valor de `status` da Imobzi que não é `'available'` para esses imóveis (a API da Imobzi não foi
inspecionada ao vivo pra confirmar).

Antes de alterar o filtro "no escuro" e arriscar incluir imóvel vendido/reservado por engano,
adicionei uma rota de diagnóstico: `adm_debug_imovel_revenda&codigo=XXXX` — busca o imóvel direto na
API da Imobzi (sem aplicar o filtro) e retorna os campos crus (`status`, `active`, `site_publish`,
`sale_value`, etc.) pra decidir o fix certo com base no dado real, não em suposição.

## 2026-07-07 — "obs:" com o que mudou em cada imóvel modificado

Complementa a detecção de "Modificado" desta mesma sessão: agora `revenda_diff` também descreve
QUAIS campos mudaram e os valores antes/depois (`descreverMudancas_`, usando os rótulos de
`CAMPOS_LABEL_REVENDA`) — anexado como `_mudancas` em cada item de `modificados`. Ex: "Preço alterou
de R$ 500.000 para R$ 550.000". Campos cujo valor bruto não ajuda a leitura (`urlSite`, `foto`,
`latitude`, `longitude`) só avisam que mudaram, sem despejar a URL/coordenada na tela.

Em `insight-detail.html`, a lista de imóveis (`tableImoveis`) ganhou uma linha "obs: ..." abaixo de
cada imóvel com `_mudancas`, juntando todas as mudanças daquele imóvel numa linha só, em itálico
âmbar — sem quebrar o alinhamento das colunas (usa `colspan`).

Testado via Node (`descreverMudancas_` com bairro+preço alterados e um campo "somente aviso")
e via preview (linha "obs:" renderizando corretamente só nos itens modificados, itens novos sem a
linha extra).

## 2026-07-07 — Detecção de imóveis modificados + colunas Último/Modificado/Novo/Variação

Até aqui, `revenda_diff` só comparava por presença/ausência do `codigo` — um imóvel que teve o
preço (ou qualquer outro campo) alterado, mas continuou na base, não aparecia em lugar nenhum do
painel: não era "novo" nem "removido". Agora existe uma terceira categoria, "Modificado": mesmo
código presente no registro "Último" e no atual, mas com pelo menos um campo de conteúdo diferente
(`imovelMudou_`, comparando `tipo/finalidade/bairro/cidade/endereco/condominio/quartos/suites/
banheiros/vagas/areaUtil/areaTerr/valorVenda/padrao/estagio/publicadoSite/urlSite/foto/latitude/
longitude` — de propósito SEM `dataAtualizacao`/`ultimaSincronizacao`, que mudam em toda sincronização
e fariam tudo parecer "modificado" sempre).

Colunas da tabela renomeadas/reorganizadas: **Tipo | Último | Modificado | Novo | Variação**
(antes era Tipo/Antes/Depois/Variação). "Último" é o mesmo registro congelado por 12h já existente;
"Modificado" e "Novo" são caixas clicáveis como a "Variação" já era, cada uma abrindo a lista
filtrada daquela categoria específica em `insight-detail.html` (`verRevendaDiffTipo(tipo, categoria)`).
O card "Novidades" da Visão geral passou a somar `adicionados + modificados`, e não só os novos.

Testado via Node (cenário com imóvel modificado, removido, novo e um sem alteração — cada um cai na
categoria certa e o `delta` por tipo bate) e via preview (tabela com as 5 colunas certas, cliques
abrindo a lista filtrada por categoria, card de Novidades somando novo+modificado, badge "Modificado"
em âmbar em `insight-detail.html`).

## 2026-07-07 — Registro "Antes" congelado por 12h

Mudança de comportamento pedida pelo usuário: antes, cada `sincronizarRevenda()` (gatilho de 6h ou
clique manual em "Sincronizar revenda") sobrescrevia o "antes" com o "depois" da sincronização
anterior — ou seja, sincronizar duas vezes seguidas sempre zerava a variação, mesmo que nada tivesse
mudado de fato entre elas. Agora o snapshot "Antes" fica congelado por 12h (`JANELA_ANTES_MS`):
qualquer sincronização dentro dessa janela só atualiza a coluna "Depois"; só quando as 12h expiram é
que o "Depois" atual passa a ser o novo "Antes" e a janela reinicia.

Implementado com uma âncora de tempo em `PropertiesService` (`bi_revenda_ancora_ts`) — quando
`agora - ancora >= 12h` (ou não existe âncora ainda), a aba REVENDA_ANTERIOR é atualizada e a âncora
avança; caso contrário, REVENDA_ANTERIOR não é tocada. `revenda_diff` agora também retorna
`antesDesde` (quando a âncora atual foi fixada), exibido no painel do Dashboard como "Registro
'Antes' congelado desde ... (renova a cada 12h)" — pra deixar claro por que sincronizar de novo não
muda a coluna Antes.

Testado via Node simulando 3 sincronizações (imediata, +1h, +13h): confirma que a 2ª sync dentro da
janela não altera REVENDA_ANTERIOR nem a âncora, e a 3ª sync (após 12h) rola a janela corretamente,
usando o "depois" da sync anterior como o novo "antes".

## 2026-07-07 — Botão "Sincronizar revenda" no painel de atualização do portfólio

Novo botão no topo da seção "Atualização do portfólio" do Dashboard, chamando a rota já existente
`adm_sincronizar_revenda` (mesma usada no fluxo de inicialização do `index.html`) — não precisa mais
esperar o gatilho automático de 6h para forçar uma sincronização manual com o Imobzi.

O painel deixou de ficar oculto até existir uma sincronização anterior (`renderRevendaDiff` tinha um
early-return que escondia o painel inteiro sem `ultimaSync` — o que impedia rodar a primeira
sincronização pela própria tela). Agora o painel sempre aparece com o botão; a tabela Antes/Depois/
Variação só é exibida quando já existe algum histórico.

Testado via preview: painel visível mesmo sem sincronização prévia, clique dispara
`adm_sincronizar_revenda`, mostra spinner, toast de sucesso/erro, e reconstrói o painel com os dados
atualizados (`revenda_diff`) ao final.

## 2026-07-07 — Fix: colunas do pipeline mostravam só o primeiro nome

`pipeline_dados` cortava o nome do cliente em `nome_.split(' ')[0]` antes de mandar pro card do
funil no Dashboard — o `.pip-name` já suporta texto longo (`text-overflow:ellipsis` + `title` com o
nome completo no hover), então o corte era só um resquício, não uma limitação de layout. Agora o
campo `nome` enviado é o nome completo cadastrado (igual a `nomeCompleto`).

Testado via Node (`pipeline_dados` retorna o nome completo) e via preview (`.pip-name` renderiza o
nome completo no card).

## 2026-07-07 — Estágio do pipeline na Etapa 1 do formulário

Adicionado um select "Estágio no pipeline" na Etapa 1 (Identificação) do `formulario.html`, antes
do campo Nome, com as mesmas 5 opções já usadas no funil do Dashboard (Urgentes, Pós-Visita,
Agendar Visita, Pré-Atendimento, Ganhos). Nenhuma mudança de backend foi necessária: a coluna
`pipeline` já existe em `CABECALHO` e `salvar()`/`atualizar()` já gravam qualquer campo presente no
payload genericamente — bastou incluir `pipeline` no payload de `saveClient()` e preencher o select
ao editar um contato existente (`carregarContato()`).

Isso complementa o select rápido de pipeline que já existia nos resultados de busca da Etapa 1
(usado para mudar o estágio sem abrir o cadastro completo) — agora também é possível definir/editar
o estágio dentro do próprio formulário de cadastro.

Testado via preview: select aparece antes do campo Nome com as opções certas, o valor escolhido vai
no payload salvo, e reabrir um contato existente preenche o select com o estágio salvo.

## 2026-07-07 — Card "Novidades" na Visão geral

Novo card na seção "Visão geral" do Dashboard, ao lado de Quentes/Mornos/Frios: mostra o total de
imóveis novos identificados na coluna "Variação" do painel "Atualização do portfólio" (hoje só
REVENDA — a mesma lógica pode ser somada para LANÇAMENTOS quando aquele diff existir lá também).
O card carrega em "—" e é atualizado assim que `carregarRevendaDiff()` resolve (`atualizarCardNovidades_`);
clicar abre `insight-detail.html` com a lista dos imóveis novos (reaproveitando o `type: 'imoveis'`
criado para o painel de variação).

`tableImoveis` em `insight-detail.html` ganhou uma coluna "Fonte" (REVENDA/LANÇAMENTO) para já
acomodar a extensão futura sem precisar tocar na página de novo.

Testado via preview: card atualiza de "—" para a contagem correta, botão "Ver →" aparece só quando
há novidades, e a navegação leva à lista com os itens certos e a coluna Fonte preenchida.

## 2026-07-07 — Caixa clicável de variação no painel "Atualização do portfólio"

Na seção "Atualização do portfólio" do Dashboard, a coluna "Variação" agora mostra o número dentro
de uma caixa destacada (`.diff-box`, verde/vermelha conforme sinal) — tanto nas linhas por tipo
quanto na linha Total. Clicar na caixa abre `insight-detail.html` com a lista dos imóveis
específicos que entraram (Adicionado) ou saíram (Removido) do portfólio desde a última
sincronização, filtrada pelo tipo daquela linha (ou todos os tipos, na linha Total).

Backend: `sincronizarRevenda()` passou a copiar a aba REVENDA inteira (linhas completas, não só a
contagem por tipo) para uma aba espelho `REVENDA_ANTERIOR` antes de sobrescrever, substituindo o
snapshot agregado que ficava em `PropertiesService`. A rota `revenda_diff` agora compara
REVENDA_ANTERIOR × REVENDA por `codigo` (nova função `linhasComoObjetos_`) e retorna `adicionados`/
`removidos` com os registros completos, além de manter `delta`/`totalAntes`/`totalDepois` como
antes (compatibilidade com a tabela existente).

Testado via Node (diff por código com casos de imóvel que permanece, sai e entra) e via preview do
navegador (renderização das caixas com onclick correto, filtragem por tipo ao clicar, e exibição da
lista em `insight-detail.html` com o novo tipo `imoveis`).

## 2026-07-07 — Favoritar em lote na Busca Aberta

Novo botão "⭐ Favoritar" na barra de seleção de `busca.html` (ao lado de "Gerar PDF"), habilitado
junto com a seleção de imóveis. Abre um painel lateral (`.fav-overlay`/`.fav-painel`, mesmo padrão
visual do drawer de cliente) listando os imóveis marcados e um campo de busca de cliente por nome
ou código.

Backend: rota `buscar` (GET) passou a casar também por `idCliente`, e nova rota
`adicionar_favorito` (`adicionarFavorito_`) faz adição idempotente na aba FAVORITOS — nunca remove,
diferente do `toggleFavorito_` usado no botão de estrela individual (evita desfavoritar por acidente
numa ação em lote). `toggleFavorito_` foi refatorado para compartilhar a busca de linha existente
(`encontrarLinhaFavorito_`) com a nova função.

Mapeamento de campos: para imóveis de `fonte === 'LANCAMENTO'`, usa `idOferta` como `imoCodigo`
(esses itens não têm `codigo` preenchido) e usa `precoMin` como fallback de `imoValorVenda`. Os
favoritos salvos aparecem automaticamente no botão "⭐ Favoritos (N)" do drawer e na página
`favoritos.html`, já que reaproveitam a mesma aba/infra existente.

Testado via Node (`adicionarFavorito_`/`toggleFavorito_` idempotência) e via preview do navegador
(abertura do painel, busca de cliente com fetch mockado, payload de salvamento com mapeamento de
campos para REVENDA e LANCAMENTO).

## 2026-07-06 — `code.txt` confirmado como arquivo canônico único; `Code.gs.txt` removido de novo

Usuário confirmou: `code.txt` é o arquivo oficial do backend daqui pra frente. `Code.gs.txt`
(recriado pela outra estação durante o merge desta sessão) removido de novo, já confirmado idêntico
via `diff` antes de apagar.

## 2026-07-06 — Merge com trabalho em paralelo (Pipeline, revenda_diff, contagem de favoritos)

Outra estação pushou 5 commits enquanto a parte 20 estava sendo feita: Pipeline de Negociações
(funil heatmap no dashboard + coluna select em `contatos.html` + rotas `pipeline_dados`/
`salvar_pipeline`), painel de atualização do portfólio de revenda (rota `revenda_diff`), e uma
caixa de contagem de favoritos ao lado dos matches no dashboard (`item.favs`, lendo a aba
FAVORITOS). Sem conflito de merge a nível de texto — as mudanças de cada lado ficaram em blocos
diferentes dos mesmos arquivos (ex: meu fix de `tel`/`ultimoContato` e o `item.favs` deles estão
em pontos diferentes de `dadosDashboard()`).

Validado rodando toda a suíte de testes de regressão da sessão contra o código mesclado — todos
passaram — mais os testes de renderização do drawer/favoritos em `contatos.html`/`dashboard.html`.

**Pendência**: a outra estação recriou `Code.gs.txt` e o declarou "fonte de verdade", contrariando
a consolidação em `code.txt` único aprovada pelo usuário antes nesta sessão. Sincronizei os dois
arquivos por ora (idênticos) pra não ficarem divergindo, mas qual dos dois deve ser o canônico daqui
pra frente ainda precisa ser decidido com o usuário.

## 2026-07-06 (parte 20) — Fix: coluna "Último contato" vazia nas telas "Ver" de Quentes/Mornos/Frios

Consequência direta da parte 19: os arrays `quentes`/`mornos`/`frios` de `dadosDashboard()` nunca
incluíam `telefone`/`ultimoContato` no `item` (só `cod/nome/score/scoreTotal/seg/pad/urg`) — por
isso as colunas Telefone e Último contato apareciam sempre com "—" nas páginas "Ver" novas, mesmo
com o dado presente na planilha. Adicionado `tel: obj.telefone || ''` e
`ultimoContato: obj.ultimoContato || ''` ao `item`.

## 2026-07-06 (parte 19) — Botão "Ver" em todos os cards de "Visão geral"

Pedido do usuário: os cards Quentes/Mornos/Frios (só "Total de contatos" já tinha) ganharem botão
"Ver", abrindo uma página com a listagem dos nomes qualificados.

Em vez de criar 3 páginas novas do zero, reaproveitado o mecanismo já existente dos cards de
Insight: `window._insightDetails['cardQuentes'|'cardMornos'|'cardFrios']` (populado em
`renderDados()`, com os mesmos arrays `quentes`/`mornos`/`frios` que já alimentam as colunas do
"Matches do momento") + `verInsight(id)` + `insight-detail.html` — que já é exatamente uma página
genérica de "listagem de clientes qualificados" (`tableClientes()`), usada em vários outros
insights.

Os itens desses arrays trazem `cod/nome/score/scoreTotal/seg/pad/urg` (sem telefone/último
contato — dado não computado nessa etapa do backend); `tableClientes()` já mostra "—" nesses casos
graciosamente.

Validado no preview: os 4 cards mostram "Ver →", `verInsight('cardQuentes')` grava os dados certos
no sessionStorage, e `insight-detail.html` renderiza a tabela corretamente com o item de teste.

## 2026-07-06 (parte 18) — Botão "Favoritos" do drawer mostra a contagem de imóveis marcados

Pedido do usuário: no botão de Favoritos da página do cliente, informar quantos imóveis já estão
marcados como favorito.

Botão ganhou `id="btnFavoritos"` (em `dashboard.html` e `contatos.html`, já que o drawer foi
duplicado nos dois). `carregarMatchesDrawer()` já busca a lista de favoritos em paralelo com os
matches — só precisou usar esse número (`favoritos.length`) pra atualizar o texto do botão pra
"⭐ Favoritos (N)" assim que a busca termina. Favoritar/desfavoritar um card no próprio drawer
ajusta a contagem na hora (+1/-1), sem precisar rebuscar a lista inteira.

Validado com testes em Node em ambos os arquivos: contagem inicial correta ao abrir o drawer, e
ajuste correto após desfavoritar um item.

## 2026-07-06 (parte 17) — Drawer do cliente portado inteiro pra dentro de contatos.html

Usuário confirmou (depois do "Ver Matchs" ainda não abrir nada): quer a aba lateral abrindo direto
em `contatos.html`, sem navegar pra outra página. A abordagem da parte 15/16 (redirecionar pra
`dashboard.html?abrirCliente=1&...`) foi abandonada.

**O que mudou**: todo o mecanismo do drawer (~450 linhas de CSS/HTML/JS) foi duplicado de
`dashboard.html` pra dentro de `contatos.html` — `abrirDrawer()`, `fecharDrawer()`,
`abrirCliente()`, `renderDrawer()`, `carregarMatchesDrawer()`, `gerarMensagemOferta_()`,
`toggleFavoritoClick()`, `chaveFavorito_()`, `copiarTexto_()`, `excluirCliente_()`, `val()`,
`campo()`, `norm_()`, mais o CSS de `.drawer*`, `.d-*`, `.imovel-*`, `.tag-chip`, `.tipo-badge`,
`.dot-anim`. Botão "Ver Matchs" agora chama `abrirCliente()` local em vez de redirecionar.

Duas adaptações na cópia (não são só copiar-colar):
- `fmt_()` (formata R$) renomeado pra `fmtValor_()` pra não colidir com o `formatarDataDisplay_`/
  outras funções já existentes em `contatos.html`.
- `excluirCliente_()` chama `carregar()` (a função de recarregar a lista já existente em
  `contatos.html`) em vez de `carregarDados()` (específica do dashboard, não existe aqui).
- `rodapeDrawerCliente_()` reaproveita o `formatarDataDisplay_()` já existente em `contatos.html`
  em vez de duplicá-lo — só ajustada a checagem de "sem data", já que a versão local desse helper
  retorna `'—'` (não `''`) pra string vazia.

Como consequência, `verificarDeepLinkCliente_()` e as duas chamadas a ela em `dashboard.html`
(adicionadas na parte 15 especificamente pra esse redirecionamento) ficaram órfãs — removidas.

Validado com testes em Node cobrindo o fluxo completo: abrir cliente → busca → render dos dados →
matches → rodapé com data de cadastro → fechar; e separadamente favoritar (toggle) e excluir
cadastro (confirmando que chama `carregar()`, não `carregarDados()`).

## 2026-07-06 (parte 16) — Nome deixa de ser link em contatos.html; botão "Ver Matchs" no lugar

Usuário reportou que clicar no nome (parte 15, item 19) não abria o drawer do cliente. Em vez de
depurar mais a fundo o link no nome, pediu pra trocar a abordagem: tirar o link do nome e colocar
um botão "Ver Matchs" ao lado de "Editar".

- Nome volta a ser texto simples (`<td class="td-nome">`, sem `onclick`/`<a>`).
- Nova coluna "Ações" na tabela, com os dois botões lado a lado: "✏️ Editar" e "📊 Ver Matchs".
- "Ver Matchs" chama a mesma `abrirClienteDash()` (mesmo mecanismo de query string pro
  `dashboard.html`, mesmo `abrirCliente()` das colunas Quentes/Mornos/Frios da home) — só mudou o
  elemento que dispara, de um link no nome pra um botão dedicado.
- `.link-nome` (CSS agora sem uso) removida; `.td-acoes`/`.btn-ver-matches` adicionadas.

**Nota**: como o mecanismo de navegação (`abrirClienteDash` → `dashboard.html?abrirCliente=1&...` →
`verificarDeepLinkCliente_()` → `abrirCliente()`) continua o mesmo por baixo, só mudou o gatilho
visual — se o botão "Ver Matchs" também não abrir o drawer, o problema não é o link em si, e sim
algo nesse mecanismo de query string que vale investigar mais a fundo (ex: timing real de
carregamento do `dashboard.html`, que não reproduzi localmente do mesmo jeito que acontece pro
usuário).

## 2026-07-06 (parte 15) — Área útil = 0 por padrão, setas no topo, drawer do cliente a partir de contatos.html

Itens 17 a 20 pedidos pelo usuário.

**17. Área útil = 0 por padrão** — o campo de texto (`id="areaUtil"`, o valor "de verdade" desde a
parte 8) começava vazio; agora tem `value="0"` desde o carregamento, e `resetForm()` volta pra "0"
em vez de deixar em branco (era o único campo, além de `cidadeMora`, com uma regra especial na
limpeza genérica).

**18. Setas de navegação também no topo** — `btnBackTop`/`btnNextTop` adicionados no
`progress-header`, ao lado do rótulo da etapa. `updateNav()` passou a espelhar o estado
habilitado/desabilitado dessas setas junto com as de baixo (`btnBack`/`btnNext`), já que fazem
exatamente a mesma coisa (`prevStep()`/`nextStep()`).

**19. Clicar no nome do cliente em `contatos.html` abre o drawer do Dashboard** — em vez de duplicar
todo o HTML/CSS/JS do drawer (~300 linhas) dentro de `contatos.html`, o nome agora é um link que
navega pra `dashboard.html?abrirCliente=1&nome=...&score=...&cod=...`; o dashboard detecta esses
parâmetros (`verificarDeepLinkCliente_()`) e chama `abrirCliente(nome, score, cod)` — a mesma
função já usada ao clicar num nome nas colunas Quentes/Mornos/Frios da home, que já faz sua própria
busca independente dos dados do dashboard.

**⚠️ Bug pego durante a implementação**: a primeira versão chamava `verificarDeepLinkCliente_()` de
dentro de `carregarDados()`, depois do fetch principal do dashboard — mas esse fetch tem um
`if (trataNaoAutenticado(json)) return;` que sai mais cedo (e desloga) se a sessão falhar,
nunca chegando na checagem do deep link mesmo com uma sessão válida em casos de erro/latência.
Corrigido chamando `verificarDeepLinkCliente_()` direto nos dois pontos onde a autenticação é
confirmada (`verificarAuth()` e o fim de `admInicializarSistema()`), independente do resultado do
carregamento principal — `abrirCliente()` já faz sua própria busca, não precisa dessa dependência.

**20. `contatos.html`: colunas Telefone e Cadastrado em removidas** — "Cadastrado em" passou a
aparecer no rodapé do drawer do cliente (`rodapeDrawerCliente_()`), logo após a lista de matches,
puxando `dataCadastro` do próprio cliente. `wpp()`/`.td-tel`/`.wpp` (só usados pela coluna de
telefone) removidos por ficarem mortos.

Validado com testes de renderização (Node) pra `contatos.html` confirmando colunas removidas e
onclick com aspas escapadas corretamente (aprendendo com o bug da parte 14), e no preview pra
`formulario.html` (setas/área útil) e `dashboard.html` (deep link + rodapé).

## 2026-07-06 (parte 14) — Fix: botão de favoritar não fazia nada (onclick quebrado por aspas)

Usuário reportou, mesmo depois de reimplantar o Apps Script, que a estrela de favoritos não
marcava e a página de Favoritos só mostrava o código do cliente (nunca o nome) — os dois sintomas
eram a mesma causa.

**Causa raiz**: o atributo `onclick` do botão de favoritar era montado com
`${JSON.stringify(cod)}` direto dentro de uma string `onclick="..."` (que já usa aspas duplas).
`JSON.stringify("CLI-10001")` produz `"CLI-10001"` — as aspas duplas do JSON fecham o atributo
HTML **no meio da string**, quebrando o `onclick` inteiro. Renderizando o botão de verdade e
inspecionando o `outerHTML`, o atributo saía como
`onclick="toggleFavoritoClick(0, " cli-10001",="" "raimundo="" barros",="" this)"=""` — uma
sopa de pseudo-atributos, sem nenhum handler de clique válido. Clicar na estrela literalmente não
fazia nada (nenhum POST era disparado), então nenhum favorito nunca tinha sido salvo de verdade —
por isso `favoritos.html` sempre mostrava a lista vazia (só o código da URL no topo, nunca o nome,
que só é preenchido a partir do primeiro item da lista).

Corrigido escapando as aspas do JSON antes de embutir no atributo
(`.replace(/"/g,'&quot;')`), mesma técnica já usada em `formulario.html` pra esse tipo de caso
(`carregarContato` já fazia isso corretamente — não copiei o padrão ao escrever o botão novo).
Validado inspecionando o `outerHTML` real do botão antes/depois do fix, e chamando
`toggleFavoritoClick` de ponta a ponta confirmando payload correto e toast de sucesso.

De brinde: `toggleFavoritoClick` deixou de falhar silenciosamente (só `console.error`) — agora
mostra um toast visível de erro com o motivo real, e um toast de sucesso ("⭐ Adicionado aos
favoritos" / "Removido dos favoritos") quando dá certo. Isso teria revelado o bug real de cara em
vez do sintoma ambíguo "não está marcando".

## 2026-07-06 (parte 13) — Favoritar imóveis na página de ofertas do cliente + página de Favoritos com PDF

Item 15 pedido pelo usuário: em cada card de match do drawer do cliente, opção de marcar como
favorito; botão "Favoritos" no topo abrindo uma lista dos imóveis favoritados desse cliente
(identificado por nome + código no topo), com a mesma opção de selecionar imóveis e gerar PDF que
já existe em `busca.html`.

**Backend (`code.txt`)**: nova aba `FAVORITOS`, com os dados do imóvel **denormalizados** (mesmos
campos `imo*` de MATCHES) em vez de só uma referência — porque `rodarMatching()` reescreve a aba
MATCHES inteira a cada execução, então guardar só `idCliente + imoCodigo` perderia foto/preço/local
assim que o matching rodasse de novo. Cada linha de favorito é auto-contida.

- `toggleFavorito_(d)`: se o par (idCliente + imoCodigo + fonte) já existe, remove; senão,
  adiciona. Rota `toggle_favorito` (POST, protegida por sessão).
- `listarFavoritos_(idCliente)`: retorna todos os favoritos de um cliente. Rota `listar_favoritos`
  (GET).
- Validado com teste unitário mockando a aba (favoritar, favoritar de novo = remove, dois
  favoritos pro mesmo cliente, isolamento entre clientes diferentes).

**Drawer do cliente (`dashboard.html`)**: cada card de match ganhou um botão ★/☆ (`toggleFavoritoClick`)
que chama `toggle_favorito` e atualiza o ícone na hora — o estado inicial (favoritado ou não) vem
de uma chamada paralela a `listar_favoritos` feita junto com `matches_cliente` ao abrir o drawer.
Botão "⭐ Favoritos" adicionado na barra de ações (ao lado de "✏️ Editar"), levando pra
`favoritos.html?cod=<idCliente>`.

**Nova página `favoritos.html`**: lista os imóveis favoritados do cliente (nome + código no topo,
extraídos do próprio registro de favorito), com os mesmos cards visuais do drawer, botão de
remover favorito por card, e o mesmo mecanismo de seleção + "Gerar PDF" de `busca.html` (checkbox
por card → janela nova com tabela impressa → `window.print()` — não é uma lib de PDF, é a
funcionalidade de impressão do navegador). Validado com teste de renderização e teste de seleção
confirmando que o PDF gerado inclui só os imóveis marcados.

**Gotcha de teste registrado**: reatribuir uma variável `let`/`const` declarada num `eval()` a
partir de um SEGUNDO `eval()` separado não alcança o binding original — cada `eval()` direto ganha
seu próprio Lexical Environment pra declarações lexicais. A injeção de dados mockados e a chamada
da função que os lê precisam estar na mesma string de `eval()`.

## 2026-07-06 (parte 12) — Código do imóvel no card de match: letra pequena demais

Usuário reportou de novo que o código não aparecia no card de "Revenda" (item 7 da sessão) —
investigado e confirmado que o dado e a exibição já estavam corretos (fix da parte 5), só que
`.imovel-codigo` estava em `font-size:11px` com `color:var(--text3)` (cinza bem apagado), quase
imperceptível ao lado do resto do card. Aumentado pra `13px`, `font-weight:600`, `color:var(--text2)`
(mais contraste). Validado via `preview_inspect`.

## 2026-07-06 (parte 11) — Fix: badge Status e ordenação continuavam quebrados mesmo após editar

Usuário reportou que, mesmo depois de editar um contato, a coluna Status continuava mostrando só
"—" (nunca virava bolinha colorida), e a lista não estava ordenando pela data de atualização mais
recente.

**Causa raiz**: gravar uma string com "cara de data" (`"06/07/2026 18:30"`, formato de
`Utilities.formatDate`) numa célula do Sheets faz o próprio Google Sheets **auto-converter a
célula pro tipo Data nativo** (mesmo comportamento de quando alguém digita uma data direto na
planilha). Quando o Apps Script lê essa célula de volta, ela já vem como objeto `Date` — e o
`JSON.stringify()` do backend serializa isso automaticamente como ISO 8601
(`"2026-07-06T21:30:00.000Z"`) antes de mandar pro navegador. `parseDataBr_()` em `contatos.html`
só reconhecia o formato `"dd/MM/yyyy HH:mm"` — contra uma string ISO, o regex não casava, retornava
0, e tanto `statusFrescorEl()` (badge sempre "—") quanto a ordenação (todo mundo com a mesma chave
0, ordem não mudava) quebravam do mesmo jeito. Os dois sintomas eram a mesma causa.

`parseDataBr_()` agora detecta o prefixo ISO (`/^\d{4}-\d{2}-\d{2}T/`) e usa `new Date()` direto
nesse caso (seguro pra ISO — a ambiguidade de "não confiar no parser nativo" só existe pro formato
brasileiro no formulário). Adicionado também `formatarDataDisplay_()` pra exibir uma data ISO
formatada como `dd/MM/yyyy HH:mm` nas colunas "Cadastrado em"/"Atualizado em" em vez da string ISO
crua. Validado com teste cobrindo os dois formatos isoladamente e uma lista com formatos
misturados, confirmando badge correto e ordenação certa em ambos os casos.

## 2026-07-06 (parte 10) — Fix: coluna Status vazia pra contatos antigos (dataAtualizacao nunca preenchida)

Usuário reportou que a coluna "Status" (parte 8) não mostrava os badges de Quente/Morno/Frio.
Mesma classe de bug do `idCliente` (parte 4 desta sessão): `dataAtualizacao` só é gravado quando
`salvar()`/`atualizar()` rodam — todo contato criado ANTES dessa coluna existir fica com o campo
vazio pra sempre, a menos que alguém edite e salve de novo. Sem `dataAtualizacao`,
`statusFrescorEl()` cai no caso "sem data" e mostra só "—" em vez do badge colorido — por isso a
coluna parecia "não aparecer" pra praticamente toda a base (só contatos editados manualmente hoje
tinham o campo preenchido).

Nova função `preencherDataAtualizacaoFaltantes()` (idempotente, só preenche onde está vazio) usa
`dataCadastro` como aproximação — não sabemos quando um contato antigo foi editado de verdade, mas
sabemos desde quando ele existe, e um cadastro nunca tocado desde a criação DEVE aparecer frio se
for antigo (é literalmente o comportamento que a feature quer sinalizar). Rota
`adm_preencher_data_atualizacao`, adicionada ao `FUNCOES` do `index.html` — roda sozinha no
próximo login. Validado com teste unitário mockando a planilha (contatos com/sem
`dataAtualizacao`, e um caso sem nenhuma data pra confirmar que não quebra).

## 2026-07-06 (parte 9) — Salvar edição de contato redireciona pra contatos.html

Pedido do usuário: depois de salvar as edições de um contato, voltar pra `contatos.html` em vez de
limpar o formulário. Aplicado só ao fluxo de **edição** (`linhaAtual` setado, botão "Atualizar
contato") — cadastrar um cliente **novo** continua limpando o formulário e voltando à etapa 1, pra
não atrapalhar quem está cadastrando vários contatos em sequência.

Validado no preview: capturado o log de rede mostrando `formulario.html → contatos.html →
index.html` — o último salto é só a própria `contatos.html` rejeitando o token de teste falso (sem
tocar no backend real não dá pra confirmar a chegada com sessão válida), mas confirma que o
redirecionamento pós-edição está indo pro lugar certo.

## 2026-07-06 (parte 8) — Coluna "Status" (tempo de cadastro) em contatos.html

Item 14 pedido pelo usuário: coluna nova ao lado de "Cadastrado em" com um selo de
Quente/Morno/Frio — mas baseado em **tempo desde a última atualização do cadastro**
(`dataAtualizacao`), não na qualidade de match (que é o critério da home do dashboard). Usuário
fez questão de deixar essa distinção clara, então:

- Mesmos limiares de `fatorFrescor_()` (≤15 dias / 15–30 / >30), só que calculado no front-end
  (`statusFrescorEl()`, 100% client-side — não precisa de rota nova no backend, já tem
  `dataAtualizacao` disponível via `buscar`).
- Mesmos emojis do badge de temperatura já usado no drawer do dashboard (🔴/🟡/🔵), pra manter o
  vocabulário visual consistente mesmo o critério sendo diferente.
- `title` (tooltip) em cada badge e no cabeçalho da coluna explicando que é "status de tempo, não
  de match" — évita confundir com o Quente/Morno/Frio da home.
- Validado via teste de renderização em Node com datas conhecidas (5/20/40 dias) cobrindo as 3
  faixas.

## 2026-07-06 (parte 7) — Card "Esfriando" não deve contar cadastros já "Frios" (>30 dias)

Ajuste no item 12 da parte anterior: o card contava TODO cadastro com mais de 15 dias sem
atualização, inclusive quem já passou dos 30 dias (ponto em que `fatorFrescor_()` já classifica
como "Frio", fator 0.65). Usuário pediu pra excluir esses — o alerta é sobre quem ainda está na
janela de reverter antes de esfriar de vez, não sobre quem já esfriou.

Condição em `adm_dados_insights` mudou de `diasDA_ > 15` para `diasDA_ > 15 && diasDA_ <= 30`.
Textos do card e do título do drill-down atualizados pra "entre 15 e 30 dias". Validado com teste
unitário cobrindo os limites (15, 16, 30, 31 dias) e visualmente no preview.

## 2026-07-06 (parte 6) — Score do Cliente com frescor de cadastro + alerta de "esfriando"

Itens 11 e 12 pedidos pelo usuário.

**Nova coluna `dataAtualizacao`** no CABECALHO — diferente de `dataCadastro` (nunca muda, é a
criação) e de `ultimoContato` (sobre a conversa com o cliente, preenchido manualmente):
`dataAtualizacao` é automática, gravada pelo próprio backend toda vez que `salvar()`/`atualizar()`
rodam.

**11. `contatos.html`**: nova coluna "Atualizado em" com `dataAtualizacao`; lista ordenada do mais
recente pro mais antigo (antes não tinha ordenação explícita). Score do Cliente passou a
incorporar o tempo desde a última atualização do cadastro: `scoreComFrescor_()` aplica um fator
multiplicativo sobre o score bruto — até 15 dias, fator 1 (mais alto, sem penalidade); 15–30 dias,
fator 0.85 (médio); mais de 30 dias, fator 0.65 (baixo). Cadastros sem `dataAtualizacao` (legado,
nunca editado desde essa feature existir) não são penalizados. O valor decaído (`scoreEfetivo`) é
o que aparece na coluna Score de `contatos.html` — o score bruto continua intacto na planilha.

O mesmo fator entra na classificação de temperatura do dashboard (`dadosDashboard()`): o score do
cadastro (35% do peso do Score Total, que decide Quente/Morno/Frio) agora é o valor com frescor
aplicado, não o bruto — um cadastro parado por muito tempo esfria mesmo com perfil declarado bom.

**⚠️ Bug de parsing de data pego durante a implementação**: a primeira versão calculava dias desde
`dataAtualizacao` com `new Date(string)` em cima do formato `"dd/MM/yyyy HH:mm"` — o parser nativo
do JS trata strings não-ISO como padrão americano (MM/DD/YYYY), trocando dia e mês silenciosamente
sempre que o dia é ≤ 12 (ex: "06/07/2026" virava 7 de junho em vez de 6 de julho). Testes
unitários (`fatorFrescor_` com datas conhecidas) pegaram o erro antes de ir pro ar. Corrigido com
parse explícito via regex (`diasDesdeData_()`) em vez de confiar no parser nativo — mesmo cuidado
que o resto do código já tomava com `dataCadastro` (só comparado como string, nunca parseado).

**12. Novo card de insight "🥶 Esfriando"** no dashboard — conta cadastros (excluindo
Corretor/Parceiro/Descartar/Igreja) com mais de 15 dias sem atualização, com drill-down (mesmo
padrão dos outros cards de insight: "Ver →" abre a lista em `insight-detail.html`). Backend:
`adm_dados_insights` ganhou `esfriando15`/`esfriandoList`, computados no mesmo loop que já lia a
aba CONTATOS (sem reler a planilha).

## 2026-07-06 (parte 5) — Matching por texto ignorava chips de quartos/suítes, reorganização do dashboard e mais tags

Itens 5 a 10 pedidos pelo usuário nesta sessão.

**5. Bug: cliente removeu preferência de quartos/suítes e continuava recebendo os mesmos matches**

Caso relatado: Raimundo Barros (CLI-10001) tinha "2 quartos"/"1 suíte" marcados, o usuário desmarcou
os dois chips, rodou o matching de novo e ele continuou aparecendo como "QUENTE" com os mesmos
matches de apartamento 2 quartos. Causa raiz: `scoreQuartos_()` e o bônus de suítes em
`calcularMatch_()` **nunca liam o campo estruturado do formulário** (`contato.quartos`/
`contato.suites`) — só extraíam número de quartos/suítes via regex em cima do texto livre
(conversa/observações/nome_bruto/produtoOrigem). Ou seja, marcar ou desmarcar os chips de
quartos/suítes no cadastro **nunca teve efeito nenhum no matching**, desde sempre.

Corrigido seguindo o mesmo padrão já usado em `scoreTipo_`/`scorePadrao_` nesta sessão: campo
estruturado manda (com suporte a múltipla escolha, ex: "2, 3"), texto livre vira fallback só
quando o campo estruturado está vazio. `scoreSuites_()` é uma função nova (o bônus de suíte
antes só existia embutido, sem considerar o campo estruturado).

**Importante — limite conhecido**: se a conversa/observações do cliente também mencionar
"2 quartos" como texto solto, esse texto ainda entra como fallback quando o campo estruturado fica
vazio (mesma lógica de tipo/padrão — não dá pra distinguir "nunca declarou" de "removeu a
preferência" só pelos dados). Isso só importa se o texto livre do cadastro tiver essa menção; não
foi possível confirmar se é o caso do Raimundo sem acesso à planilha ao vivo.

**6. Dashboard: "Composição da base de clientes" movida pra logo abaixo de "Matches do momento"**

Reordenação simples de blocos HTML — sem mudança de lógica, os gráficos continuam os mesmos
(`chartSegmento`/`chartPadrao`).

**7. Cards de match tipo "Revenda" sem código do imóvel**

`imoCodigo` já existia na aba MATCHES (vem de `imo.codigo` do REVENDA, sincronizado da Imobzi) e já
era devolvido pela rota `matches_cliente` — só faltava exibir no card (`carregarMatchesDrawer` em
`dashboard.html`). Adicionado `<div class="imovel-codigo">Código: ...</div>`, condicionado a
`m.imoCodigo` existir (lançamentos não têm esse campo, então não aparece nada pra eles — sem
"Código: undefined").

**8. Área útil: slider travado no mínimo de 50 + campo de texto pra digitar**

O slider (`<input type="range">`) tinha `min="50"`, então nunca dava pra registrar uma área abaixo
disso. Trocado `min` pra `0`. Além disso, como o slider tem um teto fixo (500m²) por natureza,
adicionado um campo de texto ao lado (`id="areaUtil"`, o texto virou o campo com o valor "de
verdade" que é salvo — o slider virou um atalho visual que sincroniza com ele, sem limitar o valor
real). Testado no preview: digitar 620 no texto mantém "620m²" no rótulo mesmo com o slider
travado visualmente em 500 (seu teto); arrastar o slider sincroniza o texto normalmente.

**9. Tag "Montar Empresa" em Finalidade**

**10. Tags "Financiamento", "À vista" e "Permuta com Carro" em Situação financeira**

Cada uma é uma flag independente (mesmo padrão de fgts/financ/entrada_chip/permuta) — 3 colunas
novas no `CABECALHO` (`financiamento`, `avista`, `permutaCarro`), no fim do array de sempre.
`migrarCabecalhoContatos()` (já existente, roda a cada login) cobre a criação dessas colunas na
planilha automaticamente.

## 2026-07-06 (parte 4) — Fix: código do cliente não aparecia ao editar cliente existente

Usuário reportou que o código do cliente (adicionado na parte 2 desta sessão) não aparecia na
etapa "Identificação" ao editar um cliente já cadastrado. O front-end estava certo (confirmado —
o campo já estava até publicado no GitHub Pages) e o teste no preview com dado simulado funcionava;
o problema era a ORIGEM do dado: `preencherIdsFaltantes()` — a função que preenche `idCliente` pra
contatos antigos que nunca tiveram esse campo (toda a base migrada antes da feature existir) —
**nunca tinha rota nem rodava automaticamente**. Só existia pra ser chamada manualmente no editor do
Apps Script, e aparentemente nunca foi rodada (ou só rodou uma vez, há tempo, sem cobrir contatos
editados/criados depois). Sem o `idCliente` preenchido na planilha, o campo simplesmente fica oculto
(comportamento correto do front-end — só não tinha dado pra mostrar).

Corrigido com uma rota nova, `adm_preencher_ids_faltantes_contatos` (nome diferente de
`adm_preencher_ids_faltantes`, que já é usada pro `idOferta` de LANCAMENTOS — são funções
diferentes apesar do nome parecido), adicionada à lista `FUNCOES` do `index.html` — roda sozinha a
partir do próximo login e preenche o `idCliente` de qualquer contato que ainda esteja sem.

**Ação necessária**: reimplantar o Apps Script (colar `code.gs.txt` atualizado, "Nova versão") e
depois fazer login de novo no Base Inteligente — a próxima tela de carregamento já roda o
preenchimento. Se quiser confirmar mais rápido sem esperar o redeploy propagar, dá pra rodar
`preencherIdsFaltantes()` direto pelo menu Executar do editor do Apps Script.

## 2026-07-06 (parte 3) — Salvar cliente recalcula matches antes de avisar sucesso

Pedido do usuário: "sempre que houver uma atualização de dados de clientes, ao clicar no botão da
última página para salvar os dados, gravar os dados na tabela e em seguida acionar a função 'rodar
matching' antes de mostrar que os dados foram salvos."

`saveClient()` (`formulario.html`) agora, depois do POST de salvar (aguardado via `await` — mesmo
sendo `no-cors`/resposta opaca, o `await` só resolve depois do `doPost` terminar no servidor, então
o dado já está gravado), faz uma segunda chamada `acao=rodar_matching` e só then mostra o toast de
sucesso. Erro no recálculo de matching é logado no console mas não impede o aviso de sucesso — o
cadastro em si foi salvo de qualquer forma, matching é um recálculo derivado.

De brinde, corrigido um bug lateral que essa mudança deixaria mais visível: o spinner/estado de
carregamento do botão sempre atualizava `btnSave`, mesmo em modo edição — onde o botão realmente
visível é `btnUpdate` (`btnSave` fica `display:none`). Clicar em "Atualizar contato" não mostrava
nenhum feedback de carregamento antes; agora o botão certo é identificado dinamicamente
(`linhaAtual ? 'btnUpdate' : 'btnSave'`) e mostra as duas fases: "Salvando..." → "Atualizando
matches...". Validado no preview mockando `fetch` — chamadas saem na ordem SALVAR → MATCHING, toast
só aparece depois das duas, e o botão `btnUpdate` mostra as duas fases corretamente em modo edição.

## 2026-07-06 (parte 2) — Chips de múltipla escolha, campos livres, código do cliente e lista de contatos

Pedido do usuário ("Alterações 06/07"): três frentes no formulário de cadastro do cliente e no
dashboard.

**1. Chips viram múltipla escolha em todas as etapas do `formulario.html`**

`toggleChip()` desmarcava todos os "irmãos" ao clicar (single-choice) — reescrita pra alternar
cada chip de forma independente, guardando os valores selecionados em `chipState[group]` como
string separada por `, ` (mesmo formato que `toggleBool()` já usava pras comodidades). Isso corrige
de brinde um problema latente na seção "Situação financeira": FGTS/Pré-aprovado/Entrada
disponível/Permuta são 4 grupos diferentes dentro do mesmo `.chip-group`, e o `toggleChip()` antigo
limpava visualmente TODOS os chips do container ao clicar em qualquer um deles (mesmo os de outro
grupo), então marcar "Tem FGTS" e depois "Pré-aprovado" fazia o primeiro sumir da tela mesmo
continuando salvo internamente.

`updateCamposImovel()` e `updateScore()` foram ajustados pra ler múltiplos valores (via novo
helper `temValor_()`) em vez de comparar `===` com uma string única. `scoreTipo_()` no `code.txt`
também passou a aceitar `segmento` com vários tipos separados por vírgula, pontuando pelo melhor
match entre eles — cliente que marca "Casa, Apartamento" não é mais incompatibilizado com um
apartamento só porque também marcou casa.

**2. Comodidades desejadas / Canal de origem ganham campo de texto livre**

Adicionado `<input id="comodidadesOutras">` e `<input id="canalOutro">`, mais duas tags novas em
Canal de origem ("Placa no Imóvel", "Faixas"). Duas colunas novas no `CABECALHO` do `code.txt`
(`comodidadesOutras`, `canalOutro`, no fim do array — convenção de sempre). Nova função
`migrarCabecalhoContatos()` (idempotente, mesmo padrão de `migrarCabecalhoLancamentos()`) registrada
como rota `adm_migrar_cabecalho_contatos` e adicionada à lista `FUNCOES` do `index.html` — roda
sozinha no próximo login, sem precisar abrir o editor do Apps Script.

**3. Código do cliente visível na 1ª etapa do formulário**

Novo campo (desabilitado, só leitura) em "Identificação" que aparece preenchido com o `idCliente`
quando o formulário é aberto em modo edição (`carregarContato()`/`carregarClienteDaUrl()`); fica
oculto ao cadastrar um cliente novo (o ID só existe depois de salvar).

**4. Bug: cliente com "3 quartos" marcado não aparecia com o chip ativo ao reabrir**

`ativarChip()` comparava `chip.textContent.trim() === valor` com igualdade exata — funciona pra
dados salvos pelo formulário atual (que só grava o dígito puro, ex: `"3"`), mas falha silenciosamente
pra registros com valor no formato descritivo antigo (ex: `"3 quartos"`, de importação/migração
anterior): a informação está certinha na planilha, só não reflete visualmente no chip. Corrigido pra
também tentar casar pela primeira palavra do valor salvo (`"3 quartos".split(' ')[0] === "3"`), além
do match exato — e agora lida com múltiplos valores (`split(',')`) já que os chips viraram múltipla
escolha. Validado simulando um contato com `quartos: "3 quartos"` no preview: o chip "3" ativa
corretamente.

**5. Cliente com interesse em "Casa" recebendo match de "Lote"**

`scoreTipo_()` já desqualifica (score 0) um imóvel de grupo incompatível quando o cliente declara um
tipo — o comportamento reportado só acontece se `segmento` estiver vazio na planilha (cai pro score
neutro 8, que não desqualifica nada) ou se os MATCHES daquele cliente foram calculados numa versão
anterior do cadastro dele (antes do segmento ser preenchido) e nunca recalculados depois. Não deu pra
confirmar qual dos dois é o caso da Priscila (CLI-10002) sem acesso à planilha ao vivo — o fix de
múltipla escolha em `scoreTipo_()` deixa o motor mais robusto de qualquer forma, mas vale conferir o
campo `segmento` dela na aba CONTATOS e, se necessário, rodar `adm_rodar_matching` de novo.
`scorePadrao_()` recebeu o mesmo tratamento de múltipla escolha (pontua pelo melhor padrão declarado),
já que "Padrão" também virou multi-select.

**6. Lista de todos os contatos no Dashboard**

Botão "Ver →" no card "Total de contatos" (seção Visão geral) leva para `contatos.html` — página
nova (mesmo estilo visual de `insight-detail.html`) com busca por nome/telefone/código e um botão
"✏️ Editar" por linha que abre `formulario.html?linha=X` com o cadastro completo (rota `buscar` já
existente; sem `q`, ela devolve todos os contatos — sem endpoint novo no backend).

## 2026-07-06 — Fix: botão "Editar" em Lançamentos não abria a página do empreendimento

Bug reportado pelo usuário: o botão "✏️ Editar" (criado pela estação server) na lista de
empreendimentos não abria `lancamentos-editar.html`.

**Causa raiz**: em `lancamentos-editar.html`, o IIFE `(function init(){...})()` era executado
imediatamente durante o parse do script (linha ~301) e chamava `preencherForm()` →
`addUnidade()` de forma síncrona. Só que `addUnidade()` referencia `_uniCount`, declarada mais
abaixo no arquivo com `let _uniCount = 0;` (linha 331) — como `let` não sofre hoisting de valor
(fica na temporal dead zone até a linha de declaração ser executada), a chamada síncrona a
`addUnidade()` disparava `ReferenceError: Cannot access '_uniCount' before initialization`
*antes* dessa linha rodar. O erro era engolido pelo `try/catch` do próprio `init()`, que
silenciosamente redirecionava de volta para `lancamentos.html` — dando a impressão de que o
botão "não fazia nada".

Confirmado isolando o erro real via `localStorage` (o `console.error` normal não sobrevive ao
redirect síncrono): `ReferenceError: Cannot access '_uniCount' before initialization at
addUnidade (lancamentos-editar.html:337:3)`.

**Fix**: `init()` deixou de ser uma IIFE disparada no meio do arquivo e virou uma função nomeada,
chamada explicitamente (`init();`) só no final do `<script>`, depois que todas as declarações
top-level (`let _uniCount = 0`, funções, etc.) já rodaram. Validado no preview: navegação direta
para `lancamentos-editar.html` com dados de sessão simulados agora renderiza o formulário
corretamente preenchido, sem erros no console.

## 2026-07-05/06 — Merge com a estação server (26 commits)

Duas estações trabalharam em paralelo sem sincronizar: enquanto esta sessão seguia em 03/07, a
outra estação avançou 04–05/07 direto no GitHub, sem passar pelo fluxo desta conversa. Antes de
enviar o fix do bairro (parte 18), foi necessário estudar e mesclar esse trabalho.

**O que a outra estação construiu:**
- **Integração BaseImob → CONTATOS**: `listarLeadsBaseimob_()`/`migrarLeadBaseimob_()` — o
  corretor vê os leads do funil externo numa aba nova do dashboard e promove os qualificados pra
  CONTATOS (com checagem de duplicidade por email). A migração usa o `idOferta` (implementado na
  parte 17 desta sessão) pra pré-preencher `produtoOrigem` com os imóveis de interesse.
- **Painel ADM** (dashboard.html): botões manuais pra rodar matching, sincronizar Revenda,
  criar gatilhos agendados, rodar `testarMatching()`, checar gatilhos ativos — rotas `adm_*`
  novas no Code.gs, protegidas por sessão.
- **Insights do dashboard**: 11 indicadores cruzados substituindo a seção Construtora (clientes
  sem contato 90+ dias, bairros mais procurados, canal com melhor score médio, leads BaseImob
  pendentes), com página de detalhe (`insight-detail.html`).
- **Reestruturação**: `index.html` virou só login+init (redireciona pra `busca.html`, nova home
  pós-login); formulário de cliente saiu pra `formulario.html`; Lançamentos ganhou botão "Editar"
  por empreendimento (`lancamentos-editar.html`).

**Merge**: `git merge origin/main` trouxe os 26 commits sem nenhum conflito — as mudanças da
outra estação em `Code.gs.txt`/`lancamentos.html` ficaram em funções/seções diferentes das que
esta sessão tocou hoje (nenhum dos 4 esquemas de coluna mudou dos dois lados). Confirmado
comparando o `Code.gs.txt` resultante do merge contra o arquivo realmente implantado (que o
usuário exportou) — **única diferença: a função `corrigirBairroComEnderecoJunto()` de hoje**,
que ainda não existia lá.

Revalidado após o merge: as 9 suítes de teste desta sessão (63 casos) continuam passando no
`Code.gs.txt` final combinado, e os 7 arquivos HTML do projeto (incluindo os 3 novos da outra
estação) passam checagem de sintaxe e carregam sem erro no preview.

## 2026-07-03 (parte 18) — Bug real: bairro salvando o endereço inteiro

Usuário reportou que o card do BaseImob mostrava "Rua 500 175. Cidade Vera Cruz, Aparecida de
Goiânia" em vez de só "Cidade Vera Cruz, Aparecida de Goiânia" — não era bug de exibição, era o
dado errado na base: o campo `bairro` desse lançamento (Max Cidade) tinha o endereço inteiro
salvo, não só o bairro.

**Causa raiz**: a regex de extração de bairro em `lancamentos.html` usava `\S+` pra "pular" até
a cidade e confirmar onde o bairro terminava — `\S+` não atravessa espaço, então funcionava pra
cidades de uma palavra ("Goiânia") mas **falhava silenciosamente pra cidades com mais de uma
palavra** ("Aparecida de Goiânia"), a regex principal não casava, e o código caía num fallback
mais grosseiro que pegava o endereço inteiro como bairro.

**Quem foi afetado**: todo lançamento na cidade "Aparecida de Goiânia" (a única cidade de mais de
uma palavra na base hoje) — confirmado direto na planilha ao vivo, exatamente 6 empreendimentos:
Max Cidade, Max Serra Dourada, Park Residence, Parque América Cancún, Link Clube House e
Residencial Máximo Clube.

**Fix no parser** (`lancamentos.html`): reescrita a extração de bairro/cidade/estado pra
reaproveitar o mesmo match de cidade (que já usava `[^\/]+`, correto) em vez de tentar casar a
cidade de novo com `\S+` dentro da regex de bairro. Bairro agora é "tudo entre o primeiro '.' do
logradouro e a cidade já identificada" — também blindado contra abreviação de rua com ponto
próprio (ex: "R." de "Rua"), que antes cortaria no lugar errado.

**Fix nos dados existentes** (`Code.gs.txt`): `corrigirBairroComEnderecoJunto()` — função de
correção pontual (rodar uma vez): bairro de verdade nunca tem ".", então qualquer linha com "."
no bairro pega só o trecho depois do **último** ponto. Aplicada e confirmada nos 6 casos reais
achados na base, sem mexer em nenhum bairro já correto.

Testado em Node: 6 cenários do parser (caso real quebrado, 2 regressões — cidade de 1 palavra e
prefixo abreviado "R./Av." não quebram) + 6 cenários da correção pontual com os valores reais dos
6 empreendimentos afetados, mais um bairro já correto que não deveria ser tocado. Testado no
preview: extração real do texto da Max Cidade preenche os campos certos. As 8 suítes anteriores
continuam passando sem regressão (63 testes no total).

**Ação pendente do usuário**: colar o `Code.gs.txt` atualizado, reimplantar, e rodar
**`corrigirBairroComEnderecoJunto()`** uma vez pelo editor do Apps Script pra corrigir as 6 linhas
já existentes com o bug.

## 2026-07-03 (parte 17b) — Código da oferta também visível na landing

Ajuste rápido: a parte 17 mostrou o código só no card do BaseImob Total — a landing
(pré-cadastro) também precisava, já que é o primeiro lugar onde o cliente vê o imóvel. Adicionado
"Código: LAN-XXXXX-XX" no `icard-top` de `renderCard()` (`baseimob-landing.html`), ao lado do
título, sem quebrar o layout flex existente. Testado no preview com o card real (Rua 500 175,
Aparecida de Goiânia) — código aparece corretamente.

## 2026-07-03 (parte 17) — Código único por oferta (idOferta) — rastreabilidade do interesse

Pedido do usuário: cada oferta específica da base de LANCAMENTOS (uma tipologia dentro de um
empreendimento) precisava de um código próprio, pra não "ficar solta" — o cliente se cadastra,
marca interesse em alguns imóveis, e depois precisa reencontrar exatamente esses mesmos imóveis
por email ou na busca aberta (quando o link for enviado).

**Problema encontrado**: hoje só existe `idLancamento` (LAN-NNNNN), que identifica o
**empreendimento inteiro** — um lançamento com 6 tipologias diferentes tem 6 linhas com o MESMO
`idLancamento`. O BaseImob Total usava a **posição do imóvel na lista filtrada atual**
(`im.id + '-' + índice`) como identificador de seleção — isso muda toda vez que o filtro/ordem
muda, então o código salvo em `idsInteresse` (aba INTERESSES) não aponta de volta pra nada estável.

**Bug relacionado encontrado e corrigido**: `salvarLancamento_()` gerava um `idLancamento` **novo**
toda vez que o mesmo empreendimento era reextraído/resalvo (variável `idExistente` era capturada
mas nunca usada) — mesmo se nada tivesse mudado, o ID mudava a cada atualização de tabela de
preço, quebrando qualquer referência já enviada. Corrigido pra reaproveitar o ID existente quando
o nome do empreendimento já existe na base.

**Fix — `idOferta` (Code.gs.txt)**:
- Nova coluna `idOferta` em `CABECALHO_LANCAMENTOS` (fim do array, mesmo motivo de sempre — não
  desalinhar dados existentes), formato `LAN-00011-01`, `LAN-00011-02` etc. Gerado em
  `salvarLancamento_()` — código único e estável por linha/tipologia, que sobrevive a reimportação
  (já que o `idLancamento` pai agora também é estável).
- `lancamentoParaImovel_()` e `buscaAberta_()` passaram a expor `idOferta` no objeto de imóvel.
- `preencherIdOfertaFaltantes()`: função de migração pontual (mesmo padrão de
  `preencherIdsFaltantes()` de CONTATOS) pra preencher `idOferta` nas 174 linhas que já existem na
  base hoje — sem isso, elas ficariam sem código até serem reextraídas manualmente uma a uma.

**Fix no front-end (BaseImob Total)**:
- `renderLista()`: a chave de seleção agora é `im.idOferta` de verdade (fallback pro esquema antigo
  só pra dado ainda não migrado) — `selecionados` e `idsInteresse` passam a usar códigos estáveis.
- Card agora mostra o código visível ("Código: LAN-00016-01"), pra ficar rastreável mesmo pro
  cliente que olhar de novo depois.
- De brinde, corrigido o mesmo bug da parte 16 aqui também (linha "Entrega" com data crua →
  "Status" com o valor real).

Testado em Node: 9 cenários do `salvarLancamento_`/`idOferta` (geração sequencial, reimportação
mantém o mesmo `idLancamento` e os mesmos `idOferta`, empreendimento diferente não colide) + 5
cenários da migração `preencherIdOfertaFaltantes` (preenche só o que falta, respeita código já
existente, não colide entre lançamentos diferentes). Testado no preview: card mostra o código
certo, seleção usa o código real, `idsInteresse` sai com os códigos estáveis no payload de
interesse. As 6 suítes anteriores continuam passando sem regressão (57 testes no total).

**Ação pendente do usuário**: colar o `Code.gs.txt` atualizado, reimplantar, e depois rodar
**`preencherIdOfertaFaltantes()`** uma vez pelo editor do Apps Script (além do
`migrarCabecalhoLancamentos()` de sempre) pra preencher o código nas linhas já existentes.

## 2026-07-03 (parte 16) — Cards da landing BaseImob: Bairro/Cidade + fix da data crua

Pedido do usuário: os cards de resultado do pré-cadastro (`baseimob-landing.html`) estavam muito
resumidos, e a linha "Entrega" mostrava a data sem formatação nenhuma (ex: "Entrega:
2025-11-30T03:00:00.000Z") — o Apps Script serializa datas de célula do Sheets como ISO string
completa, e o card exibia esse valor cru direto.

**Fix**: linha "Entrega" removida, substituída por **"Status"** com o valor real da base (ex:
"Pronto") — sem exigir nenhuma formatação de data. `icard-tipo` (linha "Apartamento · Xm²") passou
a incluir **Bairro e Cidade** (ex: "Apartamento · Setor Bela Vista, Goiânia · 63m²"). Cidade vem
normalizada em minúsculo/sem acento no schema interno — criado um pequeno mapa (`CIDADES_LABEL`)
pras 2 cidades que existem na base hoje (Goiânia/Aparecida de Goiânia), com fallback de
capitalização simples pra qualquer cidade nova que apareça.

Testado no preview: card renderiza corretamente com bairro+cidade reais, cai graciosamente sem
vírgulas soltas quando bairro/cidade vêm vazios, cidade desconhecida não quebra (capitalização
simples), e o fluxo completo (API mockada → `mostrarResultado()` → card) mostra "Status: Pronto"
sem nenhum resquício de data crua.

**Achado relacionado, não corrigido agora**: `baseimob-total.html` tem a mesma linha "Entrega:
${im.entrega}" com o mesmo problema em potencial (mesma fonte de dado, `previsaoEntrega` da API) —
o usuário pediu especificamente sobre a página do pré-cadastro (landing), essa outra fica pendente
até confirmação.

## 2026-07-03 (parte 15) — BaseImob: backend do funil de tráfego pago implementado

Primeira implementação real do BaseImob (funil externo de captação de leads pra tráfego pago),
depois de uma sessão de estudo do material enviado (2 HTMLs + relatório) e uma análise de dados
real da base `LANCAMENTOS` (arquivo `lancamentos.txt`, 174 unidades reais em 38 empreendimentos —
o resto das 872 linhas exportadas eram linha em branco). Essa análise mudou decisões importantes
do plano original (ver conversa): não existe padrão "Popular" no estoque hoje (100% Médio/Alto), e
nenhuma das 174 unidades tem condição de pagamento cadastrada (`entrada`/`fgts`/`parcelasObra`
etc. — todos vazios). O usuário decidiu seguir com público "Médio Padrão" e a comunicação
"Apartamento novo pronto, a partir de R$269 mil, com condição facilitada".

**Backend (`Code.gs.txt`) — módulo BaseImob, completamente separado do Base Inteligente:**
- Novas abas `LEADS_LANCAMENTOS` (roxo `#7030A0`) e `INTERESSES` (laranja `#C55A11`), criadas
  automaticamente no primeiro lead — **nunca gravam em CONTATOS**.
- `salvarLeadLancamento_()`: grava o lead com ID próprio `LL-NNNNN` (contador isolado, nunca
  colide com `CLI-` de CONTATOS nem `LAN-` de LANCAMENTOS). Faz **upsert por email** — a mesma
  pessoa passa pela landing (`LEAD LANDING PAGE`) e depois completa o cadastro no BaseImob Total
  (`LEAD QUALIFICADO`); a 2ª chamada atualiza a mesma linha em vez de duplicar, preservando a
  `dataCadastro` original.
- `salvarInteresse_()`: grava o interesse (imóveis selecionados) em `INTERESSES`, busca o
  `idCliente` (LL-NNNNN) por email em `LEADS_LANCAMENTOS` (o formulário de "solicitar informações"
  não manda esse ID direto), e dispara `enviarNotificacaoAtendente_()` — email pro corretor com
  nome/contato/score/imóveis selecionados. Momento mais quente do funil, não pode passar batido.
- **Detalhe técnico importante**: os dois HTMLs do BaseImob mandam os dados via **GET** com
  `?dados=<json>` (não POST) — a ação fica dentro do JSON, não como parâmetro solto. `doGet` agora
  detecta esse padrão e roteia pra `salvarLeadLancamento_`/`salvarInteresse_` antes de qualquer
  outra coisa. Suportado também via POST (`d.acao`) para caso o front mude no futuro.
- **Essas ações são públicas** (sem exigir o token de sessão do fix de segurança da parte 9) —
  visitante de anúncio nunca faz login. `listar_lancamentos` também virou pública, pelo mesmo
  motivo (os dois HTMLs do BaseImob leem ela sem sessão).

**Front-end — mensagem, público e segmentação:**
- `baseimob-landing.html` / `baseimob-total.html`: trazidos pro repositório (antes só existiam em
  Downloads), `WEBHOOK` renomeado pra `WEBHOOK_URL` e passaram a carregar `config.js` — mesmo
  padrão das outras 5 páginas, backend único.
- Headline da landing trocado para a comunicação definida: **"Apartamento novo pronto, a partir
  de R$269 mil"** + "condição facilitada" no subtítulo — antes falava de "compra na planta" e
  "investimento", que não correspondiam a nada do estoque real (não existe nenhum lançamento em
  status "Em planta" hoje, só Pronto novo/Em obras/Pronto).
- **Correção de reivindicação falsa**: um card dizia "FGTS aceito como entrada na maioria dos
  lançamentos" sem nenhum dado real por trás (0/174 registros têm esse campo preenchido) —
  substituído por 2 estatísticas reais e verificadas: "74% das unidades já estão prontas" e
  "R$269 mil é o valor de entrada mais baixo disponível hoje".
- **Segmentação geográfica** (`?regiao=vila-rosa` / `?regiao=aparecida`): a landing lê o parâmetro
  da URL, troca o texto do pill do header e filtra o estoque mostrado no quiz só pra bairros/
  cidade daquela região — permite rodar 2 campanhas de anúncio separadas (Vila Rosa x Aparecida de
  Goiânia) sem precisar de 2 páginas diferentes. A região entra no campo `canal` do lead salvo,
  pra saber de qual campanha cada lead veio.
- **Ajuste de qualificação (não promessa)**: como não há dado de condição de pagamento por
  imóvel, a pergunta "Como pretende pagar?" (landing) e as tags financeiras (BaseImob Total) agora
  só ajustam o **score interno** (prioridade de atendimento) — não aparecem como promessa de
  produto pro visitante. FGTS/à vista somam +10 ao score de urgência na landing; ter qualquer tag
  financeira "forte" (FGTS/pré-aprovado/entrada disponível) no cadastro completo eleva o score de
  50 pra 70.

Testado em Node: 17 cenários novos do módulo BaseImob (criação de lead, upsert por email
case-insensitive, contador de ID incremental, busca de idCliente por email, disparo de
notificação, roteamento GET com `?dados=`, roteamento POST, confirmação de que ações do Base
Inteligente continuam exigindo token) — todos passaram, mais as 5 suítes anteriores (matching,
auth gate, multi-select, área mínima, status/cidade/padrão/estado) sem regressão. Testado no
preview: segmentação por região isola corretamente o estoque certo, bônus de pontuação aplica
certo nos dois formulários, headline/cards renderizam como esperado.

**Ação pendente do usuário**: colar o `Code.gs.txt` atualizado no editor do Apps Script e
reimplantar — sem isso o BaseImob não tem backend funcionando (o teste no preview contra a URL ao
vivo confirmou que ainda está bloqueando com `nao_autenticado`, como esperado antes do deploy).

## 2026-07-03 (parte 14) — Todos os filtros de chip da Busca Aberta viram múltipla escolha

Pedido do usuário: os chips (tags) da Busca Aberta só aceitavam 1 opção marcada por grupo — clicar
num segundo desmarcava o primeiro. Exemplo dado: cliente que aceita tanto 2 quanto 3 quartos não
conseguia marcar os dois.

**Fix no front-end** (`busca.html`): `toggleChip()` não desmarca mais os outros chips do mesmo
grupo — todo grupo (tipo, padrão, quartos, suítes, vagas, cidade, estado, status, urgência) agora
funciona como bairro/condições/características já funcionavam (múltipla escolha nativa).
`getChipUnico()` (só retornava o único chip marcado) foi removido — sem uso depois da mudança,
todo grupo usa `getChips()` (array) agora.

**Fix no back-end** (`Code.gs.txt`, `buscaAberta_()`) — cada tipo de filtro precisou de uma
estratégia diferente pra aceitar array em vez de valor único:
- **Quartos/suítes/vagas**: antes viravam texto livre injetado (“2 quartos”) pro motor tentar
  extrair de volta com regex — não dava pra representar múltiplos valores nesse formato. Viraram
  filtro rígido de verdade (`imovelBateContagem_`): bate se o imóvel atender **qualquer um** dos
  valores marcados, com suporte ao sufixo "+" dos chips (ex: "4+" = 4 ou mais).
- **Status/cidade/estado**: já eram filtro rígido de valor único (`===`) — só trocou pra
  checagem de array (`.indexOf(...) >= 0`, bate com qualquer um dos marcados).
- **Tipo/padrão**: são os únicos dois que entram no motor de score (`scoreTipo_`/`scorePadrao_`),
  que só aceita um valor por chamada. Pra múltipla escolha, `buscaAberta_()` agora testa **cada
  combinação tipo×padrão marcada** pra cada imóvel e fica com a de melhor nota
  (`melhorMatch_()`) — equivalente a "compatível com qualquer um dos marcados".
- **Retrocompatibilidade**: `paraArray_()` aceita tanto o formato novo (array) quanto o antigo
  (string única), então nada quebra se algum outro chamador ainda mandar valor único.

Testado em Node: 7 cenários novos de múltipla escolha (quartos 2 ou 3, tipo Apartamento ou Casa,
status Pronto ou Pronto novo, cidade Goiânia ou Anápolis, padrão Alto ou Luxo, retrocompatibilidade
com string única, chip "4+") — todos corretos. Recontestei as 3 suítes de filtro anteriores
(status/cidade/padrão/estado, área mínima) sem regressão. Testado no preview: marcar 2 chips do
mesmo grupo mantém os dois marcados, payload sai como array, resumo mostra "2 ou 3 quartos" /
"Apartamento ou Casa" etc. `testarMatching()` continua 19/19.

## 2026-07-03 (parte 13) — Filtro de Área útil mínima na Busca Aberta

Pedido do usuário: filtro pra área útil mínima, no mesmo formato do filtro de preço (barra pra
arrastar + valor digitável, sincronizados).

**Diferença de design em relação ao preço**: preço é um alvo com margem pra ambos os lados (o
motor aceita imóveis um pouco acima/abaixo, com pontuação decrescente via `scorePreco_`). Área
útil mínima é só um **piso rígido** — "quero pelo menos X m²", sem teto e sem pontuação parcial.
Por isso virou filtro rígido em `buscaAberta_()` (`Code.gs.txt`), igual a status/cidade/estado, em
vez de entrar no motor de score: imóvel com área abaixo do mínimo é excluído dos resultados, e
imóvel sem área cadastrada também fica de fora quando o filtro está ativo (não dá pra saber se
atende um mínimo que não está informado).

`busca.html`: nova seção "Área útil mínima" reaproveitando as mesmas classes CSS do filtro de
preço (`.preco-input-row`/`.preco-prefixo`/`.preco-input`/`.slider-wrap`, já genéricas o
suficiente), com slider 0–1.000m² e campo digitável sincronizados (`atualizarSliderArea`/
`atualizarAreaDigitada`, mesmo padrão de `atualizarSlider`/`atualizarPrecoDigitado`). Incluído no
payload de `executarBusca()`, no resumo dos resultados ("300m²+") e zerado em `novaBusca()`.

Testado em Node (4 cenários: filtro isola só o imóvel grande o suficiente, inclui os que atendem
o mínimo de fontes diferentes, área=0 não filtra nada, `interpretado.areaMin` reflete o valor
usado) e no preview (digitar sincroniza com o slider e vice-versa, payload correto, resumo exibe
"300m²+", reset zera tudo). `testarMatching()` e as suítes de status/cidade/padrão/estado
continuam passando, sem regressão.

## 2026-07-03 (parte 12) — Filtros de Cidade, Padrão e Estado na Busca Aberta

Pedido do usuário: mais colunas de LANCAMENTOS viravam filtro importante na Busca Aberta. Além de
tipo/bairro/status (já feitos), adicionados:

- **Cidade** e **Estado (UF)** — filtro **rígido** (ou é a cidade/estado certo ou não é, igual ao
  filtro de status). Cidade coleta de REVENDA + CONSTRUTORA + LANCAMENTOS (as 3 fontes têm essa
  coluna). Estado só existe em LANCAMENTOS hoje — filtrar por estado naturalmente restringe a
  busca só a Lançamentos, o que é esperado dado o schema atual.
- **Padrão** (Popular/Médio/Alto/Luxo) — diferente dos outros dois, usa o **`scorePadrao_` que já
  existe no motor** (soft-score, dá crédito parcial pra padrão vizinho, ex: Alto x Médio) em vez
  de filtro rígido — antes `buscaAberta_()` sempre mandava `padrao: ''` pro contato sintético,
  agora manda `d.padrao`. Coleta de REVENDA (`padrao`) + LANCAMENTOS (`padrao`) +
  CONSTRUTORA-APARTAMENTOS (via `classe`, que é a coluna que `constutoraParaImovel_()` já usa como
  padrão desse imóvel).

**Fix colateral necessário**: `lancamentoParaImovel_()` não expunha `estado` no objeto de imóvel
retornado (só existia na linha crua da planilha) — sem isso o filtro de estado não teria como
comparar nada. Adicionado `estado: row.estado || ''` no mapeamento.

`busca.html`: 3 novas seções de chips single-select (Padrão, Cidade, Estado), populadas
dinamicamente pelo mesmo `opcoes_filtro` que já alimenta tipo/bairro/status, incluídas no payload
de `executarBusca()` e no resumo exibido em cima dos resultados.

Testado em Node com 3 fontes simuladas (Revenda em Goiânia, Construtora em Goiânia via `classe`,
3 Lançamentos em Goiânia/GO, Anápolis/GO e Brasília/DF): cidades/padrões/estados aparecem
corretamente nas opções: filtro por cidade isola só o lançamento certo; filtro por estado GO pega
os 2 de Goiás e exclui o de Brasília e a Revenda/Construtora (sem coluna estado); filtro de padrão
não quebra a busca. Testado no preview: chips renderizam, seleção entra no payload e aparece no
resumo ("Apartamento · Alto · Goiânia/GO · Setor A"). `testarMatching()` continua 19/19.

## 2026-07-03 (parte 11) — LANCAMENTOS também alimenta tipos/bairros da Busca Aberta

Usuário zerou a aba CONSTRUTORA-APARTAMENTOS de propósito, pra usar só os dados atualizados de
LANCAMENTOS. Isso expôs uma lacuna já existente: `opcoesFiltro_()` só coletava "Tipo de imóvel" e
"Bairros" de REVENDA e CONSTRUTORA-APARTAMENTOS — nunca olhava LANCAMENTOS. Com a Construtora
vazia, um tipo (ex: Casa) ou bairro que só existisse em Lançamentos não aparecia como opção de
filtro na Busca Aberta.

**Fix**: `Code.gs.txt` — `opcoesFiltro_()` agora também roda `registrarTipo`/`registrarBairro`
sobre `lerAba_('LANCAMENTOS')`, junto com REVENDA e CONSTRUTORA (mesmo agrupamento normalizado já
usado pros outros dois). Testado em Node com CONSTRUTORA-APARTAMENTOS vazia (cenário real atual) e
um lançamento com tipo "Casa" + bairro exclusivo: ambos passaram a aparecer nas opções. Suíte de
filtro de status (parte 10) e `testarMatching()` continuam passando, sem regressão.

## 2026-07-03 (parte 10) — Status "Pronto novo" + filtro de status na Busca Aberta

**1. Fix na extração do Bloco 1 (Lançamentos)**: "Estágio: Pronto novo" (Orulo) estava sendo
simplificado pra "Pronto" — a classificação `es.includes('pronto')` batia antes de checar o caso
mais específico "pronto novo". `lancamentos.html`: adicionado um `else if` checando "pronto novo"
**antes** do "pronto" genérico, e a opção "Pronto novo" no `<select id="f-status">` (antes só
tinha Em planta/Em obras/Pronto/Entregue). Testado com o exemplo real da Ares Marista (Node +
preview): status extraído corretamente como "Pronto novo"; reconfirmado que "Estágio: Pronto para
entregar" continua virando "Pronto" normalmente, sem regressão.

**2. Filtro "Status do empreendimento" na Busca Aberta**: pedido do usuário pra poder filtrar
resultados por estágio da obra (Em planta/Em obras/Pronto/Pronto novo/Entregue), já que isso só
existe pra Lançamentos e Construtora (Revenda é sempre pronto/usado).
- `Code.gs.txt`: `opcoesFiltro_()` agora também coleta os valores distintos de `status` de
  LANCAMENTOS e CONSTRUTORA-APARTAMENTOS (mesmo padrão de agrupamento normalizado já usado pra
  tipo/bairro), devolvidos como `status: [...]`. `buscaAberta_()` passa a aceitar `d.status` e
  aplica um **filtro rígido** (exclui da busca em vez de só pontuar) — status é categórico
  (é o estágio certo ou não é), igual à desqualificação por tipo incompatível, diferente do
  bairro/preço que dão pontuação parcial.
- `busca.html`: nova seção de filtro "Status do empreendimento" (chips single-select, populados
  dinamicamente via `opcoes_filtro`, igual ao padrão de "Tipo de imóvel"), incluída no payload de
  `executarBusca()` e exibida no resumo do resultado (`renderResultados`).

Testado em Node (mock do `SpreadsheetApp`): `opcoesFiltro_()` traz os 3 status de exemplo, filtro
por "Pronto novo" isola corretamente só o lançamento certo, sem filtro retorna todos. Testado no
preview: chips renderizam, seleção envia `status` no payload de busca. `testarMatching()` e o
teste de extração do Bloco 1 continuam passando (sem regressão).

## 2026-07-03 (parte 9) — Segurança: backend passa a exigir sessão válida

**Achado**: a tela de senha nas 5 páginas era só cosmética. `doGet`/`doPost` no `Code.gs.txt` não
checavam nenhuma credencial antes de executar ações — `verificar_senha` só devolvia `true/false`
pro navegador guardar num `sessionStorage`, mas `dashboard`, `buscar`, `buscar_linha`,
`matches_cliente`, `opcoes_filtro`, `listar_lancamentos`, `excluir`, `salvar`/`atualizar`,
`busca_aberta`, `salvar_lancamento` e `excluir_lancamento` executavam pra **qualquer chamada**,
sem verificar login algum. Como o repositório é público e agora até `config.js` deixa a URL do
Web App mais fácil de achar, qualquer pessoa com essa URL conseguia ler (e até apagar) a base
inteira de ~5700 contatos direto pela URL, sem senha nenhuma.

**Fix — sessão de servidor via `CacheService`**:
- `Code.gs.txt`: `verificarSenha_()` agora, ao validar a senha, gera um token de sessão
  (`criarSessao_()`, UUID guardado no `CacheService` com validade de 6h — o máximo permitido) e
  devolve ele na resposta. `doGet`/`doPost` passaram a checar `sessaoValida_(token)` antes de
  executar qualquer ação, **exceto** as do próprio fluxo de login/reset de senha
  (`verificar_senha`, `esqueci_senha`, `validar_token`, `salvar_senha` — essa última já é
  protegida pelo seu próprio token de reset, de uso único e validade de 1h).
- As 5 páginas HTML: guardam o token recebido no login em `sessionStorage` (`bi_session_token`,
  ao lado do `bi_session` já existente) e passam a mandar esse token em toda chamada sensível —
  como parâmetro `token` na URL (GET) ou dentro do JSON do corpo (POST). Se o servidor responder
  `{status:'nao_autenticado'}` (token ausente/expirado), a página volta pra tela de login em vez
  de falhar silenciosamente ou mostrar um erro genérico.
- `index.html`: o carregamento de cliente via `?linha=N` (link "Editar" do dashboard) foi movido
  pra só disparar **depois** do login confirmado (antes disparava imediatamente ao carregar a
  página, o que agora falharia com sessão ainda não validada).

**Trade-off consciente**: não é uma segurança "perfeita" — quem inspecionar o tráfego de rede
durante uma sessão ativa ainda veria o token válido por até 6h. Mas fecha a brecha atual de
"totalmente aberto, sem senha nenhuma", que é o problema real e presente.

**Validado sem tocar produção**: toda a lógica de gate (`sessaoValida_`, `doGet`, `doPost`) e a
emissão de token foram testadas em Node com `CacheService`/`PropertiesService` mockados (8/8
cenários: bloqueia sem token, bloqueia com token errado, libera com token válido, ações públicas
do fluxo de login continuam acessíveis). No lado do cliente, os 5 fluxos de login e as chamadas
sensíveis de cada página foram testados no preview com `fetch` mockado, confirmando que o token é
armazenado e enviado no formato certo em cada uma. `testarMatching()` continua 19/19 (mudança não
toca no motor de score).

**Achado à parte, não corrigido agora** (fora do escopo desta mudança): `lancamentos.html`
calcula o hash da senha como `sha256(senha)`, enquanto as outras 4 páginas usam
`sha256(senha + email)` — são fórmulas diferentes, então login feito diretamente nessa página
provavelmente sempre falharia com "Senha incorreta". Na prática isso não trava ninguém, porque
`sessionStorage` é compartilhado entre páginas da mesma aba, e o usuário sempre chega em
Lançamentos já autenticado por outra página. Vale corrigir num momento oportuno.

**Ação pendente do usuário**: colar o `Code.gs.txt` atualizado no editor do Apps Script e
reimplantar ("Editar implantação → Nova versão").

## 2026-07-03 (parte 8) — Causa raiz do mojibake (corrupção de acentos): confirmada

Investigação da 3ª ideia de melhoria pendente desta sessão. Revisão completa da cadeia de dados
(HTMLs, `processar_contatos_v3.py`, `importar_base_local.py`, `Code.gs.txt`, os CSVs reais em
Downloads) **não encontrou nenhum bug de encoding no código versionado** — `<meta charset="UTF-8">`
correto nos 5 HTMLs, scripts Python lendo/gravando `utf-8-sig` corretamente, Apps Script sem
manipulação de bytes/charset em nenhum ponto, `fetch()` nos HTMLs usando serialização UTF-8
padrão do navegador.

**Causa raiz confirmada pelo usuário**: o fluxo de trabalho real é abrir o `.csv` exportado do
Google Contacts **no Excel** logo após a exportação, pra organizar colunas manualmente, e só
depois importar pro Google Sheets. O Excel do Windows, ao salvar de volta como "CSV (Comma
delimited)" (a opção padrão do "Salvar Como"), resalva o arquivo em `cp1252`/`latin-1` sem BOM —
corrompendo acentos de forma **irreversível** antes mesmo do arquivo chegar aos scripts Python ou
ao Sheets. Não é um bug de código; é um problema no formato de exportação do Excel.

**Correção recomendada** (fora do código, mudança de processo):
- Se precisar reorganizar colunas no Excel, salvar com a opção **"CSV UTF-8 (Comma delimited)
  (*.csv)"** no menu Salvar Como (Excel 2016+ tem essa opção separada de "CSV (Comma delimited)")
  — preserva o UTF-8 com BOM.
- Alternativa mais segura: organizar as colunas direto no Google Sheets (importar o CSV bruto,
  reorganizar lá, exportar de novo se precisar) e nunca abrir/resalvar CSV intermediário no Excel.

**Fix de código aplicado** (mitigação, não a causa): os dois scripts de migração
(`scripts/processar_contatos_v3.py`, `scripts/importar_base_local.py`) tinham um fallback
silencioso pra `latin-1` quando o arquivo não decodifica como UTF-8 — hoje imprime um aviso
explícito nesse caso, apontando o Excel como suspeito mais provável, em vez de processar e gerar
uma planilha já corrompida sem avisar ninguém.

## 2026-07-03 (parte 7) — WEBHOOK_URL centralizado em config.js

Terceira ideia de melhoria proposta nesta sessão, aprovada pelo usuário: toda vez que o Code.gs é
reimplantado gerando uma URL nova, ela precisava ser copiada manualmente em 5 arquivos
(`index.html`, `dashboard.html`, `busca.html`, `lancamentos.html`, `reset.html`) — fácil esquecer
um e deixar uma página órfã apontando pra URL antiga.

**Fix**: criado `config.js` na raiz do repositório com a constante `WEBHOOK_URL`. As 5 páginas
agora carregam `<script src="config.js"></script>` logo antes do próprio `<script>` que usa a
constante, em vez de declará-la localmente. Daqui pra frente, uma reimplantação com URL nova
exige editar **1 arquivo**, não 5.

Retestado no preview: as 5 páginas carregam `config.js` sem erro de console, `WEBHOOK_URL` fica
definida globalmente antes de qualquer chamada de rede, e nenhuma delas ficou com declaração
duplicada da constante.

**Lembrete do usuário, sem precisar de código**: usar sempre "Editar implantação → Nova versão"
no Apps Script (em vez de "Nova implantação") já evita a URL mudar — o `config.js` cobre o caso
em que ela muda mesmo assim.

## 2026-07-03 (parte 6) — Coluna "unidades" renomeada para "unidade" em LANCAMENTOS

Pedido do usuário: a coluna guarda um **código de referência de uma unidade específica** (ex:
"102B"), não uma quantidade — o plural estava incoerente com o dado real.

**Verificação pedida pelo usuário — onde mais essa informação aparecia**:
- `Code.gs.txt`: `CABECALHO_LANCAMENTOS` (nome da coluna), `lancamentoParaImovel_()` (lia
  `row.unidades`) e `salvarLancamento_()` (escrevia `u.unidades` na planilha) — todos renomeados
  para `unidade`.
- `lancamentos.html`: campo por unidade em 3 pontos — `agruparPorArea()` (valor padrão vazio),
  a tabela de edição manual (BOX 2, coluna "Unid.") e o payload montado em `lerPreview()` antes
  de salvar — todos renomeados de `unidades` para `unidade`.
- **Não precisou mudar**: a aba **CONSTRUTORA-APARTAMENTOS** tem sua própria coluna `unidades`
  (em `CABECALHO_CONSTRUTORA`) — é um dado diferente (não usado em nenhuma lógica hoje, e é uma
  aba separada), então ficou como estava. Os usos de "unidades" no `dashboard.html` e o restante
  das ocorrências em `lancamentos.html` (`unidades-table`, `unidades-tbody`, `dados.unidades`,
  o array de tipologias de um empreendimento) são coleções/arrays de verdade — plural correto,
  não fazem parte dessa coluna e não precisaram mudar.

**Bug preexistente encontrado durante a verificação** (não causado por esta mudança, mas achado
ao rastrear todas as referências): o painel expandido de um lançamento já salvo (clique em "Ver
unidades" no card) tentava ler um campo `qtdUnidades` que nunca existiu nos dados carregados do
backend — sempre mostrava "—" nessa coluna, silenciosamente. Corrigido para ler o campo certo
(`unidade`) e o cabeçalho da coluna, que dizia "Qtd", foi trocado para "Unid." (mesmo rótulo já
usado na tabela de edição manual), já que o conteúdo é um código, não uma contagem.

Retestado no preview: extração/edição manual (BOX 2), payload de salvamento (`lerPreview()`) e
o painel expandido (`renderPanel()`) todos exibindo/enviando o código da unidade corretamente.
Suíte `testarMatching()` continua 19/19 (mudança não afeta o motor de score).

**Ação pendente do usuário**: como o nome da coluna mudou (não é campo novo, é rename no mesmo
lugar do array — não desalinha dados existentes), rode `migrarCabecalhoLancamentos()` uma vez
pelo editor do Apps Script após colar o Code.gs atualizado, pra atualizar o texto do cabeçalho
na planilha.

## 2026-07-03 (parte 5) — Testes automatizados do matching + campo Estado em Lançamentos

Usuário aprovou 2 das 3 ideias de melhoria detalhadas na parte anterior da sessão.

**1. Smoke test do motor de matching** (`Code.gs.txt`, função `testarMatching()`): suíte de 19
asserções que roda as funções puras de score (`calcularScoreTotal_`, `classificarTemperatura_`,
`scorePreco_`, `scoreTipo_`, `calcularMatch_`) com dados fixos e confere o resultado — não lê nem
escreve na planilha, então é seguro rodar a qualquer momento pelo editor do Apps Script (selecionar
a função no dropdown e clicar Executar; resultado sai no Logger). Cada caso corresponde a um bug
real já corrigido nesta sessão (fallback do Score Total sem match, bandas de margem de preço,
desqualificação por tipo incompatível, normalização Terreno/Lote, limite de 30 pontos da
contribuição do preço) — se algum passar a falhar depois de uma mudança futura, é sinal de
regressão. Validado rodando a suíte completa fora do Apps Script (Node) antes de commitar: 19/19
passaram.

**2. Campo Estado (UF) em Lançamentos**: extraído automaticamente da linha de endereço do Orulo
(mesma regex que já extraía a cidade, ex: "- Goiânia/GO" → estado="GO") e exibido/editável no
formulário (`lancamentos.html`, campo `f-estado`, ao lado de Cidade).

Detalhe técnico importante: `estado` foi adicionado no **fim** de `CABECALHO_LANCAMENTOS`, não ao
lado de `cidade` (onde faria mais sentido visualmente) — porque `migrarCabecalhoLancamentos()`
só sabe *anexar* colunas novas no final da planilha. Inserir no meio do array teria desalinhado
todos os dados já cadastrados (a partir da coluna `endereco` em diante, cada valor passaria a
cair uma coluna adiante da que o cabeçalho diz). Mesmo padrão já usado para `idCliente` em
`CABECALHO`. **Ação pendente do usuário**: rodar `migrarCabecalhoLancamentos()` uma vez pelo
editor do Apps Script após atualizar o Code.gs, pra criar a coluna nova na planilha.

## 2026-07-03 (parte 4) — Faixas de padrão (R$/m²) por tipo de imóvel

Correção do usuário sobre a parte 3: as faixas de R$/m² usadas para classificar o "padrão"
(Popular/Médio/Alto/Luxo) só valem para **Apartamento** — Casa, Lote, Lote em condomínio,
Cobertura, Lote comercial e Casa em condomínio têm escalas de mercado bem diferentes (lote
costuma valer bem menos por m² que apartamento; cobertura costuma valer mais), e o código
precisava prever isso mesmo sem ainda ter os valores reais de cada tipo.

**Fix em `lancamentos.html`**: `classificarPadraoPorM2_(v)` virou `classificarPadraoPorM2_(v,
tipoTexto)`, consultando uma tabela `FAIXAS_PADRAO_POR_TIPO` com uma faixa `{medio, alto, luxo}`
por tipo (chave normalizada: minúsculo, sem acento). Só **apartamento** tem valores confirmados
pelo usuário (`5000/10000/15000`); os demais tipos usam os mesmos valores como placeholder
provisório, comentado no código, até o usuário passar a referência real de cada um — não precisa
mexer em mais nada além da tabela quando esses valores chegarem, a busca já é por tipo.

O texto bruto do tipo (ex: viria "lote em condomínio" se o Orulo informasse isso na seção
"Tipologias disponíveis", texto mais granular que os 4 valores do seletor
Apartamento/Casa/Terreno/Comercial) é capturado em `extrairBloco1()` numa variável de escopo de
função (`tipoTextoBruto`) e passado direto pra classificação — antes ficava preso dentro do bloco
`if` da extração de tipo e não existia caminho pra chegar até a extração de padrão.
Retestado com o exemplo real "Ares Marista" (apartamento, R$ 12.888/m² → Alto): resultado
inalterado, confirmando que não houve regressão pro caso já validado na parte 3.

## 2026-07-03 (parte 3) — Melhora extração do Bloco 1 em Lançamentos (Orulo)

Usuário mandou um exemplo real de texto colado da página inteira do Orulo (com o menu
"Orulo / Foto de perfil / WhatsApp / Empreendimentos / ..." antes do título do empreendimento).

**Causa raiz encontrada**: quando se cola a página inteira (não só o bloco a partir do título), o
nome do empreendimento e o endereço ficam bem mais abaixo no texto (linha 14 no exemplo, não
linha 1/2) — a extração antiga só olhava as primeiras 6-10 linhas e acabava capturando "Orulo"
(o próprio cabeçalho do site) como nome do empreendimento.

**Fix**: `extrairBloco1()` agora localiza a linha de endereço (padrão `Rua/Av./Setor/...`) em
**qualquer posição do texto**, e usa a linha imediatamente anterior a ela como título — no padrão
Orulo, título e endereço sempre ficam colados um no outro, independente de quanto menu vier
antes. Testado nos dois formatos (paste limpo desde o título, e paste da página inteira) sem
regressão.

**Novos campos extraídos automaticamente** (pedido do usuário, com exemplo real "Ares Marista -
Bambuí" / "Rua 1141 551. Setor Marista - Goiânia/GO" / "(R$ 12.888/m²)" / "Tipologias
disponíveis Apartamento"):
- **Cidade**: extraída da linha de endereço (`- Cidade/UF`), normalizada pro mesmo padrão do
  resto da base (minúsculo, sem acento — ex: "Goiânia" → "goiania"). Estado (UF) só é usado
  internamente pra achar onde a cidade termina — não tem coluna própria ainda.
- **Tipo de imóvel**: da seção "Tipologias disponíveis" (Apartamento/Casa/Terreno/Comercial).
- **Padrão**: calculado a partir do R$/m² informado — `<R$5.000` Popular, `R$5.000–9.999`
  Médio, `R$10.000–14.999` Alto, `>=R$15.000` Luxo. Adicionada a opção **"Luxo"** no seletor de
  padrão (só existiam Alto/Médio/Popular antes — faltava o nível mais alto).

## 2026-07-03 (parte 2) — Segurança: token da Imobzi exposto em repositório público

Ao versionar o `Code.gs.txt` (parte 1, mesmo dia), o `IMOBZI_TOKEN` (credencial de API da Imobzi,
hardcoded) foi junto — e o repositório `chaverleo1/base-inteligente` é **público** (obrigatório
pro GitHub Pages gratuito), então o token ficou exposto publicamente.

**Ação do usuário**: regenerar o token no painel da Imobzi (invalida o antigo, que já esteve
exposto).

**Fix no código**: `IMOBZI_TOKEN` deixou de ser uma constante no arquivo — `obterImobziToken_()`
lê de `PropertiesService.getScriptProperties()` (mesmo mecanismo já usado pra `bi_password_hash`
e `bi_reset_token`, então é um padrão já estabelecido no projeto, não algo novo). **Configuração
única necessária**: no editor do Apps Script → ⚙️ Configurações do projeto → Propriedades do
script → adicionar `IMOBZI_TOKEN` com o valor do token novo.

Verificado: nenhum outro segredo hardcoded no `Code.gs.txt` nem no `lancamentos_code_gs.txt`
(SHEET_ID e e-mails não são credenciais — não concedem acesso por si só).

## 2026-07-03 — Sincronização com a estação servidor + Code.gs versionado pela primeira vez

Trabalho feito na estação servidor em 2026-07-02 (20 commits) trazido pra este repositório via
`git pull` (fast-forward limpo, sem conflitos). Resumo do que veio:

- **Módulo Lançamentos** (`lancamentos.html`, novo): ferramenta pra cadastrar empreendimentos em
  pré-lançamento/construção. Cola um texto (formato do site Orulo) e um parser extrai
  automaticamente empreendimento, construtora, bairro, endereço, tabela de tipologias
  (quartos/suítes/vagas/área/preço), lazer e conceito. Detecta a data da tabela de preços com
  alerta visual de "Atualizada"/"Desatualizada". Nova aba **LANCAMENTOS** na planilha.
- **Lançamentos integrado como 3ª fonte no motor de matching** (`rodarMatching`, `buscaAberta_`)
  ao lado de Revenda e Construtora — confirmado ao vivo, uma busca traz resultados dos 3 tipos.
  Aparece também no drawer do cliente no dashboard com o selo de status da tabela de preços.
- **Busca Aberta ganhou exportação em PDF**: seleciona vários imóveis com checkbox e gera um PDF
  de ofertas (usa impressão nativa do navegador em A4 paisagem — sem depender de biblioteca de
  PDF).

### Code.gs versionado no repositório pela primeira vez

Até agora o Code.gs só existia no editor do Apps Script e em cópias locais de cada estação — as
duas sessões (aqui e no servidor) divergiram sem se perceber, e só foi descoberto porque o motor
de matching em produção já lia uma aba (LANCAMENTOS) que minha cópia local nem conhecia.

Adicionado **`Code.gs.txt`** na raiz do repositório com o conteúdo completo e atual (1528 linhas,
confirmado batendo com a produção via testes diretos na API: `listar_lancamentos`,
`opcoes_filtro`, `busca_aberta` com as 3 fontes). Esse arquivo agora é a fonte de verdade —
`lancamentos_code_gs.txt` (commitado antes, na estação servidor) é um rascunho anterior das
instruções de integração e ficou desatualizado em detalhes (ex: usa `respJson_` em vez de `ok`,
`CABECALHO_LANCAMENTOS` com campos diferentes do que foi implementado de fato); mantido só como
histórico, não deve ser usado como referência de código atual.

**A partir de agora**: qualquer edição no Code.gs, de qualquer estação, deve terminar com esse
arquivo atualizado e commitado — é a única forma de manter as duas estações (e futuras sessões)
sincronizadas sem precisar descobrir divergências por acidente de novo.

## 2026-07-01 (parte 14) — Correção: bairros duplicados por grafia diferente

`opcoes_filtro` (parte 13) retornou 220 bairros em produção — inflado porque o mesmo bairro
aparece cadastrado com grafias diferentes (ex: "AEROVIARIO" maiúsculo sem acento e "Aeroviário"
com acento contam como dois distintos). Corrigido: `opcoesFiltro_()` agora agrupa por texto
normalizado (`norm_`, mesma função usada no motor de matching) antes de montar a lista, mantendo
uma versão em Title Case pra exibição. Testado: 5 grafias diferentes de 3 bairros reais
viraram corretamente 3 chips, sem duplicata.

## 2026-07-01 (parte 13) — Busca Aberta: chips dinâmicos + preço digitável

Dois ajustes na Busca Aberta (parte 12):

1. **Chips de tipo e bairro agora vêm da base real**, não de lista fixa. Nova ação
   `opcoes_filtro` no Code.gs lê os valores distintos de `tipo` e `bairro` em REVENDA +
   CONSTRUTORA-APARTAMENTOS e devolve ordenado; `busca.html` carrega isso ao abrir a página e
   monta os chips dinamicamente. Confirmado na base real: 15 tipos distintos em REVENDA, 34+
   bairros só na construtora (a lista fixa anterior tinha só 5 tipos e 6 bairros de exemplo).
2. **"Preço máximo" renomeado para "Preço limite"** (consistente com o resto do app), e
   adicionado um campo de texto pra digitar o valor exato, sincronizado com a barra de
   rolagem — útil pra valores fora da faixa visual dela (ex: acima de R$ 5M) ou pra digitar
   direto em vez de arrastar.

## 2026-07-01 (parte 12) — Busca Aberta: encontrar imóveis sem precisar de cadastro

Nova página `busca.html` (nova aba no menu de todas as páginas) — descreve o que um possível
cliente busca (chips estruturados de tipo/quartos/suítes/vagas/preço/bairros/condições de
pagamento/características + texto livre) e mostra os imóveis compatíveis da base real
(REVENDA + CONSTRUTORA-APARTAMENTOS), sem precisar cadastrar a pessoa antes. No fim, oferece
cadastrar o cliente (nome + telefone) com os critérios já identificados.

**Backend (Code.gs):**
- `buscaAberta_(d)`: recebe os filtros estruturados, monta um "contato sintético" e roda no
  mesmo motor de match do `rodarMatching()` (`calcularMatch_`) contra todos os imóveis — não
  grava nada, é só consulta. Limiar de score mais permissivo (40, contra 70 do matching oficial)
  porque aqui é exploratório.
- `extrairValorTexto_()`: versão em JS do extrator de preço do script de migração (K/mil/Mi/milhão).
- Nova rota em `doPost`: `acao: 'busca_aberta'`.

**Limitação conhecida**: os chips de "características desejadas" (quintal, na laje, piscina
etc.) não influenciam o score ainda — REVENDA/CONSTRUTORA-APARTAMENTOS não têm essas colunas
hoje (só existem como preferência do cliente em CONTATOS). Ficam salvos no cadastro se a pessoa
for cadastrada, mas não filtram imóveis por enquanto.

**Incidente durante o desenvolvimento**: um teste da função antes do deploy do backend caiu no
fallback padrão do `doPost` (que sempre chamava `salvar()` pra ações não reconhecidas) e criou um
contato em branco na planilha de produção (linha 5042). Identificado e apagado na hora via
`buscar_linha`/`excluir`, sem perda de dados reais. Corrigido o `doPost` pra nunca mais deixar
isso acontecer: uma ação nomeada mas não reconhecida agora retorna erro em vez de cair no
`salvar()`, e o próprio `salvar()` exige nome+telefone.

## 2026-07-01 (parte 11) — ID permanente do cliente (fim do CLI-XXXXX instável)

Problema descoberto ao investigar um caso confuso: o usuário perguntou sobre CLI-10048 e, ao
verificar de novo minutos depois, esse código já apontava pra uma **pessoa completamente
diferente** ("Fernando Neves" em vez de "Priscila"). Causa raiz: `gerarCodigo_(linha)` calculava
o código **a partir da posição da linha na planilha**, não é um identificador real — toda vez que
a aba CONTATOS é reimportada/reordenada (o que já aconteceu várias vezes nesta sessão), todos os
códigos CLI-XXXXX silenciosamente passam a apontar pra pessoas diferentes.

**Fix — ID permanente de verdade:**
- Nova coluna `idCliente` no `CABECALHO` (Code.gs) — gravada na própria linha, nunca recalculada.
- `proximoIdCliente_()`: gera o próximo ID lendo o maior número já usado na coluna + 1 (com
  `LockService` pra evitar corrida em cadastros simultâneos).
- `salvar()`: gera e grava um ID novo pra todo cadastro novo.
- `atualizar()`: preserva o ID existente, igual já fazíamos com `dataCadastro`/`tipo_contato`.
- `preencherIdsFaltantes()`: função pra rodar **uma vez manualmente** depois do deploy — garante
  o cabeçalho da coluna e preenche o ID de todo contato que já existe na planilha hoje (a base
  toda, migrada antes dessa feature existir). Não mexe em mais nada da linha, só preenche o que
  falta.
- `dadosDashboard()`, `top20`, `empurrarMatch_()`: agora usam `obj.idCliente` (com fallback pro
  cálculo antigo só como segurança, caso alguma linha ainda não tenha sido preenchida).
- `dashboard.html`: a função `abrirCliente()` fazia uma conta frágil (`_linha` esperada a partir
  do código) pra desambiguar clientes com nome repetido — simplificado pra `x.idCliente === cod`,
  direto e correto.
- `importar_base_local.py`: futuras migrações já saem com `idCliente` de fábrica
  (`CLI-{10000+posição}`, mesma numeração histórica).

**Importante**: a planilha `planilha_modelo_contatos.xlsx` regenerada NÃO deve ser reimportada
sobre a aba CONTATOS em produção — a planilha ao vivo já divergiu bastante do arquivo de
migração local (reimportações/edições manuais ao longo da sessão). Em vez disso, depois de
reimplantar o Code.gs, **rodar `preencherIdsFaltantes()` uma vez** no editor do Apps Script —
ela trabalha em cima do que já está na planilha, sem substituir nada.

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
