/* ============================================================
   BURASYID HOMEMADE — Interactions
   Scroll-driven, reveal, counter, marquee, slider, countdown,
   product filter, WhatsApp form
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Scroll progress bar ---------- */
  const progressBar = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    progressBar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------- Navbar: shrink on scroll ---------- */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    heroParallax();
    updateProgress();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- Active nav link (scroll-spy) ---------- */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = [...navLinks].map((l) => document.querySelector(l.getAttribute('href'))).filter(Boolean);

  const spy = () => {
    const pos = window.scrollY + 120;
    let current = sections[0] ? sections[0].id : '';
    for (const sec of sections) {
      if (sec.offsetTop <= pos) current = sec.id;
    }
    navLinks.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  };
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  /* ---------- Hero parallax (scroll-driven) ---------- */
  const heroBg = document.getElementById('heroBg');
  function heroParallax() {
    if (!heroBg || reduceMotion) return;
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroBg.style.transform = 'translateY(' + y * 0.35 + 'px) scale(1.08)';
    }
  }
  onScroll();

  /* ---------- Reveal on scroll (IntersectionObserver) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        el.style.setProperty('--d', delay * 120 + 'ms');
        el.classList.add('visible');
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------- Staggered grid children ---------- */
  const grids = document.querySelectorAll('.services-grid, .products-grid, .branches-grid, .testimonials-grid, .about-values');
  grids.forEach((grid) => {
    [...grid.children].forEach((child, i) => {
      child.style.setProperty('--d', (i % 6) * 110 + 'ms');
    });
  });

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');

  const runCounter = (el) => {
    const target = parseInt(el.dataset.counter, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString('id-ID') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25, rootMargin: '0px 0px -10px 0px' });

  counters.forEach((c) => counterObserver.observe(c));

  /* ---------- Marquee (duplicate content for seamless loop) ---------- */
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ---------- Product filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      productCards.forEach((card) => {
        const show = filter === 'semua' || card.dataset.cat === filter;
        if (show) {
          card.classList.remove('hidden');
          requestAnimationFrame(() => {
            card.style.opacity = '0';
            card.style.transform = 'scale(.94)';
            requestAnimationFrame(() => {
              card.style.transition = 'opacity .45s ease, transform .45s ease';
              card.style.opacity = '1';
              card.style.transform = 'none';
            });
          });
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ---------- Promo slider ---------- */
  const track = document.getElementById('promoTrack');
  const dotsWrap = document.getElementById('promoDots');
  const prevBtn = document.getElementById('promoPrev');
  const nextBtn = document.getElementById('promoNext');
  const slides = track ? [...track.children] : [];

  if (slides.length) {
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'promo-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', 'Promo ke-' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    const dots = [...dotsWrap.children];

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + index * 100 + '%)';
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    };

    nextBtn.addEventListener('click', () => { goTo(index + 1); restart(); });
    prevBtn.addEventListener('click', () => { goTo(index - 1); restart(); });

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 6000);
    };
    restart();

    document.getElementById('promoSlider').addEventListener('mouseenter', () => clearInterval(timer));
    document.getElementById('promoSlider').addEventListener('mouseleave', restart);
  }

  /* ---------- Promo countdown (ends in 9 days) ---------- */
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');

  if (cdDays) {
    const end = Date.now() + 9 * 24 * 60 * 60 * 1000;
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      let diff = Math.max(0, end - Date.now());
      const d = Math.floor(diff / 86400000);
      diff -= d * 86400000;
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);
      cdDays.textContent = pad(d);
      cdHours.textContent = pad(h);
      cdMins.textContent = pad(m);
      cdSecs.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Reservation form → WhatsApp ---------- */
  const form = document.getElementById('reservationForm');
  const note = document.getElementById('formNote');
  const submitBtn = document.getElementById('submitBtn');

  const WA_NUMBER = '6281234567890';

  const markInvalid = (field, invalid) => {
    field.classList.toggle('invalid', invalid);
  };

  const validate = (field) => {
    let ok = true;
    if (!field.value.trim()) ok = false;
    if (field.id === 'fWa' && field.value.trim() && !/^\+?[0-9\s\-()]{8,16}$/.test(field.value.trim())) ok = false;
    if (field.id === 'fPax' && (parseInt(field.value, 10) < 1 || isNaN(parseInt(field.value, 10)))) ok = false;
    if (field.id === 'fTanggal' && field.value < new Date().toISOString().slice(0, 10)) ok = false;
    markInvalid(field, !ok);
    return ok;
  };

  const fields = form.querySelectorAll('input, select, textarea');
  fields.forEach((f) => f.addEventListener('blur', () => validate(f)));
  fields.forEach((f) => f.addEventListener('input', () => { if (f.classList.contains('invalid')) validate(f); }));

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((f) => { if (!validate(f)) valid = false; });

    const agree = document.getElementById('fAgree');
    if (!agree.checked) valid = false;

    if (!valid) {
      note.textContent = 'Mohon lengkapi semua isian dengan benar.';
      note.className = 'form-note error';
      return;
    }

    const data = {
      nama: document.getElementById('fNama').value.trim(),
      wa: document.getElementById('fWa').value.trim(),
      acara: document.getElementById('fAcara').value,
      layanan: document.getElementById('fLayanan').value,
      tanggal: document.getElementById('fTanggal').value,
      pax: document.getElementById('fPax').value,
      catatan: document.getElementById('fCatatan').value.trim() || '-'
    };

    const msg =
      'Halo Burasyid Homemade! 👋\n' +
      'Saya ingin melakukan reservasi katering:\n\n' +
      '👤 Nama: ' + data.nama + '\n' +
      '📞 WhatsApp: ' + data.wa + '\n' +
      '🎉 Jenis Acara: ' + data.acara + '\n' +
      '🍽️ Layanan: ' + data.layanan + '\n' +
      '📅 Tanggal: ' + data.tanggal + '\n' +
      '👥 Jumlah Tamu: ' + data.pax + ' pax\n' +
      '📝 Catatan: ' + data.catatan;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengalihkan ke WhatsApp...';
    note.textContent = 'Menyiapkan pesan Anda...';
    note.className = 'form-note';

    setTimeout(() => {
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Reservasi via WhatsApp →';
      note.textContent = '✓ Pesan siap! Silakan kirim di WhatsApp yang terbuka.';
      note.className = 'form-note success';
    }, 900);
  });

  /* ---------- Date min = today ---------- */
  const tanggal = document.getElementById('fTanggal');
  if (tanggal) tanggal.min = new Date().toISOString().slice(0, 10);

  /* ---------- Hero image: graceful fallback if sample image fails ---------- */
  const heroImg = document.querySelector('.hero-bg');
  if (heroImg) {
    const img = new Image();
    img.src = 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1920&auto=format&fit=crop';
    img.onerror = () => {
      heroImg.style.backgroundImage = 'linear-gradient(135deg, #1E3A2B, #2C5440)';
    };
  }
})();
