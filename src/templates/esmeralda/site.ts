// Helpers do estilo esmeralda: tipos, links, ênfase nos títulos e a home padrão
// (para JSONs sem `inicio`). Nada de nome de imagem aqui: o prune_assets.py só lê
// os .astro, então fotos ficam no mapa literal do EsmeraldaSite.astro.
import type { CollectionEntry } from 'astro:content';

export type Clinica = CollectionEntry<'clinicas'>['data'];
export type Secao = NonNullable<Clinica['inicio']>[number];
export type Item = NonNullable<Secao['itens']>[number];
export type Cta = NonNullable<Secao['ctas']>[number];
export type Resolver = (link: string) => string | null;

const digitos = (s: string) => s.replace(/\D/g, '');

export const pad = (n: number) => String(n).padStart(2, '0');

// "Muito *além dos* carros." → ['Muito ', 'além dos', ' carros.']; índices ímpares = ênfase.
export const partes = (texto: string) => texto.split('*');

// Texto de item com parágrafos separados por linha em branco.
export const paragrafos = (texto?: string) => (texto ? texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean) : []);

export function whatsappUrl(clinica: Clinica, texto?: string) {
  if (!clinica.whatsapp) return null;
  return `https://wa.me/55${digitos(clinica.whatsapp)}${texto ? `?text=${encodeURIComponent(texto)}` : ''}`;
}

export const telefoneUrl = (clinica: Clinica) => (clinica.telefone ? `tel:+55${digitos(clinica.telefone)}` : null);

export const redeUrl = (valor: string | undefined, base: string) =>
  !valor ? null : /^https?:/.test(valor) ? valor : `${base}${valor.replace(/^@/, '')}`;

export const ehExterno = (href: string) => /^https?:/.test(href);

