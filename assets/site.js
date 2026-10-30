/* Ketan Mishra — shared site behaviour (v3). Nav, mobile menu, theme, reveal, card glow, copy email. */
(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  document.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;


  // Smooth scroll (Lenis) + parallax. Both switch off for reduced motion.
  // Parallax: data-speed = extra vertical speed (negative = slower, feels deeper),
  // data-px = sideways drift, data-scale = constant scale (images inside a mask),
  // data-origin="top" = drift from the page top instead of the screen centre.
  // Offsets are measured from the parent's position, so an element never feeds back into itself.
  const pxEls = $$('[data-speed], [data-px]');
  if (!reduce) {
    const pp = $('.pp-hero .pp-title, .hp-hero .hp-title');
    if (pp) { pp.dataset.speed = '-0.12'; pxEls.push(pp); }
  }
  const small = () => innerWidth < 860;
  function parallax() {
    const vh = innerHeight, k = small() ? 0.5 : 1;
    for (const el of pxEls) {
      const r = (el.parentElement || el).getBoundingClientRect();
      if (r.bottom < -vh * 0.5 || r.top > vh * 1.5) continue;
      // data-origin="top": measured from the page top, so the element sits exactly in place at load (hero)
      const c = el.dataset.origin === 'top' ? -scrollY : r.top + r.height / 2 - vh / 2;
      const y = c * (parseFloat(el.dataset.speed) || 0) * k;
      const x = c * (parseFloat(el.dataset.px) || 0) * k;
      const s = el.dataset.scale ? ' scale(' + el.dataset.scale + ')' : '';
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)' + s;
    }
  }
  if (!reduce) {
    if (window.Lenis) {
      const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, anchors: true });
      window.__lenis = lenis;
      lenis.on('scroll', parallax);
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } else {
      let ticking = false;
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { parallax(); ticking = false; }); } }, { passive: true });
    }
    addEventListener('resize', parallax);
    parallax();
  }

  // Nav shadow on scroll
  const nav = $('.site-nav');
  if (nav) { const f = () => nav.classList.toggle('scrolled', scrollY > 20); addEventListener('scroll', f, { passive: true }); f(); }

  // Mobile menu
  const sheet = $('#sheet'), menuBtn = $('.menu-btn');
  if (sheet && menuBtn) {
    const set = open => { sheet.classList.toggle('open', open); sheet.setAttribute('aria-hidden', String(!open)); menuBtn.setAttribute('aria-expanded', String(open)); document.body.style.overflow = open ? 'hidden' : ''; if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start(); };
    menuBtn.addEventListener('click', () => set(!sheet.classList.contains('open')));
    $$('a', sheet).forEach(a => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  // Theme
  const tb = $('.theme-btn');
  if (tb) tb.addEventListener('click', () => {
    const light = document.documentElement.classList.toggle('light-mode');
    try { localStorage.setItem('km-theme', light ? 'light' : 'dark'); } catch (e) {}
  });

  // Reveal on scroll: only for things below the first screen, so nothing above the fold flickers
  if (!reduce && 'IntersectionObserver' in window) {
    const sel = '.rv, .piece, .project, .track-stat, .range-col, .samples-link, .pp-section, .pp-related-card, .wh-card, .ad-card, .hp-item, .hp-pc, .hk-card, .site-contact .contact-inner';
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    $$(sel).forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (!el.classList.contains('rv') && top < innerHeight) return;
      el.classList.add('rv');
      const sibs = el.parentElement ? Array.from(el.parentElement.children) : [];
      if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (Math.max(sibs.indexOf(el), 0) % 6) * 60 + 'ms');
      io.observe(el);
    });
  } else {
    $$('.rv').forEach(el => el.classList.add('in'));
  }

  // Cursor glow on cards
  $$('.piece, .project, .track-stat, .range-col, .samples-link, .panel, .pp-related-card, .wh-card, .ad-card, .hp-pc, .hk-card').forEach(el => {
    el.classList.add('glow');
    el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  // Copy email
  const cb = $('#copy-email'), note = $('#copy-note');
  if (cb) cb.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('ketanmishra47@gmail.com'); note.textContent = 'Copied. Talk soon.'; }
    catch (e) { note.textContent = 'ketanmishra47@gmail.com'; }
    note.classList.add('show'); setTimeout(() => note.classList.remove('show'), 2400);
  });
})();
