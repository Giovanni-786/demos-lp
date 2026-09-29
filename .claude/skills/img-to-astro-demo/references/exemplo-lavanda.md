# Exemplo de referência: estilo `lavanda`

Primeira conversão feita à mão, validada com build real. Origem: saída do
img-to-html `pawprints-veterinary/` (mock desktop de clínica vet, paleta roxa).

## Decisões por seção

| Seção do HTML original | Decisão | Motivo |
|---|---|---|
| `header.nav` | mantida | nome da clínica + links internos (#inicio, #servicos, #contato); botão de contato só se houver whatsapp/telefone |
| `.nav__links` com "Blog", "About", dropdown | reduzida a 3 âncoras | links para páginas que não existem na demo |
| `.btn2` "Get Started" | removida | CTA duplicado sem destino |
| `section.hero` | mantida | chip com bairro e selo 24h; h1 reescrito em PT-BR; botão de agendar = contato |
| `.social` (LinkedIn, Instagram, X) | removida | links falsos; o schema não tem redes sociais |
| `section.logos` | removida | logos de parceiros inventados |
| `section.services` | mantida | cards vindos de `servicos` (fallback: lista padrão) + card extra se `emergencia24h` |
| cards `.svc--cut` (só ícone) | removidos | artefato do recorte do mock |
| `section.integrations` | removida | "30+ integrações" não é dado da clínica |
| `section.team` | removida | nomes de veterinários inventados |
| `section.cta` | mantida | vira "Chamar no WhatsApp" ou "Ligar agora"; some sem contato |
| `section.stats` | removida | números falsos ("$100M Capital Value") |
| `section.testimonial` | removida | depoimento inventado atribuído à clínica |

O CSS entra por `?url` + `<link>` (ver SKILL.md). O CSS das seções removidas fica no `styles.css` (classes sem uso não fazem mal);
as imagens delas são apagadas pelo `prune_assets.py`.

## Arquivo convertido

```astro
---
// Estilo "lavanda" — convertido do img-to-html (PawPrints Veterinary).
// Estrutura esperada nesta pasta (saída da skill, sem mudar nada dentro de assets/):
//   Lavanda.astro
//   assets/styles.css, assets/fonts/, assets/cta-globe.svg, assets/icons/, assets/photo-*.svg
// CSS como URL, não como import: o [slug].astro importa todos os templates, e um
// import de CSS entraria no bundle de TODAS as páginas. Com ?url, só a página que
// renderiza este template carrega o arquivo.
import cssUrl from './assets/styles.css?url';

const { clinica } = Astro.props;

// Todos os assets passam pelo Vite. Um path errado quebra o build em vez de gerar imagem quebrada.
const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  './assets/**/*.{svg,png,jpg,jpeg,webp}',
  { eager: true }
);
const a = (path: string) => {
  const mod = arquivos[`./assets/${path}`];
  if (!mod) throw new Error(`[lavanda] asset não encontrado: assets/${path}`);
  return mod.default.src;
};

// Contato: WhatsApp tem prioridade, telefone é o fallback. Os dois são opcionais no schema,
// então sem nenhum deles os botões e o CTA simplesmente não renderizam.
const digitos = (s: string) => s.replace(/\D/g, '');
const contatoHref = clinica.whatsapp
  ? `https://wa.me/55${digitos(clinica.whatsapp)}`
  : clinica.telefone
    ? `tel:+55${digitos(clinica.telefone)}`
    : null;

const local = clinica.bairro ?? 'Bauru';

const servicosPadrao = ['Consultas e check-up', 'Vacinação', 'Cirurgias', 'Exames'];
const servicos = clinica.servicos?.length ? clinica.servicos : servicosPadrao;
// Caminhos completos, nunca montados dinamicamente: o prune_assets.py precisa enxergá-los como literais.
const icones = ['icons/paw.svg', 'icons/syringe.svg', 'icons/medkit.svg', 'icons/tooth.svg'];
---
<link rel="stylesheet" href={cssUrl} />
<div class="page">

  <!-- nav -->
  <header class="nav">
    <a class="brand" href="#">
      <img class="ico" src={a('icons/paw.svg')} alt="" />
      <span class="brand__name">{clinica.nome}</span>
    </a>
    <nav class="nav__links">
      <a class="lnk" href="#inicio">Início</a>
      <a class="lnk" href="#servicos">Serviços</a>
      <a class="lnk" href="#contato">Contato</a>
    </nav>
    {contatoHref && (
      <div class="nav__actions">
        <a class="btn" href={contatoHref}>
          Fale conosco
          <span class="btn__orb"><img class="ico ico--xs" src={a('icons/arrow-right.svg')} alt="" /></span>
        </a>
      </div>
    )}
  </header>

  <!-- hero -->
  <section class="hero" id="inicio">
    <div class="hero__rings" aria-hidden="true"></div>
    <div class="hero__content">
      <p class="chip">
        {clinica.emergencia24h && <span class="chip__tag">24h</span>}
        Atendimento veterinário em {local}
      </p>
      <h1 class="h1">Cuidado veterinário<br />com carinho para<br />quem é da família.</h1>
      <p class="t2 hero__lead">{clinica.nome} · {local}</p>
      {contatoHref && (
        <a class="btn3" href={contatoHref}>
          <span class="btn3__orb"><img class="ico ico--xs" src={a('icons/paw-white.svg')} alt="" /></span>
          Agendar consulta
        </a>
      )}
    </div>
    <span class="hero__orb"><img class="ico" src={a('icons/chat.svg')} alt="" /></span>
    <img class="hero__photo" src={a('photo-hero-vet.svg')} alt="" />
  </section>

  <!-- serviços -->
  <section class="services" id="servicos">
    <p class="eyebrow">
      <span class="eyebrow__pill"><img class="ico ico--xxs" src={a('icons/paw.svg')} alt="" />Serviços</span>
    </p>
    <h2 class="h2">Como cuidamos<br />do seu pet</h2>
    <div class="services__grid">
      {servicos.map((nome, i) => (
        <article class="svc">
          <span class="svc__ico"><img class="ico" src={a(icones[i % icones.length])} alt="" /></span>
          <h4 class="h4">{nome}</h4>
        </article>
      ))}
      {clinica.emergencia24h && (
        <article class="svc">
          <span class="svc__ico"><img class="ico" src={a('icons/medkit.svg')} alt="" /></span>
          <h4 class="h4">Emergência 24h</h4>
          <p class="t3">Atendimento a qualquer hora, todos os dias.</p>
        </article>
      )}
    </div>
  </section>

  <!-- cta -->
  {contatoHref && (
    <section class="cta" id="contato">
      <h3 class="h3 cta__title">Seu pet merece esse<br />cuidado. Vamos conversar?</h3>
      <a class="btn4" href={contatoHref}>
        {clinica.whatsapp ? 'Chamar no WhatsApp' : 'Ligar agora'}
        <span class="btn4__orb"><img class="ico ico--xs" src={a('icons/arrow-right-white.svg')} alt="" /></span>
      </a>
    </section>
  )}

</div>
```
