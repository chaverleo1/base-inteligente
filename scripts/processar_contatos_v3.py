"""
BASE INTELIGENTE — processar_contatos_v3.py

Uso padrão (argumentos):
    python processar_contatos_v3.py contatos.xlsx base_processada.csv

Uso sem argumentos (caminhos fixos abaixo):
    python processar_contatos_v3.py

Aceita .xlsx e .csv como entrada.
Para cada telefone encontrado em fone1..fone5 gera uma linha separada,
permitindo rastrear todos os pontos de contato mesmo que o nome se repita.

Dependência extra para .xlsx:
    pip install openpyxl
"""

import csv
import re
import sys
import unicodedata
from pathlib import Path

# ── CAMINHOS PADRÃO (usados quando não há argumentos) ───────────────────────
ENTRADA_PADRAO = Path(r"C:\Users\User\Downloads\contatos.xlsx")
SAIDA_PADRAO   = Path(r"C:\Users\User\Downloads\base_processada.csv")

# ── CONSTANTES ──────────────────────────────────────────────────────────────

COLUNAS_SAIDA = [
    "nome", "telefone", "email",
    "segmento", "padrao", "produtoOrigem",
    "canal", "finalidade",
    "valorMin", "valorMax",
    "score", "prioridade", "categoria",
    "nome_bruto",
]

# Colunas de telefone aceitas (case-insensitive, com ou sem espaço/underline)
PADROES_FONE = re.compile(
    r"^(phone|fone|tel|telefone)\s*[\s_\-]?\s*(\d+)\s*[\-_]?\s*(value|valor)?$",
    re.IGNORECASE,
)

# ── NORMALIZAÇÃO ─────────────────────────────────────────────────────────────

def norm(texto: str) -> str:
    """Uppercase sem acento para comparação."""
    if not texto:
        return ""
    nfkd = unicodedata.normalize("NFKD", texto.upper())
    return "".join(c for c in nfkd if not unicodedata.combining(c))


def limpar_fone(fone: str) -> str:
    """Remove tudo que não é dígito. Retorna vazio se menos de 8 dígitos."""
    digits = re.sub(r"\D", "", fone)
    return digits if len(digits) >= 8 else ""


# ── CATEGORIAS ───────────────────────────────────────────────────────────────

# Ordem importa: prefixos mais específicos primeiro
CATEGORIA_PREFIXOS = [
    # Descartar — verificar antes de qualquer categoria útil
    (["BANCO", "BRADESCO", "ITAU", "SANTANDER", "CAIXA", "BB ", "BTG",
      "OLX", "ZAP+", "SUPORTE", "COBRANCA", "COBRANÇA", "TIM ", "VIVO ",
      "CLARO ", "OI ", "GOOGLE ", "FACEBOOK", "META ", "MERCADO LIVRE",
      "SHOPEE", "AMAZON", "DELL ", "CASAS BAHIA", "AMERICANAS",
      "SISTEMA ", "SOFTWARE", "CRM ", "IMOBZI", "INGAIA", "OMEGA ",
      "OMEGA-", "ÔMEGA"], "Descartar"),

    # Igreja
    (["IBNF", "PASTOR ", "PASTORA ", "PR.", "IGREJA", "LITURGIA",
      "CÉLULA", "MISSIONAR"], "Igreja"),

    # Inquilino
    (["INQ ", "INQ.", "INQUILINO", "INQUILINA"], "Inquilino"),

    # Investidor
    (["INV ", "INVEST ", "INVESTIDOR", "INVESTIDORA"], "Investidor"),

    # Proprietário
    (["PP ", "PP_", "PPA ", "PPA_", "PPAPT ", "PPAPT_"], "Proprietário"),

    # Corretor
    (["COR ", "COR.", "CORRETOR", "CORRETORA", "CORR "], "Corretor"),

    # Gerente / Diretor / Construtor
    (["GER ", "GER.", "GER_", "DIR ", "DIR.", "DIRETOR",
      "CONST ", "CONST.", "CONST_", "CONSTRUTOR", "CONSTRUTORA",
      "ENG ", "ENG."], "Parceiro"),

    # Lead / Campanha
    (["LEAD ", "LEAD_", "LM ", "SNL ", "NEWLEAD", "ORIG ",
      "CADFACE", "FCAD ", "FACEADS", "MANYCHAT", "LEADSTER",
      "FORM-PV", "FORM PV", "BOT ", "MENU PARQ", "HOTSITE"], "Lead"),

    # Comprador — vem por último pois é o mais genérico
    (["CC ", "CC_", "CCA ", "CCA_", "CCR ", "CCP ",
      "CLIENTE", "CADFACE"], "Comprador"),
]


