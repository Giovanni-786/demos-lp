# Contrato do projeto demos-vet

O que o template recebe e o que já é responsabilidade de outro arquivo.
Leia antes de escrever o `.astro` e confira no projeto se nada mudou.

## Estrutura

```
src/
├── content.config.ts            # schema + loader (rascunhos com "_" fora do build de produção)
├── content/clinicas/*.json      # uma clínica por arquivo; o nome do arquivo é o slug
├── lib/cor.ts                   # corDoSlug(slug) → cor da paleta por hash
├── layouts/DemoLayout.astro     # dono de <html>, <head>, <body>
├── templates/<estilo>/
│   ├── <Estilo>.astro           # só o conteúdo do <body>
│   └── assets/                  # cópia intacta do assets/ do img-to-html (styles.css dentro)
└── pages/demo/[slug].astro      # getStaticPaths + mapa `templates` por estilo
public/robots.txt                # Disallow: /
```

## Schema (prop `clinica` que o template recebe)

```ts
{
  nome: string;              // único obrigatório
  estilo: 'lavanda' | ...;   // enum; register_style.py adiciona o novo estilo
  bairro?: string;
  whatsapp?: string;         // formato livre, ex. "(14) 99999-0000"
  telefone?: string;
  emergencia24h: boolean;    // default false
  servicos?: string[];
}
```

Regra de exibição: campo ausente → a seção ou o elemento que depende dele não
renderiza. Nunca exibir "undefined", placeholder do mock ou dado inventado.
Exceção aceita: `servicos` pode ter lista padrão genérica, porque uma clínica
vet sem seção de serviços fica vazia demais.

## O que NÃO vai no template

- `<html>`, `<head>`, `<body>`, `<title>`, meta tags: o `DemoLayout` já cuida
  (noindex, Open Graph com nome e bairro, faixa "Demonstração").
- Classe ou atributo que a skill colocou no `<body>` (ex.: `class="page"`):
  mova para uma `<div>` que envolve todo o template.
- `import './assets/styles.css'`: o CSS entra por `?url` e `<link>` no próprio template (ver SKILL.md, etapa 3).
- Fontes em `<link>` do Google Fonts no `<head>`: passe para `@import` no topo
  do `styles.css`. Um `slot="head"` não funciona, porque o template não é
  filho direto do layout (`[slug].astro` renderiza
  `<DemoLayout><Template /></DemoLayout>`).

## Cor por hash

O `DemoLayout` injeta `--primaria` no `<body>`. Enquanto o CSS do estilo não
usar essa variável, a paleta original do mock continua. Ligar a cor exige
revisar gradientes e tokens derivados com hex fixo (o audit.py lista quantos).
Isso é uma etapa separada: não faça na conversão sem o usuário pedir.
