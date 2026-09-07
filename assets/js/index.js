/* ============================================================
   Stackly — INDEX PAGE JAVASCRIPT
   Handles: Package filter, Testimonial switcher,
            Destination row keyboard nav, Newsletter,
            Gallery lightbox, Stats ticker counter
============================================================ */

'use strict';

/* ─────────────────────────────────────────
   EARLY NEWSLETTER RESET
   Runs on DOMContentLoaded — before the preloader
   fires — to restore the submit button if the user
   returns from the 404-page redirect.
───────────────────────────────────────── */
function earlyNewsletterReset() {
  if (sessionStorage.getItem('nlRedirected') !== '1') return;
  sessionStorage.removeItem('nlRedirected');

  const form      = document.getElementById('newsletterForm');
  const submitBtn = document.getElementById('newsletterSubmit');
  const nameEl    = document.getElementById('newsletterName');
  const emailEl   = document.getElementById('newsletterEmail');

  /* reset form fields */
  if (form)    form.reset();
  if (nameEl)  nameEl.value  = '';
  if (emailEl) emailEl.value = '';

  /* restore button to its original state */
  if (submitBtn) {
    submitBtn.disabled = false;
    const btnText = submitBtn.querySelector('.nl-btn-text');
    const btnIcon = submitBtn.querySelector('.nl-btn-icon');
    if (btnText) btnText.textContent = 'Subscribe Now';
    if (btnIcon) btnIcon.className   = 'ri-arrow-right-line nl-btn-icon';
    submitBtn.style.opacity    = '';
    submitBtn.style.transform  = '';
    submitBtn.style.cursor     = '';
  }

  /* clear any leftover validation classes */
  document.getElementById('nlNameGroup')?.classList.remove('is-error','is-valid');
  document.getElementById('nlEmailGroup')?.classList.remove('is-error','is-valid');
  const nameErr  = document.getElementById('nlNameError');
  const emailErr = document.getElementById('nlEmailError');
  if (nameErr)  nameErr.textContent  = '';
  if (emailErr) emailErr.textContent = '';
}

/* ─────────────────────────────────────────
   PACKAGE SHOWCASE FILTER
───────────────────────────────────────── */
function initPkgFilter() {
  const filterBtns = document.querySelectorAll('.pkg-filter-btn');
  const rows       = document.querySelectorAll('.pkg-row');
  if (!filterBtns.length) return;

  // Strip AOS from filterable rows so GSAP fully controls them
  // (prevents conflict between AOS once:true state and GSAP inline styles)
  rows.forEach(row => {
    row.removeAttribute('data-aos');
    row.removeAttribute('data-aos-delay');
    row.style.opacity = '';
    row.style.transform = '';
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Active state
      filterBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const filter = btn.dataset.filter;
      let visibleIndex = 0;

      rows.forEach(row => {
        const match = filter === 'all' || row.dataset.category === filter;

        if (match) {
          row.classList.remove('hidden-row');
          gsap.fromTo(row,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out',
              delay: 0.05 * visibleIndex,
              clearProps: 'opacity,transform' }
          );
          visibleIndex++;
        } else {
          gsap.to(row, {
            opacity: 0, y: 16, duration: 0.3, ease: 'power2.in',
            onComplete: () => {
              row.classList.add('hidden-row');
              // Clear inline styles so the row is clean when shown again
              row.style.opacity = '';
              row.style.transform = '';
            }
          });
        }
      });

      // Refresh AOS for all sections below so their scroll animations still fire
      if (typeof AOS !== 'undefined') {
        setTimeout(() => AOS.refresh(), 400);
      }
    });
  });

  // Wishlist toggle
  document.querySelectorAll('.pkg-wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      icon.className = btn.classList.contains('active') ? 'ri-heart-fill' : 'ri-heart-line';
      gsap.fromTo(btn,
        { scale: 1 },
        { scale: 1.35, duration: 0.14, ease: 'power2.out', yoyo: true, repeat: 1 }
      );
    });
  });
}

