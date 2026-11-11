// Mapa de rotas das demos: qual JSON gera qual página.
// Só para consulta: as rotas de verdade saem de src/content/clinicas/*.json
// (o nome do arquivo é o slug). Ao criar, renomear ou apagar um JSON, atualize aqui.
//
// - Arquivos com "_" no início são rascunhos: aparecem só no `npm run dev`.
// - Subpáginas do estilo primarias só existem quando o JSON tem o campo:
//   /blog/ precisa de `posts` e /concurso-de-bolsas/ precisa de `concurso`.

export const ROTAS = [
  {
    arquivo: 'src/content/clinicas/ads-assessoria-juridica.json',
    estilo: 'dourado',
    rotas: ['/demo/ads-assessoria-juridica/'],
  },
  {
    arquivo: 'src/content/clinicas/clinica-sao-francisco.json',
    estilo: 'lavanda',
    rotas: ['/demo/clinica-sao-francisco/'],
  },
  {
    arquivo: 'src/content/clinicas/colegio-gbi.json',
    estilo: 'primarias',
    rotas: ['/demo/colegio-gbi/', '/demo/colegio-gbi/blog/', '/demo/colegio-gbi/concurso-de-bolsas/'],
  },
  {
    arquivo: 'src/content/clinicas/exemplo-grafite.json',
    estilo: 'grafite',
    rotas: ['/demo/exemplo-grafite/'],
  },
  {
    arquivo: 'src/content/clinicas/_pet-care.json',
    estilo: 'lavanda',
    rotas: ['/demo/_pet-care/'], // rascunho: só no dev
  },
] as const;