// Transforma o `link` do JSON em href. Retorna null quando o destino depende de um
// contato que a empresa não tem (sem WhatsApp nem telefone): o botão não renderiza.
// Erros de digitação no JSON (página, âncora ou mensagem inexistente) quebram o build.
export function criarResolver(clinica: Clinica, slug: string, paginaAtual: string, secoesInicio: Secao[]): Resolver {
  const base = `/demo/${slug}/`;
  const tel = telefoneUrl(clinica);
  const ids = new Map<string, Set<string>>();
  ids.set('', new Set(secoesInicio.map((s) => s.id).filter((x): x is string => Boolean(x))));
  for (const p of clinica.paginas ?? []) ids.set(p.slug, new Set(p.secoes.map((s) => s.id).filter((x): x is string => Boolean(x))));

  return (link) => {
    if (link === 'wa') return whatsappUrl(clinica, clinica.whatsappMensagem) ?? tel;
    if (link.startsWith('wa:')) {
      const msg = clinica.whatsappMensagens?.[link.slice(3)];
      if (msg === undefined) throw new Error(`[esmeralda] mensagem de WhatsApp desconhecida: ${link}`);
      return whatsappUrl(clinica, msg) ?? tel;
    }
    if (/^(https?:|mailto:|tel:)/.test(link)) return link;
    const [caminho, ancora] = link.split('#');
    const pagina = caminho.replace(/^\//, '').replace(/\/$/, '');
    if (!caminho) return `#${ancora}`; // âncora na própria página
    if (!caminho.startsWith('/')) throw new Error(`[esmeralda] link inválido: ${link}`);
    if (!ids.has(pagina)) throw new Error(`[esmeralda] página inexistente no link: ${link}`);
    if (ancora && !ids.get(pagina)!.has(ancora)) throw new Error(`[esmeralda] âncora inexistente no link: ${link}`);
    if (pagina === paginaAtual && ancora) return `#${ancora}`;
    return `${base}${pagina ? `${pagina}/` : ''}${ancora ? `#${ancora}` : ''}`;
  };
}

// Home padrão, montada com os campos genéricos do schema. É a conversão original do
// mock: textos genéricos verdadeiros para qualquer empresa de eventos automotivos e
// seções que só aparecem com dado real (produtos, cidades, contato).
export function inicioPadrao(clinica: Clinica): Secao[] {
  const contato = whatsappUrl(clinica, clinica.whatsappMensagem) ?? telefoneUrl(clinica);
  const parceiro = whatsappUrl(clinica, 'Olá! Tenho interesse em ser marca parceira nos eventos de vocês.') ?? telefoneUrl(clinica);
  const lugares = clinica.cidades?.length ? clinica.cidades : clinica.bairro ? [clinica.bairro] : [];
  const cta = (texto: string, link: string | null): Cta[] => (link ? [{ texto, link }] : []);

  const tickerBase = [...(clinica.servicos ?? []), ...lugares];
  const ticker = tickerBase.length
    ? tickerBase
    : ['Eventos automotivos', 'Super carros', 'Experiências exclusivas', 'Networking', clinica.nome];

  const valores =
    clinica.diferenciais?.length
      ? clinica.diferenciais.map((d) => ({ titulo: d.titulo, texto: d.descricao }))
      : [
          {
            titulo: 'Paixão compartilhada',
            texto: 'O que une todo mundo aqui é o fascínio por carros e por tudo o que eles representam: história, engenharia e emoção.',
          },
          {
            titulo: 'Conexões de verdade',
            texto: 'Gente que fala a mesma língua. Nos eventos, encontros viram amizades e, muitas vezes, boas oportunidades.',
          },
          {
            titulo: 'Experiência em cada detalhe',
            texto: 'Lugar, programação e estrutura pensados para que cada evento seja lembrado muito depois do último motor desligar.',
          },
        ];

  const secoes: Secao[] = [
    {
      tipo: 'capa',
      apoio: [clinica.area ?? 'Eventos automotivos', clinica.bairro].filter(Boolean).join(' · '),
      titulo: 'Paixão *em alta* rotação',
      textos: [
        clinica.slogan ??
          'Eventos pensados para quem vive a paixão por carros: experiências exclusivas, curadoria em cada detalhe e conexões entre pessoas que falam a mesma língua.',
      ],
      ctas: [...cta('Quero participar', contato), { texto: `Conheça o universo ${clinica.nome}`, link: '#sobre' }],
    },
    { tipo: 'faixa', itens: ticker.map((titulo) => ({ titulo })) },
    {
      tipo: 'apresentacao',
      id: 'sobre',
      menu: 'Sobre',
      apoio: `Bem-vindo ao universo ${clinica.nome}`,
      titulo: 'Mais que eventos: um *estilo de vida* para quem é apaixonado por carros.',
      textos: [
        clinica.descricao ??
          `${clinica.nome} cria eventos para quem é apaixonado por carros, reunindo entusiastas, colecionadores, famílias e convidados em torno da mesma paixão.`,
        'Cada evento é pensado nos detalhes, do lugar à programação, para que a experiência vá muito além do motor.',
      ],
      legenda: 'Encontro de super carros',
    },
    { tipo: 'presenca', apoio: 'Presença', titulo: 'Grandes máquinas pedem *grandes cenários.*' },
    {
      tipo: 'valores',
      id: 'essencia',
      menu: 'Essência',
      apoio: 'A essência da experiência',
      titulo: 'Feito por quem vive a paixão por carros.',
      itens: valores.slice(0, 4),
    },
    { tipo: 'banner', legenda: 'Super carros na pista' },
  ];

  if (clinica.produtos?.length)
    secoes.push({
      tipo: 'experiencias',
      id: 'experiencias',
      menu: 'Experiências',
      apoio: 'Experiências',
      titulo: 'Cada evento, uma experiência única.',
      textos: ['Carros raros. Pessoas apaixonadas. Momentos para lembrar.'],
      itens: clinica.produtos.slice(0, 5).map((p) => ({ titulo: p.titulo, tag: p.tag, texto: p.descricao })),
    });

  secoes.push({ tipo: 'galeria' });

  if (lugares.length)
    secoes.push({
      tipo: 'alcance',
      id: 'alcance',
      menu: 'Alcance',
      apoio: 'Alcance',
      titulo: 'Por onde a paixão passa.',
      textos: ['Conectando pessoas apaixonadas por carros onde quer que a estrada leve.'],
      legenda: 'Eventos em',
      itens: lugares.map((titulo) => ({ titulo })),
    });

  secoes.push({
    tipo: 'parceiros',
    id: 'parcerias',
    menu: 'Parcerias',
    apoio: 'Para marcas',
    titulo: 'Sua marca no centro de uma experiência premium.',
    textos: [
      'Concessionárias, estética automotiva, blindagem, seguros e serviços financeiros encontram nos nossos eventos um palco para exposição, test drives e conteúdo digital.',
    ],
    ctas: contato ? [{ texto: 'Seja parceiro', link: '#convite' }] : [],
    itens: [
      { titulo: 'Sua marca em destaque', texto: 'Exposição da sua marca nos eventos, diante de um público apaixonado por carros.' },
      { titulo: 'Ativações e test drives', texto: 'Deixe o público conhecer de perto o seu produto, com demonstrações, amostras e test drives.' },
      { titulo: 'Presença nas redes', texto: 'Sua participação aparece nas fotos e vídeos dos eventos publicados nas redes sociais.' },
    ],
  });

  if (contato)
    secoes.push({
      tipo: 'convite',
      id: 'convite',
      apoio: 'Participe',
      titulo: 'Quer viver a próxima experiência de perto?',
      textos: [
        'Fale com a gente para saber as próximas datas, como participar com o seu carro ou como levar a sua marca para os eventos.',
      ],
      itens: [
        {
          titulo: 'Participante',
          texto: 'Para quem é apaixonado por carros e quer viver a experiência de perto.',
          lista: ['Acesso aos eventos e encontros', 'Contato com quem divide a mesma paixão', 'Experiências com curadoria'],
          ctas: cta('Quero participar', contato),
        },
        {
          titulo: 'Marca parceira',
          texto: 'Para marcas que querem estar diante de um público apaixonado por carros.',
          lista: ['Exposição e ativação de marca', 'Test drives e demonstrações', 'Presença no conteúdo digital'],
          ctas: cta('Quero ser parceiro', parceiro),
        },
      ],
    });

  secoes.push({
    tipo: 'encerramento',
    apoio: 'Faça parte',
    titulo: `Entre para o universo *${clinica.nome}.*`,
    ctas: cta(clinica.whatsapp ? 'Falar no WhatsApp' : 'Ligar agora', contato),
  });

  return secoes;
}
