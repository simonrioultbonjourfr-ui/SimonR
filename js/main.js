'use strict';

/* ─── Feature detection ──────────────────────────────────────────── */
const touch = !window.matchMedia('(hover: hover)').matches;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Helpers ────────────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── Scene bg color map ─────────────────────────────────────────── */
const sceneBg = {
  cream:  '#FAF6EF',
  coral:  '#E84C1A',
  forest: '#1B3528',
  ink:    '#18140E',
};

/* ================================================================
   GSAP + LENIS SETUP
   ================================================================ */
gsap.registerPlugin(ScrollTrigger);

/* Lenis smooth scroll — desktop only.
   On touch devices (mobile/tablet) native scrolling is already smooth and
   hardware-accelerated; running Lenis there just adds overhead and jank. */
let lenis = null;
if (!touch) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ================================================================
   LOADER — overlay split-panel wipe
   ================================================================ */
const loader  = qs('#loader');
const ldTop   = qs('.ld-top');
const ldBot   = qs('.ld-bot');
const POOL    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function bootReady() {
  document.body.classList.remove('ld-active');
  document.body.classList.add('ready');
  runHeroAnim();
}

if (!loader || reducedMotion) {
  if (loader) loader.style.display = 'none';
  bootReady();
} else if (sessionStorage.getItem('sr-v4-intro')) {
  loader.style.display = 'none';
  bootReady();
} else {
  sessionStorage.setItem('sr-v4-intro', '1');

  /* Name scramble */
  const ldName = qs('.ld-name');
  if (ldName) {
    const target = 'Simon';
    const N = 44; let f = 0;
    setTimeout(() => {
      const id = setInterval(() => {
        const p   = easeOut(Math.min(f / N, 1));
        const rev = Math.floor(p * target.length);
        ldName.firstChild.textContent = target.split('').map((c, i) =>
          i < rev ? c : POOL[Math.floor(Math.random() * POOL.length)]
        ).join('');
        f++;
        if (f > N + 3) { ldName.firstChild.textContent = target; clearInterval(id); }
      }, 16);
    }, 130);
  }

  /* Split-panel wipe out */
  setTimeout(() => {
    gsap.to(ldTop, { yPercent: -100, duration: 0.9, ease: 'power3.inOut' });
    gsap.to(ldBot, { yPercent:  100, duration: 0.9, ease: 'power3.inOut',
      onComplete: () => {
        loader.style.display = 'none';
        bootReady();
      }
    });
    gsap.to('.ld-content', { opacity: 0, duration: 0.3, ease: 'power2.in' });
  }, 1800);
}

/* ================================================================
   HERO ANIMATIONS  (run after loader)
   ================================================================ */
function runHeroAnim() {
  if (reducedMotion) {
    /* Show everything immediately */
    qsa('.mask-inner').forEach(el => { el.style.transform = 'none'; });
    qsa('.hero-sub, .hero-actions, .hero-badge, .scroll-ind')
      .forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  /* Kicker words slide in */
  tl.fromTo('.kicker-word', {
    opacity: 0, y: 18
  }, {
    opacity: 1, y: 0,
    duration: 0.7,
    stagger: 0.08
  }, 0.1);

  /* Headline lines mask-up */
  tl.fromTo('.mask-inner', {
    y: '110%'
  }, {
    y: '0%',
    duration: 1.1,
    stagger: 0.12
  }, 0.05);

  /* Sub + actions */
  tl.to('.hero-sub', {
    opacity: 1, y: 0,
    duration: 0.9
  }, 0.7);

  tl.to('.hero-actions', {
    opacity: 1, y: 0,
    duration: 0.8
  }, 0.85);

  tl.to('.hero-badge', {
    opacity: 1, y: 0,
    duration: 0.7
  }, 1.0);

  tl.to('.scroll-ind', {
    opacity: 1,
    duration: 0.6
  }, 1.3);
}

/* ================================================================
   SCROLL PROGRESS BAR
   ================================================================ */
const spb = qs('#spb');
if (spb) {
  /* Drive the bar with scaleX (compositor-only) instead of width (layout). */
  const updateSPB = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = total > 0 ? window.scrollY / total : 0;
    spb.style.transform = `scaleX(${ratio.toFixed(4)})`;
  };
  window.addEventListener('scroll', updateSPB, { passive: true });
  updateSPB();
}

