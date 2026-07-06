# Changelog — Base Inteligente

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
