# Changelog — Base Inteligente

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