def detectar_categoria(nome_norm: str) -> str:
    for prefixos, cat in CATEGORIA_PREFIXOS:
        for p in prefixos:
            if nome_norm.startswith(p) or (" " + p.strip()) in nome_norm:
                return cat
    # Sem prefixo reconhecido → tenta heurística pelo conteúdo
    return "Comprador"  # default conservador


# ── PRODUTOS ─────────────────────────────────────────────────────────────────

# (lista_de_termos, nome_produto, tipo_imovel, padrao)
PRODUTOS = [
    # ── Alto Padrão Luxo ────────────────────────────────────────────────────
    (["PLATEAU D'OR", "PLATEAUDOR", "PLATEU DOR", "PLATEU D'OR",
      "PLATEAU DOR", "PLATEAU"],
     "Plateau D'Or", "Lote em cond.", "Alto Padrão Luxo"),

    (["ALPHAVILLE GOIAS", "ALPHAVILLE IPES", "ALPHAVILLE CRUZEIRO",
      "ALPHAVILLE ARAGUAIA", "ALPHA VILLE", "ALPHAVILLE"],
     "Alphaville", "Lote em cond.", "Alto Padrão Luxo"),

    (["ALDEIA DO VALE", "ALDEIA"],
     "Aldeia do Vale", "Lote em cond.", "Alto Padrão Luxo"),

    (["JD FRANCA", "JD FRANCA", "JARDINS FRANCA", "JARDINS FRANCA",
      "JD FRANCE", "JARDINS FRANCE"],
     "Jardins França", "Lote em cond.", "Alto Padrão Luxo"),

    (["JD MADRI", "JARDINS MADRI", "JD MADRID", "JARDINS MADRID"],
     "Jardins Madri", "Lote em cond.", "Alto Padrão Luxo"),

    (["JD MILAO", "JD MILAO", "JARDINS MILAO", "JARDINS MILAO"],
     "Jardins Milão", "Lote em cond.", "Alto Padrão Luxo"),

    (["OPUS PENTHOUSES", "OPUS PENTHOUSE"],
     "Opus Penthouses", "Apartamento", "Alto Padrão Luxo"),

    (["GRAN ELEGANCE", "GRAN ELEGANCIA"],
     "Gran Elegance", "Apartamento", "Alto Padrão Luxo"),

    (["GRAN EXCELENCE", "GRAN EXCELLENCE", "GRAN EXCELENCIA",
      "GRAN EXCEL"],
     "Gran Excelence", "Apartamento", "Alto Padrão Luxo"),

    (["GRANVILLE", "GRAN VILLE"],
     "Granville", "Casa", "Alto Padrão Luxo"),

    (["PORTAL DO SOL GREEN"],
     "Portal do Sol Green", "Lote em cond.", "Alto Padrão Luxo"),

    # ── Alto Padrão ─────────────────────────────────────────────────────────
    (["PQV FIGUEIRA", "PARQVILLE FIGUEIRA", "PARQVILLE", "PQ VILLE",
      "PQVILLE", "PARK VILLE", "PQV"],
     "PQV Figueira", "Lote em cond.", "Alto Padrão"),

    (["JD GRECIA", "JD GRECIA", "JARDINS GRECIA", "JARDINS GRECIA",
      "JARDINS GRÉCIA"],
     "Jardins Grécia", "Lote em cond.", "Alto Padrão"),

    (["COND FECHADO", "CONDOMINIO FECHADO"],
     "Cond. Fechado", "Lote em cond.", "Alto Padrão"),

    (["ECOVILLE IPE", "ECOVILLE"],
     "Ecoville Ipê", "Lote em cond.", "Alto Padrão"),

    (["BOSQUE GARAVELO", "BOSQUE"],
     "Bosque", "Casa", "Alto Padrão"),

    (["ABL PRIME"],
     "ABL Prime", "Apartamento", "Alto Padrão"),

    (["VOX BUENO", "VOX HOME"],
     "Vox Bueno", "Apartamento", "Alto Padrão"),

    (["ELEVEN", "EMISA"],
     "Eleven / EMISA", "Apartamento", "Alto Padrão"),

    (["DOM THIAGO", "ED DOM THIAGO"],
     "Ed Dom Thiago", "Apartamento", "Alto Padrão"),

    (["ILHA DE MALTA"],
     "Ilha de Malta", "Sobrado", "Alto Padrão"),

    (["FLORAPARK", "FLORA PARK"],
     "Florapark", "Lote em cond.", "Alto Padrão"),

    (["PORTAL DO SOL"],
     "Portal do Sol", "Lote em cond.", "Alto Padrão"),

    (["PQV JACARANDA", "PARQVILLE JACARANDA", "PQV JACARANDA",
      "PARQVILLE JACARANDA"],
     "PQV Jacarandá", "Lote em cond.", "Alto Padrão"),

    (["JARDINS MONTREAL", "JD MONTREAL"],
     "Jardins Montreal", "Lote em cond.", "Alto Padrão"),

    # ── Médio Padrão ────────────────────────────────────────────────────────
    (["RESID OLINDA", "RESIDENCIAL OLINDA", "CS OLINDA", "OLINDA"],
     "CS Olinda", "Casa", "Médio Padrão"),

    (["CS ARUANA", "ARUANA", "ARUANA"],
     "CS Aruanã", "Casa", "Médio Padrão"),

    (["CS RIVIERA", "RIVIERA"],
     "CS Riviera", "Casa", "Médio Padrão"),

    (["SONHO VERDE"],
     "Sonho Verde", "Casa", "Médio Padrão"),

    (["NEW FREE", "ED NEW FREE"],
     "Ed New Free", "Apartamento", "Médio Padrão"),

    (["PORTO LUDOVICO"],
     "Porto Ludovico", "Apartamento", "Médio Padrão"),

    (["ED CONQUIST", "CONQUIST"],
     "Ed Conquist", "Apartamento", "Médio Padrão"),

    (["AMAZONIA PARK", "AMAZ PARK"],
     "Amazônia Park", "Apartamento", "Médio Padrão"),

    (["ALTO AMAZONAS"],
     "Alto Amazonas", "Apartamento", "Médio Padrão"),

    (["LIVRE BURITI", "LIVRE BURITIS"],
     "Livre Buriti", "Apartamento", "Médio Padrão"),

    (["VEREDAS DA SERRA", "COND VEREDAS"],
     "Veredas da Serra", "Lote em cond.", "Médio Padrão"),

    (["KITNET ALICE BARBOSA", "ALICE BARBOSA"],
     "Kitnet Alice Barbosa", "Apartamento", "Médio Padrão"),

    # ── Comercial ───────────────────────────────────────────────────────────
    (["GALPAO CAMPINAS", "GALPAO CAMPINAS", "GALPÃO CAMPINAS"],
     "Galpão Campinas", "Sala comercial", "Comercial"),
]


