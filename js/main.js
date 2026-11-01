/* ==========================================================
   ELORA CLINIC — interações e animações
   ========================================================== */

// ---- Dados de contato (altere aqui) ----
const WHATSAPP = '5533999360863';
const DEFAULT_MSG = 'Olá! Vim pelo site da Elora Clinic e gostaria de agendar uma avaliação.';
const MAPS_QUERY = 'ELORA CLINIC by Dra. Karyne Oliveira, Av. José Ivair F. Mattos, 137 - Santo Agostinho, Governador Valadares - MG';

const waLink = (msg) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg || DEFAULT_MSG)}`;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- Links do WhatsApp e do mapa ----
// data-wa            → mensagem padrão
// data-wa="implantes" → "gostaria de saber mais sobre implantes"
// data-wa-msg="..."   → mensagem completa personalizada
document.querySelectorAll('[data-wa], [data-wa-msg]').forEach((el) => {
  const topic = el.getAttribute('data-wa');
  const custom = el.getAttribute('data-wa-msg');
  const msg = custom || (topic ? `Olá! Vim pelo site da Elora Clinic e gostaria de saber mais sobre ${topic}.` : DEFAULT_MSG);
  el.href = waLink(msg);
  el.target = '_blank';
  el.rel = 'noopener noreferrer';
});
document.querySelectorAll('[data-maps]').forEach((el) => {
  el.href = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAPS_QUERY)}`;
});
document.getElementById('year').textContent = new Date().getFullYear();

// ---- Header: muda ao rolar + menu mobile ----
const header = document.getElementById('header');
const menuBtn = document.getElementById('menuBtn');
const mobileBar = document.getElementById('mobileBar');
function onScroll() {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 24);
  mobileBar.classList.toggle('show', y > 500);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
menuBtn.addEventListener('click', () => {
  const open = header.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
document.querySelectorAll('.mobile-nav a').forEach((a) =>
  a.addEventListener('click', () => { header.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); })
);

// ---- Títulos: revelação palavra por palavra com desfoque ----
document.querySelectorAll('.split').forEach((el) => {
  const base = parseFloat(el.dataset.delay || 0);
  const words = el.textContent.trim().split(/\s+/);
  el.setAttribute('aria-label', el.textContent.trim());
  el.innerHTML = words
    .map((w, i) => `<span class="w" aria-hidden="true" style="transition-delay:${(base + i * 0.06).toFixed(2)}s">${w}&nbsp;</span>`)
    .join('');
});

// ---- Entrada ao rolar (reveal, títulos e contadores) ----
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-count]').forEach(runCounter);
      if (e.target.matches('[data-count]')) runCounter(e.target);
      io.unobserve(e.target);
    });
  },
  { threshold: 0.2, rootMargin: '0px 0px -40px 0px' }
);
document.querySelectorAll('.reveal, .split').forEach((el) => io.observe(el));

// ---- Contador animado ----
function runCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const to = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.decimals || 0, 10);
  const fmt = (v) => v.toFixed(dec).replace('.', ',');
  if (reduceMotion) { el.textContent = fmt(to); return; }
  const start = performance.now();
  const dur = 1600;
  (function tick(now) {
    const t = Math.min(1, (now - start) / dur);
    const eased = 1 - Math.pow(1 - t, 4);
    el.textContent = fmt(to * eased);
    if (t < 1) requestAnimationFrame(tick);
  })(start);
}

// ---- Parallax suave nas fotos ----
const parallax = [...document.querySelectorAll('[data-parallax]')];
if (!reduceMotion && parallax.length) {
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    parallax.forEach((el) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = parseFloat(el.dataset.parallax);
      const offset = el.hasAttribute('data-center') ? r.top + r.height / 2 - vh / 2 : -r.top;
      const scale = el.dataset.scale ? ` scale(${el.dataset.scale})` : '';
      el.style.transform = `translate3d(0, ${(offset * -speed).toFixed(1)}px, 0)${scale}`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

// ---- Cards com inclinação 3D + brilho seguindo o mouse ----
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

// ---- Faixa de frases (duplica o conteúdo para rolar sem emendas) ----
const track = document.getElementById('marquee');
if (track) track.innerHTML = track.innerHTML.repeat(4);

// ---- FAQ (sanfona) ----
document.querySelectorAll('.faq-item').forEach((item) => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach((o) => {
      o.classList.remove('open');
      o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('open');
      item.querySelector('.faq-q').setAttribute('aria-expanded', 'true');
    }
  });
});

// ---- Política de privacidade ----
const modal = document.getElementById('privacy');
const openModal = () => { modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); };
const closeModal = () => { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); };
document.getElementById('openPrivacy').addEventListener('click', openModal);
document.getElementById('closePrivacy').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ---- Resultados (antes e depois): mostra a seção só se houver casos ----
const results = document.getElementById('resultados');
if (results && results.querySelector('.case')) results.hidden = false;
document.querySelectorAll('.compare').forEach((box) => {
  const range = box.querySelector('input');
  const before = box.querySelector('.before');
  const divider = box.querySelector('.divider');
  range.addEventListener('input', () => {
    before.style.clipPath = `inset(0 ${100 - range.value}% 0 0)`;
    divider.style.left = `${range.value}%`;
  });
});
