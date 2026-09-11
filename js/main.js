/* LP Gaspar Lopes — interações (header, menu, accordion, reveals, filtros, carrossel "Quem faz") */
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

  // Menu mobile (painel navy sob o header; o header fica sólido enquanto aberto)
  var menuBtn = document.querySelector('.menu-btn');
  var mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    var setMenu = function (open) {
      mobileNav.classList.toggle('open', open);
      if (header) header.classList.toggle('menu-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };
    menuBtn.addEventListener('click', function () {
      setMenu(!mobileNav.classList.contains('open'));
    });
    mobileNav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
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

  // Carrossel "Quem faz": autoplay com crossfade; pausa em hover/foco, fora da tela
  // e em aba oculta; sem autoplay com prefers-reduced-motion (dots continuam funcionando)
  var carousel = document.querySelector('.author-carousel');
  if (carousel) {
    var slides = carousel.querySelectorAll('.author-slide');
    var dots = carousel.querySelectorAll('.author-dot');
    var INTERVAL = 5000;
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var current = 0, timer = null, paused = false, visible = false;
    carousel.style.setProperty('--interval', INTERVAL + 'ms');
    if (reduced) carousel.classList.add('is-static');

    var show = function (n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      dots.forEach(function (dot) { dot.classList.remove('is-active'); dot.setAttribute('aria-selected', 'false'); });
      void carousel.offsetWidth; // reinicia a animação de progresso do dot
      dots[current].classList.add('is-active');
      dots[current].setAttribute('aria-selected', 'true');
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () {
      stop();
      if (reduced || paused || !visible || document.hidden) return;
      timer = setInterval(function () { show(current + 1); }, INTERVAL);
    };
    var restart = function () { show(current); play(); };

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { show(i); play(); });
      dot.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          show(current + (e.key === 'ArrowRight' ? 1 : -1));
          dots[current].focus();
          play();
        }
      });
    });

    var pause = function () { paused = true; carousel.classList.add('is-paused'); stop(); };
    var resume = function () { paused = false; carousel.classList.remove('is-paused'); restart(); };
    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    carousel.addEventListener('focusin', pause);
    carousel.addEventListener('focusout', function (e) {
      if (!carousel.contains(e.relatedTarget)) resume();
    });

    // Swipe (touch/pen)
    var startX = null;
    carousel.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      startX = e.clientX;
    });
    carousel.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) { show(current + (dx < 0 ? 1 : -1)); play(); }
    });
    carousel.addEventListener('pointercancel', function () { startX = null; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) restart(); else stop();
      }, { threshold: 0.3 }).observe(carousel);
    } else {
      visible = true;
      play();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else if (visible) restart();
    });
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

/* =============================== Tracking ===============================
 * Tudo vai para o dataLayer; GA4 e Google Ads são configurados no GTM
 * (importar gtm/gtm-container-gaspar-lopes.json, guia em gtm/TRACKING.md).
 *
 * Catálogo de eventos:
 * - whatsapp_click   { source, label, page }   CONVERSÃO PRINCIPAL (qualquer link wa.me)
 * - social_click     { network, source, page } Instagram
 * - collection_filter{ filter }                filtros da Coleção
 * - faq_open         { question }              pergunta aberta no FAQ
 * - section_view     { section }               seção 40% visível, 1x por seção
 * - cookie_consent   { consent_choice }        accepted | essential
 * ======================================================================= */
(function () {
  'use strict';
  var CONSENT_KEY = 'gl-consent';

  function push(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    // Espelha no coletor first-party do /dashboard (js/tracker.js), se carregado
    if (typeof window.glCollect === 'function') {
      var props = {}; for (var k in payload) if (k !== 'event') props[k] = payload[k];
      window.glCollect(payload.event, props);
    }
  }
  function consentUpdate(granted) {
    var s = granted ? 'granted' : 'denied';
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', { ad_storage: s, ad_user_data: s, ad_personalization: s, analytics_storage: s });
    }
  }
  function sourceOf(el) {
    if (el.closest('.wa-float')) return 'flutuante';
    if (el.closest('.header')) return 'header';
    if (el.closest('.footer')) return 'footer';
    var sec = el.closest('section');
    if (!sec) return 'outro';
    if (sec.id) return sec.id;
    if (sec.classList.contains('hero')) return 'hero';
    if (sec.classList.contains('final-cta')) return 'cta-final';
    return 'outro';
  }
  function labelOf(el) {
    var piece = el.closest('.piece');
    var h3 = piece && piece.querySelector('h3');
    var txt = (h3 ? h3.textContent : el.textContent) || el.getAttribute('aria-label') || '';
    return txt.replace(/\s+/g, ' ').trim().slice(0, 80);
  }
  var page = window.location.pathname;

  // Cliques: WhatsApp (conversão) e Instagram
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me|api\.whatsapp\.com/.test(href)) {
      push({ event: 'whatsapp_click', source: sourceOf(a), label: labelOf(a), page: page });
    } else if (/instagram\.com/.test(href)) {
      push({ event: 'social_click', network: 'instagram', source: sourceOf(a), page: page });
    }
  }, true);

  // Filtros da Coleção
  document.querySelectorAll('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      push({ event: 'collection_filter', filter: btn.getAttribute('data-filter') || '' });
    });
  });

  // FAQ: só quando abre
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.getAttribute('aria-expanded') === 'true') {
        push({ event: 'faq_open', question: (btn.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120) });
      }
    });
  });

  // Seções vistas (funil de leitura)
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var name = el.id || (el.classList.contains('hero') ? 'hero' : el.classList.contains('final-cta') ? 'cta-final' : '');
        if (!name || seen[name]) return;
        seen[name] = true;
        push({ event: 'section_view', section: name });
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('main section').forEach(function (s) { io.observe(s); });
  }

  // Banner de cookies
  var bar = document.getElementById('cookie-bar');
  if (bar) {
    var saved = null;
    try { saved = localStorage.getItem(CONSENT_KEY); } catch (e) {}
    if (!saved) bar.hidden = false;
    bar.querySelectorAll('[data-consent]').forEach(function (b) {
      b.addEventListener('click', function () {
        var choice = b.getAttribute('data-consent');
        try { localStorage.setItem(CONSENT_KEY, choice); } catch (e) {}
        consentUpdate(choice === 'accepted');
        push({ event: 'cookie_consent', consent_choice: choice });
        bar.hidden = true;
      });
    });
  }
})();
