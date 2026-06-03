/* =================================================================
   CRÉATION SITE IMMOBILIER — Interactions & animations
   - Nav translucide au scroll
   - Menu mobile
   - Révélations au scroll (IntersectionObserver)
   - Titres révélés mot par mot
   - Manifeste illuminé au fil du scroll
   - Compteurs animés
   - Boutons magnétiques + barre de progression + parallaxe
================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Nav : fond translucide après défilement ---------- */
  var nav = document.querySelector('[data-nav]');
  var burger = document.querySelector('.nav-burger');
  var navLinks = document.querySelector('.nav-links');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  /* ---------- Découpe des titres en mots (effet masque) ---------- */
  function splitWords(el) {
    if (el.dataset.split) return;
    el.dataset.split = '1';
    var frag = document.createDocumentFragment();
    Array.prototype.forEach.call(el.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (part) {
          if (part === '') return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          var word = document.createElement('span'); word.className = 'word';
          var inner = document.createElement('span'); inner.className = 'word-in'; inner.textContent = part;
          word.appendChild(inner); frag.appendChild(word);
        });
      } else if (node.nodeName === 'BR') {
        frag.appendChild(document.createElement('br'));
      } else {
        frag.appendChild(node.cloneNode(true));
      }
    });
    el.innerHTML = '';
    el.appendChild(frag);
    el.querySelectorAll('.word-in').forEach(function (wi, i) {
      wi.style.transitionDelay = (i * 0.045) + 's';
    });
  }

  var wordEls = document.querySelectorAll('.hero-title, .section-title');
  if (!reduceMotion) {
    wordEls.forEach(splitWords);
    var wordObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('words-in');
        wordObserver.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    wordEls.forEach(function (el) { wordObserver.observe(el); });
  }

  /* ---------- Manifeste : illumination mot par mot au scroll ---------- */
  var manifesto = document.querySelector('.manifesto-text');
  var manifestoWords = [];
  if (manifesto && !reduceMotion) {
    // Découpe en conservant les espaces, en aplatissant les <span>
    var text = manifesto.textContent.replace(/\s+/g, ' ').trim();
    manifesto.innerHTML = '';
    text.split(' ').forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'mw';
      span.textContent = w;
      manifesto.appendChild(span);
      if (i < text.split(' ').length - 1) manifesto.appendChild(document.createTextNode(' '));
      manifestoWords.push(span);
    });
  }

  function updateManifesto() {
    if (!manifesto || !manifestoWords.length) return;
    var rect = manifesto.getBoundingClientRect();
    var vh = window.innerHeight;
    // progression de 0 (entrée en bas) à 1 (sorti par le haut, milieu d'écran)
    var progress = (vh * 0.85 - rect.top) / (rect.height + vh * 0.35);
    progress = Math.max(0, Math.min(1, progress));
    var litCount = Math.round(progress * manifestoWords.length);
    manifestoWords.forEach(function (w, i) {
      w.classList.toggle('lit', i < litCount);
    });
  }

  /* ---------- Révélations + compteurs ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    if (reduceMotion) { el.textContent = target; return; }
    var duration = 1500, startTs = null;
    function tick(ts) {
      if (startTs === null) startTs = ts;
      var p = Math.min((ts - startTs) / duration, 1);
      var eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-in');
      el.querySelectorAll('[data-count]').forEach(function (c) {
        c.textContent = c.getAttribute('data-count');
      });
    });
  }

  /* ---------- Halo qui suit la souris dans le hero ---------- */
  var heroSpot = document.querySelector('[data-spotlight]');
  if (heroSpot && finePointer && !reduceMotion) {
    var spotRaf = false;
    heroSpot.addEventListener('mousemove', function (e) {
      if (spotRaf) return;
      spotRaf = true;
      requestAnimationFrame(function () {
        var r = heroSpot.getBoundingClientRect();
        heroSpot.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        heroSpot.style.setProperty('--my', (e.clientY - r.top) + 'px');
        spotRaf = false;
      });
    });
  }

  /* ---------- Inclinaison 3D des réalisations ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      var max = 7;
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateY(' + (px * max) + 'deg) rotateX(' + (-py * max) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Boutons magnétiques ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.btn-pill').forEach(function (btn) {
      var strength = 0.35;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + x * strength + 'px,' + y * strength + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ---------- Scroll : barre de progression, nav, manifeste ---------- */
  var progressBar = document.querySelector('[data-progress]');
  var toTop = document.querySelector('[data-to-top]');
  var ticking = false;

  // Scroll-spy : associe chaque lien de nav à sa section
  var spy = [];
  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var sec = document.querySelector(link.getAttribute('href'));
      if (sec) spy.push({ link: link, sec: sec });
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;

      // Nav
      if (nav) nav.classList.toggle('is-scrolled', y > 24);

      // Barre de progression
      if (progressBar) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        var p = h > 0 ? y / h : 0;
        progressBar.style.transform = 'scaleX(' + p + ')';
      }

      // Manifeste
      updateManifesto();

      // Bouton retour en haut
      if (toTop) toTop.classList.toggle('is-visible', y > window.innerHeight * 0.8);

      // Scroll-spy
      if (spy.length) {
        var mid = y + window.innerHeight * 0.35;
        var current = null;
        spy.forEach(function (item) {
          if (item.sec.offsetTop <= mid) current = item;
        });
        spy.forEach(function (item) {
          item.link.classList.toggle('is-active', item === current);
        });
      }

      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Bouton retour en haut ---------- */
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Formulaire : validation + confirmation ---------- */
  var form = document.getElementById('contact-form');
  var formSuccess = document.querySelector('.form-success');
  function showSuccess() {
    form.hidden = true;
    if (formSuccess) {
      formSuccess.hidden = false;
      formSuccess.classList.add('is-in');
      formSuccess.setAttribute('tabindex', '-1');
      formSuccess.focus();
    }
  }

  var formNote = form ? form.querySelector('.form-note') : null;
  var formNoteDefault = formNote ? formNote.textContent : '';

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.add('was-submitted');
      if (!form.checkValidity()) {
        var firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
      if (formNote) { formNote.classList.remove('is-error'); formNote.textContent = formNoteDefault; }

      var data = new URLSearchParams();
      new FormData(form).forEach(function (value, key) { data.append(key, value); });

      fetch(form.getAttribute('action') || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status);
          showSuccess();
        })
        .catch(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma demande'; }
          if (formNote) {
            formNote.textContent = "Une erreur est survenue. Réessayez ou écrivez-moi à contact@creationsiteimmobilier.fr.";
            formNote.classList.add('is-error');
          }
        });
    });
  }

  /* ---------- Bandeau cookies ---------- */
  var cookie = document.querySelector('[data-cookie]');
  if (cookie) {
    var KEY = 'csi-cookie-ok';
    var stored = false;
    try { stored = localStorage.getItem(KEY) === '1'; } catch (e) {}
    if (!stored) {
      cookie.hidden = false;
      requestAnimationFrame(function () { cookie.classList.add('is-in'); });
    }
    var okBtn = cookie.querySelector('[data-cookie-ok]');
    if (okBtn) {
      okBtn.addEventListener('click', function () {
        try { localStorage.setItem(KEY, '1'); } catch (e) {}
        cookie.classList.remove('is-in');
        setTimeout(function () { cookie.hidden = true; }, 350);
      });
    }
  }

  /* ---------- Année automatique ---------- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