/* ─────────────────────────────────────────
   TESTIMONIAL SWITCHER
───────────────────────────────────────── */
function initTestiSwitcher() {
  const navItems = document.querySelectorAll('.testi-v2-nav-item');
  const panels   = document.querySelectorAll('.testi-v2-panel');
  if (!navItems.length) return;

  let autoTimer = null;
  let current   = 0;

  function switchTo(index) {
    // Nav
    navItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
      item.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });

    // Panel
    panels.forEach((panel, i) => {
      if (i === index) {
        panel.classList.add('active');
        gsap.fromTo(panel,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );
      } else {
        panel.classList.remove('active');
      }
    });

    current = index;
  }

  navItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      clearInterval(autoTimer);
      switchTo(i);
      // Restart auto-rotate after manual interaction
      startAuto();
    });
  });

  function startAuto() {
    autoTimer = setInterval(() => {
      const next = (current + 1) % navItems.length;
      switchTo(next);
    }, 6000);
  }

  startAuto();
}

/* ─────────────────────────────────────────
   DESTINATION ROWS — keyboard + click nav
───────────────────────────────────────── */
function initDestRows() {
  const rows = document.querySelectorAll('.dest-v2-row');

  rows.forEach(row => {
    // Keyboard activation
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });

    // Click — could link to services page in future
    row.addEventListener('click', () => {
      gsap.fromTo(row,
        { backgroundColor: 'rgba(42,123,111,0.06)' },
        { backgroundColor: 'rgba(42,123,111,0)', duration: 0.6, ease: 'power2.out' }
      );
    });
  });
}

/* ─────────────────────────────────────────
   NEWSLETTER FORM — validation + redirect
───────────────────────────────────────── */
function initNewsletterV2() {
  const form      = document.getElementById('newsletterForm');
  const nameEl    = document.getElementById('newsletterName');
  const emailEl   = document.getElementById('newsletterEmail');
  const submitBtn = document.getElementById('newsletterSubmit');
  if (!form || !nameEl || !emailEl) return;

  const nameGroup  = document.getElementById('nlNameGroup');
  const emailGroup = document.getElementById('nlEmailGroup');
  const nameErr    = document.getElementById('nlNameError');
  const emailErr   = document.getElementById('nlEmailError');

  /* ── helpers ── */
  function setError(group, errEl, msg) {
    group.classList.add('is-error');
    group.classList.remove('is-valid');
    errEl.textContent = msg;
  }

  function setValid(group, errEl) {
    group.classList.remove('is-error');
    group.classList.add('is-valid');
    errEl.textContent = '';
  }

  function clearField(group, errEl) {
    group.classList.remove('is-error', 'is-valid');
    errEl.textContent = '';
  }

  function validateName(val) {
    if (!val) return 'Full name is required.';
    if (val.length < 2) return 'Name must be at least 2 characters.';
    if (!/^[a-zA-Z\s.'-]+$/.test(val)) return 'Name can only contain letters, spaces, hyphens, and apostrophes.';
    return '';
  }

  function validateEmail(val) {
    if (!val) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return 'Please enter a valid email address.';
    return '';
  }

  /* ── live validation on blur ── */
  nameEl.addEventListener('blur', () => {
    const err = validateName(nameEl.value.trim());
    err ? setError(nameGroup, nameErr, err) : setValid(nameGroup, nameErr);
  });

  emailEl.addEventListener('blur', () => {
    const err = validateEmail(emailEl.value.trim());
    err ? setError(emailGroup, emailErr, err) : setValid(emailGroup, emailErr);
  });

  /* ── clear on input ── */
  nameEl.addEventListener('input', () => {
    if (nameGroup.classList.contains('is-error')) clearField(nameGroup, nameErr);
  });

  emailEl.addEventListener('input', () => {
    if (emailGroup.classList.contains('is-error')) clearField(emailGroup, emailErr);
  });

  /* ── submit ── */
  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameVal  = nameEl.value.trim();
    const emailVal = emailEl.value.trim();
    const nErr     = validateName(nameVal);
    const eErr     = validateEmail(emailVal);

    /* apply validation state to both fields */
    nErr ? setError(nameGroup, nameErr, nErr) : setValid(nameGroup, nameErr);
    eErr ? setError(emailGroup, emailErr, eErr) : setValid(emailGroup, emailErr);

    if (nErr || eErr) {
      /* shake the form card */
      if (typeof gsap !== 'undefined') {
        gsap.timeline()
          .to('.newsletter-v2-right', { x: -8, duration: 0.06, ease: 'power2.out' })
          .to('.newsletter-v2-right', { x:  8, duration: 0.06 })
          .to('.newsletter-v2-right', { x: -6, duration: 0.06 })
          .to('.newsletter-v2-right', { x:  6, duration: 0.06 })
          .to('.newsletter-v2-right', { x:  0, duration: 0.06, ease: 'power2.in' });
      }
      /* focus first invalid field */
      (nErr ? nameEl : emailEl).focus();
      return;
    }

    /* ── valid — animate button then redirect ── */
    if (submitBtn) {
      submitBtn.disabled = true;
      const btnText = submitBtn.querySelector('.nl-btn-text');
      const btnIcon = submitBtn.querySelector('.nl-btn-icon');
      if (btnText) btnText.textContent = 'Subscribing…';
      if (btnIcon) btnIcon.className = 'ri-loader-4-line nl-btn-icon';
      if (typeof gsap !== 'undefined') {
        gsap.to(submitBtn, { scale: 0.97, duration: 0.12, yoyo: true, repeat: 1 });
      }
    }

    /* clear fields right before redirect so they're blank on return */
    form.reset();
    clearField(nameGroup,  nameErr);
    clearField(emailGroup, emailErr);

    /* flag so we can reset button state on return */
    sessionStorage.setItem('nlRedirected', '1');

    setTimeout(() => { window.location.href = '404.html'; }, 600);
  });
}

