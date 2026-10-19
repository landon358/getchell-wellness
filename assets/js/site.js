(function () {
  // The `js` class is set by an inline script in <head> so reveal state applies before first paint.
  document.documentElement.classList.add('js');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var useGsap = !reduced && window.gsap && window.ScrollTrigger;
  var EASE = 'power3.out';

  // Mark the current page in nav + menu
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__side a:not(.btn), .menu a:not(.btn)').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
  });

  // Hamburger morph + overlay
  var burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.querySelectorAll('.menu a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('menu-open'); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') document.body.classList.remove('menu-open');
    });
  }

  // Page-to-page fade: internal links fade the page out before navigating
  if (!reduced) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a) return;
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/i.test(href)) return;
      if (href.split('#')[0] === path) return;
      e.preventDefault();
      document.body.classList.remove('menu-open');
      document.documentElement.classList.add('leaving');
      setTimeout(function () { location.href = href; }, 200);
    });
    window.addEventListener('pageshow', function () { document.documentElement.classList.remove('leaving'); });
  }

  // Stagger siblings that share a parent with data-stagger (CSS fallback path)
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child, i) {
      child.style.setProperty('--d', (i * 0.06) + 's');
    });
  });

  // Contact form: no backend yet — show a friendly note instead of submitting nowhere
  var form = document.querySelector('form[data-demo]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form__note');
      if (!note) return;
      note.hidden = false;
      void note.offsetHeight; // commit the unhidden state before transitioning
      setTimeout(function () { note.classList.add('is-shown'); }, 16);
      note.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }

  if (useGsap) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('gsap');

    // ---- Hero intro: full on the first page of a visit, compact afterwards ----
    var seen = false;
    try { seen = sessionStorage.getItem('gw-intro') === '1'; sessionStorage.setItem('gw-intro', '1'); } catch (err) {}

    var hero = document.querySelector('.hero, .page-hero');
    var h1 = hero && hero.querySelector('h1');
    var heroEls = hero ? Array.prototype.slice.call(hero.querySelectorAll('.reveal')) : [];
    heroEls.forEach(function (el) { el.classList.add('gsap-hero'); });
    var lede = hero && hero.querySelector('.lede');
    var actions = hero && hero.querySelector('.actions');
    var photo = hero && hero.querySelector('.hero__photo, .page-hero__photo');

    gsap.set(heroEls, { autoAlpha: 1, y: 0, clearProps: 'transform' });
    var tl = gsap.timeline({ defaults: { ease: EASE } });

    if (!seen) {
      if (h1) {
        // Wrap each word in a mask, keeping any <mark> highlight intact around its words
        var wrapWords = function (text) {
          return text.split(/(\s+)/).map(function (t) {
            return /^\s+$/.test(t) ? t : (t ? '<span class="w"><span class="wi">' + t + '</span></span>' : '');
          }).join('');
        };
        var out = '';
        Array.prototype.forEach.call(h1.childNodes, function (n) {
          if (n.nodeType === 3) out += wrapWords(n.nodeValue);
          else if (n.nodeType === 1) out += '<' + n.tagName.toLowerCase() + ' class="' + n.className + '">' + wrapWords(n.textContent) + '</' + n.tagName.toLowerCase() + '>';
        });
        h1.innerHTML = out.trim();
      }
      tl.from('.nav', { y: -10, autoAlpha: 0, duration: 0.8 }, 0);
      if (h1) tl.from(h1.querySelectorAll('.wi'), { yPercent: 110, duration: 1.1, stagger: 0.05 }, 0.15);
      if (lede) tl.from(lede, { y: 18, autoAlpha: 0, duration: 0.9 }, 0.55);
      if (actions) tl.from(actions, { y: 18, autoAlpha: 0, duration: 0.9 }, 0.7);
      if (photo) tl.from(photo, { autoAlpha: 0, scale: 1.04, y: 24, duration: 1.4, ease: 'power4.out' }, 0.6);
    } else {
      if (h1) tl.from(h1, { y: 12, autoAlpha: 0, duration: 0.5 }, 0);
      if (lede) tl.from(lede, { y: 10, autoAlpha: 0, duration: 0.45 }, 0.08);
      if (actions) tl.from(actions, { y: 10, autoAlpha: 0, duration: 0.45 }, 0.14);
      if (photo) tl.from(photo, { autoAlpha: 0, y: 12, duration: 0.6 }, 0.1);
    }

    // ---- Scroll reveals ---------------------------------------------
    var rest = Array.prototype.filter.call(document.querySelectorAll('.reveal'), function (el) { return !el.classList.contains('gsap-hero'); });
    gsap.set(rest, { autoAlpha: 0, y: 22 });
    ScrollTrigger.batch(rest, {
      start: 'top 92%',
      once: true,
      onEnter: function (batch) { gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.06, overwrite: true }); }
    });

    // ---- Photo parallax ---------------------------------------------
    gsap.utils.toArray('.photo img, .hero__photo img, .page-hero__photo img').forEach(function (img) {
      gsap.set(img, { scale: 1.12 });
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    });

    // ---- Stat counters ------------------------------------------------
    gsap.utils.toArray('.stat b').forEach(function (b) {
      var node = Array.prototype.find.call(b.childNodes, function (n) { return n.nodeType === 3 && /\d/.test(n.nodeValue); });
      if (!node) return;
      var m = node.nodeValue.match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;
      var prefix = m[1], target = parseInt(m[2], 10), suffix = m[3];
      var obj = { v: 0 };
      node.nodeValue = prefix + '0' + suffix;
      gsap.to(obj, {
        v: target, duration: 1.2, ease: EASE,
        scrollTrigger: { trigger: b, start: 'top 85%', once: true },
        onUpdate: function () { node.nodeValue = prefix + Math.round(obj.v) + suffix; }
      });
    });

    // ---- Nav shadow once scrolled ---------------------------------
    ScrollTrigger.create({ start: 24, toggleClass: { targets: '.nav', className: 'is-scrolled' } });
    return;
  }

  // ---- Fallback: IntersectionObserver reveals (no GSAP or reduced motion) ----
  var els = document.querySelectorAll('.reveal');
  var vh = window.innerHeight || 800;
  els.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh * 0.95) el.classList.add('in');
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
})();
