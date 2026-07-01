"""
BASE INTELIGENTE — importar_base_local.py

Converte base_processada.csv (saída do processar_contatos_v3.py)
para o formato exato da aba CONTATOS do Google Sheets.

Uso:
    python importar_base_local.py
    python importar_base_local.py base_processada.csv sheets_import.csv

Depois: no Sheets, Arquivo -> Importar -> sheets_import.csv
        Escolher: Inserir linhas na planilha atual / Sem conversão de tipo
"""

import csv
import sys
from pathlib import Path
from datetime import datetime

ENTRADA_PADRAO = Path(r"C:\Users\User\Downloads\base_processada.csv")
SAIDA_PADRAO   = Path(r"C:\Users\User\Downloads\sheets_import.csv")

# Ordem exata das colunas da aba CONTATOS no Sheets
# (mesma ordem do Apps Script)
COLUNAS_SHEETS = [
    "dataCadastro",
    "nome", "telefone", "email",
    "nascimento", "estadoCivil", "filhos",
    "profissao", "empresa",
    "bairroMora", "cidadeMora", "moradia",
    "bairroTrabalha", "raioMaximo", "bairroInteresse",
    "segmento",
    # Características do imóvel (etapa 3 do formulário)
    "quartos", "suites", "vagas", "areaUtil", "areaTerreno",
    "adensavel", "andarAlto", "aceitaTerreo", "churrasqueira",
    "piscina", "homeOffice", "condFechado", "elevador", "acessibilidade",
    "padrao", "precoLimite", "margem_preco",
    "finalidade", "fgts", "financ", "entrada_chip", "permuta", "entrada",
    "canal", "primeiroContato", "ultimoContato",
    "produtoOrigem", "naoFechou", "urgencia",
    "indicadoPor",
    "conversa", "observacoes",
    "score",
    # Colunas extras da base local (nao vem do formulario)
    "prioridade", "categoria", "nome_bruto",
    # Colunas usadas pelo dashboard, preenchidas manualmente no Sheets
    "tipo_contato", "tags",
]

# Mapeamento: coluna do Sheets -> coluna no base_processada.csv
# Quando o nome e igual, nao precisa mapear
MAPA = {
    "urgencia": "prioridade",  # prioridade Alta/Media/Baixa vira campo urgencia
}

def main():
    if len(sys.argv) == 3:
        entrada = Path(sys.argv[1])
        saida   = Path(sys.argv[2])
    else:
        entrada = ENTRADA_PADRAO
        saida   = SAIDA_PADRAO
        print(f"Caminhos padrao:\n  entrada: {entrada}\n  saida:   {saida}\n")

    if not entrada.exists():
        print(f"Arquivo nao encontrado: {entrada}")
        sys.exit(1)

    # Detecta encoding
    for enc in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            with open(entrada, newline="", encoding=enc) as f:
                reader = csv.DictReader(f)
                linhas = list(reader)
                colunas_origem = reader.fieldnames or []
            break
        except UnicodeDecodeError:
            continue

    print(f"Lendo: {entrada}")
    print(f"  -> {len(linhas)} linhas")
    print(f"  -> Colunas origem: {colunas_origem}")

    agora = datetime.now().strftime("%d/%m/%Y %H:%M")

    with open(saida, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=COLUNAS_SHEETS, extrasaction="ignore")
        writer.writeheader()

        for row in linhas:
            nova = {}
            for col in COLUNAS_SHEETS:
                origem = MAPA.get(col, col)  # usa mapeamento ou nome direto
                nova[col] = row.get(origem, "")

            # dataCadastro: usa hoje se vazio
            if not nova.get("dataCadastro"):
                nova["dataCadastro"] = agora

            # urgencia: se veio de prioridade, limpa o "—"
            if nova.get("urgencia") == "—":
                nova["urgencia"] = ""

            writer.writerow(nova)

    print(f"\nOK: {saida} gerado com {len(linhas)} linhas")
    print("\nProximo passo no Google Sheets:")
    print("  Arquivo -> Importar -> sheets_import.csv")
    print("  Opcao: 'Inserir linhas na planilha atual'")
    print("  Tipo de separador: Virgula")
    print("  Converter texto em numeros: NAO (desmarcar)")

if __name__ == "__main__":
    main()
