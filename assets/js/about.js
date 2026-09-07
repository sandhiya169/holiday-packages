/* ============================================================
   Stackly — ABOUT PAGE JAVASCRIPT
   GSAP + ScrollTrigger + AOS — page-specific animations.
   Assumes gsap, ScrollTrigger and AOS are already loaded and
   that assets/js/main.js has already registered the GSAP plugins
   and wired up the shared header/footer/cursor behaviour.
============================================================ */

'use strict';

(function () {
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. ABOUT HERO — parallax + floating badges
  ───────────────────────────────────────── */
  function initAboutHero() {
    const img = qs('#aboutHeroImg');
    if (img && !prefersReducedMotion) {
      gsap.to(img, {
        yPercent: 20,
        scale: 1.4,
        transformOrigin: 'center bottom',
        ease: 'none',
        scrollTrigger: {
          trigger: '.about-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    const badge1 = qs('#floatBadge1');
    const badge2 = qs('#floatBadge2');
    if (badge1 && badge2 && !prefersReducedMotion) {
      gsap.from([badge1, badge2], {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.2,
        delay: 0.6,
      });

      // Gentle floating loop
      gsap.to(badge1, { y: '+=10', duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 });
      gsap.to(badge2, { y: '-=10', duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 });
    }
  }

  /* ─────────────────────────────────────────
     2. STORY TIMELINE — animated progress line
  ───────────────────────────────────────── */
  function initTimeline() {
    const timeline = qs('#storyTimeline');
    const progress = qs('#timelineProgress');
    if (!timeline || !progress) return;

    gsap.to(progress, {
      height: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: timeline,
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: 1,
      },
    });

    // Pop each dot as its item enters view
    qsa('.timeline-dot', timeline).forEach((dot) => {
      ScrollTrigger.create({
        trigger: dot,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            dot,
            { scale: 0 },
            { scale: 1, duration: 0.5, ease: 'back.out(3)' }
          );
        },
      });
    });
  }

  /* ─────────────────────────────────────────
     3. ACHIEVEMENTS — radial ring draw + count up
  ───────────────────────────────────────── */
  function initAchievements() {
    const cards = qsa('.achieve-card');
    if (!cards.length) return;

    const CIRCUMFERENCE = 2 * Math.PI * 60; // r=60

    cards.forEach((card) => {
      const ring   = qs('.ring-fill', card);
      const numEl  = qs('.achieve-number', card);
      if (!ring || !numEl) return;

      const percent = parseFloat(ring.dataset.percent) || 0;
      const target  = parseFloat(numEl.dataset.target) || 0;
      const offset  = CIRCUMFERENCE - (percent / 100) * CIRCUMFERENCE;

      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(
            ring,
            { strokeDashoffset: CIRCUMFERENCE },
            { strokeDashoffset: offset, duration: 1.6, ease: 'power2.out' }
          );
          gsap.fromTo(
            numEl,
            { textContent: 0 },
            {
              textContent: target,
              duration: 1.6,
              ease: 'power2.out',
              snap: { textContent: 1 },
              onUpdate() {
                numEl.textContent = Math.round(parseFloat(numEl.textContent));
              },
            }
          );
        },
      });
    });
  }

  /* ─────────────────────────────────────────
     4. WHY CHOOSE US — interactive tabs
  ───────────────────────────────────────── */
  function initWhyTabs() {
    const tabs   = qsa('.why-tab');
    const panels = qsa('.why-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const index = tab.dataset.tab;
        const activePanel = qs('.why-panel.active');
        const nextPanel = qs(`.why-panel[data-panel="${index}"]`);
        if (!nextPanel || nextPanel === activePanel) return;

        tabs.forEach((t) => {
          t.classList.toggle('active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });

        if (prefersReducedMotion) {
          panels.forEach((p) => p.classList.remove('active'));
          nextPanel.classList.add('active');
          return;
        }

        const tl = gsap.timeline();
        if (activePanel) {
          tl.to(activePanel, {
            opacity: 0,
            y: 12,
            duration: 0.25,
            ease: 'power2.in',
            onComplete: () => activePanel.classList.remove('active'),
          });
        }
        tl.set(nextPanel, { opacity: 0, y: 12 })
          .add(() => nextPanel.classList.add('active'))
          .to(nextPanel, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  /* ─────────────────────────────────────────
     5. MISSION COMPASS — interactive philosophy
  ───────────────────────────────────────── */
  function initMissionCompass() {
    const compass = qs('#missionCompass');
    const points = qsa('.compass-point', compass || document);
    const number = qs('.mission-current-number');
    const kicker = qs('.mission-current-kicker');
    const title = qs('#missionActiveTitle');
    const text = qs('#missionActiveText');
    const outerOrbit = qs('.compass-orbit-outer', compass || document);

    if (!compass || !points.length || !number || !kicker || !title || !text) return;

    const activatePoint = (point) => {
      if (!point || point.classList.contains('active')) return;

      points.forEach((item) => {
        const active = item === point;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      const updateCopy = () => {
        number.textContent = point.dataset.number;
        kicker.textContent = point.dataset.kicker;
        title.textContent = point.dataset.title;
        text.textContent = point.dataset.text;
      };

      if (prefersReducedMotion) {
        updateCopy();
        return;
      }

      gsap.to([number, kicker, title, text], {
        opacity: 0,
        y: 10,
        duration: 0.18,
        stagger: 0.02,
        ease: 'power2.in',
        onComplete: () => {
          updateCopy();
          gsap.fromTo([number, kicker, title, text],
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.36, stagger: 0.04, ease: 'power2.out' }
          );
        },
      });
    };

    points.forEach((point) => {
      point.addEventListener('click', () => activatePoint(point));
    });

    if (outerOrbit && !prefersReducedMotion) {
      gsap.to(outerOrbit, {
        rotate: 360,
        duration: 36,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center',
      });

      gsap.from(compass, {
        rotate: -5,
        scale: 0.94,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: compass, start: 'top 82%', once: true },
      });
    }
  }

  /* ─────────────────────────────────────────
     6. TEAM FILMSTRIP — cinematic slide switcher
  ───────────────────────────────────────── */
  function initTeamEditorial() {
    const filmstrip  = qs('#teamFilmstrip');
    if (!filmstrip) return;

    const slides     = qsa('.team-slide', filmstrip);
    const dots       = qsa('.team-dot');
    const prevBtn    = qs('#teamPrev');
    const nextBtn    = qs('#teamNext');
    const counterEl  = qs('#teamNavCurrent');
    const totalEl    = qs('#teamNavTotal');

    if (!slides.length) return;

    const total = slides.length;
    let current = 0;
    let isAnimating = false;

    // Write total count
    if (totalEl) totalEl.textContent = String(total).padStart(2, '0');

    /* ── Core activate function ── */
    const activate = (index) => {
      if (index === current && slides[index].classList.contains('active')) return;
      if (isAnimating && !prefersReducedMotion) return;

      const prev    = current;
      const next    = ((index % total) + total) % total;
      const leaving = slides[prev];
      const entering = slides[next];

      current = next;

      // Update ARIA on all slides
      slides.forEach((slide, i) => {
        const isActive = i === next;
        slide.setAttribute('aria-selected', isActive ? 'true' : 'false');
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Update nav dots
      dots.forEach((dot, i) => dot.classList.toggle('active', i === next));

      // Update counter
      if (counterEl) counterEl.textContent = String(next + 1).padStart(2, '0');

      if (prefersReducedMotion) {
        leaving.classList.remove('active');
        entering.classList.add('active');
        return;
      }

      // Animate out the leaving slide's info text
      isAnimating = true;
      const leaveEls = qsa('.team-slide-role, .team-slide-bio, .team-slide-socials', leaving);
      const enterEls = qsa('.team-slide-role, .team-slide-bio, .team-slide-socials', entering);

      gsap.to(leaveEls, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          leaving.classList.remove('active');
          entering.classList.add('active');

          // Animate in the entering slide's info
          gsap.fromTo(
            enterEls,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.42,
              stagger: 0.07,
              ease: 'power3.out',
              onComplete: () => { isAnimating = false; },
            }
          );

          // Subtle image scale-in
          const enterImg = qs('.team-slide-img img', entering);
          if (enterImg) {
            gsap.fromTo(enterImg, { scale: 1.08 }, { scale: 1, duration: 0.7, ease: 'power3.out' });
          }
        },
      });
    };

    /* ── Slide click ── */
    slides.forEach((slide) => {
      slide.addEventListener('click', () => activate(Number(slide.dataset.index)));
    });

    /* ── Dot click ── */
    dots.forEach((dot) => {
      dot.addEventListener('click', () => activate(Number(dot.dataset.target)));
    });

    /* ── Arrow buttons ── */
    if (prevBtn) prevBtn.addEventListener('click', () => activate(current - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => activate(current + 1));

    /* ── Keyboard navigation (left/right arrows) ── */
    filmstrip.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate(current + 1);
        slides[((current) % total + total) % total].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activate(current - 1);
        slides[((current) % total + total) % total].focus();
      }
    });

    /* ── Touch / swipe support ── */
    let touchStartX = 0;
    filmstrip.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    filmstrip.addEventListener('touchend', (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 44) activate(delta < 0 ? current + 1 : current - 1);
    }, { passive: true });

    /* ── ScrollTrigger entrance animation ── */
    if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
      gsap.from('.team-header-inner', {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.team-section', start: 'top 78%', once: true },
      });

      gsap.from(slides, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: filmstrip, start: 'top 82%', once: true },
      });
    }
  }

  /* ─────────────────────────────────────────
     7. CTA — background zoom parallax
  ───────────────────────────────────────── */
  function initAboutCta() {
    const img = qs('.about-cta-bg img');
    if (!img || prefersReducedMotion) return;

    gsap.from(img, {
      scale: 1.15,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-cta',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    initAboutHero();
    initTimeline();
    initAchievements();
    initWhyTabs();
    initMissionCompass();
    initTeamEditorial();
    initAboutCta();

    function refreshScrollTrigger() {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
        setTimeout(() => ScrollTrigger.refresh(), 500);
      }
    }
    if (document.readyState === 'complete') {
      refreshScrollTrigger();
    } else {
      window.addEventListener('load', refreshScrollTrigger);
    }
  }

  function bootWhenReady() {
    if (window.__preloaderDone) {
      init();
    } else {
      window.addEventListener('preloaderDone', init, { once: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootWhenReady);
  } else {
    bootWhenReady();
  }
})();