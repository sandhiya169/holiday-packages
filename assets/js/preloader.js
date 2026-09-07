/* ============================================================
   PRELOADER
   - Keeps the preloader on screen for a minimum of 1 second.
   - Blocks page scrolling while it is up.
   - Fires a global "preloaderDone" signal once it hides, so
     entrance animations (AOS, GSAP, custom reveals) only start
     AFTER the preloader disappears — instead of running silently
     underneath it and finishing before anyone sees them.
============================================================ */
(function () {
  var MIN_PRELOAD_TIME = 1000; // 1 second
  var FALLBACK_TIMEOUT = 6000; // safety net if 'load' never fires
  var startTime = Date.now();
  var html = document.documentElement;
  var hidden = false;

  html.classList.add('is-preloading');
  window.__preloaderDone = false;

  function hidePreloader() {
    if (hidden) return;
    hidden = true;

    var preloader = document.getElementById('preloader');

    // Unlock scrolling & flag that the page is ready
    html.classList.remove('is-preloading');
    html.classList.add('preloader-done');
    window.__preloaderDone = true;

    // Let every other script know it's safe to start entrance animations
    window.dispatchEvent(new CustomEvent('preloaderDone'));

    if (preloader) {
      preloader.classList.add('preloader--hidden');
      window.setTimeout(function () {
        if (preloader && preloader.parentNode) {
          preloader.parentNode.removeChild(preloader);
        }
      }, 500); // matches the CSS fade-out transition
    }
  }

  function onLoad() {
    var elapsed = Date.now() - startTime;
    var remaining = Math.max(MIN_PRELOAD_TIME - elapsed, 0);
    window.setTimeout(hidePreloader, remaining);
  }

  if (document.readyState === 'complete') {
    onLoad();
  } else {
    window.addEventListener('load', onLoad);
  }

  // Fallback: never leave the preloader (or the page) stuck
  window.setTimeout(hidePreloader, FALLBACK_TIMEOUT);
})();
