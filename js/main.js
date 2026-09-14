// 0. Theme Manager (Light / Dark with subtle Bitnomial-inspired orange accents)
(() => {
  const STORAGE_KEY = 'magnet_search_theme';
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Toggle Switches (Desktop & Mobile)
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  const updateToggleLabels = (currentTheme) => {
    themeToggles.forEach(btn => {
      const isLight = currentTheme === 'light';
      btn.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
      btn.setAttribute('title', isLight ? 'Switch to dark theme' : 'Switch to light theme');
    });
  };

  const initialTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateToggleLabels(initialTheme);

  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', nextTheme);
      try {
        localStorage.setItem('magnet_search_theme', nextTheme);
      } catch (e) {
        // Ignore localStorage errors in private browsing
      }
      updateToggleLabels(nextTheme);
    });
  });

  // 2. Mobile Navigation Toggle
  const navToggle = document.querySelector('.mobile-nav-toggle');
  const navDrawer = document.querySelector('.mobile-nav-drawer');

  if (navToggle && navDrawer) {
    navToggle.addEventListener('click', () => {
      const isOpen = navDrawer.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    const mobileLinks = navDrawer.querySelectorAll('.nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        navDrawer.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = '';
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
        navDrawer.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open navigation menu');
        document.body.style.overflow = '';
        navToggle.focus();
      }
    });
  }

  // 2. Button interactions and clean focus handling (clean and stable)
  // Removed artificial glyph scrambling for a solid, human-crafted experience

  // 3. Scroll Reveal & Progressive Line Draw via IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal');
  const lineDrawElements = document.querySelectorAll('.line-draw');

  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
    lineDrawElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
    lineDrawElements.forEach(el => el.classList.add('active'));
  }
});
