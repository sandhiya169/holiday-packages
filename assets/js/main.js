/* ============================================================
   Stackly — MAIN JAVASCRIPT
   GSAP + ScrollTrigger + AOS + Swiper + Custom Interactions
============================================================ */

'use strict';

/* ─────────────────────────────────────────
   1. GSAP PLUGIN REGISTRATION
───────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

/* ─────────────────────────────────────────
   2. UTILITY HELPERS
───────────────────────────────────────── */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────
   3. AOS — SCROLL REVEAL
───────────────────────────────────────── */
function initAOS() {
  AOS.init({
    duration: 750,
    easing: 'ease-out-cubic',
    once: true,
    offset: 60,
    disable: prefersReducedMotion ? true : false,
    anchorPlacement: 'top-bottom',
  });

  // On mobile, convert horizontal slide animations to simple fade-up
  // so they never push content off-screen
  if (window.innerWidth <= 768) {
    document.querySelectorAll('[data-aos="fade-left"], [data-aos="fade-right"]').forEach(el => {
      el.setAttribute('data-aos', 'fade-up');
    });
    AOS.refreshHard();
  }
}

/* ─────────────────────────────────────────
   4. CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
  // Skip on touch/coarse pointer devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = qs('#cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let activeTarget = null;
  const interactiveSelector = 'a, button, [role="button"], input, select, textarea, label, .package-card, .dest-card, .gallery-item, .filter-btn, .card-wishlist, .testi-prev, .testi-next';

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  (function animateCursor() {
    let targetX = mouseX;
    let targetY = mouseY;

    if (activeTarget) {
      const bounds = activeTarget.getBoundingClientRect();
      const distanceX = bounds.left + bounds.width / 2 - mouseX;
      const distanceY = bounds.top + bounds.height / 2 - mouseY;
      targetX = mouseX + distanceX * 0.18;
      targetY = mouseY + distanceY * 0.18;
    }

    cursorX += (targetX - cursorX) * 0.22;
    cursorY += (targetY - cursorY) * 0.22;
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    requestAnimationFrame(animateCursor);
  })();

  function onEnter(target) {
    activeTarget = target;
    cursor.classList.add('hover');
  }

  function onLeave() {
    activeTarget = null;
    cursor.classList.remove('hover');
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest(interactiveSelector);
    if (target) {
      onEnter(target);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (activeTarget && !activeTarget.contains(e.relatedTarget)) {
      onLeave();
    }
  });

  // Hide when pointer leaves the window
  document.addEventListener('mouseleave', () => {
    cursor.classList.add('hidden');
  });
  document.addEventListener('mouseenter', () => {
    cursor.classList.remove('hidden');
  });
}

/* ─────────────────────────────────────────
   5. NAVBAR
───────────────────────────────────────── */
function initNavbar() {
  const navbar = qs('#navbar');
  const hamburger = qs('#hamburger');
  const mobileMenu = qs('#mobileMenu');
  const mobileClose = qs('#mobileClose');
  const mobileLinks = qsa('.mobile-link');
  if (!navbar) return;

  // Scroll effect — always visible, only style changes
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  function openMenu() {
    mobileMenu.classList.add('open');
    document.documentElement.classList.add('mobile-open');
    document.body.classList.add('mobile-open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    // Animate links in
    gsap.fromTo('.mobile-link',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out', delay: 0.2 }
    );
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    document.documentElement.classList.remove('mobile-open');
    document.body.classList.remove('mobile-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  mobileClose?.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMenu();
  });

  // Smooth scroll for all anchor links
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = qs(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      gsap.to(window, {
        scrollTo: { y: target, offsetY: offset },
        duration: 1.1,
        ease: 'power3.inOut',
      });
    });
  });
}

/* ─────────────────────────────────────────
   6. HERO ANIMATIONS (CSS keyframes only)
───────────────────────────────────────── */
function initHeroAnimations() {
  // Only keep the parallax scroll effect — CSS handles entrance animations
  if (prefersReducedMotion) return;

  gsap.to('.hero-img', {
    yPercent: 25,
    scale: 1.4,
    transformOrigin: 'center bottom',
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });
}


/* Split hero title — disabled, CSS handles animation */
function splitHeroTitle() {
  // No-op: word splitting removed to prevent GSAP race condition
}

