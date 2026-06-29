"""
BASE INTELIGENTE — importar_produtos_imobzi.py

Busca todos os imoveis disponiveis no CRM Imobzi via API
e gera produtos_imobzi.csv para importar na Aba PRODUTOS do Sheets.

Uso:
    python importar_produtos_imobzi.py
    python importar_produtos_imobzi.py produtos_imobzi.csv

Depois: no Sheets, Aba PRODUTOS -> Arquivo -> Importar -> produtos_imobzi.csv
        Escolher: Substituir planilha atual / Sem conversao de tipo
"""

import csv
import sys
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime

# ── Configuracao ──────────────────────────────────────────────────────────────
API_TOKEN = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJjcmVhdGVkX2F0IjoiMjAyNi0wNi0yM1QxMzozMToyMS4wNjIwMDlaIiwi"
    "aXNfdGhpcmRfcGFydHlfYWNjZXNzIjp0cnVlLCJ0aGlyZF9wYXJ0eV9hcHBfaWQiOiJHQWpFY0JOcVliIn0"
    ".mliZqb-XiPsDPQyw0VrjaNNvL0mLLsanhhDIhu2Hb-U"
)
API_BASE   = "https://api.imobzi.app/v1"
LIMIT      = 50   # registros por pagina (max 100)

SAIDA_PADRAO = Path(r"C:\Users\User\Downloads\produtos_imobzi.csv")

# Colunas da Aba PRODUTOS no Sheets
COLUNAS = [
    "codigo",          # code do Imobzi
    "db_id",           # id interno
    "tipo",            # property_type (Apartamento, Casa...)
    "finalidade",      # finality (sale / rental)
    "status",          # available, rented, solded...
    "bairro",          # neighborhood
    "cidade",          # city
    "endereco",        # address + address_complement
    "condominio",      # building_name
    "quartos",         # bedroom
    "suites",          # suite
    "banheiros",       # bathroom
    "vagas",           # garage
    "areaUtil",        # useful_area
    "areaTerr",        # lot_area
    "valorVenda",      # sale_value
    "padrao",          # inferido pelo valor (Popular/Medio/Alto/Luxo)
    "estagio",         # stage (ready, plant, building)
    "publicadoSite",   # site_publish
    "urlSite",         # site_url
    "foto",            # cover_photo.url
    "dataCadastro",    # created_at
    "dataAtualizacao", # updated_at
    "latitude",
    "longitude",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_json(url):
    req = urllib.request.Request(url, headers={"X-Imobzi-Secret": API_TOKEN})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode())


def inferir_padrao(valor_venda, valor_locacao):
    v = valor_venda or valor_locacao or 0
    if v >= 1_500_000:
        return "Luxo"
    if v >= 700_000:
        return "Alto"
    if v >= 300_000:
        return "Medio"
    if v > 0:
        return "Popular"
    return ""


def mapear_finalidade(f):
    mapa = {"residential": "Residencial", "commercial": "Comercial", "rural": "Rural"}
    return mapa.get(f, f or "")


def mapear_estagio(s):
    mapa = {"ready": "Pronto", "plant": "Planta", "building": "Construcao"}
    return mapa.get(s, s or "")


def formatar_moeda(v):
    if not v:
        return ""
    return f"R$ {v:,.0f}".replace(",", ".")