def detectar_produto(nome_norm: str):
    """Retorna (nome_produto, segmento, padrao) ou (None, None, None)."""
    for termos, produto, segmento, padrao in PRODUTOS:
        for t in termos:
            if norm(t) in nome_norm:
                return produto, segmento, padrao
    return None, None, None


# ── TIPOS DE IMÓVEL (fallback quando produto não identificado) ───────────────

SEGMENTO_KEYWORDS = [
    (["GALPAO", "GALPÃO"], "Galpão"),
    (["SALA ", "SL "], "Sala comercial"),
    (["CHACARA", "CHÁCARA", "CHC "], "Chácara"),
    (["STUDIO", "STÚDIO"], "Apartamento"),
    (["FLAT "], "Flat"),
    (["SOBRADO", "SOB "], "Sobrado"),
    (["APTO", "APT ", "ED "], "Apartamento"),
    (["LOTE", "LT ", " LT"], "Lote em cond."),
    (["CASA ", "CS "], "Casa"),
]


def detectar_segmento_fallback(nome_norm: str) -> str:
    for kws, seg in SEGMENTO_KEYWORDS:
        for kw in kws:
            if kw in nome_norm:
                return seg
    return ""


# ── CANAIS ───────────────────────────────────────────────────────────────────

CANAL_KEYWORDS = [
    (["FORM-PV", "FORM PV", "FORMULARIO PV", "FORMULÁRIO PV"], "Formulário PV"),
    (["FACEADS", "FACE-ADS", "CADFACE", "FCAD", "SNL", "FACEBOOK ADS"], "Facebook Ads"),
    (["LEADSTER"], "Leadster"),
    (["MANYCHAT", "MANY-CHAT"], "ManyChat"),
    (["JIVOCHAT", "JIVO "], "Jivo Chat"),
    (["MENU PARQ", "HOTSITE"], "Menu/Hotsite"),
    (["BOT SIMPLES", "BOT WHATSAPP", "PV WHATSAPP"], "Bot WhatsApp"),
    (["INSTA ", "INSTAGRAM"], "Instagram"),
    (["GOOGLE ADS", "GOOGLE "], "Google Ads"),
    (["ZAP+", "ZAP ", "OLX", "CANAL PRO", "WIMOVEIS", "VIVA REAL"], "ZAP / OLX"),
    (["IMOBZI"], "Imobzi / CRM"),
    (["INDIC", "INDICAC"], "Indicação"),
    (["DECORADO", "PLANTAO", "PLANTÃO"], "Visita decorado"),
]


