#!/usr/bin/env python3
"""Valida um estilo com um build real do Astro.

Uso: python verify_build.py <raiz-do-projeto> <estilo>

Cria temporariamente duas clínicas de teste para o estilo (uma com todos os
campos, outra só com os obrigatórios), roda `npx astro build`, inspeciona o
HTML gerado e apaga tudo no final. Os JSONs de teste não começam com "_" de
propósito: rascunhos ficam fora do build de produção e não seriam testados.

Falha (exit 1) se:
- o build quebrar ou alguma das duas páginas não for gerada
- sobrar `src="assets/` (imagem não convertida para a())
- aparecer "undefined", "null" ou "[object" como texto na página
- a página mínima tiver link de contato (sem contato, CTA não deve renderizar)
- alguma URL /_astro/ referenciada não existir em dist/
- a página carregar mais de uma folha de CSS (CSS de outro estilo vazando)
Avisa (sem falhar) sobre placeholders "?" do mock e imagens do estilo emitidas sem uso.
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

COMPLETO = {
    "nome": "Clínica Veterinária Teste Completo",
    "bairro": "Centro",
    "whatsapp": "(14) 99999-0000",
    "telefone": "(14) 3333-0000",
    "emergencia24h": True,
    "servicos": ["Consultas", "Vacinação", "Cirurgias", "Exames", "Banho e tosa"],
}
MINIMO = {"nome": "Clínica Teste Mínimo"}


def texto_visivel(html: str) -> str:
    html = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S)
    return re.sub(r"<[^>]+>", " ", html)


def main():
    if len(sys.argv) != 3:
        sys.exit("uso: python verify_build.py <raiz-do-projeto> <estilo>")
    raiz, estilo = Path(sys.argv[1]).resolve(), sys.argv[2]
    clinicas = raiz / "src" / "content" / "clinicas"
    dist = raiz / "dist"
    slugs = {"completo": f"zz-verifica-{estilo}-completo", "minimo": f"zz-verifica-{estilo}-minimo"}
    criados = []
    erros, avisos = [], []

    try:
        for tipo, dados in (("completo", COMPLETO), ("minimo", MINIMO)):
            arq = clinicas / f"{slugs[tipo]}.json"
            arq.write_text(json.dumps({**dados, "estilo": estilo}, ensure_ascii=False, indent=2), encoding="utf-8")
            criados.append(arq)

        r = subprocess.run("npx astro build", cwd=raiz, shell=True, capture_output=True, text=True)
        if r.returncode != 0:
            print((r.stdout + r.stderr)[-3000:])
            sys.exit("BUILD FALHOU")

        paginas = {}
        for tipo, slug in slugs.items():
            p = dist / "demo" / slug / "index.html"
            if not p.exists():
                erros.append(f"página {tipo} não gerada: {p.relative_to(raiz)}")
            else:
                paginas[tipo] = p.read_text(encoding="utf-8")

        css = "".join(f.read_text(encoding="utf-8") for f in (dist / "_astro").glob("*.css"))
        referenciados = set()
        for tipo, html in paginas.items():
            if 'src="assets/' in html:
                erros.append(f"{tipo}: sobrou src=\"assets/...\" (imagem não passou por a())")
            txt = texto_visivel(html)
            for ruim in ("undefined", "null", "[object"):
                if re.search(rf"(?<![\w-]){re.escape(ruim)}(?![\w-])", txt):
                    erros.append(f"{tipo}: texto '{ruim}' visível na página")
            # placeholder do mock = "?" solto ou no início de palavra ("?", "?sn");
            # pergunta legítima ("Vamos conversar?") não é acusada
            nos = [n.strip() for n in re.findall(r">([^<>]+)<", html) if n.strip()]
            placeholders = [n for n in nos if re.search(r"(?:^|\s)\?", n)]
            if placeholders:
                avisos.append(f"{tipo}: placeholders '?' do mock: {placeholders[:5]}")
            referenciados |= set(re.findall(r"/_astro/([^\"')\s]+)", html))
        referenciados |= set(re.findall(r"/_astro/([^\"')\s]+)", css))

        for tipo, html in paginas.items():
            folhas = re.findall(r'<link rel="stylesheet"[^>]*>', html)
            if any("/_slug_." in f for f in folhas):
                erros.append(f"{tipo}: CSS entrou no bundle da rota (_slug_.css), compartilhado por todos os estilos; use ?url, ver SKILL.md")
            if len(folhas) > 1:
                erros.append(f"{tipo}: {len(folhas)} folhas de CSS na página; o CSS de outros estilos está vazando (use ?url, ver SKILL.md)")

        if "minimo" in paginas and re.search(r'href="(?:https://wa\.me|tel:)', paginas["minimo"]):
            erros.append("minimo: há link de contato sem whatsapp/telefone no JSON")

        for ref in sorted(referenciados):
            if not (dist / "_astro" / ref).exists():
                erros.append(f"referência quebrada: /_astro/{ref}")

        assets_estilo = raiz / "src" / "templates" / estilo / "assets"
        nomes = {p.stem for p in assets_estilo.rglob("*") if p.is_file() and p.suffix.lower() != ".css"}
        for f in (dist / "_astro").iterdir():
            base = f.name.split(".")[0]
            if base in nomes and f.name not in referenciados and not f.name.endswith(".css"):
                avisos.append(f"emitido sem uso: {f.name} (rode prune_assets.py)")

        print(f"páginas geradas: {', '.join(paginas) or 'nenhuma'}")
        for a in avisos:
            print(f"AVISO: {a}")
        for e in erros:
            print(f"ERRO: {e}")
        print("OK" if not erros else "FALHOU")
        if erros:
            sys.exit(1)
    finally:
        for arq in criados:
            arq.unlink(missing_ok=True)
        shutil.rmtree(dist, ignore_errors=True)


if __name__ == "__main__":
    main()
