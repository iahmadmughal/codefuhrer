/* ═══════════════════════════════════════════════
   CODE FUHRER — MAIN.JS
   Handles: Nav scroll, hero card bars, stats counter,
   testimonials carousel, billing toggle, form submit,
   scroll reveal animations, hamburger menu
════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── NAVBAR SCROLL ─── */
  const navHeader = document.getElementById('nav-header');
  window.addEventListener('scroll', () => {
    navHeader.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ─── HAMBURGER MENU ─── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    hamburger.querySelectorAll('span').forEach((span, i) => {
      span.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      if (open) {
        if (i === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
        if (i === 1) { span.style.opacity = '0'; span.style.transform = 'scaleX(0)'; }
        if (i === 2) span.style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        span.style.transform = '';
        span.style.opacity   = '';
      }
    });
  });

  // Close menu on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });

  /* ─── HERO CARD BAR FILLS ─── */
  // Replace pseudo-element bars with real markup
  const barWrap = document.querySelector('.hcard-bar-wrap');
  if (barWrap) {
    const bars = [
      { label: 'Revenue',    pct: 88 },
      { label: 'Traffic',    pct: 72 },
      { label: 'Engagement', pct: 95 },
    ];
    barWrap.innerHTML = bars.map(b => `
      <div class="hcard-bar">
        <span>${b.label}</span>
        <div class="hcard-bar-inner">
          <div class="hcard-bar-fill" style="--w:${b.pct}%"></div>
        </div>
        <span>${b.pct}%</span>
      </div>
    `).join('');
  }

  /* ─── SCROLL REVEAL ─── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Add reveal classes to various sections
  const revealTargets = [
    '.service-card',
    '.price-card',
    '.tcard',
    '.stat-item',
    '.cp-item',
    '.rs-item',
    '.section-title',
    '.section-sub',
    '.section-label',
  ];

  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      if (i % 4 === 1) el.classList.add('reveal-delay-1');
      if (i % 4 === 2) el.classList.add('reveal-delay-2');
      if (i % 4 === 3) el.classList.add('reveal-delay-3');
      revealObserver.observe(el);
    });
  });

  /* ─── STAT COUNTER ANIMATION ─── */
  const statNumbers = document.querySelectorAll('.stat-number');

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const step     = 16;
    const increment = target / (duration / step);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, step);
  }

  statNumbers.forEach(el => statsObserver.observe(el));

  /* ─── TESTIMONIALS CAROUSEL ─── */
  const track    = document.getElementById('testimonials-track');
  const cards    = track ? Array.from(track.querySelectorAll('.tcard')) : [];
  const dotsWrap = document.getElementById('tc-dots');
  const prevBtn  = document.getElementById('tc-prev');
  const nextBtn  = document.getElementById('tc-next');

  let currentSlide = 0;
  let slidesPerView = getSlidesPerView();
  let totalSlides   = Math.ceil(cards.length / slidesPerView);
  let autoInterval;

  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = '';
    totalSlides = Math.ceil(cards.length / slidesPerView);
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('div');
      dot.className = 'tc-dot' + (i === currentSlide ? ' active' : '');
      dot.addEventListener('click', () => goToSlide(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll('.tc-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentSlide);
    });
  }

  function goToSlide(index) {
    currentSlide = Math.max(0, Math.min(index, totalSlides - 1));
    const cardWidth      = cards[0].offsetWidth + 24; // gap
    const offset         = currentSlide * slidesPerView * cardWidth;
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1);
    resetAutoplay();
  });

  if (nextBtn) nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
    resetAutoplay();
  });

  function startAutoplay() {
    autoInterval = setInterval(() => {
      goToSlide(currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1);
    }, 5000);
  }

  function resetAutoplay() { clearInterval(autoInterval); startAutoplay(); }

  // Touch / swipe support
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goToSlide(diff > 0
          ? (currentSlide >= totalSlides - 1 ? 0 : currentSlide + 1)
          : (currentSlide <= 0 ? totalSlides - 1 : currentSlide - 1)
        );
        resetAutoplay();
      }
    }, { passive: true });
  }

  // Pause on hover
  if (track) {
    track.addEventListener('mouseenter', () => clearInterval(autoInterval));
    track.addEventListener('mouseleave', startAutoplay);
  }

  // Reinitialize on resize
  window.addEventListener('resize', () => {
    const newSpv = getSlidesPerView();
    if (newSpv !== slidesPerView) {
      slidesPerView = newSpv;
      currentSlide = 0;
      buildDots();
      goToSlide(0);
    }
  }, { passive: true });

  buildDots();
  startAutoplay();

  /* ─── PRICING TOGGLE ─── */
  const billingToggle = document.getElementById('billing-toggle');

  if (billingToggle) {
    billingToggle.addEventListener('change', () => {
      const isAnnual = billingToggle.checked;
      document.querySelectorAll('.pc-price').forEach(el => {
        const monthly = parseInt(el.dataset.monthly, 10);
        const annual  = parseInt(el.dataset.annual, 10);
        const target  = isAnnual ? annual : monthly;

        // Animate number
        let current = parseInt(el.textContent, 10);
        const diff  = target - current;
        const steps = 20;
        const inc   = diff / steps;
        let count   = 0;

        const t = setInterval(() => {
          count++;
          current += inc;
          el.textContent = Math.round(current);
          if (count >= steps) { el.textContent = target; clearInterval(t); }
        }, 20);
      });
    });
  }

  /* ─── CONTACT FORM ─── */
  const form          = document.getElementById('contact-form');
  const submitBtn     = document.getElementById('form-submit-btn');
  const submitText    = document.getElementById('btn-submit-text');
  const submitArrow   = document.getElementById('btn-submit-arrow');
  const successMsg    = document.getElementById('form-success');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Basic validation
      const name    = document.getElementById('cf-name').value.trim();
      const email   = document.getElementById('cf-email').value.trim();
      const budget  = document.getElementById('cf-budget').value;
      const message = document.getElementById('cf-message').value.trim();

      if (!name || !email || !budget || !message) {
        shakeForm();
        return;
      }

      if (!isValidEmail(email)) {
        document.getElementById('cf-email').style.borderColor = '#ff4444';
        setTimeout(() => document.getElementById('cf-email').style.borderColor = '', 2000);
        return;
      }

      // Simulate sending
      submitBtn.disabled = true;
      submitText.textContent = 'Sending…';
      submitArrow.style.display = 'none';
      submitBtn.style.opacity = '0.7';

      await new Promise(r => setTimeout(r, 1800));

      submitBtn.style.display = 'none';
      successMsg.classList.add('visible');
      form.querySelectorAll('input, textarea, select, button').forEach(el => el.disabled = true);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm() {
    const formEl = document.querySelector('.contact-form');
    if (!formEl) return;
    formEl.style.animation = 'none';
    formEl.offsetHeight; // reflow
    formEl.style.animation = 'shake 0.4s ease';
  }

  // Inject shake keyframe
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-8px); }
      75% { transform: translateX(8px); }
    }
  `;
  document.head.appendChild(style);

  /* ─── SMOOTH ACTIVE NAV LINKS ─── */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ─── SERVICE CARD HOVER PARTICLE EFFECT (subtle) ─── */
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = ((e.clientX - rect.left) / rect.width) * 100;
      const y      = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(244,73,35,0.07), rgba(255,255,255,0.03) 50%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  /* ─── PRELOADER FADE ─── */
  window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });

  console.log('%c🚀 Code Fuhrer — Built with passion.', 'color:#F44923;font-size:14px;font-weight:bold;');
});