/* ================================================================
   NAV — sticky + color adaptation
   ================================================================ */
const header = qs('#header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 24);
}, { passive: true });

/* ================================================================
   MOBILE BURGER MENU
   ================================================================ */
const burger  = qs('#burger');
const mobMenu = qs('#mobMenu');
const toggleMenu = (force) => {
  const open = force !== undefined ? force : !mobMenu.classList.contains('open');
  mobMenu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  mobMenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => toggleMenu());
qsa('a', mobMenu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

/* ================================================================
   CUSTOM CURSOR
   ================================================================ */
if (!touch) {
  const cur = qs('#cur');
  const ring = qs('#cur-ring');
  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  /* Position via transform (translate3d) instead of left/top: keeps the
     cursor on the compositor and avoids a layout+paint on every frame. */
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  (function tick() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  })();

  qsa('a, button, .real-card, .tarif-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}

/* ================================================================
   MAGNETIC BUTTONS
   ================================================================ */
if (!touch && !reducedMotion) {
  qsa('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = ((e.clientX - r.left - r.width  / 2) * 0.28).toFixed(1);
      const y = ((e.clientY - r.top  - r.height / 2) * 0.34).toFixed(1);
      btn.style.transform = `translate(${x}px, ${y}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.65s cubic-bezier(0.22,1,0.36,1), background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s';
      btn.style.transform = '';
      setTimeout(() => { btn.style.transition = ''; }, 650);
    });
  });
}

/* ================================================================
   GSAP SCROLL ANIMATIONS  (skip on reduced-motion)
   ================================================================ */
if (!reducedMotion) {

  /* ── 1. Background color morph per scene ───────────────────── */
  const scenes = [
    { sel: '.s-hero',    bg: sceneBg.cream  },
    { sel: '.s-marquee', bg: sceneBg.coral  },
    { sel: '.s-word:nth-of-type(1)', bg: sceneBg.ink    },
    { sel: '.s-impact',  bg: sceneBg.forest },
    { sel: '.s-word:nth-of-type(2)', bg: sceneBg.cream  },
    { sel: '.s-process', bg: sceneBg.ink    },
    { sel: '.s-word:nth-of-type(3)', bg: sceneBg.coral  },
    { sel: '.s-real',    bg: sceneBg.cream  },
    { sel: '.s-word:nth-of-type(4)', bg: sceneBg.forest },
    { sel: '.s-tarifs',  bg: sceneBg.ink    },
    { sel: '.s-word:nth-of-type(5)', bg: sceneBg.cream  },
    { sel: '.s-voice',   bg: sceneBg.coral  },
    { sel: '.s-faq',     bg: sceneBg.cream  },
    { sel: '.s-contact', bg: sceneBg.forest },
  ];

  /* Use data-scene on each element to drive bg */
  qsa('[data-scene]').forEach(el => {
    const sceneKey = el.getAttribute('data-scene');
    const bg = sceneBg[sceneKey];
    if (!bg) return;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onEnter:      () => gsap.to('body', { backgroundColor: bg, duration: 0.85, ease: 'power2.out', overwrite: 'auto' }),
      onEnterBack:  () => gsap.to('body', { backgroundColor: bg, duration: 0.85, ease: 'power2.out', overwrite: 'auto' }),
    });
  });

  /* ── 2. Giant word reveals — panel wipe + clip-path ─────────── */
  qsa('.s-word').forEach(section => {
    const panel = qs('.word-panel', section);
    const text  = qs('.word-text',  section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
        end:   'top 15%',
        scrub: false,
        once:  true,
      }
    });

    /* Panel slides left to right (wipes away) */
    tl.fromTo(panel, {
      scaleX: 1, transformOrigin: 'left center'
    }, {
      scaleX: 0, transformOrigin: 'right center',
      duration: 0.9, ease: 'power3.inOut'
    }, 0);

    /* Text revealed by clip-path */
    tl.fromTo(text, {
      clipPath: 'inset(0 100% 0 0)'
    }, {
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.9, ease: 'power3.inOut'
    }, 0.05);
  });

  /* ── 3. Impact / stats cards stagger in ─────────────────────── */
  gsap.to('.impact-card', {
    opacity: 1, y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.impact-grid',
      start: 'top 72%',
      once: true,
    }
  });

  /* ── 4. Impact number count-up ──────────────────────────────── */
  qsa('[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    let fired = false;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (fired) return; fired = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.8,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
          onComplete: () => { el.textContent = target + suffix; }
        });
      }
    });
  });

  /* ── 5. Process (showstopper) pinned scroll phases ──────────── */
  const ssWrap   = qs('.proc-pin-wrap');
  const ssSticky = qs('.proc-sticky');
  if (ssWrap) {
    const phases = qsa('.proc-phase', ssWrap);
    const dots   = qsa('.pd-dot',    ssWrap);
    const fills  = qsa('.pd-fill',   ssWrap);
    let curPhase = -1;

    const setPhase = (p) => {
      if (p === curPhase) return;
      curPhase = p;
      phases.forEach((ph, i) => ph.classList.toggle('active', i === p));
      qsa('.pl', ssWrap).forEach((l, i) => l.classList.toggle('visible', i === p));
      dots.forEach((d, i)  => d.classList.toggle('pd-dot--active', i <= p));
      fills.forEach((f, i) => { f.style.width = i < p ? '100%' : '0%'; });
    };

    /* Show layer 0 on mount */
    const firstLayer = qs('.pl[data-layer="0"]', ssWrap);
    if (firstLayer) firstLayer.classList.add('visible');
    setPhase(0);

    ScrollTrigger.create({
      trigger: ssWrap,
      pin: ssSticky,
      start: 'top top',
      end: `+=${ssWrap.offsetHeight - window.innerHeight}`,
      scrub: false,
      onUpdate(self) {
        setPhase(Math.min(3, Math.floor(self.progress * 4)));
      }
    });
  }

  /* ── 6. Horizontal gallery (desktop only) ───────────────────── */
  const realWrap   = qs('.real-pin-wrap');
  const realSticky = qs('.real-sticky');
  const realTrack  = qs('.real-track');
  const rpFill     = qs('.rp-fill');

  if (realTrack && window.innerWidth > 768) {
    /* Calculate how far to scroll */
    const getScrollDist = () =>
      realTrack.scrollWidth - realTrack.parentElement.offsetWidth + parseFloat(getComputedStyle(realTrack).paddingLeft);

    const scrollAnim = gsap.to(realTrack, {
      x: () => -getScrollDist(),
      ease: 'none',
      scrollTrigger: {
        trigger: realWrap,
        pin: realSticky,
        start: 'top top',
        end: () => `+=${getScrollDist() + 80}`,
        scrub: 1.2,
        invalidateOnRefresh: true,
        onUpdate(self) {
          if (rpFill) rpFill.style.width = (self.progress * 100).toFixed(1) + '%';
        }
      }
    });
  } else if (realSticky) {
    /* Mobile: remove pin */
    realSticky.style.position = 'static';
    realSticky.style.height   = 'auto';
  }

  /* ── 7. Tarifs cards stagger ────────────────────────────────── */
  gsap.to('.tarif-card', {
    opacity: 1, y: 0,
    duration: 0.9,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.tarifs-grid',
      start: 'top 72%',
      once: true,
    }
  });

  /* Tarif price count-up */
  qsa('.tc-big[data-count]').forEach(el => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    let fired = false;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        if (fired) return; fired = true;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => { el.textContent = Math.round(obj.val) + suffix; },
          onComplete: () => { el.textContent = target + suffix; }
        });
      }
    });
  });

  /* ── 8. Voice / testimonial reveal ─────────────────────────── */
  gsap.to('.voice-inner', {
    opacity: 1, y: 0,
    duration: 1.0,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.voice-inner',
      start: 'top 72%',
      once: true,
    }
  });

  /* ── 9. Contact headline stagger ────────────────────────────── */
  ScrollTrigger.create({
    trigger: '.s-contact',
    start: 'top 65%',
    once: true,
    onEnter() {
      gsap.fromTo('.contact-h2', {
        opacity: 0, y: 40
      }, {
        opacity: 1, y: 0,
        duration: 1.0,
        ease: 'power3.out'
      });
    }
  });

  /* ── 10. Hero headline parallax on scroll ───────────────────── */
  if (!touch) {
    gsap.to('.hero-h1', {
      y: 70,
      ease: 'none',
      scrollTrigger: {
        trigger: '.s-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  /* ── Recalc pin/scroll positions once heavy images are in ──────
     Without this, ScrollTrigger measures the page before the big
     images load, so pinned sections end up with the wrong height
     and leave blank gaps. Refresh on full load + after each image. */
  window.addEventListener('load', () => ScrollTrigger.refresh());
  qsa('img').forEach(img => {
    if (img.complete) return;
    img.addEventListener('load',  () => ScrollTrigger.refresh(), { once: true });
    img.addEventListener('error', () => ScrollTrigger.refresh(), { once: true });
  });

} /* end reducedMotion guard */

/* ================================================================
   FAQ ACCORDION
   ================================================================ */
qsa('.faq-item').forEach(item => {
  const btn  = qs('.faq-q',    item);
  const body = qs('.faq-body', item);
  if (!btn || !body) return;

  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');

    /* Close all open items */
    qsa('.faq-item.open').forEach(o => {
      const b = qs('.faq-body', o);
      o.classList.remove('open');
      qs('.faq-q', o).setAttribute('aria-expanded', 'false');
      b.setAttribute('aria-hidden', 'true');
      b.style.height = b.scrollHeight + 'px';
      requestAnimationFrame(() => { b.style.height = '0'; });
    });

    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      body.setAttribute('aria-hidden', 'false');
      body.style.height = body.scrollHeight + 'px';
      body.addEventListener('transitionend', () => {
        if (item.classList.contains('open')) body.style.height = 'auto';
      }, { once: true });
    }
  });
});

/* ================================================================
   PAGE EXIT CURTAIN
   ================================================================ */
const pageCurtain = qs('#page-curtain');
if (pageCurtain) {
  qsa('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto') || href.startsWith('http')) return;
    a.addEventListener('click', e => {
      e.preventDefault();
      pageCurtain.classList.add('closing');
      setTimeout(() => { window.location.href = href; }, 620);
    });
  });
}

/* ================================================================
   SMOOTH ANCHOR SCROLL  (Lenis-aware)
   ================================================================ */
qsa('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) {
      lenis.scrollTo(target, { offset: -76, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 5) });
    } else {
      /* Native smooth scroll fallback (touch devices, no Lenis) */
      const y = target.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

/* ================================================================
   PROCESS SECTION  — scroll-driven phase switching (fallback)
   Only fires if GSAP ScrollTrigger didn't already handle it
   ================================================================ */
(function() {
  const ssWrap = qs('.proc-pin-wrap');
  if (!ssWrap || !reducedMotion) return;

  const phases = qsa('.proc-phase', ssWrap);
  const dots   = qsa('.pd-dot',    ssWrap);
  const fills  = qsa('.pd-fill',   ssWrap);
  let cur = -1;

  const firstLayer = qs('.pl[data-layer="0"]', ssWrap);
  if (firstLayer) firstLayer.classList.add('visible');

  const setPhase = (p) => {
    if (p === cur) return; cur = p;
    phases.forEach((ph, i) => ph.classList.toggle('active', i === p));
    qsa('.pl', ssWrap).forEach((l, i) => l.classList.toggle('visible', i === p));
    dots.forEach((d, i)  => d.classList.toggle('pd-dot--active', i <= p));
    fills.forEach((f, i) => { f.style.width = i < p ? '100%' : '0%'; });
  };
  setPhase(0);

  const update = () => {
    const rect  = ssWrap.getBoundingClientRect();
    const total = ssWrap.offsetHeight - window.innerHeight;
    if (total <= 0) return;
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    setPhase(Math.min(3, Math.floor(progress * 4)));
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
