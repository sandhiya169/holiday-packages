/* ============================================================
   Stackly — DASHBOARD JAVASCRIPT
   Additive file — does not modify main.js
   Shared by traveller-dashboard.html and admin-dashboard.html
   NOTE: Dashboards are accessible without logging in (demo/preview
   mode). "Logout" simply returns to the login page.
============================================================ */

'use strict';

const dqs = (sel, ctx = document) => ctx.querySelector(sel);
const dqsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─────────────────────────────────────────
   1. SIDEBAR NAVIGATION (switch dashboard pages)
───────────────────────────────────────── */
function initDashNav() {
  const navItems = dqsa('.dash-nav-item[data-target]');
  const pages = dqsa('.dash-page');
  const pageTitle = dqs('#dashPageTitle');
  const pageSubtitle = dqs('#dashPageSubtitle');

  if (!navItems.length) return;

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const targetPage = document.getElementById(targetId);
      if (!targetPage) return;

      navItems.forEach((n) => n.classList.remove('active'));
      item.classList.add('active');

      pages.forEach((p) => p.classList.remove('active'));
      targetPage.classList.add('active');

      if (pageTitle) pageTitle.textContent = item.dataset.title || item.textContent.trim();
      if (pageSubtitle) pageSubtitle.textContent = item.dataset.subtitle || '';

      closeMobileSidebar();
      dqs('.dash-content')?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────
   2. IN-PAGE SUB-TAB SWITCHING
───────────────────────────────────────── */
function initSubTabs() {
  // Each .dash-page can have its own independent subtab bar
  dqsa('.dash-subtab-bar').forEach((bar) => {
    const tabs = [...bar.querySelectorAll('.dash-subtab[data-subtab]')];

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        if (tab.classList.contains('active')) return;

        const targetId = tab.dataset.subtab;
        // Find the containing .dash-page to scope subpanel lookups
        const page = tab.closest('.dash-page');
        if (!page) return;

        // Deactivate all tabs in this bar
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Deactivate all subpanels in this page
        page.querySelectorAll('.dash-subpanel').forEach((p) => p.classList.remove('active'));

        // Activate the target subpanel
        const target = page.querySelector('#' + targetId);
        if (target) target.classList.add('active');
      });
    });
  });
}

/* ─────────────────────────────────────────
   3. MOBILE SIDEBAR DRAWER
───────────────────────────────────────── */
function openMobileSidebar() {
  dqs('.dash-sidebar')?.classList.add('open');
  dqs('.dash-overlay')?.classList.add('show');
  document.body.classList.add('mobile-open');
}

function closeMobileSidebar() {
  dqs('.dash-sidebar')?.classList.remove('open');
  dqs('.dash-overlay')?.classList.remove('show');
  document.body.classList.remove('mobile-open');
}

function initMobileSidebar() {
  dqs('#dashHamburger')?.addEventListener('click', openMobileSidebar);
  dqs('#dashSidebarClose')?.addEventListener('click', closeMobileSidebar);
  dqs('.dash-overlay')?.addEventListener('click', closeMobileSidebar);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileSidebar();
  });
}

/* ─────────────────────────────────────────
   4. INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initDashNav();
  initSubTabs();
  initMobileSidebar();
});

document.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('stacklyUserEmail');
  if (savedEmail) {
    document.querySelectorAll('.dash-user-email, .dash-topbar-email').forEach(el => {
      el.textContent = savedEmail;
    });
  }
});

