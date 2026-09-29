const paleta = ['#2f7d5b', '#1f6f8b', '#d9822b', '#6b5b95', '#c0504d'];
export function corDoSlug(slug: string) {
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return paleta[h % paleta.length];
}