/* ─────────────────────────────────────────
   7. STATS COUNTER
───────────────────────────────────────── */
function initStatsCounter() {
  const statNumbers = qsa('.stat-number');
  if (!statNumbers.length) return;

  statNumbers.forEach(el => {
    const target = parseFloat(el.dataset.target);
    const decimal = el.dataset.decimal === 'true';

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(el,
          { textContent: 0 },
          {
            textContent: target,
            duration: 2.2,
            ease: 'power2.out',
            snap: decimal ? { textContent: 0.1 } : { textContent: 1 },
            onUpdate() {
              el.textContent = decimal
                ? parseFloat(el.textContent).toFixed(1)
                : Math.round(parseFloat(el.textContent)).toLocaleString();
            },
          }
        );

        // Animate icon
        const icon = el.closest('.stat-card')?.querySelector('.stat-icon');
        if (icon) {
          gsap.from(icon, {
            scale: 0,
            rotation: -20,
            duration: 0.6,
            ease: 'back.out(2)',
            delay: 0.2,
          });
        }
      },
    });
  });
}

/* ─────────────────────────────────────────
   8. PACKAGE CARD FILTER
───────────────────────────────────────── */
function initPackageFilter() {
  const filterBtns = qsa('.filter-btn');
  const cards = qsa('.package-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;

      // Animate cards out then back in
      const visible = filter === 'all'
        ? cards
        : cards.filter(c => c.dataset.category === filter);

      const hidden = cards.filter(c => !visible.includes(c));

      // Hide non-matching
      gsap.to(hidden, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          hidden.forEach(c => c.classList.add('hidden'));
          // Show matching
          visible.forEach(c => c.classList.remove('hidden'));
          gsap.fromTo(visible,
            { opacity: 0, y: 30, scale: 0.95 },
            { opacity: 1, y: 0, scale: 1, stagger: 0.08, duration: 0.45, ease: 'power3.out' }
          );
        }
      });

      if (!hidden.length) {
        // All cards already visible — just animate them
        gsap.fromTo(visible,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, ease: 'power3.out' }
        );
      }
    });
  });

  // Card wishlist toggle
  qsa('.card-wishlist').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (btn.classList.contains('active')) {
        icon.className = 'ri-heart-fill';
        gsap.fromTo(btn,
          { scale: 1 },
          { scale: 1.35, duration: 0.15, ease: 'power2.out', yoyo: true, repeat: 1 }
        );
      } else {
        icon.className = 'ri-heart-line';
      }
    });
  });
}

/* ─────────────────────────────────────────
   9. HOW IT WORKS — STAGGERED SCROLL REVEAL
───────────────────────────────────────── */
function initHowItWorks() {
  const cards = qsa('.hiw-card');
  if (!cards.length) return;

  if (prefersReducedMotion) return;

  // NOTE: .hiw-card elements already have data-aos="fade-up" — AOS handles reveal.
  // Only animate the connector arrows here (they don't have data-aos).
  const connectors = qsa('.hiw-connector');
  gsap.from(connectors, {
    opacity: 0,
    x: -20,
    stagger: 0.15,
    duration: 0.5,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.hiw-grid',
      start: 'top 75%',
    }
  });
}

/* ─────────────────────────────────────────
   10. DESTINATIONS — BENTO HOVER TILT
───────────────────────────────────────── */
function initDestinations() {
  const destCards = qsa('.dest-card');

  // Hover tilt (desktop only)
  if (!window.matchMedia('(pointer: coarse)').matches) {
    destCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        gsap.to(card, {
          rotateY: x * 8,
          rotateX: -y * 8,
          transformPerspective: 800,
          ease: 'power2.out',
          duration: 0.4,
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0, rotateX: 0,
          duration: 0.5,
          ease: 'power3.out',
        });
      });
    });
  }

  // NOTE: .destinations-bento already has data-aos="fade-up" on its wrapper
  // in the HTML, so AOS handles the scroll reveal. No GSAP entrance needed.
}

