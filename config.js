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
