// Helper de imagens do estilo "primarias", compartilhado pelas páginas.
// Os caminhos passados a a()/img() precisam aparecer como literais completos em algum
// .astro da raiz do template: é lá que o prune_assets.py procura o que está em uso.

const arquivos = import.meta.glob<{ default: ImageMetadata }>('./assets/**/*.{svg,png,jpg,jpeg,webp}', { eager: true });

export const img = (path: string) => {
  const mod = arquivos[`./assets/${path}`];
  if (!mod) throw new Error(`[primarias] asset não encontrado: assets/${path}`);
  return mod.default;
};
export const a = (path: string) => img(path).src;
