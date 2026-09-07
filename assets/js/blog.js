/* ============================================================
   Stackly — BLOG PAGE JAVASCRIPT
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
     1. BLOG HERO — parallax background
  ───────────────────────────────────────── */
  function initBlogHero() {
    const img = qs('#blogHeroImg');
    if (img && !prefersReducedMotion) {
      gsap.to(img, {
        yPercent: 20,
        scale: 1.4,
        transformOrigin: 'center bottom',
        ease: 'none',
        scrollTrigger: {
          trigger: '.blog-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }
  }

  /* ─────────────────────────────────────────
     2. HERO SEARCH — validation, reset, and 404 redirect
  ───────────────────────────────────────── */
  function initBlogSearch() {
    const form     = qs('#blogSearchForm');
    const input    = qs('#blogSearchInput');
    const errorMsg = qs('#blogSearchError');
    if (!form || !input) return;

    function clearError() {
      form.classList.remove('is-invalid');
      if (errorMsg) errorMsg.classList.remove('visible');
    }

    input.addEventListener('input', clearError);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = input.value.trim();

      // Text validation: check for empty or whitespace
      if (!term) {
        form.classList.add('is-invalid');
        if (errorMsg) {
          errorMsg.textContent = 'Please enter a search keyword';
          errorMsg.classList.add('visible');
        }
        if (typeof gsap !== 'undefined') {
          gsap.timeline()
            .to(form, { x: -8, duration: 0.05 })
            .to(form, { x: 8, duration: 0.05 })
            .to(form, { x: -6, duration: 0.05 })
            .to(form, { x: 6, duration: 0.05 })
            .to(form, { x: 0, duration: 0.05 });
        }
        input.focus();
        return;
      }

      // Valid: reset field and redirect to 404 page
      input.value = '';
      form.reset();
      clearError();

      window.location.href = '404.html';
    });
  }

  /* ─────────────────────────────────────────
     3. CATEGORY FILTER — animated show/hide
  ───────────────────────────────────────── */
  function initBlogFilter() {
    const filterBtns = qsa('.filter-btn', qs('#blogFilterTabs') || document);
    const cards       = qsa('.blog-post-card');
    const emptyState  = qs('#blogGridEmpty');
    if (!filterBtns.length || !cards.length) return;

    // Strip AOS from filterable cards so GSAP fully controls them
    cards.forEach(card => {
      card.removeAttribute('data-aos');
      card.removeAttribute('data-aos-delay');
      card.style.opacity = '';
      card.style.transform = '';
    });

    function applyFilter(filter) {
      let visibleCount = 0;

      cards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;

        if (matches) {
          visibleCount++;
          card.classList.remove('is-hidden');
          if (!prefersReducedMotion) {
            gsap.fromTo(
              card,
              { opacity: 0, y: 24 },
              { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
                delay: 0.04 * visibleCount,
                clearProps: 'opacity,transform' }
            );
          }
        } else {
          gsap.to(card, {
            opacity: 0, y: 10, duration: 0.25, ease: 'power2.in',
            onComplete: () => {
              card.classList.add('is-hidden');
              card.style.opacity = '';
              card.style.transform = '';
            }
          });
        }
      });

      if (emptyState) emptyState.classList.toggle('visible', visibleCount === 0);

      // Refresh AOS so sections below (Trending, Writers, Topics, Newsletter) animate
      if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 500);
      }
    }

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    // Hero "Popular" tag links also drive the filter
    qsa('.blog-hero-tags a[data-filter]').forEach((tag) => {
      tag.addEventListener('click', () => {
        const filter = tag.dataset.filter;
        const matchingBtn = filterBtns.find((b) => b.dataset.filter === filter);
        if (matchingBtn) {
          filterBtns.forEach((b) => b.classList.remove('active'));
          matchingBtn.classList.add('active');
          applyFilter(filter);
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     4. TRENDING — horizontal scroller with arrows
  ───────────────────────────────────────── */
  function initTrending() {
    const track = qs('#trendingTrack');
    const prev  = qs('#trendPrev');
    const next  = qs('#trendNext');
    if (!track) return;

    function scrollByCard(direction) {
      const card = qs('.trending-card', track);
      const gap  = 24;
      const distance = card ? card.getBoundingClientRect().width + gap : 300;

      gsap.to(track, {
        scrollTo: { x: `+=${direction * distance}` },
        duration: 0.6,
        ease: 'power2.out',
      });
    }

    prev?.addEventListener('click', () => scrollByCard(-1));
    next?.addEventListener('click', () => scrollByCard(1));

    // Stagger the cards in on scroll
    if (!prefersReducedMotion) {
      gsap.from('.trending-card', {
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: track,
          start: 'top 85%',
          once: true,
        },
      });
    }
  }

  /* ─────────────────────────────────────────
     5. TOPIC PILLS — playful hover pulse
  ───────────────────────────────────────── */
  function initTopicPills() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    qsa('.topic-pill').forEach((pill) => {
      pill.addEventListener('mouseenter', () => {
        gsap.to(pill.querySelector('i'), { rotate: -12, scale: 1.15, duration: 0.25, ease: 'back.out(3)' });
      });
      pill.addEventListener('mouseleave', () => {
        gsap.to(pill.querySelector('i'), { rotate: 0, scale: 1, duration: 0.25, ease: 'power2.out' });
      });
    });
  }

  /* ─────────────────────────────────────────
     6. BLOG NEWSLETTER — validation, reset, and 404 redirect
  ───────────────────────────────────────── */
  function initBlogNewsletter() {
    const form       = qs('#blogNewsletterForm');
    const inputGroup = qs('.newsletter-input-group', form);
    const emailInput = qs('#blogNewsletterEmail', form);
    const errorMsg   = qs('#blogNewsletterError', form);
    if (!form || !emailInput) return;

    // Background zoom parallax
    const img = qs('.blog-newsletter-bg img');
    if (img && !prefersReducedMotion) {
      gsap.from(img, {
        scale: 1.15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.blog-newsletter',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function clearError() {
      if (inputGroup) inputGroup.classList.remove('is-invalid');
      if (errorMsg) errorMsg.classList.remove('visible');
    }

    emailInput.addEventListener('input', clearError);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();

      // Text validation: check if empty or invalid email format
      if (!email || !emailRegex.test(email)) {
        if (inputGroup) inputGroup.classList.add('is-invalid');
        if (errorMsg) {
          errorMsg.textContent = !email
            ? 'Please enter your email address'
            : 'Please enter a valid email address (e.g. name@example.com)';
          errorMsg.classList.add('visible');
        }
        const targetToShake = inputGroup || form;
        if (typeof gsap !== 'undefined') {
          gsap.timeline()
            .to(targetToShake, { x: -8, duration: 0.05 })
            .to(targetToShake, { x: 8, duration: 0.05 })
            .to(targetToShake, { x: -6, duration: 0.05 })
            .to(targetToShake, { x: 6, duration: 0.05 })
            .to(targetToShake, { x: 0, duration: 0.05 });
        }
        emailInput.focus();
        return;
      }

      // Valid: reset field and redirect to 404 page
      emailInput.value = '';
      form.reset();
      clearError();

      window.location.href = '404.html';
    });
  }

  /* ─────────────────────────────────────────
     7. FEATURED POST — cursor-follow image tilt
  ───────────────────────────────────────── */
  function initFeaturedTilt() {
    const card = qs('.featured-post-card');
    if (!card || window.matchMedia('(pointer: coarse)').matches) return;

    const image = qs('.featured-post-image img', card);

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      gsap.to(image, {
        x: x * 10,
        y: y * 10,
        duration: 0.6,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(image, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' });
    });
  }

  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
    if (typeof ScrollToPlugin !== 'undefined') gsap.registerPlugin(ScrollToPlugin);

    initBlogHero();
    initBlogSearch();
    initBlogFilter();
    initTrending();
    initTopicPills();
    initBlogNewsletter();
    initFeaturedTilt();

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

    window.addEventListener('pageshow', () => {
      const searchInput = qs('#blogSearchInput');
      const newsletterInput = qs('#blogNewsletterEmail');
      if (searchInput) searchInput.value = '';
      if (newsletterInput) newsletterInput.value = '';
    });
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