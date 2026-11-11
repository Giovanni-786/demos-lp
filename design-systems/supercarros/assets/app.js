// Menu mobile
const nav = document.querySelector('.nav');
const toggle = document.querySelector('.nav-toggle');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.querySelectorAll('.nav-links a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
  })
);

// Botão de som do vídeo do hero
const video = document.querySelector('.hero-video');
const sound = document.querySelector('.sound');
sound?.addEventListener('click', () => {
  if (!video) return;
  video.muted = !video.muted;
  sound.setAttribute('aria-pressed', String(!video.muted));
  sound.setAttribute('aria-label', video.muted ? 'Ativar som' : 'Desativar som');
});
