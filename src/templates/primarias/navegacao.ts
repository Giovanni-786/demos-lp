// Fonte única de navegação da demo: header, dropdowns e colunas do rodapé da home
// e do blog leem daqui. Seções da home são âncoras; `home` é o prefixo delas
// ('' na própria home, '/demo/<slug>/' no blog).

export type ItemNav = { titulo: string; href: string; filhos?: ItemNav[] };

export const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const etapasPadrao = [
  { nome: 'Educação Infantil' },
  { nome: 'Ensino Fund. I' },
  { nome: 'Ensino Fund. II' },
  { nome: 'Ensino Médio' },
];

// Rotas das páginas do estilo: blog e concurso só existem se o JSON tiver o conteúdo.
export function montarRotas(c: { posts?: unknown[]; concurso?: { menu: string } }, slugPagina?: string) {
  const home = slugPagina ? `/demo/${slugPagina}/` : '/';
  return {
    home,
    blog: slugPagina && c.posts?.length ? `${home}blog/` : null,
    concurso: slugPagina && c.concurso ? { href: `${home}concurso-de-bolsas/`, menu: c.concurso.menu } : null,
  };
}

type Entrada = {
  home: string;
  blog: string | null;
  concurso: { href: string; menu: string } | null;
  etapas: { nome: string }[];
  atalhos: { titulo: string; link?: string }[];
  destaque?: { eyebrow: string; titulo: string };
  temDiferenciais: boolean;
  temCalendario: boolean;
  temContato: boolean;
};

export function montarNavegacao({ home, blog, concurso, etapas, atalhos, destaque, temDiferenciais, temCalendario, temContato }: Entrada) {
  const h = (ancora: string) => `${home}#${ancora}`;
  // link do atalho: âncora da home ("#calendario") ou URL externa; sem link, a seção de atalhos
  const linkAtalho = (link?: string) => (!link ? h('acesso-rapido') : link.startsWith('#') ? h(link.slice(1)) : link);
  const ehAtividade = (t: string) => /atividade/i.test(t);

  const colegio: ItemNav[] = [
    { titulo: 'Sobre', href: h('proposito') },
    ...(temDiferenciais ? [{ titulo: 'Diferenciais', href: h('diferenciais') }] : []),
    ...(temCalendario ? [{ titulo: 'Calendário Escolar', href: h('calendario') }] : []),
    ...(temContato ? [{ titulo: 'Secretaria', href: h('contato') }] : []),
  ];
  const cursos: ItemNav[] = [
    ...etapas.map((e) => ({ titulo: e.nome, href: h(`etapa-${slug(e.nome)}`) })),
    ...(atalhos.some((at) => ehAtividade(at.titulo)) ? [{ titulo: 'Atividades Complementares', href: h('acesso-rapido') }] : []),
  ];

  const header: ItemNav[] = [
    { titulo: 'Início', href: h('inicio') },
    { titulo: 'O Colégio', href: h('proposito'), filhos: colegio },
    { titulo: 'Cursos', href: h('etapas'), filhos: cursos },
    { titulo: 'Eventos', href: h('eventos') },
    ...(concurso ? [{ titulo: concurso.menu, href: concurso.href }] : []),
    ...(blog ? [{ titulo: 'Blog', href: blog }] : []),
    ...(temContato ? [{ titulo: 'Contato', href: h('contato') }] : []),
  ];

  const institucional: ItemNav[] = [
    ...atalhos.filter((at) => !ehAtividade(at.titulo)).map((at) => ({ titulo: at.titulo, href: linkAtalho(at.link) })),
    ...(destaque ? [{ titulo: `${destaque.eyebrow} ${destaque.titulo}`, href: concurso?.href ?? h('destaque') }] : []),
    ...(blog ? [{ titulo: 'Blog', href: blog }] : []),
  ];

  const rodape = {
    // o calendário já aparece em Institucional (atalho); aqui não repete
    colegio: [...colegio.filter((c) => c.href !== h('calendario')), { titulo: 'Eventos', href: h('eventos') }],
    cursos,
    institucional,
  };

  return { header, rodape };
}