def detectar_canal(nome_norm: str) -> str:
    for kws, canal in CANAL_KEYWORDS:
        for kw in kws:
            if kw in nome_norm:
                return canal
    return ""


# ── FINALIDADE ───────────────────────────────────────────────────────────────

def detectar_finalidade(nome_norm: str) -> str:
    if "INVESTIR" in nome_norm or "INVESTIMENTO" in nome_norm or "INVEST " in nome_norm:
        return "Investimento"
    if "RENDA" in nome_norm:
        return "Renda"
    if "MORAR" in nome_norm or "MORADIA" in nome_norm:
        return "Moradia"
    if "RESERVA" in nome_norm:
        return "Reserva de valor"
    return ""


# ── VALORES MONETÁRIOS ───────────────────────────────────────────────────────

def extrair_valores(nome_norm: str):
    """Retorna (valorMin, valorMax) como strings limpas ou ''."""
    # Padrões: 250K, 500MIL, 1.200.000, 1200000
    valores = []

    # 123K ou 123 K
    for m in re.finditer(r"(\d[\d.,]*)\s*K\b", nome_norm):
        try:
            v = float(m.group(1).replace(".", "").replace(",", ".")) * 1000
            valores.append(int(v))
        except ValueError:
            pass

    # 123MIL ou 123 MIL
    for m in re.finditer(r"(\d[\d.,]*)\s*MIL\b", nome_norm):
        try:
            v = float(m.group(1).replace(".", "").replace(",", ".")) * 1000
            valores.append(int(v))
        except ValueError:
            pass

    # Números grandes: 1.200.000 ou 1200000 (mínimo 6 dígitos)
    for m in re.finditer(r"\b(\d{1,3}(?:[.,]\d{3})+)\b", nome_norm):
        try:
            v = int(m.group(1).replace(".", "").replace(",", ""))
            if v >= 100000:
                valores.append(v)
        except ValueError:
            pass

    valores = sorted(set(valores))
    if not valores:
        return "", ""
    if len(valores) == 1:
        return "", str(valores[0])
    return str(valores[0]), str(valores[-1])


# ── SCORE ────────────────────────────────────────────────────────────────────

def calcular_score(row: dict) -> tuple[int, str]:
    """Retorna (score, prioridade)."""
    cat = row["categoria"]

    # Categorias que não entram no scoring
    if cat in ("Corretor", "Parceiro", "Descartar", "Igreja"):
        return 0, "—"

    score = 0

    seg = row["segmento"]
    pad = row["padrao"]
    fin = row["finalidade"]
    can = row["canal"]

    if seg and seg != "Indefinido":
        score += 15

    if pad == "Alto Padrão Luxo":
        score += 20
    elif pad == "Alto Padrão":
        score += 15
    elif pad == "Médio Padrão":
        score += 8

    if fin == "Moradia":
        score += 10
    elif fin in ("Investimento", "Renda"):
        score += 7

    if can in ("Agenda pessoal", "Indicação", "Visita decorado"):
        score += 10
    elif can in ("Formulário PV", "Menu/Hotsite", "Leadster"):
        score += 8
    elif can in ("Facebook Ads", "Google Ads", "Instagram"):
        score += 5
    elif can in ("ZAP / OLX", "Bot WhatsApp"):
        score += 3

    if cat == "Investidor":
        score += 5
    if cat == "Inquilino":
        score += 8

    if row["valorMax"]:
        score += 5

    score = min(score, 100)

    if score >= 70:
        prioridade = "Alta"
    elif score >= 40:
        prioridade = "Média"
    elif score >= 20:
        prioridade = "Baixa"
    else:
        prioridade = "—"

    return score, prioridade