/* ─────────────────────────────────────────
   11. WHY US — PARALLAX IMAGE + REVEAL
───────────────────────────────────────── */
function initWhyUs() {
  if (prefersReducedMotion) return;

  // Floating card subtle bounce
  const floatCard = qs('.why-us-card-float');
  if (floatCard) {
    gsap.to(floatCard, {
      y: -10,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  // Scroll parallax on image
  gsap.to('.why-us-image img', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.why-us',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    }
  });

  // Feature items stagger — NOTE: only animate x (slide-in), NOT opacity.
  // The parent .why-us-content has data-aos="fade-left" which manages opacity.
  // Adding opacity:0 here would fight AOS and keep children invisible.
  gsap.from('.why-feature', {
    x: -30,
    stagger: 0.12,
    duration: 0.65,
    ease: 'power3.out',
    clearProps: 'x',
    scrollTrigger: {
      trigger: '.why-us-features',
      start: 'top 82%',
    }
  });
}

/* ─────────────────────────────────────────
   12. TESTIMONIALS — SWIPER
───────────────────────────────────────── */
function initTestimonialsSwiper() {
  const el = qs('.testimonials-swiper');
  if (!el) return;

  new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,
    autoplay: {
      delay: 5500,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    pagination: {
      el: '.testi-pagination',
      clickable: true,
    },
    navigation: {
      prevEl: '.testi-prev',
      nextEl: '.testi-next',
    },
    breakpoints: {
      640: { slidesPerView: 1.2, spaceBetween: 20 },
      900: { slidesPerView: 2, spaceBetween: 24 },
      1200: { slidesPerView: 3, spaceBetween: 28 },
    },
    keyboard: { enabled: true },
    a11y: {
      prevSlideMessage: 'Previous testimonial',
      nextSlideMessage: 'Next testimonial',
    },
    effect: 'slide',
    grabCursor: true,
  });
}

/* ─────────────────────────────────────────
   13. GALLERY LIGHTBOX
───────────────────────────────────────── */
function initGallery() {
  const items = qsa('.gallery-item');
  const lightbox = qs('#lightbox');
  const lbImg = qs('#lightboxImg');
  const lbClose = qs('#lightboxClose');
  const lbPrev = qs('#lightboxPrev');
  const lbNext = qs('#lightboxNext');
  if (!lightbox || !lbImg) return;

  let currentIndex = 0;
  const images = items.map(item => {
    const img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  function openLightbox(index) {
    currentIndex = index;
    lbImg.src = images[index].src;
    lbImg.alt = images[index].alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightbox.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    gsap.fromTo(lbImg,
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    );
    lbImg.src = images[currentIndex].src;
    lbImg.alt = images[currentIndex].alt;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    gsap.fromTo(lbImg,
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
    );
    lbImg.src = images[currentIndex].src;
    lbImg.alt = images[currentIndex].alt;
  }

  items.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(index);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  // Close on background click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });

  // Swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? showNext() : showPrev();
  });
}

/* ─────────────────────────────────────────
   14. NEWSLETTER FORM
───────────────────────────────────────── */
function initNewsletter() {
  const form = qs('#newsletterForm');
  const emailEl = qs('#newsletterEmail');
  const success = qs('#newsletterSuccess');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailEl.value.trim();
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailReg.test(email)) {
      // Shake animation via keyframes
      gsap.timeline()
        .to(emailEl, { x: -8, duration: 0.07, ease: 'power2.out' })
        .to(emailEl, { x: 8, duration: 0.07, ease: 'power2.inOut' })
        .to(emailEl, { x: -8, duration: 0.07, ease: 'power2.inOut' })
        .to(emailEl, { x: 8, duration: 0.07, ease: 'power2.inOut' })
        .to(emailEl, { x: 0, duration: 0.07, ease: 'power2.in' });
      emailEl.focus();
      return;
    }

    // Success state
    const btn = form.querySelector('.btn-gold');
    gsap.to(btn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
    success.classList.add('show');
    emailEl.value = '';
    gsap.from(success, { opacity: 0, y: 10, duration: 0.4, ease: 'power3.out' });

    // Hide success after 5s
    setTimeout(() => {
      gsap.to(success, {
        opacity: 0, y: -10, duration: 0.35, ease: 'power2.in',
        onComplete: () => success.classList.remove('show'),
      });
    }, 5000);
  });
}

/* ─────────────────────────────────────────
   15. BACK TO TOP
───────────────────────────────────────── */
function initBackToTop() {
  const btn = qs('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    gsap.to(window, { scrollTo: 0, duration: 1.2, ease: 'power3.inOut' });
  });
}