/* ─────────────────────────────────────────
   GALLERY LIGHTBOX (magazine grid)
───────────────────────────────────────── */
function initGalleryV2() {
  const items    = document.querySelectorAll('.gal-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lightboxImg');
  const lbClose  = document.getElementById('lightboxClose');
  const lbPrev   = document.getElementById('lightboxPrev');
  const lbNext   = document.getElementById('lightboxNext');
  if (!lightbox) return;

  const images = [...items].map(item => {
    const img = item.querySelector('img');
    return { src: img.src, alt: img.alt };
  });

  let idx = 0;

  const open = i => {
    idx = i;
    lbImg.src = images[i].src;
    lbImg.alt = images[i].alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    gsap.fromTo(lbImg, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out' });
  };

  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };

  const next = () => {
    idx = (idx + 1) % images.length;
    gsap.fromTo(lbImg, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    lbImg.src = images[idx].src;
    lbImg.alt = images[idx].alt;
  };

  const prev = () => {
    idx = (idx - 1 + images.length) % images.length;
    gsap.fromTo(lbImg, { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' });
    lbImg.src = images[idx].src;
    lbImg.alt = images[idx].alt;
  };

  items.forEach((item, i) => {
    item.addEventListener('click',   () => open(i));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(i); });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click',  prev);
  lbNext.addEventListener('click',  next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft')  prev();
  });

  // Touch swipe
  let touchX = 0;
  lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });
}