# ── LEITURA DAS COLUNAS DE TELEFONE ──────────────────────────────────────────

def colunas_fone(cabecalho: list[str]) -> list[int]:
    """
    Retorna índices das colunas que contêm telefone.
    Aceita: Phone 1 - Value, fone1, fone2, tel1, telefone1, etc.
    """
    indices = []
    for i, col in enumerate(cabecalho):
        c = col.strip()
        # Padrão Google Contatos: "Phone N - Value"
        if re.match(r"^phone\s+\d+\s*-\s*value$", c, re.IGNORECASE):
            indices.append(i)
            continue
        # Padrões customizados: fone1, fone2, fone 1, tel1, telefone1...
        if PADROES_FONE.match(c):
            indices.append(i)
    return indices


def colunas_email(cabecalho: list[str]) -> list[int]:
    indices = []
    for i, col in enumerate(cabecalho):
        c = col.strip()
        if re.match(r"^email\s+\d+\s*-\s*value$", c, re.IGNORECASE):
            indices.append(i)
        elif re.match(r"^(email|e-mail)\s*[\s_-]?\s*\d*$", c, re.IGNORECASE):
            indices.append(i)
    return indices


# ── PROCESSAMENTO PRINCIPAL ───────────────────────────────────────────────────

def processar_linha(row_raw: dict, cabecalho: list[str],
                    idx_fones: list[int], idx_emails: list[int]) -> list[dict]:
    """
    Para cada telefone válido encontrado retorna uma linha de saída.
    Um mesmo contato com 3 telefones gera 3 linhas.
    """
    nome_bruto = row_raw.get("Name", row_raw.get("name", "")).strip()
    if not nome_bruto:
        return []

    nome_norm = norm(nome_bruto)

    # Categoria
    categoria = detectar_categoria(nome_norm)

    # Produto → segmento + padrão
    produto, segmento, padrao = detectar_produto(nome_norm)

    # Fallback segmento
    if not segmento:
        segmento = detectar_segmento_fallback(nome_norm)

    # Canal, finalidade, valores
    canal      = detectar_canal(nome_norm)
    finalidade = detectar_finalidade(nome_norm)
    valor_min, valor_max = extrair_valores(nome_norm)

    # Nome limpo (remove prefixos de categoria)
    nome_limpo = re.sub(
        r"^(CC[AR_]?|PP[AT_]?|COR|GER|DIR|CONST|INQ|INV|INVEST|LEAD|LM|SNL|"
        r"NEWLEAD|ORIG|CADFACE|FCAD|IBNF|PASTOR[A]?)\s+",
        "", nome_bruto, flags=re.IGNORECASE
    ).strip()
    # Remove sufixos de canal/produto do nome
    nome_limpo = re.split(r"\s*[-–—]\s*", nome_limpo)[0].strip()

    # Coletar todos os telefones
    valores_linha = list(row_raw.values())
    telefones = []
    for idx in idx_fones:
        if idx < len(valores_linha):
            t = limpar_fone(valores_linha[idx])
            if t and t not in telefones:
                telefones.append(t)

    # Coletar primeiro email válido
    email = ""
    for idx in idx_emails:
        if idx < len(valores_linha):
            e = valores_linha[idx].strip()
            if "@" in e:
                email = e
                break

    if not telefones:
        # Mantém a linha sem telefone (para não perder o contato)
        telefones = [""]

    linhas = []
    for tel in telefones:
        base = {
            "nome":          nome_limpo,
            "telefone":      tel,
            "email":         email,
            "segmento":      segmento or "",
            "padrao":        padrao or "",
            "produtoOrigem": produto or "",
            "canal":         canal,
            "finalidade":    finalidade,
            "valorMin":      valor_min,
            "valorMax":      valor_max,
            "score":         0,
            "prioridade":    "—",
            "categoria":     categoria,
            "nome_bruto":    nome_bruto,
        }
        base["score"], base["prioridade"] = calcular_score(base)
        linhas.append(base)

    return linhas


# ── LEITURA DE ARQUIVO (csv ou xlsx) ─────────────────────────────────────────

