# Exemplo de referência: estilo `grafite`

Segunda conversão. Origem: saída do img-to-html `future-co/`, recriação do site
de um app de personal training (marca real). Layout já responsivo (4 `@media`,
wireframes mobile e desktop), o que o torna valioso mesmo com o conteúdo errado.

## O que foi diferente do lavanda

- **Marca real no mock:** wordmark, `mark.svg` (logo) e nome da empresa nos
  textos e depoimentos. Tudo removido; o wordmark vira `clinica.nome`.
- **Fotos de pessoas reais**, recortadas da referência, inclusive embutidas nos
  fundos das seções. Todas removidas. Os `url()` saíram das declarações e ficaram
  comentados como `/* foto: ... */`; no desktop, removida a declaração com foto,
  voltou a valer o fundo em gradiente que a etapa 2 do img-to-html já tinha
  definido antes. Sobrou 1 imagem (`status-fff.svg`) de 32.
- **Seções reaproveitadas em vez de cortadas:** os 5 cards de perfil de treino
  (`.roadmap` › `.card-profile`) viraram cards de informação real: serviços em
  grupos de 3 (a altura do card no desktop comporta 3 itens), "Onde estamos",
  "Contato", "Emergência"; cada card só existe se o dado existir, até 6 (grade 3×2).
  O celular do hero virou prévia de conversa no WhatsApp (só com `whatsapp`),
  com mensagem genérica da clínica e a inicial do nome no avatar, sem nomes inventados.
- **Bloco `ajustes demos-vet` no fim do CSS:** reduz os espaços que eram das
  fotos (hero sem celular, cabeçalho do roadmap, topo do rodapé), limita o
  wordmark com ellipsis (nomes de clínica são longos) e deixa o rodapé com uma
  coluna só.

## Decisões por seção

| Seção | Decisão |
|---|---|
| `.banner` | só com `emergencia24h` |
| `.hero` › nav | sem logo; `nome` como wordmark; âncoras; botão de contato; menu hambúrguer removido (sem JS) |
| `.hero` › preço e reembolso | viram "Emergência 24 horas" e o WhatsApp, quando existem |
| `.hero` › celular | prévia de WhatsApp, só com `whatsapp` |
| `.together`, `.coach`, `.results` | removidas (fitness, nomes inventados, números e depoimentos falsos) |
| `.roadmap` | cabeçalho reescrito; bloco de membro removido; cards reaproveitados |
| `.footer` | chamada e botão só com contato; uma coluna de contato; "© {ano} {nome}" |

## Arquivo convertido

```astro
---
// Estilo "grafite" — convertido do img-to-html (future-co, layout responsivo).
// Fotos do mock removidas (pessoas reais de outra empresa); fundos neutros no lugar.
// Pastas: assets/styles.css, assets/fonts/, assets/status-fff.svg
// CSS como URL, não como import: o [slug].astro importa todos os templates, e um
// import de CSS entraria no bundle de TODAS as páginas. Com ?url, só a página que
// renderiza este template carrega o arquivo.
import cssUrl from './assets/styles.css?url';

const { clinica } = Astro.props;

const arquivos = import.meta.glob<{ default: ImageMetadata }>(
  './assets/**/*.{svg,png,jpg,jpeg,webp}',
  { eager: true }
);
const a = (path: string) => {
  const mod = arquivos[`./assets/${path}`];
  if (!mod) throw new Error(`[grafite] asset não encontrado: assets/${path}`);
  return mod.default.src;
};

// Contato: WhatsApp tem prioridade, telefone é o fallback. Sem nenhum dos dois,
// botões, prévia do WhatsApp e chamada do rodapé não renderizam.
const digitos = (s: string) => s.replace(/\D/g, '');
const whatsappHref = clinica.whatsapp ? `https://wa.me/55${digitos(clinica.whatsapp)}` : null;
const telefoneHref = clinica.telefone ? `tel:+55${digitos(clinica.telefone)}` : null;
const contatoHref = whatsappHref ?? telefoneHref;

const local = clinica.bairro ?? 'Bauru';
const inicial = clinica.nome.trim().charAt(0).toUpperCase();

// Cards de informação (roadmap). O layout comporta até 6 cards de até 3 itens.
const servicosPadrao = ['Consultas e check-up', 'Vacinação', 'Cirurgias', 'Exames'];
const servicos: string[] = clinica.servicos?.length ? clinica.servicos : servicosPadrao;

type Card = { titulo: string; itens: string[] };
const cards: Card[] = [];
for (let i = 0; i < servicos.length; i += 3) {
  cards.push({ titulo: i === 0 ? 'Serviços' : 'Também oferecemos', itens: servicos.slice(i, i + 3) });
}
if (clinica.bairro) cards.push({ titulo: 'Onde estamos', itens: [clinica.bairro] });
const contatos = [
  clinica.whatsapp && `WhatsApp ${clinica.whatsapp}`,
  clinica.telefone && `Telefone ${clinica.telefone}`,
].filter((x): x is string => Boolean(x));
if (contatos.length) cards.push({ titulo: 'Contato', itens: contatos });
if (clinica.emergencia24h) cards.push({ titulo: 'Emergência', itens: ['Atendimento 24 horas'] });
const cardsVisiveis = cards.slice(0, 6);

