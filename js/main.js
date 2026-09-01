/* LP Gaspar Lopes — interações (header, menu, accordion, reveals, filtros, carrossel) */
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

  // Destaques: carrossel com autoplay sobre trilho scroll-snap nativo.
  // Pausa em hover, foco, toque, aba oculta e fora da viewport; desliga com prefers-reduced-motion.
  document.querySelectorAll('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = track ? Array.prototype.slice.call(track.children) : [];
    if (!track || slides.length < 2) return;

    var dotsWrap = root.querySelector('.carousel-dots');
    var btnPrev = root.querySelector('[data-prev]');
    var btnNext = root.querySelector('[data-next]');
    var btnToggle = root.querySelector('[data-toggle]');
    var interval = parseInt(root.getAttribute('data-interval'), 10) || 4500;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var index = 0;
    var timer = null;
    var scrollDebounce = null;
    var state = { hover: false, focus: false, touch: false, visible: false, userPaused: reduceMotion };

    root.style.setProperty('--interval', interval + 'ms');

    // Dots (um por slide)
    var dots = slides.map(function (_, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot';
      b.setAttribute('aria-label', 'Ir para a peça ' + (i + 1) + ' de ' + slides.length);
      b.addEventListener('click', function () { goTo(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function padLeft() { return parseFloat(getComputedStyle(track).paddingLeft) || 0; }

    function setActive(i) {
      index = i;
      dots.forEach(function (d, j) {
        d.classList.toggle('is-active', j === i);
        if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
    }

    function goTo(i, instant) {
      i = (i + slides.length) % slides.length;
      var left = slides[i].offsetLeft - padLeft();
      if (instant || reduceMotion) track.scrollLeft = left;
      else track.scrollTo({ left: left, behavior: 'smooth' });
      setActive(i);
    }

    // Reinicia a animação de progresso do dot ativo (para casar com o timer)
    function resetProgress() {
      var d = dots[index];
      if (!d) return;
      d.classList.remove('is-active');
      void d.offsetWidth; // força reflow
      d.classList.add('is-active');
    }

    function canPlay() {
      return !state.userPaused && !state.hover && !state.focus && !state.touch && state.visible && !document.hidden;
    }

    function stop() {
      if (timer) { clearInterval(timer); timer = null; }
      root.classList.remove('is-playing');
      track.setAttribute('aria-live', 'polite');
    }

    function start() {
      if (timer || !canPlay()) return;
      resetProgress();
      timer = setInterval(function () { goTo(index + 1); }, interval);
      root.classList.add('is-playing');
      track.setAttribute('aria-live', 'off');
    }

    function restart() { stop(); start(); }

    function update() { if (canPlay()) start(); else stop(); }

    // Sincroniza o dot com o slide mais próximo após swipe/scroll manual
    track.addEventListener('scroll', function () {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        var pos = track.scrollLeft + padLeft();
        var best = 0, bestDist = Infinity;
        slides.forEach(function (s, i) {
          var dist = Math.abs(s.offsetLeft - pos);
          if (dist < bestDist) { bestDist = dist; best = i; }
        });
        if (best !== index) { setActive(best); if (timer) restart(); }
      }, 80);
    }, { passive: true });

    if (btnPrev) btnPrev.addEventListener('click', function () { goTo(index - 1); restart(); });
    if (btnNext) btnNext.addEventListener('click', function () { goTo(index + 1); restart(); });
    if (btnToggle) {
      btnToggle.addEventListener('click', function () {
        state.userPaused = !state.userPaused;
        btnToggle.setAttribute('aria-pressed', String(!state.userPaused));
        btnToggle.setAttribute('aria-label', state.userPaused ? 'Retomar rotação automática' : 'Pausar rotação automática');
        update();
      });
      if (reduceMotion) {
        btnToggle.setAttribute('aria-pressed', 'false');
        btnToggle.setAttribute('aria-label', 'Retomar rotação automática');
      }
    }

    // Setas do teclado quando o trilho está focado
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); restart(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); restart(); }
    });

    // Pausas contextuais
    root.addEventListener('mouseenter', function () { state.hover = true; update(); });
    root.addEventListener('mouseleave', function () { state.hover = false; update(); });
    root.addEventListener('focusin', function () { state.focus = true; update(); });
    root.addEventListener('focusout', function () {
      // só retoma se o foco saiu do carrossel
      setTimeout(function () { state.focus = root.contains(document.activeElement); update(); }, 0);
    });
    track.addEventListener('touchstart', function () { state.touch = true; update(); }, { passive: true });
    track.addEventListener('touchend', function () { state.touch = false; update(); }, { passive: true });
    track.addEventListener('touchcancel', function () { state.touch = false; update(); }, { passive: true });
    document.addEventListener('visibilitychange', update);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = entries[0].isIntersecting;
        update();
      }, { threshold: 0.35 }).observe(root);
    } else {
      state.visible = true;
      update();
    }

    setActive(0);
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
