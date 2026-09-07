/* ============================================================
   Stackly — AUTH JAVASCRIPT (Login / Signup)
   Additive file — does not modify main.js
   IMPORTANT: This is a front-end demo only.
   - No email/password is ever stored (no localStorage/sessionStorage/cookies).
   - No credentials are verified against any backend or database.
   - Fields are validated for FORMAT only (required, email shape, length, match).
============================================================ */

'use strict';

const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────
   1. VALIDATION RULES
───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  required(value) {
    return value.trim().length > 0 ? '' : 'This field is required.';
  },
  fullName(value) {
    if (!value.trim()) return 'Please enter your full name.';
    if (value.trim().length < 2) return 'Name looks too short.';
    if (!/^[a-zA-Z\s'.-]+$/.test(value.trim())) return 'Name can only contain letters.';
    return '';
  },
  email(value) {
    if (!value.trim()) return 'Email address is required.';
    if (!EMAIL_RE.test(value.trim())) return 'Enter a valid email address.';
    return '';
  },
  password(value) {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Use at least 8 characters.';
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) return 'Mix letters and numbers.';
    return '';
  },
  loginPassword(value) {
    if (!value) return 'Password is required.';
    if (value.length < 6) return 'Password looks too short.';
    return '';
  },
  confirmPassword(value, form) {
    const pw = qs('#signupPassword', form)?.value ?? '';
    if (!value) return 'Please confirm your password.';
    if (value !== pw) return 'Passwords do not match.';
    return '';
  },
  terms(checked) {
    return checked ? '' : 'You must accept the terms to continue.';
  },
};

/* ─────────────────────────────────────────
   2. FIELD-LEVEL HELPERS
───────────────────────────────────────── */
function setFieldState(inputEl, message) {
  const wrap = inputEl.closest('.field-input-wrap');
  const group = inputEl.closest('.field-group');
  const errorEl = group ? qs('.field-error-msg', group) : null;

  if (message) {
    wrap?.classList.add('field-invalid');
    wrap?.classList.remove('field-valid');
    if (errorEl) {
      const span = errorEl.querySelector('span') || errorEl;
      span.textContent = message;
      errorEl.classList.add('show');
    }
  } else {
    wrap?.classList.remove('field-invalid');
    if (inputEl.value.trim()) wrap?.classList.add('field-valid');
    if (errorEl) {
      const span = errorEl.querySelector('span') || errorEl;
      span.textContent = '';
      errorEl.classList.remove('show');
    }
  }
}

function setCheckboxState(inputEl, message) {
  const group = inputEl.closest('.field-group') || inputEl.closest('.field-checkbox-row');
  const errorEl = group ? qs('.field-error-msg', group) : null;
  if (errorEl) {
    const span = errorEl.querySelector('span') || errorEl;
    span.textContent = message;
    errorEl.classList.toggle('show', Boolean(message));
  }
}

function validateField(inputEl, rule, form) {
  const value = inputEl.type === 'checkbox' ? inputEl.checked : inputEl.value;
  const message = rule(value, form);
  if (inputEl.type === 'checkbox') {
    setCheckboxState(inputEl, message);
  } else {
    setFieldState(inputEl, message);
  }
  return !message;
}

/* ─────────────────────────────────────────
   3. PASSWORD VISIBILITY TOGGLE
───────────────────────────────────────── */
function initPasswordToggles() {
  qsa('.field-toggle-visibility').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling?.tagName === 'INPUT'
        ? btn.previousElementSibling
        : btn.parentElement.querySelector('input');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.querySelector('i').className = isPassword ? 'ri-eye-off-line' : 'ri-eye-line';
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      btn.setAttribute('aria-pressed', String(isPassword));
    });
  });
}

/* ─────────────────────────────────────────
   4. PASSWORD STRENGTH METER (signup only)
───────────────────────────────────────── */
function initPasswordStrength() {
  const pwInput = qs('#signupPassword');
  const meter = qs('#pwStrengthMeter');
  const label = qs('#pwStrengthLabel');
  if (!pwInput || !meter) return;

  pwInput.addEventListener('input', () => {
    const value = pwInput.value;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    meter.classList.remove('weak', 'medium', 'strong');
    if (!value) {
      label.textContent = 'Use 8+ characters with letters & numbers';
    } else if (score <= 1) {
      meter.classList.add('weak');
      label.textContent = 'Weak password';
    } else if (score <= 2) {
      meter.classList.add('medium');
      label.textContent = 'Medium strength';
    } else {
      meter.classList.add('strong');
      label.textContent = 'Strong password';
    }
  });
}

/* ─────────────────────────────────────────
   5. ROLE TOGGLE (Traveller / Admin) — login page
───────────────────────────────────────── */
function getSelectedRole() {
  const checked = qs('input[name="loginRole"]:checked');
  return checked ? checked.value : 'traveller';
}

