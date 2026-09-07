/* ============================================================
   Stackly — PACKAGES PAGE JAVASCRIPT
============================================================ */

'use strict';

(function () {
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     0. EARLY FIELD RESET
     Runs on DOMContentLoaded — before the
     preloader fires — so fields are cleared
     before the first paint after a redirect.
  ───────────────────────────────────────── */
  function earlyReset() {
    const searchInput = qs('#pkgSearchInput');
    if (searchInput) searchInput.value = '';

    if (sessionStorage.getItem('pkgFilterRedirected') !== '1') return;
    sessionStorage.removeItem('pkgFilterRedirected');

    const chips = qsa('.pkg-chip');
    chips.forEach(c => c.classList.remove('active'));
    const allChip = chips.find(c => c.dataset.style === 'all');
    if (allChip) allChip.classList.add('active');

    const range      = qs('#pkgBudgetRange');
    const rangeValue = qs('#pkgBudgetValue');
    if (range) {
      range.value = 150000;
      const min = Number(range.min);
      const max = Number(range.max);
      const pct = ((150000 - min) / (max - min)) * 100;
      range.style.setProperty('--pkg-range-fill', pct + '%');
    }
    if (rangeValue) rangeValue.textContent = '₹1,50,000';

    const sortSelect = qs('#pkgSortSelect');
    if (sortSelect) sortSelect.value = 'popular';

    qs('.pkg-filter-search')?.classList.remove('is-invalid');
    qs('.pkg-filter-chips')?.classList.remove('is-invalid');
    qs('.pkg-budget')?.classList.remove('is-invalid');
  }

  /* ─────────────────────────────────────────
     1. HERO — parallax + badges
  ───────────────────────────────────────── */
  function initPkgHero() {
    const img    = qs('#pkgHeroImg');
    const badges = qsa('.pkg-hero .about-float-badge');

    if (img && !prefersReducedMotion) {
      gsap.to(img, {
        yPercent: 18, scale: 1.15, ease: 'none',
        scrollTrigger: { trigger: '.pkg-hero', start: 'top top', end: 'bottom top', scrub: 1.5 }
      });
    }

    if (badges.length) {
      gsap.fromTo(badges,
        { opacity: 0, y: 24, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.18, delay: 0.9, ease: 'back.out(1.6)' }
      );
    }
  }

  /* ─────────────────────────────────────────
     2. SMART FILTER PANEL — validation
  ───────────────────────────────────────── */
  function initFilterPanel() {
    const chips       = qsa('.pkg-chip');
    const range       = qs('#pkgBudgetRange');
    const rangeValue  = qs('#pkgBudgetValue');
    const applyBtn    = qs('#pkgApplyFilters');
    const searchInput = qs('#pkgSearchInput');
    const sortSelect  = qs('#pkgSortSelect');
    if (!chips.length || !range) return;

    // Strip AOS from package cards so GSAP fully controls their entrance
    qsa('.package-card').forEach(card => {
      card.removeAttribute('data-aos');
      card.removeAttribute('data-aos-delay');
      card.style.opacity = '';
      card.style.transform = '';
    });

    function formatINR(num) {
      return '₹' + Number(num).toLocaleString('en-IN');
    }

    /* error banner */
    let errorEl = qs('#pkgFilterError');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.id = 'pkgFilterError';
      errorEl.setAttribute('role', 'alert');
      errorEl.setAttribute('aria-live', 'polite');
      errorEl.innerHTML = '<i class="ri-error-warning-fill"></i><span></span>';
      qs('.pkg-filter-bottom')?.insertAdjacentElement('afterend', errorEl);
    }

    function showError(msg) {
      const icon = errorEl.querySelector('i');
      if (icon) icon.className = 'ri-error-warning-fill';
      errorEl.classList.remove('is-success');
      errorEl.querySelector('span').textContent = msg;
      errorEl.style.display = 'flex';
      gsap.fromTo(errorEl,   { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo('.pkg-filter-panel', { x: 0 }, { x: [-6,6,-4,4,-2,2,0], duration: 0.45, ease: 'power2.out' });
    }

    function clearError() {
      gsap.to(errorEl, { opacity: 0, duration: 0.2, ease: 'power2.in',
        onComplete: () => { errorEl.style.display = 'none'; } });
    }

    /* chip toggle */
    let activeStyle = 'all';
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeStyle = chip.dataset.style;
        clearError();
        qs('.pkg-filter-chips')?.classList.remove('is-invalid');
        gsap.fromTo(chip, { scale: 0.9 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
      });
    });

    /* range */
    function updateRangeFill() {
      const min = Number(range.min), max = Number(range.max), val = Number(range.value);
      const pct = ((val - min) / (max - min)) * 100;
      range.style.setProperty('--pkg-range-fill', pct + '%');
      if (rangeValue) rangeValue.textContent = formatINR(val);
    }
    range.addEventListener('input', () => {
      updateRangeFill();
      clearError();
      qs('.pkg-budget')?.classList.remove('is-invalid');
    });
    updateRangeFill();

    searchInput?.addEventListener('input', () => {
      clearError();
      qs('.pkg-filter-search')?.classList.remove('is-invalid');
    });

    /* validation */
    function validate() {
      const term      = (searchInput?.value || '').trim();
      const budget    = Number(range.value);
      const minBudget = Number(range.min);
      let valid = true;

      qs('.pkg-filter-search')?.classList.remove('is-invalid');
      qs('.pkg-filter-chips')?.classList.remove('is-invalid');
      qs('.pkg-budget')?.classList.remove('is-invalid');

      if (!term && activeStyle === 'all') {
        qs('.pkg-filter-search')?.classList.add('is-invalid');
        qs('.pkg-filter-chips')?.classList.add('is-invalid');
        showError('Please enter a destination or choose a trip style before applying filters.');
        valid = false;
      }
      if (budget <= minBudget) {
        qs('.pkg-budget')?.classList.add('is-invalid');
        if (valid) showError('Please set a budget above the minimum (₹20,000) to search packages.');
        valid = false;
      }
      if (valid) clearError();
      return valid;
    }

    /* apply — filter cards IN PLACE */
    applyBtn?.addEventListener('click', () => {
      gsap.fromTo(applyBtn, { scale: 1 }, { scale: 0.94, duration: 0.12, ease: 'power2.in', yoyo: true, repeat: 1 });
      if (!validate()) return;

      const term = (searchInput?.value || '').trim().toLowerCase();

      const allCards = qsa('.package-card');
      const toShow   = [];
      const toHide   = [];

      allCards.forEach(card => {
        const title    = (card.querySelector('.card-title')?.textContent    || '').toLowerCase();
        const location = (card.querySelector('.card-location')?.textContent || '').toLowerCase();
        const matchesSearch = !term || title.includes(term) || location.includes(term);
        const matchesStyle  = activeStyle === 'all' || card.dataset.category === activeStyle;

        if (matchesSearch && matchesStyle) {
          toShow.push(card);
        } else {
          toHide.push(card);
        }
      });

      /* hide non-matching immediately */
      toHide.forEach(c => {
        c.style.display = 'none';
        c.style.opacity = '';
        c.style.transform = '';
      });

      /* ensure matching cards are visible and animate them */
      toShow.forEach(c => { c.style.display = ''; c.style.opacity = ''; c.style.transform = ''; });
      gsap.fromTo(toShow,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out',
          clearProps: 'opacity,transform,display' }
      );

      /* success message */
      const icon = errorEl.querySelector('i');
      if (icon) icon.className = 'ri-checkbox-circle-fill';
      errorEl.querySelector('span').textContent = 'Filters applied — showing matching packages.';
      errorEl.classList.add('is-success');
      errorEl.style.display = 'flex';
      gsap.fromTo(errorEl, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });

      /* scroll to the grid so the user sees results */
      const grid   = qs('#all-packages');
      const offset = qs('#navbar')?.offsetHeight || 80;
      if (grid) {
        gsap.to(window, { scrollTo: { y: grid, offsetY: offset }, duration: 0.9, ease: 'power3.inOut' });
      }

      /* Refresh AOS + ScrollTrigger for sections below the grid */
      setTimeout(() => {
        if (typeof AOS !== 'undefined') AOS.refresh();
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 500);
    });

    /* live search */
    searchInput?.addEventListener('input', () => {
      const term = searchInput.value.trim().toLowerCase();
      qsa('.package-card').forEach(card => {
        const title    = (card.querySelector('.card-title')?.textContent    || '').toLowerCase();
        const location = (card.querySelector('.card-location')?.textContent || '').toLowerCase();
        card.style.display = (!term || title.includes(term) || location.includes(term)) ? '' : 'none';
      });
    });

    /* sort */
    sortSelect?.addEventListener('change', () => {
      const grid  = qs('#packagesGrid');
      if (!grid) return;
      const cards = qsa('.package-card', grid);
      const getPrice  = c => parseInt((c.querySelector('.price-amount')?.textContent || '0').replace(/[^\d]/g,''), 10) || 0;
      const getRating = c => parseFloat((c.querySelector('.card-meta .ri-star-fill')?.parentElement?.textContent || '0').match(/[\d.]+/)?.[0]) || 0;
      let sorted = [...cards];
      if (sortSelect.value === 'price-low')       sorted.sort((a, b) => getPrice(a)  - getPrice(b));
      else if (sortSelect.value === 'price-high') sorted.sort((a, b) => getPrice(b)  - getPrice(a));
      else if (sortSelect.value === 'rating')     sorted.sort((a, b) => getRating(b) - getRating(a));
      sorted.forEach(card => grid.appendChild(card));
      gsap.fromTo(sorted,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: 'power2.out', clearProps: 'opacity,transform' }
      );
    });
  }

  /* ─────────────────────────────────────────
     3. TRENDING PACKAGES — auto-scroll track
  ───────────────────────────────────────── */
  function initTrendingScroll() {
    const wrap    = qs('#trendingTrackWrap');
    const track   = qs('#trendingTrack');
    const prevBtn = qs('#trendPrev');
    const nextBtn = qs('#trendNext');
    if (!wrap || !track) return;

    /* duplicate cards for seamless loop */
    [...track.children].forEach(card => track.appendChild(card.cloneNode(true)));

    function cardStep() {
      const card = qs('.trend-card', track);
      if (!card) return 320;
      const gap = parseFloat(getComputedStyle(track).gap || 24);
      return card.getBoundingClientRect().width + gap;
    }

    function scrollByStep(dir) {
      const target = Math.max(0, Math.min(wrap.scrollLeft + dir * cardStep(), track.scrollWidth - wrap.clientWidth));
      gsap.to(wrap, { scrollLeft: target, duration: 0.6, ease: 'power3.out' });
    }

    let marqueeFrame, lastFrameTime = 0;
    const stopAuto  = () => { cancelAnimationFrame(marqueeFrame); marqueeFrame = null; lastFrameTime = 0; };
    const startAuto = () => {
      if (prefersReducedMotion) return;
      stopAuto();
      gsap.killTweensOf(wrap);
      const animate = ts => {
        if (!lastFrameTime) lastFrameTime = ts;
        const elapsed = Math.min(ts - lastFrameTime, 50);
        lastFrameTime = ts;
        const loopW = track.scrollWidth / 2;
        wrap.scrollLeft += elapsed * 0.035;
        if (loopW && wrap.scrollLeft >= loopW) wrap.scrollLeft -= loopW;
        marqueeFrame = requestAnimationFrame(animate);
      };
      marqueeFrame = requestAnimationFrame(animate);
    };

    prevBtn?.addEventListener('click', () => { scrollByStep(-1); startAuto(); });
    nextBtn?.addEventListener('click', () => { scrollByStep(1);  startAuto(); });
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);
    wrap.addEventListener('focusin',   stopAuto);
    wrap.addEventListener('focusout',  startAuto);
    startAuto();

    /* stagger reveal — only animates opacity/y, nothing permanent */
    if (!prefersReducedMotion) {
      gsap.fromTo(qsa('.trend-card', track),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
          clearProps: 'opacity,transform',
          scrollTrigger: { trigger: '.trending-section', start: 'top 75%', once: true } }
      );
    }
  }

  /* ─────────────────────────────────────────
     4. LOAD MORE PACKAGES
  ───────────────────────────────────────── */
  function initLoadMore() {
    const btn = qs('#pkgLoadMore');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const hidden = qsa('.package-card.hidden');
      if (!hidden.length) return;
      hidden.forEach(c => c.classList.remove('hidden'));
      gsap.fromTo(hidden,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out', clearProps: 'all' }
      );
      gsap.to(btn, { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in',
        onComplete: () => { btn.style.display = 'none'; } });
    });
  }

  /* ─────────────────────────────────────────
     5. TRAVEL TIERS — solo / group toggle
  ───────────────────────────────────────── */
  function initTiersToggle() {
    const switchEl   = qs('#tiersSwitch');
    const soloLabel  = qs('#soloLabel');
    const groupLabel = qs('#groupLabel');
    const amounts    = qsa('.tier-amount');
    if (!switchEl || !amounts.length) return;
    let isGroup = false;

    switchEl.addEventListener('click', () => {
      isGroup = !isGroup;
      switchEl.classList.toggle('on', isGroup);
      switchEl.setAttribute('aria-checked', String(isGroup));
      soloLabel.classList.toggle('active',  !isGroup);
      groupLabel.classList.toggle('active',  isGroup);
      amounts.forEach(el => {
        const target  = Number(isGroup ? el.dataset.group : el.dataset.solo);
        const counter = { val: Number((el.textContent || '0').replace(/[^\d]/g, '')) };
        gsap.to(counter, {
          val: target, duration: 0.6, ease: 'power2.out',
          onUpdate: () => { el.textContent = Number(Math.round(counter.val)).toLocaleString('en-IN'); }
        });
      });
    });
  }

  /* ─────────────────────────────────────────
     6. HOW BOOKING WORKS — SVG line + icons
  ───────────────────────────────────────── */
  function initBookingLine() {
    const line  = qs('#bookingLineFill');
    const icons = qsa('.booking-step-icon');
    if (!line) return;

    gsap.to(line, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '.booking-track', start: 'top 70%', end: 'bottom 60%', scrub: 1 }
    });

    if (icons.length && !prefersReducedMotion) {
      icons.forEach((icon, i) => {
        ScrollTrigger.create({
          trigger: icon, start: 'top 85%', once: true,
          onEnter: () => {
            gsap.fromTo(icon,
              { scale: 0, rotation: -30 },
              { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)', delay: i * 0.05,
                clearProps: 'scale,rotation' }
            );
          }
        });
      });
    }
  }

  /* ─────────────────────────────────────────
     7. INIT
  ───────────────────────────────────────── */
  function init() {
    gsap.registerPlugin(ScrollTrigger);

    initPkgHero();
    initFilterPanel();
    initTrendingScroll();
    initLoadMore();
    initTiersToggle();
    initBookingLine();

    /* single, reliable refresh after fonts / images settle */
    window.addEventListener('load', () => {
      ScrollTrigger.refresh();
    }, { once: true });
  }

  function bootWhenReady() {
    if (window.__preloaderDone) { init(); }
    else { window.addEventListener('preloaderDone', init, { once: true }); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { earlyReset(); bootWhenReady(); });
  } else {
    earlyReset();
    bootWhenReady();
  }
})();