/* ─────────────────────────────────────────
   TICKER COUNTER (runs once visible)
───────────────────────────────────────── */
function initTickerCounters() {
  const nums = document.querySelectorAll('.ticker-num[data-target]');
  if (!nums.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el      = entry.target;
      const target  = parseFloat(el.dataset.target);
      const decimal = el.dataset.decimal === 'true';

      gsap.fromTo(el,
        { textContent: 0 },
        {
          textContent: target,
          duration: 2,
          ease: 'power2.out',
          snap: decimal ? { textContent: 0.1 } : { textContent: 1 },
          onUpdate() {
            el.textContent = decimal
              ? parseFloat(el.textContent).toFixed(1)
              : Math.round(parseFloat(el.textContent)).toLocaleString();
          },
          onComplete() {
            el.textContent = decimal ? target.toFixed(1) : target.toLocaleString();
          }
        }
      );

      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  nums.forEach(n => io.observe(n));
}

/* ─────────────────────────────────────────
   HERO PARALLAX (right images)
───────────────────────────────────────── */
function initHeroV2Parallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.to('.hero-v2-img-top img', {
    yPercent: 15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-v2',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });

  gsap.to('.hero-v2-img-bottom img', {
    yPercent: -15,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero-v2',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5,
    }
  });
}

/* ─────────────────────────────────────────
   HERO TEXT ENTRANCE + SEARCH VALIDATION
───────────────────────────────────────── */
function initHeroV2Intro() {
  const revealItems = document.querySelectorAll('[data-hero-reveal], .hero-v2-tag, .hero-v2-search, .hero-v2-trust, .hero-v2-scroll');
  if (revealItems.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.fromTo(revealItems,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: .7, stagger: .12, delay: .15, ease: 'power3.out' }
    );
  }

  const form = document.getElementById('heroSearchForm');
  const destination = document.getElementById('heroDestination');
  const date = document.getElementById('heroDate');
  const error = document.getElementById('heroSearchError');
  if (!form || !destination || !date) return;

  const clearError = () => {
    form.classList.remove('is-invalid');
    if (error) error.classList.remove('visible');
  };

  const resetSearch = () => {
    form.reset();
    clearError();
  };

  resetSearch();
  window.addEventListener('pageshow', resetSearch);

  [destination, date].forEach(field => field.addEventListener('input', clearError));

  form.addEventListener('submit', event => {
    event.preventDefault();
    const destinationValue = destination.value.trim();
    const dateValue = date.value;
    const today = new Date().toISOString().split('T')[0];

    if (!destinationValue || !dateValue || dateValue < today) {
      form.classList.add('is-invalid');
      if (error) {
        error.textContent = !destinationValue
          ? 'Please enter a destination.'
          : !dateValue
            ? 'Please choose a travel date.'
            : 'Please choose a future travel date.';
        error.classList.add('visible');
      }
      destinationValue ? date.focus() : destination.focus();
      if (typeof gsap !== 'undefined') {
        gsap.timeline()
          .to(form, { x: -7, duration: .05 })
          .to(form, { x: 7, duration: .05 })
          .to(form, { x: 0, duration: .05 });
      }
      return;
    }

    resetSearch();
    window.location.href = '404.html';
  });
}

/* ─────────────────────────────────────────
   WHY-V2 BADGE FLOAT
───────────────────────────────────────── */
function initWhyV2Badges() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const b1 = document.querySelector('.why-v2-badge-1');
  const b2 = document.querySelector('.why-v2-badge-2');

  if (b1) gsap.to(b1, { y: -10, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true });
  if (b2) gsap.to(b2, { y:  10, duration: 3.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 0.5 });
}

/* ─────────────────────────────────────────
   BOOT
───────────────────────────────────────── */
function initIndex() {
  initPkgFilter();
  initTestiSwitcher();
  initDestRows();
  initNewsletterV2();
  initGalleryV2();
  initTickerCounters();
  initHeroV2Parallax();
  initHeroV2Intro();
  initWhyV2Badges();
}

// Wait for preloader (same pattern as main.js)
function bootIndex() {
  if (window.__preloaderDone) {
    initIndex();
  } else {
    window.addEventListener('preloaderDone', initIndex, { once: true });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    earlyNewsletterReset();
    bootIndex();
  });
} else {
  earlyNewsletterReset();
  bootIndex();
}

/* bfcache restore — fires when browser back/forward restores a cached page */
window.addEventListener('pageshow', (e) => {
  if (e.persisted) earlyNewsletterReset();
});
