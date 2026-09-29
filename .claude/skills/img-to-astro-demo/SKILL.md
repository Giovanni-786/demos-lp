---
name: img-to-astro-demo
description: Converte a saída do img-to-html (pasta com index.html + assets/) em um novo estilo de template Astro dentro do projeto demos-vet, pronto para receber os dados de qualquer clínica via JSON. Use sempre que o usuário mencionar img-to-astro-demo, pedir para inserir, converter, adaptar ou registrar um layout do img-to-html no demos-vet, ou quiser transformar um mock/HTML gerado num novo estilo de demo de clínica veterinária, mesmo que não use a palavra "template".
---

# img-to-html → estilo Astro do demos-vet

## O que faz

Recebe uma pasta gerada pelo `img-to-html` e entrega um estilo novo em
`src/templates/<estilo>/`, registrado no schema e na rota, com as imagens sem
uso removidas e validado por um build real.

**Entradas:**
- pasta de saída do img-to-html (normalmente `design-systems/<slug>/`, com
  `index.html` e `assets/styles.css`). Se faltar, peça.
- nome do estilo: kebab-case minúsculo, sem acento (`lavanda`, `verde-menta`).
  Se o usuário não der, sugira um a partir da paleta e confirme.
- raiz do projeto demos-vet (padrão: diretório atual).

O resultado é um template de **demonstração de venda**: a página precisa
parecer da clínica real usando só os dados do JSON. Fidelidade ao mock vale
para o visual, não para o conteúdo. Todo texto do mock é descartável.

## Fluxo

```
1. auditar + planejar      → [usuário aprova o plano]
2. copiar assets
3. escrever <Estilo>.astro
4. registrar o estilo       (script)
5. podar imagens sem uso    (script)
6. validar com build        (script)
7. relatório
```

Só existe um gate: a aprovação do plano na etapa 1. Depois dele, siga até o
fim e pare apenas se um script falhar.

### 1. Auditar e planejar

Rode:

```bash
python <skill>/scripts/audit.py <pasta-img-to-html>
```

Leia também o `index.html`, o `wireframe.txt` (se existir) e
`references/contrato-projeto.md`. Confira no projeto se o schema em
`src/content.config.ts` ainda bate com o contrato; se mudou, siga o projeto.

Se o audit acusar arquivos ausentes, pare e diga ao usuário: o img-to-html
grava tudo em `design-systems/<slug>/assets/` no repositório onde rodou, e é
comum copiar só o HTML e o CSS.

Monte o plano como tabela: cada seção do HTML → **mantida**, **reduzida** ou
**removida**, com o campo do schema que a alimenta ou o motivo do corte.
Critério de corte: a seção só existe se puder ser preenchida com dado real do
JSON ou com texto genérico verdadeiro para qualquer clínica. Seções com
estrutura boa e conteúdo ruim podem ser **reaproveitadas** (ex.: cards de
perfil viram cards de informação com dados do JSON).

Verifique também se o mock recria o site de uma marca real (logo, wordmark,
nome da empresa no texto). Logo, wordmark e **fotos de pessoas** recortadas da
referência nunca vão para a demo: não pertencem ao usuário e não são de clínica.
Olhe as imagens antes de planejar. Se as fotos forem de terceiros, o plano
propõe trocá-las por fundos neutros (os fallbacks de cor do próprio CSS),
deixando as linhas `url()` comentadas com `/* foto: ... */` para o usuário
recolocar fotos próprias depois. Números,
depoimentos, equipe, logos de parceiros, integrações e redes sociais do mock
são sempre removidos, porque o dono da clínica sabe que não são dele e isso
derruba a credibilidade da abordagem. Veja `references/exemplo-lavanda.md`
para o padrão de decisão e `references/exemplo-grafite.md` para um mock com fotos de terceiros e layout responsivo.

Junto do plano, repasse os alertas do audit que afetam o envio (sem `@media`,
gradientes com hex fixo) como pendências, sem resolvê-los agora.

Mostre o plano e **pare**. Só continue com aprovação explícita.

### 2. Copiar os assets

Copie a pasta `assets/` inteira, intacta, para `src/templates/<estilo>/assets/`,
com o `styles.css` dentro dela. Não mova o CSS para fora: ele referencia
`url("fonts/...")` e outras imagens de forma relativa, e o Vite resolve esses
caminhos a partir da pasta do próprio CSS. Mantendo a estrutura, nenhuma linha
do CSS muda. Não copie `index.html`, `reference.*` nem `wireframe.txt`.

Edições permitidas no CSS:
- fontes em `<link>` do Google Fonts no `<head>` do HTML → `@import` no topo do `styles.css`;
- fotos removidas pelo plano → tire o `url()` da declaração, mantendo a cor de
  fallback, e deixe o original num comentário `/* foto: ... */`. O `prune_assets.py`
  ignora `url()` comentado;
- ajustes que a remoção de conteúdo exigir (espaço reservado para foto, nome da
  clínica maior que o wordmark original) → num bloco único no **fim** do arquivo,
  com comentário `ajustes demos-vet`. Não espalhe edições pelo CSS original.

