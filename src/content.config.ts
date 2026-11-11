import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Estilo esmeralda: site de várias páginas montado por seções. Cada `tipo` é um bloco
// visual do mock (capa = hero, apresentacao = about, valores, banner, experiencias,
// galeria, alcance, parceiros, convite) ou um bloco criado depois (faq). A seção
// `encerramento` não aparece no meio da página: vira a chamada do rodapé.
// `titulo` aceita *ênfase* (trecho em serifa dourada). `foto` é um arquivo de
// src/templates/esmeralda/assets/ (cada tipo tem uma foto padrão).
// `link` aceita: "/pagina", "/pagina#ancora", "/#ancora" (início), "#ancora",
// "wa" (WhatsApp com whatsappMensagem), "wa:<chave>" (whatsappMensagens) ou URL completa.
const ctaEsmeralda = z.object({ texto: z.string(), link: z.string() });
const itemEsmeralda = z.object({
  titulo: z.string(),
  tag: z.string().optional(),
  // valores: número da linha; alcance: número/ano grande (sem marco, o item entra na lista dourada)
  marco: z.string().optional(),
  // parágrafos separados por linha em branco
  texto: z.string().optional(),
  lista: z.array(z.string()).optional(),
  foto: z.string().optional(),
  ctas: z.array(ctaEsmeralda).optional(),
  // fica no JSON mas não aparece (ex.: rede social com link ainda pendente)
  rascunho: z.boolean().optional(),
});
const secaoEsmeralda = z.object({
  tipo: z.enum([
    'capa',
    'faixa',
    'apresentacao',
    'presenca',
    'valores',
    'banner',
    'experiencias',
    'galeria',
    'alcance',
    'parceiros',
    'convite',
    'faq',
    'encerramento',
  ]),
  id: z.string().regex(/^[a-z0-9-]+$/).optional(),
  // site de uma página só: seções com `menu` e `id` entram no menu
  menu: z.string().optional(),
  apoio: z.string().optional(),
  titulo: z.string().optional(),
  textos: z.array(z.string()).optional(),
  itens: z.array(itemEsmeralda).optional(),
  // alcance: texto depois da lista dourada
  nota: z.string().optional(),
  // galeria: com `itens`, cada item é uma foto (`foto` + `titulo` como descrição)
  // apresentacao/banner: legenda sobre a foto; alcance: rótulo da lista dourada
  legenda: z.string().optional(),
  foto: z.string().optional(),
  // capa: vídeo de fundo (arquivo de src/templates/esmeralda/assets/); a `foto` vira
  // a imagem de espera enquanto o vídeo carrega
  video: z.string().optional(),
  ctas: z.array(ctaEsmeralda).optional(),
});

const clinicas = defineCollection({
  loader: glob({
    base: './src/content/clinicas',
    pattern: import.meta.env.DEV ? '*.json' : '[^_]*.json',
  }),
  schema: z.object({
    nome: z.string(),
    estilo: z.enum(['lavanda', 'grafite', 'primarias', 'dourado', 'esmeralda']),
    bairro: z.string().optional(),
    whatsapp: z.string().optional(),
    // texto pré-preenchido na conversa do WhatsApp (wa.me/?text=)
    whatsappMensagem: z.string().optional(),
    telefone: z.string().optional(),
    emergencia24h: z.boolean().default(false),
    servicos: z.array(z.string()).optional(),
    // Perfil profissional (estilo grafite: personal / nutrição esportiva)
    descricao: z.string().optional(),
    // arquivos em src/templates/grafite/assets/ usados como fundo do hero
    fundo: z.string().optional(),
    fundoMobile: z.string().optional(),
    assinatura: z.string().optional(),
    marca: z.string().optional(),
    area: z.string().optional(),
    slogan: z.string().optional(),
    instagram: z.string().optional(),
    // registro profissional (estilo dourado: advocacia), ex. "OAB/SP 123.456"
    oab: z.string().optional(),
    // estilo primarias (colégio): arquivo de logo em src/templates/primarias/assets/
    logo: z.string().optional(),
    email: z.string().optional(),
    endereco: z.string().optional(),
    tiktok: z.string().optional(),
    // estilo primarias: seções da home do colégio (cada uma só aparece se vier no JSON,
    // exceto etapas, que tem lista padrão)
    atalhos: z
      .array(z.object({ titulo: z.string(), cor: z.enum(['orange', 'blue', 'red']).optional(), link: z.string().optional() }))
      .optional(),
    etapas: z
      .array(z.object({ nome: z.string(), faixa: z.string().optional(), descricao: z.string().optional() }))
      .optional(),
    destaque: z
      .object({ eyebrow: z.string(), titulo: z.string(), texto: z.string().optional(), link: z.string().optional() })
      .optional(),
    diferenciais: z.array(z.object({ titulo: z.string(), descricao: z.string() })).optional(),
    // calendário escolar (estilo primarias): `pdf` é um arquivo de
    // src/templates/primarias/assets/docs/ oferecido para download
    calendario: z
      .object({
        ano: z.string(),
        pdf: z.string().optional(),
        nota: z.string().optional(),
        observacao: z.string().optional(),
        meses: z.array(
          z.object({
            mes: z.string(),
            datas: z.array(
              z.object({
                dia: z.string(),
                titulo: z.string(),
                tipo: z.enum(['letivo', 'feriado', 'suspensa', 'evento', 'reuniao']),
              })
            ),
          })
        ),
      })
      .optional(),
    // concurso de bolsas (estilo primarias): gera /demo/<slug>/concurso-de-bolsas/.
    // Parágrafos aceitam **negrito**; banner e logo são arquivos de
    // src/templates/primarias/assets/concurso/. Botões ainda sem ação.
    concurso: z
      .object({
        menu: z.string(),
        titulo: z.string(),
        chamada: z.string(),
        paragrafos: z.array(z.string()),
        destaques: z.array(z.object({ valor: z.string(), texto: z.string() })).optional(),
        botoesTitulo: z.string().optional(),
        botoes: z.array(z.string()).optional(),
        banner: z.string().optional(),
        logo: z.string().optional(),
      })
      .optional(),
    // blog (estilo primarias): gera /demo/<slug>/blog/; `imagem` é um banner de
    // src/templates/primarias/assets/blog/ (sem ela, usa um banner pela posição)
    posts: z
      .array(
        z.object({
          titulo: z.string(),
          categoria: z.string(),
          data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          resumo: z.string().optional(),
          imagem: z.string().optional(),
        })
      )
      .optional(),
    especialidades: z.array(z.string()).optional(),
    cidades: z.array(z.string()).optional(),
    online: z.boolean().default(false),
    produtos: z
      .array(z.object({ tag: z.string().optional(), titulo: z.string(), descricao: z.string(), link: z.string().optional() }))
      .optional(),
    // estilo esmeralda (ver secaoEsmeralda no topo). Sem `inicio`, a home é montada
    // com os campos genéricos (area, slogan, descricao, diferenciais, produtos...).
    // Cada item de `paginas` gera /demo/<slug>/<pagina.slug>/.
    whatsappMensagens: z.record(z.string(), z.string()).optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    navCta: ctaEsmeralda.optional(),
    inicio: z.array(secaoEsmeralda).optional(),
    paginas: z
      .array(
        z.object({
          slug: z.string().regex(/^[a-z0-9-]+$/),
          menu: z.string(),
          titulo: z.string(),
          secoes: z.array(secaoEsmeralda),
        })
      )
      .optional(),
  }),
});

export const collections = { clinicas };