const ano = new Date().getFullYear();
---
<link rel="stylesheet" href={cssUrl} />
<div class="demo-grafite">

  {clinica.emergencia24h && (
    <div class="banner">
      <a class="lnk banner__lnk" href={contatoHref ?? '#servicos'}>Atendimento de emergência 24 horas</a>
    </div>
  )}

  <header class="hero" id="inicio">
    <nav class="nav">
      <span class="nav__logo">{clinica.nome}</span>
      <div class="nav__right">
        <a class="lnk nav__lnk" href="#servicos">Serviços</a>
        {contatoHref && <a class="lnk nav__lnk" href="#contato">Contato</a>}
        {contatoHref && <a class="btn btn--nav" href={contatoHref}>Agendar consulta</a>}
      </div>
    </nav>

    <h1 class="h1 hero__title">Cuidado veterinário<br class="br-m" /> perto de você</h1>
    <p class="t1 hero__lead">Atendimento veterinário em {local}, com atenção e carinho para o seu pet.</p>
    {contatoHref && <a class="btn" href={contatoHref}>Agendar consulta</a>}
    {clinica.emergencia24h && <p class="t2 hero__price">Emergência 24 horas</p>}
    {clinica.whatsapp && <p class="t3 hero__refund">WhatsApp {clinica.whatsapp}</p>}

    {whatsappHref && (
      <div class="phone phone--hero" aria-hidden="true">
        <div class="phone__screen phone__screen--dark">
          <div class="phone__status"><span>9:41</span><img class="ico ico--status" src={a('status-fff.svg')} alt="" /></div>
          <p class="h3 phone__greeting">{clinica.nome}</p>
          <p class="t3 phone__day">WhatsApp</p>
          <div class="phone__card">
            <div class="img img--workout"></div>
            <div class="phone__msg">
              <span class="av av--coach">{inicial}</span>
              <p class="t3 phone__msg-text">Olá! Como podemos ajudar seu pet hoje?</p>
            </div>
          </div>
        </div>
      </div>
    )}
  </header>

  <main>
    <section class="roadmap" id="servicos">
      <div class="roadmap__head">
        <h2 class="h2 roadmap__title">Como cuidamos do seu pet</h2>
        <p class="t2 roadmap__lead">Conheça os serviços da {clinica.nome}{contatoHref ? ' e fale com a gente para agendar.' : '.'}</p>
        {contatoHref && <a class="btn btn--left" href={contatoHref}>Agendar consulta</a>}
      </div>
      <div class="roadmap__cards">
        {cardsVisiveis.map((card) => (
          <article class="card-profile">
            <h3 class="h3">{card.titulo}</h3>
            <ul class="card-profile__list">
              {card.itens.map((item) => <li>+ {item}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </section>
  </main>

  <footer class="footer" id="contato">
    {contatoHref && (
      <>
        <h2 class="h2">Agende uma visita</h2>
        <a class="btn" href={contatoHref}>{whatsappHref ? 'Chamar no WhatsApp' : 'Ligar agora'}</a>
      </>
    )}
    {(contatos.length > 0 || clinica.bairro) && (
      <div class="footer__cols">
        <div class="footer-col">
          <h3 class="h3">{clinica.nome}</h3>
          {whatsappHref && <a class="lnk" href={whatsappHref}>WhatsApp {clinica.whatsapp}</a>}
          {telefoneHref && <a class="lnk" href={telefoneHref}>Telefone {clinica.telefone}</a>}
          {clinica.bairro && <span class="lnk">{clinica.bairro}</span>}
        </div>
      </div>
    )}
    <div class="footer__legal">
      <p class="t3">© {ano} {clinica.nome}</p>
    </div>
  </footer>

</div>
```

## Bloco de ajustes no fim do styles.css

```css
/*    ajustes demos-vet (estilo grafite, versão sem fotos)
   Os espaços que eram das fotos foram reduzidos. Ao colocar fotos de novo,
   descomente as linhas "foto:" acima e revise os paddings abaixo.
   ===================================================================== */
.nav__logo{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70vw}
.av--coach{display:grid;place-items:center;font-weight:600;font-size:18px;color:#fff;background:#3a3a3a}
.footer__cols{grid-template-columns:1fr}
.footer-col .lnk{overflow-wrap:anywhere}
@media (max-width:1023px){
  .roadmap__head{height:auto;padding-bottom:28px}
  .roadmap__cards .card-profile{height:auto;min-height:calc(150 * var(--u))}
  .footer{min-height:0;padding-top:96px}
}
@media (min-width:1024px){
  .nav__logo{max-width:36vw}
  .hero:not(:has(.phone)){height:auto;padding-bottom:140px}
  .roadmap__cards{left:62px}
  .footer{min-height:0;padding-top:140px}
}
```
