#!/usr/bin/env python3
"""Remove da pasta do template as imagens que o template não usa.

Uso: python prune_assets.py <pasta-do-template> [--apply]

Por que existe: o helper `a()` usa import.meta.glob com eager: true, que gera um
import para CADA arquivo que casa com o padrão. Cada import faz o Vite emitir o
arquivo em dist/, usado ou não. Imagem sem uso = lixo no deploy.

Conta como "usada":
- todo literal de string no .astro que seja caminho de imagem relativo a assets/
  (por isso o template nunca monta caminhos dinamicamente; ver SKILL.md)
- todo url() do styles.css
Sem --apply, só lista o que seria apagado. Fontes e CSS nunca são apagados.
"""
import re
import sys
from pathlib import Path

EXT = {".svg", ".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"}
LITERAL = re.compile(r"['\"`]([^'\"`$\s]+\.(?:svg|png|jpe?g|webp|gif|avif))['\"`]")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    apply = "--apply" in sys.argv
    if len(args) != 1:
        sys.exit("uso: python prune_assets.py <pasta-do-template> [--apply]")
    pasta = Path(args[0]).resolve()
    assets = pasta / "assets"
    astros = list(pasta.glob("*.astro"))
    if not astros:
        sys.exit("nenhum .astro na pasta do template")

    for f in astros:
        if re.search(r"a\(\s*`[^`]*\$\{", f.read_text(encoding="utf-8")):
            sys.exit(f"{f.name}: caminho dinâmico em a(`...${{}}`). Troque por lista de caminhos completos antes de podar.")

    usados = set()
    for f in astros:
        for lit in LITERAL.findall(f.read_text(encoding="utf-8")):
            usados.add(lit.removeprefix("./").removeprefix("assets/"))
    css = assets / "styles.css"
    if css.exists():
        css_ativo = re.sub(r"/\*.*?\*/", "", css.read_text(encoding="utf-8"), flags=re.S)  # url() comentado não conta
        for u in re.findall(r'url\(["\']?([^)"\']+)["\']?\)', css_ativo):
            usados.add(u.removeprefix("./"))

    imagens = [p for p in assets.rglob("*") if p.is_file() and p.suffix.lower() in EXT]
    rel = lambda p: p.relative_to(assets).as_posix()
    sem_uso = [p for p in imagens if rel(p) not in usados]
    ausentes = sorted(u for u in usados if Path(u).suffix.lower() in EXT and not (assets / u).exists())

    print(f"{len(imagens)} imagens na pasta | {len(imagens) - len(sem_uso)} usadas | {len(sem_uso)} sem uso")
    nomes = [rel(p) for p in sem_uso]
    if apply:
        for p in sem_uso:
            p.unlink()
    for n in nomes:
        print(f"  {'apagada' if apply else 'apagaria'}: assets/{n}")
    if apply:
        for d in sorted((d for d in assets.rglob("*") if d.is_dir()), reverse=True):
            if not any(d.iterdir()):
                d.rmdir()
    for u in ausentes:
        print(f"  ALERTA: referenciada mas ausente: assets/{u}")
    if not apply and sem_uso:
        print("rode de novo com --apply para apagar")
    if ausentes:
        sys.exit(1)


if __name__ == "__main__":
    main()