### 3. Escrever `<Estilo>.astro`

Arquivo: `src/templates/<estilo>/<Estilo>.astro` (PascalCase do nome do
estilo: `verde-menta` → `VerdeMenta.astro`). Use `references/exemplo-lavanda.md`
como modelo de estrutura. Regras:

- **Só o conteúdo do `<body>`**, envolvido numa `<div>` que recebe as classes
  que estavam no `<body>`. `<head>`, título e meta são do `DemoLayout`.
- **CSS como URL, nunca como import:** `import cssUrl from './assets/styles.css?url';`
  no frontmatter e `<link rel="stylesheet" href={cssUrl} />` como primeira linha
  do markup. O `[slug].astro` importa todos os templates para montar o mapa, e o
  Astro junta no bundle da página o CSS de tudo o que ela importa, renderizado
  ou não. Com `import` direto, todos os estilos carregariam em todas as demos e
  as classes com o mesmo nome (`.hero`, `.btn`) se sobrescreveriam. O `?url`
  continua passando pelo Vite, então fontes e `url()` do CSS seguem resolvidos.
- **Imagens pelo helper `a()`**, copiado do exemplo: `src="assets/X"` vira
  `src={a('X')}`. O `throw` do helper quebra o build se um caminho estiver
  errado, e isso é intencional.
- **Nunca monte caminhos de imagem dinamicamente** (`a(\`icons/${x}\`)`). Use
  listas com caminhos completos (`['icons/paw.svg', ...]`) e passe o item. O
  `prune_assets.py` só enxerga literais completos e recusa caminhos dinâmicos.
- **Contato:** `whatsapp` → `https://wa.me/55<dígitos>`; senão `telefone` →
  `tel:+55<dígitos>`; sem nenhum dos dois, todos os botões de contato e a
  seção de CTA não renderizam.
- **Campos opcionais** condicionam o elemento que depende deles
  (`{clinica.bairro && ...}`), com fallback só onde o texto continua
  verdadeiro (ex.: `clinica.bairro ?? 'Bauru'`).
- `emergencia24h` aparece de forma visível (selo no hero e/ou card de serviço).
- **Todo texto em PT-BR**, reescrito para clínica vet. Nenhum "?" do mock,
  nenhum texto em inglês, nenhuma descrição inventada de serviço.
- Links internos viram âncoras (`#servicos`, `#contato`) com os `id`s
  correspondentes nas seções.
- JS: se existir `assets/app.js`, carregue com `<script src="./assets/app.js"></script>`.
  Se depender de escopo global, use `is:inline` e mova o arquivo para `public/`.
- Não altere nomes de classe: o CSS depende deles.

### 4. Registrar o estilo

```bash
python <skill>/scripts/register_style.py <raiz> <estilo>
```

Adiciona o estilo ao `z.enum` do schema e o import + entrada no mapa
`templates` de `src/pages/demo/[slug].astro`. É idempotente.

### 5. Podar imagens sem uso

```bash
python <skill>/scripts/prune_assets.py src/templates/<estilo>          # revisa
python <skill>/scripts/prune_assets.py src/templates/<estilo> --apply  # apaga
```

Necessário porque o `import.meta.glob` com `eager: true` do helper faz o Vite
emitir **todas** as imagens da pasta em `dist/`, usadas ou não. Revise a lista
antes do `--apply`: se uma imagem que você usa aparecer como "sem uso", o
caminho dela no template não está como literal completo.

### 6. Validar com build

```bash
python <skill>/scripts/verify_build.py <raiz> <estilo>
```

Cria duas clínicas temporárias (completa e mínima) com o estilo, roda
`npx astro build`, inspeciona o HTML e limpa tudo no final. Se falhar,
corrija o template e rode de novo até dar `OK`. Os avisos de texto com "?"
precisam ser resolvidos: são placeholders do mock que sobraram.

### 7. Relatório

Responda ao usuário com:
- arquivos criados e alterados;
- seções mantidas e removidas (resumo do plano aprovado);
- resultado do `verify_build.py`;
- rota para testar: crie ou indique um JSON em `src/content/clinicas/` com
  `"estilo": "<estilo>"` e abra `/demo/<nome-do-arquivo>` com `npm run dev`;
- pendências do audit que continuam abertas (celular, cor por hash).

## Não fazer

- Pular a aprovação do plano.
- Manter conteúdo do mock que finja ser da clínica (números, depoimentos, equipe, logos).
- Mover o `styles.css` para fora de `assets/` ou reescrever caminhos do CSS.
- Importar o CSS com `import './assets/styles.css'` (vaza para todas as demos).
- Manter logo, wordmark ou fotos de pessoas vindos do mock.
- Colocar `<html>`, `<head>` ou meta tags no template.
- Montar caminho de imagem com template string.
- Resolver responsividade ou cor por hash sem o usuário pedir: são etapas
  separadas, apenas reporte.
