/* Sugar Blue Café — interactions & animations */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesk = () => innerWidth >= 960;
  const gap = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gap')) || 10;

  gsap.registerPlugin(ScrollTrigger, SplitText);

  /* ---------- scroll fluide ---------- */
  try { history.scrollRestoration = 'manual'; } catch (e) {}
  const deep = location.hash && location.hash.length > 1 && $(location.hash);
  if (!deep) scrollTo(0, 0);

  const lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  /* ---------- statut ouvert / fermé (heure de Paris) ---------- */
  (() => {
    const p = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    const map = { 'lun.': 1, 'mar.': 2, 'mer.': 3, 'jeu.': 4, 'ven.': 5, 'sam.': 6, 'dim.': 0 };
    const day = map[p.find(x => x.type === 'weekday').value] ?? new Date().getDay();
    const t = +p.find(x => x.type === 'hour').value + +p.find(x => x.type === 'minute').value / 60;
    const st = $('#status'), txt = st.querySelector('span'), wk = day >= 1 && day <= 5;
    if (wk && t >= 9 && t < 17) txt.textContent = t >= 16.5 ? 'Ferme bientôt' : 'Ouvert · 17h';
    else { st.classList.add('is-closed'); txt.textContent = (wk && t < 9) ? 'Ouvre à 9h' : (day === 5 || day === 6 || day === 0) ? 'Fermé · lundi 9h' : 'Fermé · demain 9h'; }
    const today = $(`#hours [data-d="${day}"]`); if (today) today.classList.add('is-today');
    $('#yr').textContent = new Date().getFullYear();
  })();

  /* ---------- préparation des textes ---------- */
  const heroS = $('.hero .lk-s'), heroB = SplitText.create('.hero .lk-b', { type: 'chars', mask: 'chars' });
  const ftrS = $('.ftr .lk-s'), ftrB = SplitText.create('.ftr .lk-b', { type: 'chars', charsClass: 'char' });
  gsap.set([heroS, ftrS], { clipPath: 'inset(-20% 100% -30% -6%)' });
  gsap.set(heroB.chars, { yPercent: 110 });
  gsap.set('.h-fade', { y: 26, opacity: 0 });
  gsap.set('.orb', { scale: .78, rotation: -40, opacity: 0 });
  gsap.set('.orb-photo', { clipPath: 'circle(0% at 50% 50%)' });
  gsap.set('.float', { scale: 0 });
  // ordinateur : BLUE géant
  const hdOut = SplitText.create('.hd-out', { type: 'chars', mask: 'chars' });
  gsap.set(hdOut.chars, { yPercent: 105 });
  gsap.set('.hd-sugar', { clipPath: 'inset(-30% 104% -40% -10%)' });
  gsap.set('.hd-in', { y: 26, opacity: 0 });
  gsap.set('.hd-echo', { x: '-.034em', y: '-.034em', opacity: 0 });

  function heroIn() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(heroS, { clipPath: 'inset(-20% -6% -30% -6%)', duration: 1.3, ease: 'power3.inOut' }, 0)
      .to(heroB.chars, { yPercent: 0, duration: 1.1, stagger: .07 }, .35)
      .to('.orb', { scale: 1, rotation: 0, opacity: 1, duration: 1.6 }, .1)
      .to('.orb-photo', { clipPath: 'circle(70% at 50% 50%)', duration: 1.6, ease: 'power3.inOut' }, .2)
      .to('.float', { scale: 1, duration: 1.1, ease: 'back.out(1.6)', stagger: .12 }, .9)
      .to(hdOut.chars, { yPercent: 0, duration: 1.2, stagger: .09 }, .05)
      .to('.hd-fill.is-on', { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'power3.inOut' }, .75)
      .to('.hd-echo', { x: 0, y: 0, opacity: .85, duration: 1.4, ease: 'expo.out' }, 1.15)
      .to('.hd-sugar', { clipPath: 'inset(-30% -10% -40% -10%)', duration: 1.25, ease: 'power2.inOut' }, 1.35)
      .to('.hd-in', { y: 0, opacity: 1, duration: 1.1, stagger: .08 }, 1.6)
      .call(() => document.dispatchEvent(new Event('hero:ready')), null, 2.3)
      .to('.h-fade', { y: 0, opacity: 1, duration: 1.1, stagger: .08 }, .6);
    return tl;
  }

  /* ---------- arrivée sur la page : le hero s'anime directement ---------- */
  const introDone = true;
  lenis.start();
  requestAnimationFrame(() => {
    gsap.delayedCall(.15, heroIn);
    ScrollTrigger.refresh();
    if (deep) lenis.scrollTo(deep, { offset: -gap(), immediate: true });
  });

  /* =========================================================
     HEADER, MENU, DOCK, ANCRES
     ========================================================= */
  const hdr = $('#hdr'), dock = $('#dock'), hero = $('#hero');
  lenis.on('scroll', ({ scroll, direction }) => {
    const hh = hero.offsetHeight;
    hdr.classList.toggle('is-solid', scroll > hh - 90);
    hdr.classList.toggle('is-hidden', direction === 1 && scroll > hh && !body.classList.contains('menu-open'));
    const nearEnd = scroll + innerHeight > document.documentElement.scrollHeight - 220;
    dock.classList.toggle('is-on', scroll > hh * .55 && !nearEnd);
  });

  const burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', !open);
    open ? lenis.stop() : lenis.start();
  }
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false); });

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = id === '#top' ? 0 : $(id);
    if (el === null) return;
    e.preventDefault();
    const wasOpen = body.classList.contains('menu-open');
    if (wasOpen) setMenu(false);
    setTimeout(() => lenis.scrollTo(el, { offset: -gap(), duration: 1.6 }), wasOpen ? 450 : 0);
  }));

  /* =========================================================
     RÉVÉLATIONS AU SCROLL
     ========================================================= */
  // titres & paragraphes : lignes qui montent derrière un masque
  $$('[data-split-lines]').forEach(el => {
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true,
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: .09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      }
    });
  });

  gsap.set('[data-reveal]', { y: 34, opacity: 0 });
  ScrollTrigger.batch('[data-reveal]', {
    start: 'top 90%', once: true,
    onEnter: els => gsap.to(els, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .09 })
  });

  // les panneaux arrivent comme des cartes posées sur la table
  if (!reduce) $$('.story,.carte,.counter,.reviews,.infos,.ftr').forEach(p => {
    gsap.fromTo(p, { scale: .93, borderRadius: 64 }, {
      scale: 1, borderRadius: getComputedStyle(p).borderRadius, ease: 'none', transformOrigin: '50% 0%',
      scrollTrigger: { trigger: p, start: 'top bottom', end: 'top 40%', scrub: true }
    });
  });

  // hero : profondeur au scroll
  if (!reduce) {
    gsap.to('.lockup', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .6 } });
    const mm = gsap.matchMedia();
    // mobile : le cercle latte & brioche
    mm.add('(max-width: 959px)', () => {
      const art = { trigger: '.hero-art--orb', start: 'top bottom', end: 'bottom top', scrub: .6 };
      gsap.fromTo('.orb-text', { rotation: -20 }, { rotation: 35, ease: 'none', scrollTrigger: art });
      $$('.float').forEach(f => gsap.fromTo(f, { y: () => f.dataset.depth * 160 }, { y: () => f.dataset.depth * -160, ease: 'none', scrollTrigger: art }));
      gsap.fromTo('.orb-photo img', { yPercent: 4 }, { yPercent: -10, ease: 'none', scrollTrigger: art });
    });
    // ordinateur : les photos du café défilent à travers les lettres
    mm.add('(min-width: 960px)', () => {
      const word = $('.hd-word'), fills = $$('.hd-fill'), dots = $$('.hd-dots i'), capT = $('.hd-cap-t');
      const NAMES = ['la façade bleue', 'latte & brioche', 'le carrot cake', 'la salade de saison'];
      let cur = 0, timer = null, live = true;
      // au scroll : le mot rétrécit un peu, Sugar se redresse (la photo reste fixe)
      const sc = { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 };
      gsap.fromTo(word, { scale: 1 }, { scale: .94, transformOrigin: '50% 100%', ease: 'none', scrollTrigger: sc });
      gsap.fromTo('.hd-sugar', { rotation: -8, y: 0 }, { rotation: -2, y: -40, ease: 'none', scrollTrigger: sc });
      // une nouvelle photo remonte dans les lettres toutes les 4 s
      function next() {
        if (!live || document.hidden) return schedule();
        const prev = fills[cur]; cur = (cur + 1) % fills.length; const n = fills[cur];
        fills.forEach(f => f.style.zIndex = f === n ? 2 : (f === prev ? 1 : 0));
        gsap.fromTo(n, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power3.inOut',
          onComplete: () => fills.forEach(f => { if (f !== n) gsap.set(f, { clipPath: 'inset(100% 0 0 0)' }); }) });
        dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
        gsap.to(capT, { y: -12, opacity: 0, duration: .3, ease: 'power2.in', onComplete: () => {
          capT.textContent = NAMES[cur]; gsap.fromTo(capT, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: 'expo.out' }); } });
        schedule();
      }
      function schedule() { timer = gsap.delayedCall(4, next); }
      const st = ScrollTrigger.create({ trigger: hero, start: 'top top', end: 'bottom top', onToggle: self => live = self.isActive });
      live = st.isActive || scrollY < hero.offsetHeight;
      const start = () => { if (!reduce && !timer) schedule(); };
      document.addEventListener('hero:ready', start, { once: true });
      return () => { timer && timer.kill(); };
    });
  }

  // polaroid qui se redresse
  if (!reduce) {
    gsap.fromTo('#polaroid', { rotation: -9, y: 60 }, { rotation: 3, y: -30, ease: 'none', scrollTrigger: { trigger: '#polaroid', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('#polaroid img', { scale: 1, ease: 'none', scrollTrigger: { trigger: '#polaroid', start: 'top bottom', end: 'bottom 30%', scrub: true } });
  }

  // compteurs
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, from = +el.dataset.from, o = { v: from };
    el.textContent = from;
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () =>
      gsap.to(o, { v: to, duration: 1.8, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) }) });
  });

  // note géante
  gsap.set('.score-n span', { yPercent: 100, opacity: 0 });
  ScrollTrigger.create({ trigger: '.score-n', start: 'top 85%', once: true, onEnter: () =>
    gsap.to('.score-n span', { yPercent: 0, opacity: 1, duration: 1.2, ease: 'expo.out', stagger: .12 }) });

  // pied de page : le logo se reconstruit au fil du scroll
  (() => {
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tl.to('.ftr-ring circle', { strokeDashoffset: 0, duration: 1.2, stagger: .15, ease: 'power1.inOut' }, 0)
      .to(ftrS, { clipPath: 'inset(-20% -6% -30% -6%)', duration: 1, ease: 'power2.inOut' }, .25)
      .fromTo(ftrB.chars, { yPercent: 120, rotation: (i) => [-14, 9, -8, 12][i % 4], opacity: 0 }, { yPercent: 0, rotation: 0, opacity: 1, duration: .6, stagger: .12, ease: 'back.out(2)' }, .7)
      .fromTo('.ftr-base', { letterSpacing: '.9em', opacity: 0 }, { letterSpacing: '.3em', opacity: 1, duration: .7, ease: 'power3.out' }, 1.1)
      .fromTo('.ftr-tag', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: .5 }, 1.4);
    ScrollTrigger.create({ trigger: '#ftrStage', start: 'top 92%', end: 'bottom 75%', animation: tl, scrub: reduce ? false : .8, toggleActions: 'play none none none' });
    $('#totop').addEventListener('click', () => lenis.scrollTo(0, { duration: 2.2 }));
  })();

  /* =========================================================
     LA CARTE — onglets
     ========================================================= */
  (() => {
    const tabs = $$('.tab'), pill = $('#pill');
    const place = t => gsap.set(pill, { width: t.offsetWidth, x: t.offsetLeft });
    tabs.forEach(t => t.addEventListener('click', () => {
      if (t.getAttribute('aria-selected') === 'true') return;
      tabs.forEach(x => x.setAttribute('aria-selected', x === t));
      place(t);
      const pane = $('#' + t.getAttribute('aria-controls'));
      $$('.pane').forEach(p => { p.hidden = p !== pane; p.classList.toggle('is-on', p === pane); });
      gsap.fromTo(pane.children, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .025 });
      ScrollTrigger.refresh();
    }));
    const fix = () => place($('.tab[aria-selected="true"]'));
    fix(); document.fonts && document.fonts.ready.then(fix); addEventListener('resize', fix);
  })();

  /* =========================================================
     COMPTOIR — pile de polaroids à faire glisser
     ========================================================= */
  (() => {
    const deck = $('#deck'), cards = $$('.card', deck), N = cards.length;
    const ROT = [-3, 4, -6, 2.5, -2, 5, -4.5, 3];
    let order = cards.map((_, i) => i);          // order[0] = carte du dessus
    const num = $('#dNum'); $('#dTot').textContent = String(N).padStart(2, '0');

    function layout(animate = true, skip = -1) {
      order.forEach((ci, pos) => {
        const c = cards[ci];
        c.style.zIndex = N - pos;
        if (ci === skip) return;
        const vis = pos < 4;
        const v = { x: 0, y: pos * 10, rotation: ROT[ci], scale: 1 - pos * .04, opacity: vis ? 1 : 0 };
        animate ? gsap.to(c, { ...v, duration: .7, ease: 'expo.out' }) : gsap.set(c, v);
      });
      num.textContent = String(order[0] + 1).padStart(2, '0');
    }
    function throwTop(dir) {
      const ci = order[0], c = cards[ci];
      order.push(order.shift());
      gsap.to(c, { x: dir * innerWidth * .85, y: '-=40', rotation: ROT[ci] + dir * 26, duration: .5, ease: 'power2.in',
        onComplete: () => { c.style.zIndex = 0; gsap.to(c, { x: 0, y: (N - 1) * 10, rotation: ROT[ci], scale: .88, opacity: 0, duration: .55, ease: 'expo.out', onComplete: () => layout(true) }); } });
      layout(true, ci);
    }
    function back() {
      const ci = order.pop(); order.unshift(ci);
      const c = cards[ci];
      c.style.zIndex = N + 1;
      gsap.fromTo(c, { x: -innerWidth * .85, y: -40, rotation: ROT[ci] - 26, opacity: 1, scale: 1 }, { x: 0, y: 0, rotation: ROT[ci], duration: .7, ease: 'expo.out' });
      layout(true, ci);
    }
    $('#dNext').addEventListener('click', () => throwTop(1));
    $('#dPrev').addEventListener('click', back);

    // glisser
    let drag = null;
    deck.addEventListener('pointerdown', e => {
      const c = e.target.closest('.card'); if (!c || c !== cards[order[0]]) return;
      drag = { c, x0: e.clientX, y0: e.clientY, t0: performance.now(), dx: 0, dy: 0, ci: order[0], moved: false };
      c.setPointerCapture(e.pointerId);
      gsap.killTweensOf(c);
    });
    deck.addEventListener('pointermove', e => {
      if (!drag) return;
      drag.dx = e.clientX - drag.x0; drag.dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(drag.dy) > Math.abs(drag.dx) && Math.abs(drag.dy) > 8) { drag = null; layout(true); return; }
      drag.moved = true;
      gsap.set(drag.c, { x: drag.dx, y: drag.dy * .25, rotation: ROT[drag.ci] + drag.dx * .07 });
    });
    const end = () => {
      if (!drag) return;
      const v = Math.abs(drag.dx) / Math.max(1, performance.now() - drag.t0);
      if (Math.abs(drag.dx) > 90 || (v > .6 && Math.abs(drag.dx) > 30)) throwTop(Math.sign(drag.dx));
      else gsap.to(drag.c, { x: 0, y: 0, rotation: ROT[drag.ci], duration: .8, ease: 'elastic.out(1,.5)' });
      drag = null;
    };
    deck.addEventListener('pointerup', end); deck.addEventListener('pointercancel', end);

    // entrée : la pile se pose
    layout(false);
    gsap.set(cards, { y: 160, opacity: 0, rotation: (i) => ROT[i] * 3 });
    ScrollTrigger.create({ trigger: deck, start: 'top 85%', once: true, onEnter: () => {
      order.slice().reverse().forEach((ci, k) => {
        const pos = order.indexOf(ci);
        gsap.to(cards[ci], { y: pos * 10, opacity: pos < 4 ? 1 : 0, rotation: ROT[ci], scale: 1 - pos * .04, duration: 1, ease: 'expo.out', delay: k * .06 });
      });
      if (!reduce) gsap.to(cards[order[0]], { x: -26, rotation: ROT[order[0]] - 4, duration: .5, ease: 'power2.inOut', yoyo: true, repeat: 1, delay: 1.3 });
    }});
  })();

  /* ---------- mentions légales ---------- */
  const legal = $('#legal');
  $('#legalOpen').addEventListener('click', () => { legal.showModal ? legal.showModal() : legal.setAttribute('open', ''); lenis.stop(); });
  $('#legalClose').addEventListener('click', () => legal.close());
  legal.addEventListener('close', () => lenis.start());

  /* ---------- polices chargées : on recalcule ---------- */
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  addEventListener('load', () => { if (!deep && !introDone) scrollTo(0, 0); ScrollTrigger.refresh(); }, { once: true });
})();
