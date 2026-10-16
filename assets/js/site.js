(function () {
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

  // Scroll reveal (IntersectionObserver, no scroll listeners)
  var els = document.querySelectorAll('.reveal');
  // Anything already in the first viewport shows at once; the observer handles the rest.
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

  // Stagger siblings that share a parent with data-stagger
  document.querySelectorAll('[data-stagger]').forEach(function (parent) {
    Array.prototype.forEach.call(parent.children, function (child, i) {
      child.style.setProperty('--d', (i * 0.09) + 's');
    });
  });

  // Contact form: no backend yet — show a friendly note instead of submitting nowhere
  var form = document.querySelector('form[data-demo]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form__note');
      if (note) { note.hidden = false; note.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }
})();
