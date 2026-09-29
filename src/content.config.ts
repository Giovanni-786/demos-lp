import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const clinicas = defineCollection({
  loader: glob({
    base: './src/content/clinicas',
    pattern: import.meta.env.DEV ? '*.json' : '[^_]*.json',
  }),
  schema: z.object({
    nome: z.string(),
    estilo: z.enum(['lavanda', 'grafite']),
    bairro: z.string().optional(),
    whatsapp: z.string().optional(),
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
    especialidades: z.array(z.string()).optional(),
    cidades: z.array(z.string()).optional(),
    online: z.boolean().default(false),
    produtos: z
      .array(z.object({ tag: z.string().optional(), titulo: z.string(), descricao: z.string(), link: z.string().optional() }))
      .optional(),
  }),
});

export const collections = { clinicas };
