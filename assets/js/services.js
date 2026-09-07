/* ============================================================
   Stackly — SERVICES PAGE JAVASCRIPT
   GSAP + ScrollTrigger + AOS interactions specific to services.html
   Loaded AFTER assets/js/main.js (which already boots AOS, the
   navbar, cursor, back-to-top, etc.)
============================================================ */

'use strict';

(function () {

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. PROCESS TIMELINE — DRAW-ON-SCROLL LINE
  ───────────────────────────────────────── */
  function initProcessLine() {
    const line = qs('#processLine');
    const wrap = qs('#processTimeline');
    if (!line || !wrap || prefersReducedMotion) return;

    gsap.to(line, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 75%',
        end: 'bottom 80%',
        scrub: 0.6,
      }
    });

    // Pop each icon as its step comes into view
    qsa('.process-icon').forEach((icon, i) => {
      ScrollTrigger.create({
        trigger: icon,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          gsap.fromTo(icon,
            { scale: 0, rotate: -40 },
            { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.2)' }
          );
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     2. SERVICE ROUTE — journey rail + detail stage
  ───────────────────────────────────────── */
  function initServiceRoute() {
    const rail   = qs('#routeRail');
    const stage  = qs('#routeStage');
    if (!rail || !stage) return;

    const stops     = qsa('.route-stop', rail);
    const railFill  = qs('#routeRailFill');
    const railPlane = qs('#routeRailPlane');

    const img       = qs('#routeStageImg');
    const numeral   = qs('.route-stage-numeral');
    const stageNum  = qs('#routeStageNum');
    const tag       = qs('#routeStageTag');
    const title     = qs('#routeStageTitle');
    const desc      = qs('#routeStageDesc');
    const features  = qs('#routeStageFeatures');

    const DATA = {
      1: {
        icon: 'ri-flight-takeoff-line',
        label: 'Flight Booking',
        img: 'assets/images/plane.webp',
        alt: 'Airplane wing above the clouds at golden hour',
        desc: 'Best-fare flights across 500+ airlines, with flexible dates and seat preferences handled for you — economy to private charter.',
        features: ['Multi-city & round-trip routing', 'Fare-drop price alerts', 'Seat & baggage add-ons'],
      },
      2: {
        icon: 'ri-hotel-line',
        label: 'Hotel & Resort Booking',
        img: 'assets/images/hotel.webp',
        alt: 'Luxury hotel infinity pool overlooking tropical ocean',
        desc: 'Hand-vetted stays from boutique villas to five-star resorts, matched to your budget, style, and every special request.',
        features: ['Verified property reviews', 'Room-upgrade negotiation', 'Free cancellation options'],
      },
      3: {
        icon: 'ri-passport-line',
        label: 'Visa & Documentation',
        img: 'assets/images/visa.webp',
        alt: 'Passport and travel documents on a world map',
        desc: 'End-to-end visa guidance and paperwork support so entry requirements never catch you off guard.',
        features: ['Country-specific checklists', 'Application review', 'Appointment scheduling'],
      },
      4: {
        icon: 'ri-map-2-line',
        label: 'Custom Itinerary Planning',
        img: 'assets/images/travel.webp',
        alt: 'Couple on a scenic mountain road trip',
        desc: 'Day-by-day plans built around your pace — adventure-packed, slow travel, or somewhere in between.',
        features: ['1:1 planning consultation', 'Local experience curation', 'Unlimited revisions'],
      },
      5: {
        icon: 'ri-taxi-line',
        label: 'Transfers & Transport',
        img: 'assets/images/holiday-travel.webp',
        alt: 'Luxury private transfer car on coastal road',
        desc: 'Private transfers, rail passes, and local transport sorted before you even land — no surprises, ever.',
        features: ['Meet & greet drivers', 'Inter-city rail & ferry', 'Car rental coordination'],
      },
      6: {
        icon: 'ri-shield-check-line',
        label: 'Travel Insurance',
        img: 'assets/images/documents.webp',
        alt: 'Traveller reviewing travel insurance documents',
        desc: 'Cover for medical emergencies, trip delays, and lost baggage — explained in plain language, not fine print.',
        features: ['Medical & evacuation cover', 'Trip cancellation protection', 'Instant digital policy'],
      },
    };

    let current = 1;
    let isAnimating = false;

    function paint(svcNum) {
      const d = DATA[svcNum];
      const padded = String(svcNum).padStart(2, '0');
      img.src = d.img;
      img.alt = d.alt;
      if (numeral) numeral.textContent = padded;
      if (stageNum) stageNum.textContent = padded;
      tag.innerHTML = `<i class="${d.icon}"></i> Service ${padded}`;
      title.textContent = d.label;
      desc.textContent = d.desc;
      features.innerHTML = d.features.map(f => `<li>${f}</li>`).join('');
    }

    function positionRail(svcNum) {
      const idx   = svcNum - 1;
      const total = stops.length - 1;
      const pct   = total === 0 ? 0 : (idx / total) * 100;
      if (railFill)  railFill.style.width = pct + '%';
      if (railPlane) railPlane.style.left = pct + '%';
    }

    function setActive(svcNum, opts = {}) {
      if (svcNum === current && !opts.force) return;
      if (isAnimating) return;

      stops.forEach(s => {
        const isActive = parseInt(s.dataset.svc, 10) === svcNum;
        s.classList.toggle('active', isActive);
        s.setAttribute('aria-selected', String(isActive));
        s.tabIndex = isActive ? 0 : -1;
      });

      stage.setAttribute('aria-labelledby', `routeTab-${svcNum}`);
      positionRail(svcNum);
      current = svcNum;

      if (opts.focus) {
        const target = stops.find(s => parseInt(s.dataset.svc, 10) === svcNum);
        if (target) target.focus();
      }

      if (prefersReducedMotion) {
        paint(svcNum);
        return;
      }

      isAnimating = true;
      const textEls = [tag, title, desc, features];

      gsap.timeline({ onComplete: () => { isAnimating = false; } })
        .to(textEls, { opacity: 0, y: 8, duration: 0.18, ease: 'power1.in' }, 0)
        .to(img, { opacity: 0, duration: 0.18, ease: 'power1.in' }, 0)
        .call(() => paint(svcNum))
        .fromTo(textEls,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.32, stagger: 0.045, ease: 'power2.out' }
        )
        .fromTo(img, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '<');
    }

    stops.forEach(stop => {
      stop.addEventListener('click', () => setActive(parseInt(stop.dataset.svc, 10)));
    });

    // Roving-tab keyboard support (left/right/up/down + home/end)
    rail.addEventListener('keydown', (e) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      let next = current;
      if (e.key === 'Home') next = 1;
      else if (e.key === 'End') next = stops.length;
      else {
        const dir = (e.key === 'ArrowRight' || e.key === 'ArrowDown') ? 1 : -1;
        next = current + dir;
        if (next < 1) next = stops.length;
        if (next > stops.length) next = 1;
      }
      setActive(next, { focus: true });
    });

    // Initial rail position (no animation needed on load)
    positionRail(current);

    // Entrance animation for the rail stops
    if (!prefersReducedMotion) {
      ScrollTrigger.create({
        trigger: '.services-route',
        start: 'top 78%',
        once: true,
        onEnter: () => {
          gsap.from(stops, {
            opacity: 0,
            y: 16,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power2.out',
          });
          const track = qs('.route-rail-track');
          if (track) {
            gsap.from(track, {
              scaleX: 0,
              transformOrigin: 'left center',
              duration: 0.7,
              ease: 'power2.out',
            });
          }
        }
      });
    }
  }

  /* ─────────────────────────────────────────
     3. SERVICE PLANS — PRICE TOGGLE (per trip / annual)
  ───────────────────────────────────────── */
  function initPlanToggle() {
    const toggle       = qs('#planToggle');
    const monthlyLabel = qs('#toggleMonthlyLabel');
    const yearlyLabel  = qs('#toggleYearlyLabel');
    const values       = qsa('.price-value');
    const periods       = qsa('.price-period');
    if (!toggle) return;

    let isYearly = false;

    toggle.addEventListener('click', () => {
      isYearly = !isYearly;
      toggle.setAttribute('aria-checked', String(isYearly));
      monthlyLabel.classList.toggle('active', !isYearly);
      yearlyLabel.classList.toggle('active', isYearly);

      // Animate price count
      values.forEach(el => {
        const target = parseFloat(el.dataset[isYearly ? 'yearly' : 'monthly']);
        gsap.to(el, {
          textContent: target,
          duration: 0.6,
          ease: 'power2.out',
          snap: { textContent: 1 },
          onUpdate() {
            el.textContent = Math.round(parseFloat(el.textContent)).toLocaleString();
          },
        });
      });

      periods.forEach(el => {
        el.textContent = el.dataset[isYearly ? 'yearly' : 'monthly'];
      });

      // Subtle pulse on the featured card
      const featured = qs('.plan-card.featured');
      if (featured) {
        gsap.fromTo(featured, { scale: window.innerWidth > 1024 ? 1.04 : 1 },
          { scale: window.innerWidth > 1024 ? 1.06 : 1.015, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      }
    });
  }

  /* ─────────────────────────────────────────
     4. FAQ ACCORDION
  ───────────────────────────────────────── */
  function initFaqAccordion() {
    const items = qsa('.faq-item');
    if (!items.length) return;

    function openItem(item, animate = true) {
      const answer = item.querySelector('.faq-answer');
      const btn    = item.querySelector('.faq-question');
      item.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');

      const targetHeight = answer.scrollHeight;
      if (animate && !prefersReducedMotion) {
        gsap.fromTo(answer, { height: 0 }, {
          height: targetHeight + 2,
          duration: 0.45,
          ease: 'power3.out',
          onComplete: () => { answer.style.height = 'auto'; },
        });
      } else {
        answer.style.height = 'auto';
      }
    }

    function closeItem(item) {
      const answer = item.querySelector('.faq-answer');
      const btn    = item.querySelector('.faq-question');
      item.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');

      const startHeight = answer.scrollHeight;
      if (!prefersReducedMotion) {
        gsap.fromTo(answer, { height: startHeight }, {
          height: 0,
          duration: 0.35,
          ease: 'power3.in',
        });
      } else {
        answer.style.height = '0px';
      }
    }

    items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all others (single-open accordion)
        items.forEach(other => {
          if (other !== item && other.classList.contains('active')) {
            closeItem(other);
          }
        });

        isActive ? closeItem(item) : openItem(item);
      });
    });

    // Open the first (pre-marked `active`) item on load without animating
    const preActive = qs('.faq-item.active');
    if (preActive) openItem(preActive, false);

    function refreshOpenAnswers() {
      items.forEach(item => {
        if (item.classList.contains('active')) {
          const answer = item.querySelector('.faq-answer');
          answer.style.height = 'auto';
        }
      });
    }

    window.addEventListener('resize', refreshOpenAnswers);
    if (document.fonts) document.fonts.ready.then(refreshOpenAnswers);
  }

  /* ─────────────────────────────────────────
     5. PLAN CARDS — STAGGERED ENTRANCE POP (extra flourish over AOS)
  ───────────────────────────────────────── */
  function initPlanCardsPop() {
    if (prefersReducedMotion) return;
    const badge = qs('.plan-badge');
    if (!badge) return;

    ScrollTrigger.create({
      trigger: '.plans-grid',
      start: 'top 78%',
      once: true,
      onEnter: () => {
        gsap.fromTo(badge,
          { scale: 0, rotate: -12 },
          { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.4)', delay: 0.35 }
        );
      }
    });
  }

  /* ─────────────────────────────────────────
     6. CTA — BACKGROUND PARALLAX ZOOM
  ───────────────────────────────────────── */
  function initCtaParallax() {
    if (prefersReducedMotion) return;
    const img = qs('.cta-bg img');
    if (!img) return;

    gsap.fromTo(img, { scale: 1.15 }, {
      scale: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: '.services-cta',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  /* ─────────────────────────────────────────
     7. PAGE HEADER — SUBTLE IMAGE PARALLAX
  ───────────────────────────────────────── */
  function initHeaderParallax() {
    if (prefersReducedMotion) return;
    const img = qs('.page-header-img');
    if (!img) return;

    gsap.to(img, {
      yPercent: 14,
      scale: 1.4,
      transformOrigin: 'center bottom',
      ease: 'none',
      scrollTrigger: {
        trigger: '.page-header',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
      }
    });
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    if (typeof gsap !== 'undefined' && gsap.registerPlugin && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    initProcessLine();
    initServiceRoute();
    initPlanToggle();
    initFaqAccordion();
    initPlanCardsPop();
    initCtaParallax();
    initHeaderParallax();

    function refreshScrollTrigger() {
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
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