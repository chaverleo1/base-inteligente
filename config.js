// URL do Web App do Apps Script (Code.gs) — único lugar a editar após reimplantar
// o backend. As 5 páginas (index, dashboard, busca, lancamentos, reset) carregam
// este arquivo via <script src="config.js"></script> antes do próprio script,
// então basta atualizar aqui em vez de repetir a URL em cada arquivo.
//
// Lembrete: usar "Editar implantação → Nova versão" no Apps Script mantém essa
// URL estável — só "Nova implantação" gera uma URL nova que precisaria ser
// colada aqui.
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxxlKelRh51vwcPq86z8pIWRF4YSwAE6K8b7Gh7Isu1ia8J4xiRAW_8EAOMI6sEmJd5/exec';
// (touch 2026-07-03 13:xx — forca novo build do GitHub Pages, que travou apos o commit anterior)
// (touch 2026-07-06 12:5x — deploy travou nos ultimos commits de novo, forcando novo build)
// (touch 2 2026-07-06 13:2x — primeiro touch nao desprendeu o deploy, tentando de novo)

// ── PADRÃO DE PREÇO (R$ 553.235,00) ──────────────────────────────────────────
// Usado nos campos de preço de lancamentos.html/lancamentos-editar.html.
// Três funções separadas de propósito, cada uma resolvendo um problema
// diferente do "mascara de dinheiro":
//
// 1) formatarPrecoBR (oninput) — só agrupa milhar ENQUANTO o usuário digita,
//    sem sufixo decimal. Se colocasse ",00" aqui, o próprio ",00" viraria
//    "dígito novo" na tecla seguinte (extraído de volta por /\D/g) e o valor
//    multiplicaria por ~100 a cada tecla — bug clássico de máscara de moeda.
// 2) normalizarPrecoBR (onblur) — fecha o valor no formato final "553.235,00"
//    quando o usuário sai do campo. Descarta tudo depois da primeira vírgula
//    ANTES de extrair dígitos, pra não reprocessar um ",00" que já esteja lá
//    (mesmo risco de multiplicar por 100 se rodasse de novo sem essa guarda).
// 3) valorPrecoBR (na hora de montar o payload) — converte "553.235,00" (ou
//    texto parcialmente digitado) de volta pra número puro, que é o que
//    realmente vai pro backend/planilha — nunca a string formatada.
function formatarPrecoBR(el) {
  const digitos = el.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  el.value = digitos ? parseInt(digitos, 10).toLocaleString('pt-BR') : '';
}

function normalizarPrecoBR(el) {
  const semDecimal = el.value.split(',')[0];
  const digitos = semDecimal.replace(/\D/g, '');
  el.value = digitos
    ? parseInt(digitos, 10).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

function valorPrecoBR(str) {
  if (!str) return 0;
  const limpo = String(str).replace(/R\$\s*/i, '').trim();
  const n = parseFloat(limpo.replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

// Formata um número já conhecido (ex: valor vindo do backend ou da extração
// da Orulo) direto no padrão de exibição "553.235,00" — usado ao popular um
// campo de preço, diferente das três funções acima (que tratam digitação).
function exibirPrecoBR(v) {
  const n = Number(v);
  return (n && n > 0)
    ? n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
}

// ── PERCENTUAL VENDIDO (Alterações 08/07, parte 2) ───────────────────────────
// "Estoque" é quantas unidades ainda restam à venda; "Total de unidades" é o
// empreendimento inteiro — vendidas = total - estoque. Não existe como coluna
// própria no backend (é sempre derivado desses dois campos que já existem),
// calculado direto na tela sempre que precisa exibir.
function calcularPercentualVendido(estoque, totalUnidades) {
  const est = parseInt(estoque, 10);
  const tot = parseInt(totalUnidades, 10);
  if (!tot || tot <= 0 || isNaN(est) || est < 0) return null;
  const vendidas = Math.max(0, tot - est);
  return Math.max(0, Math.min(100, Math.round((vendidas / tot) * 100)));
}

// Regras de cor do quadro (item 2.1): quanto mais vendido, mais "quente"/
// urgente a cor — até chegar em preto quando esgotou (100%).
function corPercentualVendido(pct) {
  if (pct >= 100) return { bg: '#000000', fg: '#ffffff' };
  if (pct > 90)   return { bg: '#e53935', fg: '#ffffff' }; // vermelho
  if (pct > 70)   return { bg: '#f57c00', fg: '#1a1a1a' }; // laranja
  if (pct > 50)   return { bg: '#f5c518', fg: '#1a1a1a' }; // amarelo
  return { bg: '#2e7d32', fg: '#ffffff' };                 // verde
}

// Monta o HTML do quadro "[90%|18]" — pct já calculado, estoque é o número
// de unidades restantes mostrado ao lado. Retorna '' se não dá pra calcular
// (empreendimento sem Estoque/Total de unidades preenchidos ainda).
function badgeVendidoHTML(pct, estoque) {
  if (pct == null) return '';
  const c = corPercentualVendido(pct);
  return `<span class="badge-vendido" style="background:${c.bg};color:${c.fg}">${pct}% | ${parseInt(estoque, 10)}</span>`;
}