def extrair_linha(p):
    end = p.get("address", "")
    comp = p.get("address_complement", "")
    if comp:
        end = f"{end}, {comp}"

    venda   = p.get("sale_value") or 0
    locacao = p.get("rental_value") or 0

    foto = ""
    cp = p.get("cover_photo")
    if cp and isinstance(cp, dict):
        foto = cp.get("url", "")

    dt_cad = (p.get("created_at") or "")[:10]
    dt_upd = (p.get("updated_at") or "")[:10]

    return {
        "codigo":          p.get("code", ""),
        "db_id":           p.get("db_id", ""),
        "tipo":            p.get("property_type", ""),
        "finalidade":      mapear_finalidade(p.get("finality", "")),
        "status":          p.get("status", ""),
        "bairro":          p.get("neighborhood", ""),
        "cidade":          p.get("city", ""),
        "endereco":        end,
        "condominio":      p.get("building_name", ""),
        "quartos":         p.get("bedroom") or "",
        "suites":          p.get("suite") or "",
        "banheiros":       p.get("bathroom") or "",
        "vagas":           p.get("garage") or "",
        "areaUtil":        p.get("useful_area") or "",
        "areaTerr":        p.get("lot_area") or "",
        "valorVenda":      formatar_moeda(venda),
        "padrao":          inferir_padrao(venda, locacao),
        "estagio":         mapear_estagio(p.get("stage", "")),
        "publicadoSite":   "Sim" if p.get("site_publish") else "Nao",
        "urlSite":         p.get("site_url", ""),
        "foto":            foto,
        "dataCadastro":    dt_cad,
        "dataAtualizacao": dt_upd,
        "latitude":        p.get("latitude", ""),
        "longitude":       p.get("longitude", ""),
    }

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    saida = Path(sys.argv[1]) if len(sys.argv) > 1 else SAIDA_PADRAO
    print(f"Buscando imoveis do Imobzi...")
    print(f"  saida: {saida}\n")

    todos = []
    descartados = 0
    cursor = None
    pagina = 1

    while True:
        url = f"{API_BASE}/properties?limit={LIMIT}"
        if cursor:
            url += f"&cursor={cursor}"

        try:
            dados = get_json(url)
        except urllib.error.HTTPError as e:
            print(f"Erro HTTP {e.code}: {e.reason}")
            sys.exit(1)
        except Exception as e:
            print(f"Erro: {e}")
            sys.exit(1)

        props = dados.get("properties", [])
        if not props:
            break

        # Filtra: somente venda ativa, com valor de venda, disponivel
        for p in props:
            sale_value = p.get("sale_value") or 0
            ativo      = p.get("active", True)
            status     = p.get("status", "")

            tem_valor_venda = sale_value > 0
            disponivel      = status == "available" and ativo

            if tem_valor_venda and disponivel:
                todos.append(p)
            else:
                descartados += 1
        total = dados.get("count", "?")
        print(f"  Pagina {pagina:3d} — {len(todos)} venda / {descartados} descartados (de {total} total)")

        cursor = dados.get("cursor")
        if not cursor or len(todos) >= (dados.get("count") or 0):
            break

        pagina += 1
        time.sleep(0.3)  # evita rate-limit

    print(f"\nTotal para venda: {len(todos)} imoveis  |  Descartados: {descartados} (aluguel/temporada/sem valor/inativos)")

    # Gera CSV
    with open(saida, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUNAS, extrasaction="ignore")
        writer.writeheader()
        for p in todos:
            writer.writerow(extrair_linha(p))

    # Resumo
    por_status = {}
    por_tipo   = {}
    for p in todos:
        s = p.get("status", "outros")
        por_status[s] = por_status.get(s, 0) + 1
        t = p.get("property_type", "outros")
        por_tipo[t] = por_tipo.get(t, 0) + 1

    print(f"\nPor status:")
    for k, v in sorted(por_status.items(), key=lambda x: -x[1]):
        print(f"  {k:<30} {v}")
    print(f"\nPor tipo:")
    for k, v in sorted(por_tipo.items(), key=lambda x: -x[1])[:10]:
        print(f"  {k:<30} {v}")

    print(f"\nOK: {saida} gerado com {len(todos)} linhas")
    print("\nProximo passo no Google Sheets:")
    print("  Aba PRODUTOS -> Arquivo -> Importar -> produtos_imobzi.csv")
    print("  Opcao: 'Substituir planilha atual'")
    print("  Tipo de separador: Virgula")
    print("  Converter texto em numeros: NAO (desmarcar)")


if __name__ == "__main__":
    main()
