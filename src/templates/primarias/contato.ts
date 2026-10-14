// Links de contato derivados do JSON, compartilhados pela home e pelo blog.
// WhatsApp tem prioridade; sem ele, o CTA vira "Agende uma visita" pelo telefone.

type Clinica = {
  whatsapp?: string;
  whatsappMensagem?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  bairro?: string;
  instagram?: string;
  tiktok?: string;
};

export const arroba = (s: string) => s.replace(/^@/, '');
const digitos = (s: string) => s.replace(/\D/g, '');

export function montarContato(c: Clinica) {
  const whatsappHref = c.whatsapp
    ? `https://wa.me/55${digitos(c.whatsapp)}${c.whatsappMensagem ? `?text=${encodeURIComponent(c.whatsappMensagem)}` : ''}`
    : null;
  const telefoneHref = c.telefone ? `tel:+55${digitos(c.telefone)}` : null;
  const emailHref = c.email ? `mailto:${c.email}` : null;
  const endereco = c.endereco ?? c.bairro;
  const mapaHref = c.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.endereco)}`
    : null;
  const instagramHref = c.instagram ? `https://instagram.com/${arroba(c.instagram)}` : null;
  const tiktokHref = c.tiktok ? `https://www.tiktok.com/@${arroba(c.tiktok)}` : null;
  const temContato = Boolean(whatsappHref || telefoneHref || emailHref || endereco);
  const cta = whatsappHref
    ? { href: whatsappHref, texto: 'WhatsApp', cor: 'green' as const }
    : telefoneHref
      ? { href: telefoneHref, texto: 'Agende uma visita', cor: 'red' as const }
      : null;

  return { whatsappHref, telefoneHref, emailHref, endereco, mapaHref, instagramHref, tiktokHref, temContato, cta };
}
