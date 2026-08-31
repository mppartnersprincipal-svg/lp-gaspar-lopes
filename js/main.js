/* LP Gaspar Lopes — interações (header, menu, accordion, reveals, filtros) */
(function () {
  'use strict';

  // Header: transparente sobre o hero, sólido ao rolar
  var header = document.querySelector('.header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Menu mobile
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // FAQ accordion (um aberto por vez)
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    var panel = item.querySelector('.faq-a');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      items.forEach(function (other) {
        var oBtn = other.querySelector('.faq-q');
        var oPanel = other.querySelector('.faq-a');
        if (oBtn && oPanel && oBtn !== btn) {
          oBtn.setAttribute('aria-expanded', 'false');
          oPanel.style.height = '0px';
        }
      });
      btn.setAttribute('aria-expanded', String(!isOpen));
      panel.style.height = isOpen ? '0px' : panel.scrollHeight + 'px';
    });
  });

  // Reveal on scroll (respeita prefers-reduced-motion via CSS)
  var revealEls = document.querySelectorAll('.reveal, .reveal-group');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  // Coleção: filtro por categoria com transição
  var filterBtns = document.querySelectorAll('.filter');
  var galleryItems = document.querySelectorAll('.g-item');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filterBtns.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      galleryItems.forEach(function (item) {
        var show = cat === 'todas' || item.getAttribute('data-cat') === cat;
        if (show) {
          if (item.classList.contains('is-hidden')) {
            item.classList.remove('is-hidden');
            item.classList.add('is-entering');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { item.classList.remove('is-entering'); });
            });
          }
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });
})();
