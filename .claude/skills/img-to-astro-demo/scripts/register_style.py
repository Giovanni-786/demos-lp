#!/usr/bin/env python3
"""Registra um estilo no projeto demos-vet.

Uso: python register_style.py <raiz-do-projeto> <estilo>

- adiciona o estilo ao z.enum de `estilo` em src/content.config.ts
- adiciona o import e a entrada no mapa `templates` de src/pages/demo/[slug].astro
Idempotente: rodar duas vezes não duplica nada.
"""
import re
import sys
from pathlib import Path


def pascal(estilo: str) -> str:
    return "".join(p.capitalize() for p in estilo.split("-"))


def registrar_enum(cfg: Path, estilo: str):
    txt = cfg.read_text(encoding="utf-8")
    m = re.search(r"estilo:\s*z\.enum\(\[(.*?)\]\)", txt, re.S)
    if not m:
        sys.exit("não achei `estilo: z.enum([...])` em src/content.config.ts")
    valores = re.findall(r"['\"]([^'\"]+)['\"]", m.group(1))
    if estilo in valores:
        print("content.config.ts: estilo já estava no enum")
        return
    valores.append(estilo)
    novo = "estilo: z.enum([" + ", ".join(f"'{v}'" for v in valores) + "])"
    cfg.write_text(txt[: m.start()] + novo + txt[m.end():], encoding="utf-8")
    print(f"content.config.ts: enum agora = {valores}")


def registrar_rota(rota: Path, estilo: str, comp: str):
    txt = rota.read_text(encoding="utf-8")
    linha = f"import {comp} from '../../templates/{estilo}/{comp}.astro';"
    original = txt
    if linha not in txt:
        imports = list(re.finditer(r"^import .* from '\.\./\.\./templates/.*';$", txt, re.M)) \
            or list(re.finditer(r"^import .*;$", txt, re.M))
        if not imports:
            sys.exit("não achei nenhum import em [slug].astro")
        pos = imports[-1].end()
        txt = txt[:pos] + "\n" + linha + txt[pos:]

    m = re.search(r"const templates = \{(.*?)\};", txt, re.S)
    if not m:
        sys.exit("não achei `const templates = { ... };` em [slug].astro")
    entradas = [e.strip() for e in m.group(1).split(",") if e.strip()]
    chaves = [e.split(":")[0].strip().strip("'\"") for e in entradas]
    if estilo not in chaves:
        chave = estilo if "-" not in estilo else f"'{estilo}'"
        entradas.append(f"{chave}: {comp}")
        txt = txt[: m.start()] + "const templates = { " + ", ".join(entradas) + " };" + txt[m.end():]
    if txt == original:
        print("[slug].astro: estilo já estava registrado")
        return
    rota.write_text(txt, encoding="utf-8")
    print(f"[slug].astro: {comp} importado e registrado")


def main():
    if len(sys.argv) != 3:
        sys.exit("uso: python register_style.py <raiz-do-projeto> <estilo>")
    raiz, estilo = Path(sys.argv[1]).resolve(), sys.argv[2]
    if not re.fullmatch(r"[a-z][a-z0-9-]*", estilo):
        sys.exit("estilo deve ser kebab-case minúsculo, sem acentos (ex.: lavanda, verde-menta)")
    comp = pascal(estilo)

    template = raiz / "src" / "templates" / estilo / f"{comp}.astro"
    if not template.exists():
        sys.exit(f"template não encontrado: {template}")

    registrar_enum(raiz / "src" / "content.config.ts", estilo)
    registrar_rota(raiz / "src" / "pages" / "demo" / "[slug].astro", estilo, comp)


if __name__ == "__main__":
    main()
