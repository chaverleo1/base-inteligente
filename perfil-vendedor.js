// ─── MÓDULO: PERFIL DO VENDEDOR — Modal compartilhado (Phase 2) ───────────────
// Injetado em busca.html, revendas-construtoras.html e lancamentos.html.
// Uso: abrirPerfilVendedor_(codigo, origemImovel, categorias, titulo, onSave)
//   onSave(json) é chamado após save bem-sucedido com {scoreVendedor, urgenciaNivel, margemEstimada}

(function() {
  // ── CSS ──────────────────────────────────────────────────────────────────────
  const css = `
.pv-overlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9000;
  display:flex;align-items:flex-start;justify-content:center;
  overflow-y:auto;padding:24px 12px;opacity:0;pointer-events:none;transition:opacity .2s}
.pv-overlay.open{opacity:1;pointer-events:all}
.pv-modal{background:#181c27;border:1px solid #2a3050;border-radius:14px;
  width:100%;max-width:560px;margin:auto;overflow:hidden}
.pv-modal-hd{padding:16px 20px;border-bottom:1px solid #2a3050;
  display:flex;align-items:center;justify-content:space-between;gap:12px;
  background:#1e2335;position:sticky;top:0;z-index:1}
.pv-modal-titulo{font-family:'Space Grotesk',sans-serif;font-size:15px;
  font-weight:700;color:#e8ecf4;min-width:0;flex:1;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pv-modal-close{background:transparent;border:none;color:#4a5470;
  font-size:20px;cursor:pointer;padding:0 4px;line-height:1;flex-shrink:0}
.pv-modal-close:hover{color:#e8ecf4}
.pv-modal-body{padding:16px 20px 24px}
.pv-score-result{display:none;background:#1e2335;border-radius:10px;
  padding:14px 16px;margin-bottom:16px;border:1px solid #2a3050}
.pv-score-box{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.pv-urg-badge{padding:6px 14px;border-radius:20px;font-weight:700;
  font-size:13px;letter-spacing:.4px}
.pv-urg-alta{background:rgba(255,107,107,.18);color:#ff6b6b;border:1px solid rgba(255,107,107,.3)}
.pv-urg-media{background:rgba(245,158,11,.18);color:#f59e0b;border:1px solid rgba(245,158,11,.3)}
.pv-urg-baixa{background:rgba(0,212,170,.18);color:#00d4aa;border:1px solid rgba(0,212,170,.3)}
.pv-score-nums{display:flex;gap:20px}
.pv-num{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:#e8ecf4}
.pv-num-label{font-size:11px;color:#8892aa;display:block}
.pv-cat-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px}
.pv-cat-tab{padding:6px 14px;border-radius:20px;border:1px solid #2a3050;
  background:transparent;color:#8892aa;font-size:12px;font-weight:600;
  cursor:pointer;transition:all .15s;font-family:'Inter',sans-serif}
.pv-cat-tab:hover{border-color:#4f7cff;color:#e8ecf4}
.pv-cat-tab.active{background:#4f7cff;border-color:#4f7cff;color:#fff}
.pv-section-title{font-size:11px;font-weight:700;text-transform:uppercase;
  letter-spacing:.8px;color:#4a5470;margin:14px 0 8px;padding-top:10px;
  border-top:1px solid #2a3050}
.pv-section-title:first-child{border-top:none;margin-top:0;padding-top:0}
.pv-row{margin-bottom:10px}
.pv-row label{display:block;font-size:12px;color:#8892aa;margin-bottom:4px;font-weight:500}
.pv-row input[type=text],.pv-row input[type=number],.pv-row input[type=month],
.pv-row select,.pv-row textarea{
  width:100%;background:#0f1117;border:1px solid #2a3050;border-radius:8px;
  color:#e8ecf4;font-size:13px;padding:8px 10px;font-family:'Inter',sans-serif;
  transition:border-color .15s;outline:none}
.pv-row input:focus,.pv-row select:focus,.pv-row textarea:focus{border-color:#4f7cff}
.pv-row select option{background:#181c27}
.pv-row textarea{resize:vertical}
.pv-row-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.pv-row-checks{display:flex;flex-wrap:wrap;gap:8px 16px}
.pv-row-checks label{display:flex;align-items:center;gap:6px;
  font-size:13px;color:#e8ecf4;cursor:pointer;font-weight:400;margin-bottom:0}
.pv-radio-group{display:flex;gap:16px}
.pv-radio-group label{display:flex;align-items:center;gap:6px;
  font-size:13px;color:#e8ecf4;cursor:pointer;font-weight:400;margin-bottom:0}
.pv-red-empty{font-size:12px;color:#4a5470;margin-bottom:6px}
.pv-red-row{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.pv-red-row input{flex:1;min-width:0;padding:6px 8px;font-size:12px}
.pv-red-row span{color:#4a5470;flex-shrink:0}
.pv-btn-add{background:transparent;border:1px dashed #2a3050;border-radius:8px;
  color:#4f7cff;font-size:12px;padding:6px 12px;cursor:pointer;margin-top:4px;
  font-family:'Inter',sans-serif;transition:border-color .15s}
.pv-btn-add:hover{border-color:#4f7cff}
.pv-btn-rem{background:transparent;border:none;color:#4a5470;
  font-size:14px;cursor:pointer;padding:2px 4px;flex-shrink:0}
.pv-btn-rem:hover{color:#ff6b6b}
.pv-btn-salvar{width:100%;padding:12px;border-radius:8px;border:none;
  background:#4f7cff;color:#fff;font-size:14px;font-weight:600;
  cursor:pointer;font-family:'Inter',sans-serif;margin-top:16px;transition:opacity .15s}
.pv-btn-salvar:hover{opacity:.88}
.pv-btn-salvar:disabled{opacity:.5;cursor:not-allowed}
.pv-alerta-excluido{background:rgba(255,90,90,.15);border:1px solid rgba(255,90,90,.3);
  border-radius:8px;padding:10px 14px;margin-bottom:14px;font-size:12px;font-weight:700;
  color:#ff6b6b;display:flex;align-items:center;gap:8px}
.pv-card-badge{display:none;align-items:center;gap:5px;
  padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;
  margin-top:4px;width:fit-content}
.pv-card-badge.pv-urg-alta{background:rgba(255,107,107,.15);color:#ff6b6b;border:1px solid rgba(255,107,107,.25);display:flex}
.pv-card-badge.pv-urg-media{background:rgba(245,158,11,.15);color:#f59e0b;border:1px solid rgba(245,158,11,.25);display:flex}
.pv-card-badge.pv-urg-baixa{background:rgba(0,212,170,.15);color:#00d4aa;border:1px solid rgba(0,212,170,.25);display:flex}
.pv-btn-card{background:transparent;border:1px solid #2a3050;border-radius:6px;
  color:#8892aa;font-size:11px;font-weight:600;padding:4px 10px;
  cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;flex-shrink:0}
.pv-btn-card:hover{border-color:#4f7cff;color:#4f7cff}
.pv-peso{display:inline-block;margin-left:6px;font-size:10px;font-weight:700;color:#00d4aa;
  background:rgba(0,212,170,.12);border-radius:99px;padding:1px 7px;vertical-align:middle}
.pv-group-desc{font-size:11px;color:#4a5470;margin:-4px 0 10px;line-height:1.4}
.pv-btn-emp{background:transparent;border:1px solid #2a3050;border-radius:6px;
  color:#8892aa;font-size:12px;font-weight:500;padding:5px 12px;
  cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s}
.pv-btn-emp:hover{border-color:#4f7cff;color:#4f7cff}
.pv-emp-badge{display:inline-flex;align-items:center;gap:5px;
  padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;vertical-align:middle}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML ─────────────────────────────────────────────────────────────────────
  const html = `
<div class="pv-overlay" id="pvOverlay" onclick="if(event.target===this)fecharPvModal_()">
  <div class="pv-modal" onclick="event.stopPropagation()">
    <div class="pv-modal-hd">
      <div class="pv-modal-titulo" id="pvModalTitulo">Perfil do Vendedor</div>
      <button class="pv-modal-close" onclick="fecharPvModal_()">✕</button>
    </div>
    <div class="pv-modal-body">
      <div id="pvAlertaExcluido" class="pv-alerta-excluido" style="display:none">⚠️ IMÓVEL EXCLUÍDO NO IMOBZI — os dados do vendedor foram preservados.</div>
      <div id="pvScoreResult" class="pv-score-result"></div>
      <div id="pvCatTabs" class="pv-cat-tabs"></div>
      <div id="pvFormBody"></div>
    </div>
  </div>
</div>`;
  function _pvInject_() { document.body.insertAdjacentHTML('beforeend', html); }
  if (document.body) { _pvInject_(); }
  else { document.addEventListener('DOMContentLoaded', _pvInject_); }
})();

// ── Estado global do módulo ───────────────────────────────────────────────────
const _pv = { codigo:null, origemImovel:null, categorias:[], titulo:'', catSelecionada:'PF', perfil:null, reducoes:[], onSave:null };

const _pvUrgConf = {
  ALTA:  { emoji:'🔴', label:'ALTA',  cls:'pv-urg-alta'  },
  MEDIA: { emoji:'🟡', label:'MÉDIA', cls:'pv-urg-media' },
  BAIXA: { emoji:'🟢', label:'BAIXA', cls:'pv-urg-baixa' }
};

function _pvToast_(msg, tipo) {
  if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  else if (typeof showToast === 'function') showToast(msg, tipo);
}

// ── Entrada pública ───────────────────────────────────────────────────────────
function abrirPerfilVendedor_(codigo, origemImovel, categorias, titulo, onSave) {
  _pv.codigo       = String(codigo || '');
  _pv.origemImovel = String(origemImovel || 'REVENDA');
  _pv.categorias   = categorias || ['PF','PJ','CORRETOR'];
  _pv.titulo       = titulo || codigo;
  _pv.catSelecionada = _pv.categorias[0];
  _pv.perfil       = null;
  _pv.reducoes     = [];
  _pv.onSave       = onSave || null;
  document.getElementById('pvModalTitulo').textContent = 'Perfil do Vendedor — ' + _pv.titulo;
  document.getElementById('pvAlertaExcluido').style.display = 'none';
  document.getElementById('pvScoreResult').style.display = 'none';
  document.getElementById('pvFormBody').innerHTML = '<div style="color:#8892aa;padding:20px 0;text-align:center">Carregando...</div>';
  document.getElementById('pvCatTabs').innerHTML = '';
  document.getElementById('pvOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  _pvCarregarPerfil_();
}

function fecharPvModal_() {
  document.getElementById('pvOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function _pvCarregarPerfil_() {
  try {
    const url = `${WEBHOOK_URL}?acao=getPerfilVendedor&codigo=${encodeURIComponent(_pv.codigo)}&origemImovel=${encodeURIComponent(_pv.origemImovel)}&token=${tokenSessao()}`;
    const resp = await fetch(url);
    const json = await resp.json();
    if (trataNaoAutenticado && trataNaoAutenticado(json)) return;
    _pv.perfil = json || null;
    if (_pv.perfil) {
      // "CONSTRUTORA" era uma categoria separada, mesclada em "PJ" (2026-07)
      // — perfis antigos salvos com essa categoria continuam abrindo
      // normalmente, só que agora na aba PJ (schema de campos específicos
      // mudou; os campos antigos de produto ficam sem uso, mas nada se perde
      // no camposEspecificos bruto salvo).
      const cat = _pv.perfil.categoriaVendedor === 'CONSTRUTORA' ? 'PJ' : _pv.perfil.categoriaVendedor;
      if (cat && _pv.categorias.includes(cat)) _pv.catSelecionada = cat;
      _pv.reducoes = Array.isArray(_pv.perfil.reducoes) ? _pv.perfil.reducoes : [];
      const alertEl = document.getElementById('pvAlertaExcluido');
      if (alertEl) alertEl.style.display = _pv.perfil.imovelExcluido ? '' : 'none';
    }
    _pvRenderCatTabs_();
    _pvRenderForm_();
    if (_pv.perfil && _pv.perfil.scoreVendedor !== undefined) {
      const sv = parseInt(_pv.perfil.scoreVendedor) || 0;
      _pvMostrarScore_({ scoreVendedor: sv, urgenciaNivel: _pv.perfil.urgenciaNivel || (sv>=70?'ALTA':sv>=40?'MEDIA':'BAIXA'), margemEstimada: _pv.perfil.margemEstimada || 0 });
    }
  } catch(e) {
    document.getElementById('pvFormBody').innerHTML = '<div style="color:#ff6b6b">Erro ao carregar: ' + e.message + '</div>';
  }
}

// ── Render tabs ───────────────────────────────────────────────────────────────
const _pvCatLabels = { PF:'👤 Pessoa Física', PJ:'🏢 Construtora / Incorporadora (PJ)', CORRETOR:'🤝 Corretor' };
// Escala rotulada usada nos critérios SUBJETIVOS do perfil PJ (2026-07) — mais
// rápido de preencher e mais consistente entre corretores diferentes do que
// pedir uma nota solta 1-5 (cada um interpretaria "nota 3" de um jeito).
const PV_ESCALA_5 = ['Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'];

function _pvRenderCatTabs_() {
  document.getElementById('pvCatTabs').innerHTML = _pv.categorias.map(c =>
    `<button class="pv-cat-tab${c===_pv.catSelecionada?' active':''}" onclick="pvSelecionarCat_('${c}')">${_pvCatLabels[c]||c}</button>`
  ).join('');
}

function pvSelecionarCat_(cat) { _pv.catSelecionada = cat; _pvRenderCatTabs_(); _pvRenderForm_(); }

// ── Helpers de valor ─────────────────────────────────────────────────────────
function _pvV_(campo)          { return (_pv.perfil && _pv.perfil[campo] != null) ? _pv.perfil[campo] : ''; }
function _pvCe_(campo)         { const ce = (_pv.perfil && _pv.perfil.camposEspecificos) || {}; return ce[campo] != null ? ce[campo] : ''; }
function _pvBool_(campo)       { return _pvV_(campo) === 'sim' ? 'checked' : ''; }
function _pvSel_(campo, val)   { return _pvV_(campo) === val ? 'selected' : ''; }
function _pvCeSel_(campo, val) { return _pvCe_(campo) === val ? 'selected' : ''; }
function _pvCeChk_(campo)      { return _pvCe_(campo) === 'sim' ? 'checked' : ''; }

function _pvOpts_(lista, ceField) {
  return lista.map(o => `<option value="${o}" ${_pvCeSel_(ceField, o)}>${o}</option>`).join('');
}

// Rótulo com badge de peso/pontuação ao lado — deixa visível, na hora de
// preencher, o quanto cada critério pesa no score final (pedido do usuário
// ao reorganizar o perfil PJ: "marcação intuitiva e lógica").
function _pvLbl_(texto, peso) { return `${texto}<span class="pv-peso">${peso}</span>`; }

// ── Render form ───────────────────────────────────────────────────────────────
function _pvRenderForm_() {
  const cat = _pv.catSelecionada;
  const redHtml = _pvRenderReducoes_();
  // Preço anunciado / Dias no mercado / Prazo declarado / Histórico de
  // reduções são dado de PRODUTO (preço, tempo e urgência do próprio anúncio)
  // — fazem sentido pro perfil PF (onde são sinais legítimos de urgência do
  // proprietário, usados em calcularScoreVendedor_PF_) e ficam visíveis pro
  // CORRETOR também, mas NÃO pro PJ/Construtora: esse perfil mede o vendedor
  // como parceiro de negócio, não o produto — mesmo motivo por trás de toda a
  // redefinição do perfil PJ (ver comentário logo abaixo, no bloco `cat === 'PJ'`).
  const mostrarCamposMercado = cat !== 'PJ';

  const origemMe   = _pvV_('origemContato') === 'Me procurou' ? 'checked' : '';
  const origemEu   = _pvV_('origemContato') === 'Eu acionei'  ? 'checked' : '';

  let esp = '';
  if (cat === 'PF') {
    esp = `
<div class="pv-section-title">Perfil — Pessoa Física</div>
<div class="pv-row"><label>Motivo da venda</label>
  <select id="pvMotivo"><option value="">— selecione —</option>
    ${_pvOpts_(['Dívida / liquidez','Divórcio / separação','Inventário / herança','Mudança de cidade','Troca de imóvel','Investidor realizando lucro','Outro'],'motivoVenda')}
  </select></div>
<div class="pv-row"><label>Perfil do proprietário</label>
  <select id="pvPerfPropr"><option value="">— selecione —</option>
    ${_pvOpts_(['Único (mora no imóvel)','Único (vazio)','Casal / família','Investidor (1-5 imóveis)','Investidor grande portfólio (6+)'],'perfilProprietario')}
  </select></div>`;
  } else if (cat === 'PJ') {
    // Perfil único Construtora/Incorporadora (2026-07) — qualifica a
    // CONSTRUTORA COMO PARCEIRA DE NEGÓCIO, não o produto que ela vende (isso
    // já mora no cadastro do empreendimento em lancamentos-editar.html e já
    // alimenta outros eixos do Score de Tração — Estoque/Força de Venda/
    // Prazo de Pgt). Reorganizado em 5 grupos temáticos (2026-07, 2ª rodada)
    // — cada campo mostra o peso/pontuação ao lado do rótulo (ver _pvLbl_),
    // pra deixar claro na hora de preencher o quanto cada critério pesa no
    // score final. Ordem dos grupos: do mais "factual/comercial" pro mais
    // "percepção do corretor" — objetivos primeiro, subjetivos por último.
    esp = `
<div class="pv-section-title">💰 Comercial — comissão e pagamento</div>
<div class="pv-row pv-row-2">
  <div><label>${_pvLbl_('Comissão oferecida (%)','até +20')}</label><input type="number" id="pvComissaoPerc" min="0" max="100" step="0.5" value="${_pvCe_('comissaoPerc')}"></div>
  <div><label>${_pvLbl_('Prazo de pagamento da comissão','até +15')}</label>
    <select id="pvPrazoComissao"><option value="">— selecione —</option>
      ${_pvOpts_(['Na assinatura','No Habite-se','Após aprovação de financiamento'],'prazoPagamentoComissao')}
    </select></div>
</div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvComissNeg2"  ${_pvCeChk_('comissaoNegociavel')}> ${_pvLbl_('Comissão negociável','+10')}</label>
</div>

<div class="pv-section-title">🤝 Relacionamento e parceria</div>
<div class="pv-row"><label>${_pvLbl_('Exclusividade da parceria','até +20')}</label>
  <select id="pvExclParceria"><option value="">— selecione —</option>
    ${_pvOpts_(['Exclusiva com você/sua imobiliária','Compartilhada com outras imobiliárias','Sem contrato formal'],'exclusividadeParceria')}
  </select></div>
<div class="pv-row pv-row-2">
  <div><label>${_pvLbl_('Tempo de relacionamento (meses)','até +10')}</label><input type="number" id="pvTempoRelac" min="0" value="${_pvCe_('tempoRelacionamentoMeses')}"></div>
  <div><label>${_pvLbl_('Vendas fechadas nos últimos 12 meses','até +15')}</label><input type="number" id="pvVolumeVendas" min="0" value="${_pvCe_('volumeVendas12Meses')}"></div>
</div>
<div class="pv-row"><label>${_pvLbl_('Agilidade documental (dias médios p/ aprovar)','até +10')}</label>
  <input type="number" id="pvAgilidadeDoc" min="0" value="${_pvCe_('agilidadeDocumentalDias')}"></div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvMaterialCom" ${_pvCeChk_('materialComercialDisponivel')}> ${_pvLbl_('Material comercial disponível (books, plantas, simulador)','+5')}</label>
</div>

<div class="pv-section-title">📍 Logística e operação</div>
<div class="pv-row"><label>${_pvLbl_('Proximidade do stand de vendas com sua empresa','até +10')}</label>
  <select id="pvProximidadeStand"><option value="">— selecione —</option>
    ${_pvOpts_(['Muito próxima','Moderada','Distante'],'proximidadeStand')}
  </select></div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvPlantaoDecorado" ${_pvCeChk_('permitePlantaoDecorado')}> ${_pvLbl_('Permite plantão no decorado','+15')}</label>
</div>

<div class="pv-section-title">🔥 Sinais de urgência e prontidão para negociar</div>
<div class="pv-group-desc">Cada sinal, isolado, já indica que o vendedor está mais aberto a ceder em preço/condições.</div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvUrgenciaVenda" ${_pvCeChk_('urgenciaVendaSinalizada')}> ${_pvLbl_('Sinalizou urgência de venda / pressão por resultado','+15')}</label>
  <label><input type="checkbox" id="pvQueimandoEstoque" ${_pvCeChk_('queimandoEstoque')}> ${_pvLbl_('Querendo queimar estoque','+15')}</label>
</div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvPagaEscrituraItbi" ${_pvCeChk_('pagaEscrituraItbi')}> ${_pvLbl_('Pagando escritura e/ou ITBI','+12')}</label>
  <label><input type="checkbox" id="pvPremiacaoVenda" ${_pvCeChk_('premiacaoPorVenda')}> ${_pvLbl_('Premiação por venda','+10')}</label>
</div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvPromoveuProduto" ${_pvCeChk_('promoveuProdutoNaImobiliaria')}> ${_pvLbl_('Foi à imobiliária promover o produto','+10')}</label>
  <label><input type="checkbox" id="pvPermutaFacil" ${_pvCeChk_('aceitaPermutaFacil')}> ${_pvLbl_('Aceita permuta com facilidade','+10')}</label>
</div>

<div class="pv-section-title">⭐ Critérios subjetivos <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#8892aa">— avaliação do corretor</span></div>
<div class="pv-group-desc">Escala Ruim → Excelente; cada nível soma mais pontos, proporcional ao peso do critério.</div>
<div class="pv-row pv-row-2">
  <div><label>${_pvLbl_('Confiabilidade / cumpre prazos e promessas','peso 3')}</label>
    <select id="pvConfiabilidade"><option value="">— selecione —</option>${_pvOpts_(PV_ESCALA_5,'confiabilidadePrazos')}</select></div>
  <div><label>${_pvLbl_('Reputação no mercado','peso 3')}</label>
    <select id="pvReputacao"><option value="">— selecione —</option>${_pvOpts_(PV_ESCALA_5,'reputacaoMercado')}</select></div>
</div>
<div class="pv-row pv-row-2">
  <div><label>${_pvLbl_('Suporte do gerente comercial','peso 2')}</label>
    <select id="pvSuporteGerente"><option value="">— selecione —</option>${_pvOpts_(PV_ESCALA_5,'qualidadeSuporteGerente')}</select></div>
  <div><label>${_pvLbl_('Facilidade de negociar condições especiais','peso 2')}</label>
    <select id="pvFacilidadeNeg"><option value="">— selecione —</option>${_pvOpts_(PV_ESCALA_5,'facilidadeNegociacao')}</select></div>
</div>
<div class="pv-row"><label>${_pvLbl_('Clima geral da parceria','peso 2')}</label>
  <select id="pvClimaParceria"><option value="">— selecione —</option>${_pvOpts_(PV_ESCALA_5,'climaParceria')}</select></div>`;
  } else if (cat === 'CORRETOR') {
    esp = `
<div class="pv-section-title">Perfil — Corretor / Parceiro</div>
<div class="pv-row"><label>Exclusividade</label>
  <select id="pvExcl"><option value="">— selecione —</option>
    ${_pvOpts_(['Exclusivo com você/sua imobiliária','Compartilhado (múltiplas imobiliárias)','Sem exclusividade'],'exclusividade')}
  </select></div>
<div class="pv-row"><label>Dias desde última resposta</label>
  <input type="number" id="pvDiasResp" min="0" value="${_pvCe_('diasDesdeUltimaResposta')}"></div>
<div class="pv-row"><label>Urgência do vendedor original</label>
  <select id="pvVendUrgente"><option value="">— selecione —</option>
    ${_pvOpts_(['Sim (sinalizado pelo corretor)','Não','Desconhecido'],'vendedorOriginalUrgente')}
  </select></div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvComissNeg" ${_pvCeChk_('comissaoNegociavel')}> Comissão negociável</label>
  <label><input type="checkbox" id="pvRelHist"   ${_pvCeChk_('relacionamentoHistorico')}> Relacionamento histórico</label>
</div>`;
  }

  document.getElementById('pvFormBody').innerHTML = `
<div class="pv-section-title">Contato e Mercado</div>
<div class="pv-row"><label>Origem do contato *</label>
  <div class="pv-radio-group">
    <label><input type="radio" name="pvOrigem" value="Me procurou" ${origemMe}> Me procurou</label>
    <label><input type="radio" name="pvOrigem" value="Eu acionei" ${origemEu}> Eu acionei</label>
  </div></div>
${mostrarCamposMercado ? `
<div class="pv-row pv-row-2">
  <div><label>Preço anunciado (R$)</label><input type="text" id="pvPreco" placeholder="ex: 850000" value="${_pvV_('precoAnuncio')}"></div>
  <div><label>Dias no mercado</label><input type="number" id="pvDias" min="0" value="${_pvV_('diasNaMercado')}"></div>
</div>
<div class="pv-row"><label>Prazo declarado para venda</label>
  <input type="text" id="pvPrazo" placeholder="ex: 60 dias, até março..." value="${_pvV_('prazoDeclarado')}"></div>
<div class="pv-row"><label>Histórico de reduções de preço</label>
  <div id="pvReducoesList">${redHtml}</div>
  <button class="pv-btn-add" onclick="pvAddReducao_()" type="button">+ Adicionar redução</button></div>` : ''}
<div class="pv-section-title">Condições aceitas</div>
<div class="pv-row pv-row-checks">
  <label><input type="checkbox" id="pvFGTS"   ${_pvBool_('aceitaFGTS')}>         Aceita FGTS</label>
  <label><input type="checkbox" id="pvPermuta" ${_pvBool_('aceitaPermuta')}>      Aceita permuta</label>
  <label><input type="checkbox" id="pvFinanc"  ${_pvBool_('aceitaFinanciamento')}> Aceita financiamento</label>
  <label><input type="checkbox" id="pvParcel"  ${_pvBool_('aceitaParcelamento')}> Aceita parcelamento</label>
</div>
<div class="pv-row"><label>Observações sobre condições</label>
  <textarea id="pvCondObs" rows="2">${_pvV_('condicoesObs')}</textarea></div>
${esp}
<button class="pv-btn-salvar" onclick="pvSalvar_()">Calcular e salvar score</button>`;
}

// ── Reduções ─────────────────────────────────────────────────────────────────
function _pvRenderReducoes_() {
  if (!_pv.reducoes.length) return '<div class="pv-red-empty">Nenhuma redução registrada.</div>';
  return _pv.reducoes.map((r, i) => `
<div class="pv-red-row">
  <input type="text" placeholder="De R$..." value="${r.de||''}" onchange="_pv.reducoes[${i}].de=this.value">
  <span>→</span>
  <input type="text" placeholder="Para R$..." value="${r.para||''}" onchange="_pv.reducoes[${i}].para=this.value">
  <input type="text" placeholder="mês/ano" style="width:76px" value="${r.data||''}" onchange="_pv.reducoes[${i}].data=this.value">
  <button type="button" class="pv-btn-rem" onclick="pvRemReducao_(${i})">✕</button>
</div>`).join('');
}

function pvAddReducao_()  { _pv.reducoes.push({de:'',para:'',data:''}); document.getElementById('pvReducoesList').innerHTML = _pvRenderReducoes_(); }
function pvRemReducao_(i) { _pv.reducoes.splice(i,1); document.getElementById('pvReducoesList').innerHTML = _pvRenderReducoes_(); }

// ── Coleta campos específicos ─────────────────────────────────────────────────
function _pvColetarEsp_() {
  const cat  = _pv.catSelecionada;
  const g    = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const chk  = id => { const el = document.getElementById(id); return (el && el.checked) ? 'sim' : 'não'; };
  if (cat === 'PF') return { motivoVenda: g('pvMotivo'), perfilProprietario: g('pvPerfPropr') };
  if (cat === 'PJ') return {
    comissaoPerc: g('pvComissaoPerc'), tempoRelacionamentoMeses: g('pvTempoRelac'),
    prazoPagamentoComissao: g('pvPrazoComissao'), exclusividadeParceria: g('pvExclParceria'),
    volumeVendas12Meses: g('pvVolumeVendas'), agilidadeDocumentalDias: g('pvAgilidadeDoc'),
    comissaoNegociavel: chk('pvComissNeg2'),
    materialComercialDisponivel: chk('pvMaterialCom'),
    confiabilidadePrazos: g('pvConfiabilidade'), qualidadeSuporteGerente: g('pvSuporteGerente'),
    facilidadeNegociacao: g('pvFacilidadeNeg'), reputacaoMercado: g('pvReputacao'),
    climaParceria: g('pvClimaParceria'), urgenciaVendaSinalizada: chk('pvUrgenciaVenda'),
    premiacaoPorVenda: chk('pvPremiacaoVenda'), promoveuProdutoNaImobiliaria: chk('pvPromoveuProduto'),
    pagaEscrituraItbi: chk('pvPagaEscrituraItbi'), queimandoEstoque: chk('pvQueimandoEstoque'),
    aceitaPermutaFacil: chk('pvPermutaFacil'),
    proximidadeStand: g('pvProximidadeStand'), permitePlantaoDecorado: chk('pvPlantaoDecorado'),
  };
  if (cat === 'CORRETOR') return { exclusividade: g('pvExcl'), diasDesdeUltimaResposta: g('pvDiasResp'), vendedorOriginalUrgente: g('pvVendUrgente'), comissaoNegociavel: chk('pvComissNeg'), relacionamentoHistorico: chk('pvRelHist') };
  return {};
}

// ── Save ──────────────────────────────────────────────────────────────────────
async function pvSalvar_() {
  const btn = document.querySelector('.pv-btn-salvar');
  const origemRadio = document.querySelector('input[name="pvOrigem"]:checked');
  if (!origemRadio) { _pvToast_('Selecione a origem do contato.', 'erro'); return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Salvando...'; }
  const g   = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const chk = id => { const el = document.getElementById(id); return (el && el.checked) ? 'sim' : 'não'; };
  const payload = {
    acao:'salvar_perfil_vendedor', token:tokenSessao(),
    codigo:_pv.codigo, origemImovel:_pv.origemImovel, categoriaVendedor:_pv.catSelecionada,
    origemContato:origemRadio.value,
    precoAnuncio:g('pvPreco'), diasNaMercado:g('pvDias'), prazoDeclarado:g('pvPrazo'),
    reducoes:_pv.reducoes,
    aceitaFGTS:chk('pvFGTS'), aceitaPermuta:chk('pvPermuta'),
    aceitaFinanciamento:chk('pvFinanc'), aceitaParcelamento:chk('pvParcel'),
    condicoesObs:g('pvCondObs'), camposEspecificos:_pvColetarEsp_()
  };
  try {
    const resp = await fetch(WEBHOOK_URL, { method:'POST', body: new URLSearchParams({ dados: JSON.stringify(payload) }) });
    const json = await resp.json();
    if (trataNaoAutenticado && trataNaoAutenticado(json)) return;
    if (json.status === 'ok') {
      _pvMostrarScore_(json);
      if (_pv.onSave) _pv.onSave(json);
      _pvToast_('✓ Perfil salvo!');
    } else {
      _pvToast_('Erro: ' + (json.motivo || 'desconhecido'), 'erro');
    }
  } catch(e) {
    _pvToast_('Erro de conexão: ' + e.message, 'erro');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Calcular e salvar score'; }
  }
}

// ── Score display ─────────────────────────────────────────────────────────────
function _pvMostrarScore_(json) {
  const u = _pvUrgConf[json.urgenciaNivel] || _pvUrgConf.BAIXA;
  document.getElementById('pvScoreResult').innerHTML = `
<div class="pv-score-box">
  <div class="pv-urg-badge ${u.cls}">${u.emoji} Urgência ${u.label}</div>
  <div class="pv-score-nums">
    <div><span class="pv-num">${json.scoreVendedor}</span><span class="pv-num-label">/100 score</span></div>
    <div><span class="pv-num">+${json.margemEstimada}%</span><span class="pv-num-label">margem est.</span></div>
  </div>
</div>`;
  document.getElementById('pvScoreResult').style.display = 'block';
}

// ── Helpers de badge para cards ───────────────────────────────────────────────
function pvBadgeHtml_(nivel) {
  const u = _pvUrgConf[nivel] || _pvUrgConf.BAIXA;
  return `<span class="pv-emp-badge ${u.cls}">${u.emoji} Vendedor: urgência ${u.label}</span>`;
}

// Escreve o score do vendedor dentro do próprio botão "Vendedor" (ex: "🏷️
// Vendedor 83"), em vez de só num badge separado — usado por todo botão que
// abre abrirPerfilVendedor_ (revendas-lista, busca, lançamentos, revendas-
// construtoras, dashboard). Sem score (perfil ainda não cadastrado ou 0),
// mantém só o rótulo base, sem "0" pendurado.
function pvSetBotaoScore_(btn, baseLabel, score) {
  if (!btn) return;
  const sv = parseInt(score) || 0;
  btn.textContent = sv > 0 ? baseLabel + ' ' + sv : baseLabel;
}

// Popula badges de perfil nos cards após batch load.
// Usado por busca.html, lancamentos.html e revendas-construtoras.html com lógica própria.
async function pvCarregarBadgesBatch_(seletor, getCodigo, getOrigem, atualizarFn) {
  const cards = [...document.querySelectorAll(seletor)];
  if (!cards.length) return;
  try {
    const url = `${WEBHOOK_URL}?acao=listarPerfisVendedor&token=${tokenSessao()}`;
    const resp = await fetch(url);
    const lista = await resp.json();
    if (!Array.isArray(lista)) return;
    const mapa = {};
    lista.forEach(p => { if (p.codigo && p.origemImovel) mapa[p.codigo + '|' + p.origemImovel] = p; });
    cards.forEach(card => {
      const cod = getCodigo(card);
      const ori = getOrigem(card);
      const p   = mapa[cod + '|' + ori];
      if (p) atualizarFn(card, p);
    });
  } catch(e) {}
}