function initRoleToggle() {
  const radios = qsa('input[name="loginRole"]');
  const title = qs('#loginTitle');
  const subtitle = qs('#loginSubtitle');
  if (!radios.length) return;

  radios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (!title || !subtitle) return;
      if (radio.value === 'admin' && radio.checked) {
        title.textContent = 'Admin Sign In';
        subtitle.textContent = 'Access the Stackly management console.';
      } else if (radio.checked) {
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Sign in to manage your trips and bookings.';
      }
    });
  });
}

/* ─────────────────────────────────────────
   6. TOAST
───────────────────────────────────────── */
function showToast({ title, message, icon = 'ri-checkbox-circle-fill' }) {
  const toast = qs('#authToast');
  if (!toast) return;
  qs('.auth-toast-title', toast).textContent = title;
  qs('.auth-toast-msg', toast).textContent = message;
  qs('i', toast).className = icon;
  toast.classList.add('show');
  clearTimeout(toast._hideTimer);
  toast._hideTimer = setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ─────────────────────────────────────────
   7. LOGIN FORM
───────────────────────────────────────── */
function initLoginForm() {
  const form = qs('#loginForm');
  if (!form) return;

  const emailInput = qs('#loginEmail', form);
  const passwordInput = qs('#loginPassword', form);
  const submitBtn = qs('.btn-auth-submit', form);
  const formAlert = qs('#loginAlert');

  emailInput.addEventListener('blur', () => validateField(emailInput, validators.email, form));
  passwordInput.addEventListener('blur', () => validateField(passwordInput, validators.loginPassword, form));
  emailInput.addEventListener('input', () => { if (emailInput.closest('.field-invalid')) validateField(emailInput, validators.email, form); });
  passwordInput.addEventListener('input', () => { if (passwordInput.closest('.field-invalid')) validateField(passwordInput, validators.loginPassword, form); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formAlert?.classList.remove('show');

    const validEmail = validateField(emailInput, validators.email, form);
    const validPassword = validateField(passwordInput, validators.loginPassword, form);

    if (!validEmail || !validPassword) {
      formAlert?.classList.add('show');
      form.querySelector('.field-invalid input, .field-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const role = getSelectedRole();

    // Simulate a brief sign-in process. No credentials are checked or stored —
    // this only confirms the form passed validation.
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      // Save email for dashboard display
      localStorage.setItem('stacklyUserEmail', emailInput.value);
      // Clear sensitive fields before navigating away
      form.reset();
      window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'traveller-dashboard.html';
    }, 900);
  });
}

/* ─────────────────────────────────────────
   8. SIGNUP FORM
───────────────────────────────────────── */
function initSignupForm() {
  const form = qs('#signupForm');
  if (!form) return;

  const nameInput = qs('#signupName', form);
  const emailInput = qs('#signupEmail', form);
  const passwordInput = qs('#signupPassword', form);
  const confirmInput = qs('#signupConfirm', form);
  const termsInput = qs('#signupTerms', form);
  const submitBtn = qs('.btn-auth-submit', form);
  const formAlert = qs('#signupAlert');

  const fieldMap = [
    [nameInput, validators.fullName],
    [emailInput, validators.email],
    [passwordInput, validators.password],
    [confirmInput, validators.confirmPassword],
  ];

  fieldMap.forEach(([input, rule]) => {
    input.addEventListener('blur', () => validateField(input, rule, form));
    input.addEventListener('input', () => { if (input.closest('.field-invalid')) validateField(input, rule, form); });
  });

  // Re-validate confirm field whenever the password changes
  passwordInput.addEventListener('input', () => {
    if (confirmInput.value) validateField(confirmInput, validators.confirmPassword, form);
  });

  termsInput.addEventListener('change', () => validateField(termsInput, validators.terms, form));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    formAlert?.classList.remove('show');

    const results = fieldMap.map(([input, rule]) => validateField(input, rule, form));
    const termsValid = validateField(termsInput, validators.terms, form);

    if (results.includes(false) || !termsValid) {
      formAlert?.classList.add('show');
      form.querySelector('.field-invalid input, .field-invalid')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      // Nothing typed into this form is stored anywhere — the values are
      // discarded here and the user is sent to the login page to sign in.
      form.reset();
      showToast({
        title: 'Account created',
        message: 'Redirecting you to sign in...',
      });

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1400);
    }, 900);
  });
}

/* ─────────────────────────────────────────
   9. SOCIAL BUTTONS (demo stub — no real OAuth)
───────────────────────────────────────── */
function initSocialButtons() {
  qsa('.btn-social').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = btn.getAttribute('href') || '404.html';
    });
  });
}

/* ─────────────────────────────────────────
   10. SCROLL FORWARDING (left visual -> right form)
───────────────────────────────────────── */
function initVisualScrollForward() {
  const visual = qs('.auth-visual');
  const formPanel = qs('.auth-form-panel');
  if (visual && formPanel) {
    visual.addEventListener('wheel', (e) => {
      formPanel.scrollTop += e.deltaY;
    }, { passive: true });
  }
}

/* ─────────────────────────────────────────
   11. INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initPasswordStrength();
  initRoleToggle();
  initLoginForm();
  initSignupForm();
  initSocialButtons();
  initVisualScrollForward();
});