def ler_arquivo(entrada: Path) -> tuple[list[str], list[dict]]:
    """Lê .csv ou .xlsx e retorna (cabecalho, lista_de_dicts)."""
    ext = entrada.suffix.lower()

    if ext == ".xlsx":
        try:
            import openpyxl
        except ImportError:
            print("Instale openpyxl:  pip install openpyxl")
            sys.exit(1)

        wb = openpyxl.load_workbook(entrada, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        wb.close()

        if not rows:
            return [], []

        cabecalho = [str(c).strip() if c is not None else "" for c in rows[0]]
        linhas_raw = []
        for row in rows[1:]:
            d = {}
            for i, col in enumerate(cabecalho):
                val = row[i] if i < len(row) else None
                d[col] = str(val).strip() if val is not None else ""
            # Ignora linha completamente vazia
            if any(v for v in d.values()):
                linhas_raw.append(d)
        return cabecalho, linhas_raw

    else:  # csv
        # Tenta utf-8-sig primeiro, fallback para latin-1
        for enc in ("utf-8-sig", "latin-1"):
            try:
                with open(entrada, newline="", encoding=enc) as f:
                    reader = csv.DictReader(f)
                    cabecalho = reader.fieldnames or []
                    linhas_raw = list(reader)
                return cabecalho, linhas_raw
            except UnicodeDecodeError:
                continue
        print("Não foi possível ler o arquivo. Tente converter para UTF-8.")
        sys.exit(1)


# ── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    if len(sys.argv) == 3:
        entrada = Path(sys.argv[1])
        saida   = Path(sys.argv[2])
    elif len(sys.argv) == 1:
        entrada = ENTRADA_PADRAO
        saida   = SAIDA_PADRAO
        print(f"Usando caminhos padrão:\n  entrada: {entrada}\n  saída:   {saida}\n")
    else:
        print("Uso: python processar_contatos_v3.py contatos.xlsx base_processada.csv")
        sys.exit(1)

    if not entrada.exists():
        print(f"Arquivo não encontrado: {entrada}")
        sys.exit(1)

    print(f"Lendo: {entrada}")

    cabecalho, linhas_raw = ler_arquivo(entrada)

    print(f"  → {len(linhas_raw)} contatos brutos")
    print(f"  → Colunas: {cabecalho}")

    idx_fones  = colunas_fone(cabecalho)
    idx_emails = colunas_email(cabecalho)

    print(f"  → Colunas de telefone detectadas: {[cabecalho[i] for i in idx_fones]}")
    print(f"  → Colunas de email detectadas:    {[cabecalho[i] for i in idx_emails]}")

    resultados = []
    for row in linhas_raw:
        resultados.extend(processar_linha(row, cabecalho, idx_fones, idx_emails))

    # Ordenar por score desc
    resultados.sort(key=lambda r: -int(r["score"]))

    with open(saida, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUNAS_SAIDA)
        writer.writeheader()
        writer.writerows(resultados)

    # ── Estatísticas ──────────────────────────────────────────────────────
    total = len(resultados)
    por_cat = {}
    por_pri = {"Alta": 0, "Média": 0, "Baixa": 0, "—": 0}
    por_seg = {}

    for r in resultados:
        por_cat[r["categoria"]] = por_cat.get(r["categoria"], 0) + 1
        por_pri[r["prioridade"]] = por_pri.get(r["prioridade"], 0) + 1
        if r["segmento"]:
            por_seg[r["segmento"]] = por_seg.get(r["segmento"], 0) + 1

    print(f"\n✓ {total} linhas geradas → {saida}\n")
    print("─── Categorias ───────────────────────────────")
    for cat, n in sorted(por_cat.items(), key=lambda x: -x[1]):
        print(f"  {cat:<20} {n:>5}")
    print("\n─── Prioridade (compradores/leads/investidores) ─")
    print(f"  Alta   {por_pri['Alta']:>5}")
    print(f"  Média  {por_pri['Média']:>5}")
    print(f"  Baixa  {por_pri['Baixa']:>5}")
    print(f"  —      {por_pri['—']:>5}")
    print("\n─── Segmentos ────────────────────────────────")
    for seg, n in sorted(por_seg.items(), key=lambda x: -x[1]):
        print(f"  {seg:<25} {n:>5}")


if __name__ == "__main__":
    main()
