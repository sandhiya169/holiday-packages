/* ============================================================
   Stackly — 404 PAGE SCRIPT
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Log the missing path (useful for debugging broken links)
  console.warn('404 — page not found:', window.location.pathname);

  const goBackButton = document.querySelector('#goBackButton');
  goBackButton?.addEventListener('click', () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = 'index.html';
  });

  // Wire up the quick search box to jump to the packages section on the homepage
  const form = document.querySelector('.error-search');
  const input = form ? form.querySelector('input') : null;

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = input.value.trim();
      const target = query
        ? `index.html?search=${encodeURIComponent(query)}#packages`
        : 'index.html#packages';
      window.location.href = target;
    });
  }
});