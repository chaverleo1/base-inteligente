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
