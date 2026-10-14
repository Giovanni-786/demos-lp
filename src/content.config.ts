import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const clinicas = defineCollection({
  loader: glob({
    base: './src/content/clinicas',
    pattern: import.meta.env.DEV ? '*.json' : '[^_]*.json',
  }),
  schema: z.object({
    nome: z.string(),
    estilo: z.enum(['lavanda', 'grafite', 'cobre', 'primarias']),
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
    // registro profissional (estilo cobre: advocacia), ex. "OAB/SP 123.456"
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
  }),
});

export const collections = { clinicas };
