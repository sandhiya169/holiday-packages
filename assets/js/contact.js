/* ============================================================
   Stackly — CONTACT PAGE JAVASCRIPT
   Runs alongside assets/js/main.js (nav, cursor, back-to-top,
   AOS init, scroll progress, etc). This file only contains
   interactions specific to contact.html.
============================================================ */

'use strict';

(function () {

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────
     1. HERO PARALLAX (mirrors homepage hero)
  ───────────────────────────────────────── */
  function initContactHeroParallax() {
    const img = qs('.contact-hero-img');
    if (!img || prefersReducedMotion || typeof gsap === 'undefined') return;

    gsap.to(img, {
      yPercent: 18,
      scale: 1.4,
      transformOrigin: 'center bottom',
      ease: 'none',
      scrollTrigger: {
        trigger: '.contact-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  }

  /* ─────────────────────────────────────────
     2. CHIP BAR — idle float + magnetic hover
  ───────────────────────────────────────── */
  function initChipBar() {
    const chips = qsa('.contact-chip');
    if (!chips.length || typeof gsap === 'undefined') return;

    if (!prefersReducedMotion) {
      chips.forEach((chip, i) => {
        gsap.to(chip, {
          y: -6,
          duration: 2.2 + i * 0.2,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: i * 0.15,
        });
      });
    }

    // Skip magnetic pull on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    chips.forEach(chip => {
      chip.addEventListener('mousemove', (e) => {
        const rect = chip.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.12;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.12;
        gsap.to(chip, { x, y: y - 6, duration: 0.4, ease: 'power2.out' });
      });
      chip.addEventListener('mouseleave', () => {
        gsap.to(chip, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ─────────────────────────────────────────
     3. SUPPORT ICONS — scroll pop
  ───────────────────────────────────────── */
  function initSupportIcons() {
    const icons = qsa('.support-icon');
    if (!icons.length || prefersReducedMotion || typeof gsap === 'undefined') return;

    // NOTE: .support-item already has data-aos="fade-up" — AOS handles opacity.
    // Only animate the icon scale/rotate on top, same pattern as stat-icon in main.js.
    icons.forEach(icon => {
      ScrollTrigger.create({
        trigger: icon,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.fromTo(icon,
            { scale: 0, rotation: -25 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.6,
              ease: 'back.out(2.2)',
              clearProps: 'transform',
            }
          );
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     4. CONTACT FORM — validation + submit UX
  ───────────────────────────────────────── */
  function initContactForm() {
    const form = qs('#contactForm');
    if (!form) return;

    const nameField    = qs('#cName');
    const emailField   = qs('#cEmail');
    const messageField = qs('#cMessage');
    const consentField = qs('#cConsent');
    const submitBtn    = qs('#contactSubmitBtn');
    const success      = qs('#formSuccess');

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setInvalid(field, invalid) {
      const wrapper = field.closest('.form-field');
      if (!wrapper) return;
      wrapper.classList.toggle('field-invalid', invalid);
    }

    function shake(el) {
      if (typeof gsap === 'undefined') return;
      gsap.timeline()
        .to(el, { x: -6, duration: 0.06, ease: 'power2.out' })
        .to(el, { x: 6, duration: 0.06, ease: 'power2.inOut' })
        .to(el, { x: -6, duration: 0.06, ease: 'power2.inOut' })
        .to(el, { x: 6, duration: 0.06, ease: 'power2.inOut' })
        .to(el, { x: 0, duration: 0.06, ease: 'power2.in' });
    }

    // Clear error state as the visitor types/fixes a field
    [nameField, emailField, messageField].forEach(field => {
      if (!field) return;
      field.addEventListener('input', () => setInvalid(field, false));
    });
    consentField?.addEventListener('change', () => setInvalid(consentField, false));

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;

      if (!nameField.value.trim()) { setInvalid(nameField, true); valid = false; }
      if (!emailReg.test(emailField.value.trim())) { setInvalid(emailField, true); valid = false; }
      if (!messageField.value.trim()) { setInvalid(messageField, true); valid = false; }
      if (!consentField.checked) { setInvalid(consentField, true); valid = false; }

      if (!valid) {
        const firstInvalid = qs('.field-invalid', form);
        if (firstInvalid && typeof gsap !== 'undefined') shake(firstInvalid);
        firstInvalid?.querySelector('input, textarea, select')?.focus();
        return;
      }

      // Success feedback
      if (typeof gsap !== 'undefined') {
        gsap.to(submitBtn, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 });
      }

      success.classList.add('show');
      if (typeof gsap !== 'undefined') {
        gsap.from(success, { opacity: 0, y: 12, duration: 0.45, ease: 'power3.out' });
      }

      form.reset();
      form.querySelectorAll('input, select, textarea').forEach(field => {
        field.blur();
      });
      qsa('.form-field', form).forEach(f => f.classList.remove('field-invalid'));
      window.location.href = '404.html';

      setTimeout(() => {
        if (typeof gsap === 'undefined') { success.classList.remove('show'); return; }
        gsap.to(success, {
          opacity: 0, y: -10, duration: 0.35, ease: 'power2.in',
          onComplete: () => success.classList.remove('show'),
        });
      }, 6000);
    });

    // Subtle focus lift on fields (mirrors hero search-field micro-interaction)
    if (typeof gsap !== 'undefined') {
      qsa('.form-field input, .form-field select, .form-field textarea', form).forEach(input => {
        input.addEventListener('focus', () => {
          gsap.to(input, { y: -2, duration: 0.2, ease: 'power2.out' });
        });
        input.addEventListener('blur', () => {
          gsap.to(input, { y: 0, duration: 0.2, ease: 'power2.out' });
        });
      });
    }
  }

  /* ─────────────────────────────────────────
     5. MAP OVERLAY — pin pulse + entrance
  ───────────────────────────────────────── */
  function initMapPin() {
    const pin = qs('.map-pin-pulse');
    if (!pin || prefersReducedMotion || typeof gsap === 'undefined') return;

    gsap.to(pin, {
      scale: 1.15,
      duration: 1.1,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  /* ─────────────────────────────────────────
     6. FAQ ACCORDION
  ───────────────────────────────────────── */
  function initFaqAccordion() {
    const items = qsa('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const question = qs('.faq-question', item);
      const answer   = qs('.faq-answer', item);

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close any other open item (single-open accordion)
        items.forEach(other => {
          if (other === item) return;
          other.classList.remove('active');
          qs('.faq-question', other).setAttribute('aria-expanded', 'false');
          const otherAnswer = qs('.faq-answer', other);
          if (typeof gsap !== 'undefined') {
            gsap.to(otherAnswer, { height: 0, duration: 0.35, ease: 'power2.inOut' });
          } else {
            otherAnswer.style.height = '0px';
          }
        });

        if (isOpen) {
          item.classList.remove('active');
          question.setAttribute('aria-expanded', 'false');
          if (typeof gsap !== 'undefined') {
            gsap.to(answer, { height: 0, duration: 0.35, ease: 'power2.inOut' });
          } else {
            answer.style.height = '0px';
          }
        } else {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
          const target = answer.scrollHeight;
          if (typeof gsap !== 'undefined') {
            gsap.to(answer, { height: target, duration: 0.4, ease: 'power2.inOut' });
          } else {
            answer.style.height = target + 'px';
          }
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     7. LIVE CHAT CHIP — scroll to form + focus
  ───────────────────────────────────────── */
  function initLiveChatShortcut() {
    const chip = qs('#liveChatChip');
    const message = qs('#cMessage');
    if (!chip || !message) return;

    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const target = qs('#contact-form');
      const navbar = qs('#navbar');
      const offset = (navbar?.offsetHeight || 80) + 16;

      if (typeof gsap !== 'undefined' && gsap.plugins && gsap.plugins.scrollTo) {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: offset },
          duration: 1,
          ease: 'power3.inOut',
          onComplete: () => focusMessage(),
        });
      } else if (typeof gsap !== 'undefined') {
        gsap.to(window, {
          scrollTo: { y: target, offsetY: offset },
          duration: 1,
          ease: 'power3.inOut',
          onComplete: () => focusMessage(),
        });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
        focusMessage();
      }
    });

    function focusMessage() {
      message.focus();
      if (typeof gsap === 'undefined') return;
      gsap.fromTo(message,
        { boxShadow: '0 0 0 0 rgba(232,168,124,0)' },
        { boxShadow: '0 0 0 6px rgba(232,168,124,.28)', duration: 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }
      );
    }
  }

  /* ─────────────────────────────────────────
     8. CTA MAGNETIC BUTTONS
  ───────────────────────────────────────── */
  function initMagneticButtons() {
    const buttons = qsa('.cta-magnetic');
    if (!buttons.length || typeof gsap === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
        gsap.to(btn, { x, y, duration: 0.35, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  /* ─────────────────────────────────────────
     9. GLOBAL OFFICES TABS (CLEAN & SIMPLE)
  ───────────────────────────────────────── */
  function initCityTabs() {
    const tabBtns = qsa('.city-tab-btn');
    const panels = qsa('.office-city-panel');
    if (!tabBtns.length || !panels.length) return;

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('aria-controls');

        tabBtns.forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        panels.forEach(p => {
          p.classList.remove('active');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        const activePanel = document.getElementById(targetId);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     10. INFO PANEL GLOW — idle drift
  ───────────────────────────────────────── */
  function initGlowDrift() {
    const glow = qs('.info-panel-glow');
    if (!glow || prefersReducedMotion || typeof gsap === 'undefined') return;

    gsap.to(glow, {
      x: -30,
      y: 20,
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    });
  }

  /* ─────────────────────────────────────────
     11. INIT
  ───────────────────────────────────────── */
  function init() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);
    }

    initContactHeroParallax();
    initChipBar();
    initSupportIcons();
    initContactForm();
    initMapPin();
    initFaqAccordion();
    initLiveChatShortcut();
    initMagneticButtons();
    initCityTabs();
    initGlowDrift();

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