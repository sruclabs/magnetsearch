/* Magnet Search — interactions. Plain JS, no dependencies. */
(function () {
  'use strict';

  /* 0. Theme — restore saved choice, else follow the OS (light wins ties) */
  var root = document.documentElement;
  var KEY = 'magnet_search_theme';
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      root.setAttribute('data-theme', 'light');
    }
  } catch (err) { /* private mode — fall through to default dark */ }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Theme toggles */
  var toggles = document.querySelectorAll('.theme-toggle-btn');
  function paintToggles(theme) {
    var light = theme === 'light';
    toggles.forEach(function (btn) {
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      btn.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    });
  }
  paintToggles(root.getAttribute('data-theme') || 'dark');
  toggles.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var next = (root.getAttribute('data-theme') || 'dark') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (err) { /* ignore */ }
      paintToggles(next);
    });
  });

  /* 2. Mobile drawer */
  var navToggle = document.querySelector('.mobile-nav-toggle');
  var drawer = document.querySelector('.mobile-nav-drawer');
  function setDrawer(open) {
    if (!navToggle || !drawer) return;
    drawer.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (navToggle && drawer) {
    navToggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('open'));
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        setDrawer(false);
        navToggle.focus();
      }
    });
    /* resizing to desktop with the drawer open must not strand it */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 820 && drawer.classList.contains('open')) setDrawer(false);
    });
  }

  /* 3. Reveal on scroll, cascaded within groups */
  var items = document.querySelectorAll('.reveal');
  var groups = new Map();
  items.forEach(function (el) {
    var key = el.parentElement;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });
  groups.forEach(function (group) {
    if (group.length < 2) return;
    group.forEach(function (el, i) {
      el.style.setProperty('--reveal-delay', Math.min(i, 5) * 60 + 'ms');
    });
  });
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* 4. Contact form (Web3Forms) with honest status feedback */
  var form = document.querySelector('[data-contact-form]');
  if (form) {
    var statusEl = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var originalLabel = submitBtn ? submitBtn.innerHTML : '';
    if (statusEl) statusEl.setAttribute('tabindex', '-1');

    var setStatus = function (msg, state) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.hidden = false;
      if (state) statusEl.setAttribute('data-state', state);
      else statusEl.removeAttribute('data-state');
      if (state === 'success' || state === 'error') {
        statusEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        statusEl.focus({ preventScroll: true });
      }
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      /* honeypot filled — bot: feign success, send nothing */
      if (form.botcheck && form.botcheck.value) {
        form.reset();
        setStatus('Thanks — your message was sent.', 'success');
        return;
      }
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';
      }
      setStatus('Sending…');

      var clean = function (v, max) {
        return (v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);
      };
      var name = clean(form.querySelector('#contact-name') && form.querySelector('#contact-name').value, 80);
      var email = clean(form.querySelector('#contact-email') && form.querySelector('#contact-email').value, 120);
      var topic = clean(form.querySelector('#contact-topic') && form.querySelector('#contact-topic').value, 60);
      var subject = form.querySelector('input[name="subject"]');
      var fromName = form.querySelector('input[name="from_name"]');
      var replyTo = form.querySelector('input[name="replyto"]');
      if (subject && name) subject.value = ('[Magnet Search] ' + (topic || 'Message') + ' — ' + name).slice(0, 140);
      if (fromName && name) fromName.value = name;
      if (replyTo && email) replyTo.value = email;

      fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok, data: data };
        });
      }).then(function (out) {
        if (out.ok && out.data.success) {
          form.reset();
          setStatus('Thanks — your message was sent.', 'success');
        } else {
          setStatus(out.data.message || 'Something went wrong. Please try again later.', 'error');
        }
      }).catch(function () {
        setStatus('Could not reach the mail service. Check your connection and try again.', 'error');
      }).then(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
      });
    });

    form.addEventListener('reset', function () {
      if (!statusEl) return;
      statusEl.textContent = '';
      statusEl.hidden = true;
      statusEl.removeAttribute('data-state');
    });

    var msgField = form.querySelector('#contact-message');
    var counter = form.querySelector('[data-char-count]');
    var count = function () {
      if (!msgField || !counter) return;
      counter.textContent = msgField.value.length + ' / ' + (msgField.getAttribute('maxlength') || 2000);
    };
    if (msgField && counter) {
      msgField.addEventListener('input', count);
      form.addEventListener('reset', count);
      count();
    }
  }

  /* 5. Back-to-top */
  var toTop = document.querySelector('.to-top-btn');
  if (toTop) {
    var paint = function () {
      toTop.classList.toggle('show', window.scrollY > 600);
    };
    window.addEventListener('scroll', paint, { passive: true });
    paint();
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* 6. In-page anchors — offset below the sticky header, hash kept in sync */
  function landOn(target) {
    var offset = (document.querySelector('.site-header') || { offsetHeight: 64 }).offsetHeight + 16;
    var top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(top, 0), behavior: reduceMotion ? 'auto' : 'smooth' });
    if (target.id) {
      try { history.pushState(null, '', '#' + target.id); } catch (err) { /* ignore */ }
    }
    if (!/^(?:A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    var hash = link.getAttribute('href');
    if (!hash || hash.length < 2) return;
    link.addEventListener('click', function (e) {
      var target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      setDrawer(false);
      landOn(target);
    });
  });

  /* deep links (e.g. premium/#premium-features) land below the header */
  if (window.location.hash) {
    var initial = document.querySelector(window.location.hash);
    if (initial) {
      window.setTimeout(function () {
        var offset = (document.querySelector('.site-header') || { offsetHeight: 64 }).offsetHeight + 16;
        var top = initial.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(top, 0), behavior: 'auto' });
      }, 60);
    }
  }
})();