/* ─────────────────────────────────────────
   16. SCROLLTRIGGER — SECTION TRANSITIONS
───────────────────────────────────────── */
function initScrollTriggerAnimations() {
  if (prefersReducedMotion) return;

  // NOTE: .stats section background must always remain visible — do NOT animate
  // the whole section opacity. The stat-card elements use data-aos individually.

  // NOTE: .package-card, .section-header, .dest-card, .trust-logo already have
  // data-aos attributes on them in the HTML, so AOS handles their reveal.
  // Adding a second GSAP animation on top causes conflicts and can keep elements
  // permanently invisible. Only use GSAP here for elements WITHOUT data-aos.

  // Newsletter section — background zoom parallax (no data-aos on this)
  gsap.from('.newsletter-bg img', {
    scale: 1.15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.newsletter',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  // Footer fade in (footer columns have no data-aos)
  gsap.from('.footer-grid > *', {
    opacity: 0,
    y: 30,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
    clearProps: 'all',
    scrollTrigger: {
      trigger: '.footer-grid',
      start: 'top 95%',
      once: true,
    }
  });
}

/* ─────────────────────────────────────────
   17. SEARCH BAR — MICRO INTERACTIONS
───────────────────────────────────────── */
function initSearchBar() {
  const searchFields = qsa('.search-field');
  const searchBtn = qs('.search-btn');

  searchFields.forEach(field => {
    const input = field.querySelector('input, select');
    if (!input) return;

    input.addEventListener('focus', () => {
      gsap.to(field, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
    });
    input.addEventListener('blur', () => {
      gsap.to(field, { scale: 1, duration: 0.2, ease: 'power2.out' });
    });
  });

  searchBtn?.addEventListener('click', () => {
    gsap.fromTo(searchBtn,
      { scale: 1 },
      { scale: 0.93, duration: 0.1, ease: 'power2.in', yoyo: true, repeat: 1 }
    );
    // Visual feedback
    const icon = searchBtn.querySelector('i');
    gsap.to(icon, { rotation: 360, duration: 0.5, ease: 'power2.inOut' });
    setTimeout(() => gsap.set(icon, { rotation: 0 }), 600);
  });
}

/* ─────────────────────────────────────────
   18. PACKAGE CARD — HOVER TILT
───────────────────────────────────────── */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  qsa('.package-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
      gsap.to(card, {
        rotateY: x * 5,
        rotateX: -y * 5,
        transformPerspective: 900,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateY: 0, rotateX: 0,
        duration: 0.5, ease: 'power3.out',
      });
    });
  });
}

/* ─────────────────────────────────────────
   19. SCROLL PROGRESS BAR
───────────────────────────────────────── */
function initScrollProgress() {
  // Create progress bar element
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #E8A87C, #2A7B6F);
    z-index: 9999;
    transition: width 0.1s linear;
    border-radius: 0 2px 2px 0;
    pointer-events: none;
  `;
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Page scroll progress');
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (scrolled / docHeight) * 100;
    bar.style.width = `${pct}%`;
  }, { passive: true });
}

/* ─────────────────────────────────────────
   20. ACTIVE NAV LINK — PAGE-BASED
───────────────────────────────────────── */
function initActiveNavLinks() {
  const navLinks = qsa('.nav-link');
  const mobileLinks = qsa('.mobile-link');
  const allLinks = [...navLinks, ...mobileLinks];
  if (!allLinks.length) return;

  // Get current page filename e.g. "index.html" or "" / "/"
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  allLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';

    if (linkPage === page) {
      link.classList.add('active-link');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active-link');
      link.removeAttribute('aria-current');
    }
  });
}

/* ─────────────────────────────────────────
   21. LAZY IMAGE FADE-IN
───────────────────────────────────────── */
function initLazyImages() {
  const lazyImgs = qsa('img[loading="lazy"]');

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.addEventListener('load', () => {
        gsap.from(img, { opacity: 0, scale: 1.03, duration: 0.6, ease: 'power2.out' });
      }, { once: true });
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });

  lazyImgs.forEach(img => io.observe(img));
}

/* ─────────────────────────────────────────
   22. PACKAGE CARD — PRICE RIPPLE
───────────────────────────────────────── */
function initPriceHighlight() {
  qsa('.price-amount').forEach(price => {
    ScrollTrigger.create({
      trigger: price,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        gsap.fromTo(price,
          { color: '#2A7B6F' },
          { color: '#1A1A2E', duration: 1.2, ease: 'power2.out', delay: 0.3 }
        );
      }
    });
  });
}

/* ─────────────────────────────────────────
   23. INIT ON DOM READY
───────────────────────────────────────── */
function init() {
  // Order matters for some
  splitHeroTitle();
  initAOS();
  initCursor();
  initNavbar();
  initHeroAnimations();
  initStatsCounter();
  initPackageFilter();
  initHowItWorks();
  initDestinations();
  initWhyUs();
  initTestimonialsSwiper();
  initGallery();
  initNewsletter();
  initBackToTop();
  initScrollTriggerAnimations();
  initSearchBar();
  initCardTilt();
  initScrollProgress();
  initActiveNavLinks();
  initLazyImages();
  initPriceHighlight();

  // Refresh ScrollTrigger after all images load
  function refreshScrollTrigger() {
    ScrollTrigger.refresh();
    // Small delay to account for any layout shifts
    setTimeout(() => ScrollTrigger.refresh(), 500);
  }
  if (document.readyState === 'complete') {
    refreshScrollTrigger();
  } else {
    window.addEventListener('load', refreshScrollTrigger);
  }

  // Re-refresh on bfcache restore (back/forward navigation)
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      setTimeout(() => {
        ScrollTrigger.refresh(true);
      }, 100);
    }
  });
}

// Wait for the preloader to finish (minimum 1s) before running any
// entrance animations — otherwise AOS/GSAP animate in silently underneath
// the preloader and are already finished by the time it disappears.
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
