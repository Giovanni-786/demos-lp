#!/usr/bin/env python3
"""Audita a saída do img-to-html antes da conversão.

Uso: python audit.py <pasta-da-saida-img-to-html>

Relata o que a conversão precisa tratar: estrutura de arquivos, seções do HTML,
imagens referenciadas (e ausentes), responsividade, cores fixas e placeholders.
Não altera nada.
"""
import re
import sys
from pathlib import Path


def main():
    if len(sys.argv) != 2:
        sys.exit("uso: python audit.py <pasta-da-saida-img-to-html>")
    src = Path(sys.argv[1]).resolve()
    html_path = src / "index.html"
    css_path = src / "assets" / "styles.css"

    faltando = [p for p in (html_path, css_path) if not p.exists()]
    if faltando:
        for p in faltando:
            print(f"FALTANDO: {p.relative_to(src)}")
        sys.exit("Saída do img-to-html incompleta. Confira design-systems/<slug>/ no repositório onde a skill rodou.")

    html = html_path.read_text(encoding="utf-8")
    css = css_path.read_text(encoding="utf-8")

    print("== Seções ==")
    for tag, cls in re.findall(r'<(section|header|footer)\s+class="([^"]+)"', html):
        print(f"  <{tag}> .{cls.split()[0]}")

    print("\n== Imagens referenciadas no HTML ==")
    imgs = sorted(set(re.findall(r'src="assets/([^"]+)"', html)))
    ausentes = [i for i in imgs if not (src / "assets" / i).exists()]
    print(f"  {len(imgs)} arquivos distintos; ausentes: {len(ausentes)}")
    for f in ausentes:
        print(f"    AUSENTE: assets/{f}")

    print("\n== url() no CSS (resolvidos a partir de assets/) ==")
    for u in sorted(set(re.findall(r'url\(["\']?([^)"\']+)["\']?\)', css))):
        if u.startswith(("data:", "http", "#")):
            continue
        ok = (src / "assets" / u).exists()
        print(f"  {'ok     ' if ok else 'AUSENTE'} {u}")

    print("\n== Responsividade ==")
    medias = len(re.findall(r"@media", css))
    absolutos = len(re.findall(r"(?:left|top|right|bottom):\s*\d{3,}px", css))
    largos = len(re.findall(r"width:\s*\d{3,}px", css))
    print(f"  @media: {medias} | posições >=100px: {absolutos} | larguras fixas >=100px: {largos}")
    if medias == 0:
        print("  ALERTA: sem @media. O layout provavelmente quebra no celular.")

    print("\n== Cor da marca ==")
    root = re.search(r":root\s*\{(.*?)\n\}", css, re.S)
    if root:
        for nome, valor in re.findall(r"(--[\w-]+):\s*(#[0-9a-fA-F]{3,8})", root.group(1)):
            print(f"  {nome}: {valor}")
    grads = len(re.findall(r"gradient\([^;]*#[0-9a-fA-F]{6}", css))
    print(f"  gradientes com hex fixo: {grads} (não acompanham --primaria só trocando um token)")

    print("\n== Placeholders do mock ==")
    textos = [t.strip() for t in re.findall(r">([^<>]+)<", html) if t.strip()]
    interrog = [t for t in textos if "?" in t]
    print(f"  textos com '?': {len(interrog)}")
    for t in interrog[:15]:
        print(f"    {t[:70]}")

    js = (src / "assets" / "app.js").exists()
    print(f"\n== JavaScript == assets/app.js {'existe' if js else 'não existe'}")


if __name__ == "__main__":
    main()
