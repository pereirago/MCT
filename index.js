/**
 * FORGE PROTOCOL — JavaScript v2.0
 * MCT Metal Construcciones Tillero, C.A.
 * Sidebar nav · Status bar clock · Counter animation
 * Tab panels · Fab category filter · RFQ form · Reveal observer
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================ */
  /* 1. STATUS BAR — Reloj en tiempo real                         */
  /* ============================================================ */
  const statusTime = document.getElementById('status-time');
  if (statusTime) {
    const updateClock = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      statusTime.textContent = `${hh}:${mm}:${ss}`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ============================================================ */
  /* 2. MOBILE MENU                                               */
  /* ============================================================ */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav     = document.getElementById('mobile-nav');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('mobile-nav--open');
      mobileMenuBtn.classList.toggle('mobile-menu-btn--active');
      mobileMenuBtn.setAttribute('aria-expanded', String(isOpen));
      mobileNav.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('.mobile-nav__link').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('mobile-nav--open');
        mobileMenuBtn.classList.remove('mobile-menu-btn--active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  /* ============================================================ */
  /* 3. SIDEBAR — Sección activa con IntersectionObserver         */
  /* ============================================================ */
  const sidebarLinks = document.querySelectorAll('.sidebar__link[data-section]');
  const sections     = document.querySelectorAll('section[id]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        sidebarLinks.forEach(link => {
          const match = link.dataset.section === id;
          link.classList.toggle('sidebar__link--active', match);
        });
      }
    });
  }, {
    rootMargin: '-25% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(s => sectionObserver.observe(s));

  /* ============================================================ */
  /* 4. CONTADORES ANIMADOS (HMI Strip)                           */
  /* ============================================================ */
  const counterEls = document.querySelectorAll('.hmi-metric__val[data-target]');

  const animateCounter = (el) => {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const steps    = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const value = Math.round((step / steps) * target);
      el.textContent = (step >= steps ? target : value) + suffix;
      if (step >= steps) clearInterval(timer);
    }, interval);
  };

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* ============================================================ */
  /* 5. FABRICACIÓN — Tab Panel switcher                          */
  /* ============================================================ */
  const fabTabs   = document.querySelectorAll('.fab-tab');
  const fabPanels = document.querySelectorAll('.fab-panel');

  fabTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetCat = tab.dataset.cat;

      // Update tabs
      fabTabs.forEach(t => {
        t.classList.remove('fab-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('fab-tab--active');
      tab.setAttribute('aria-selected', 'true');

      // Update panels
      fabPanels.forEach(panel => {
        const isTarget = panel.id === `cat-${targetCat}`;
        panel.classList.toggle('fab-panel--active', isTarget);
        if (isTarget) {
          // Stagger reveal child cards
          const cards = panel.querySelectorAll('.datasheet-card');
          cards.forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(12px)';
            setTimeout(() => {
              card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 60);
          });
        }
      });
    });
  });

  /* ============================================================ */
  /* 6. REVEAL ANIMATION — scroll-driven fade-up                  */
  /* ============================================================ */
  const revealEls = document.querySelectorAll(
    '.og-service-card, .datasheet-card, .capacity-category, .contract-entry, .mv-card, .spec-panel'
  );

  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============================================================ */
  /* 7. RFQ FORM — validación y envío a Netlify Forms             */
  /* ============================================================ */
  const rfqForm    = document.getElementById('rfq-form');
  const rfqSuccess = document.getElementById('rfq-success');
  const rfqError   = document.getElementById('rfq-error');
  const rfqSubmit  = document.getElementById('rfq-submit-btn');
  const rfqBtnText = document.getElementById('rfq-btn-text');

  if (rfqForm) {
    rfqForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Reset state
      rfqSuccess.style.display = 'none';
      rfqError.style.display = 'none';

      // Collect values
      const name    = document.getElementById('rfq-name').value.trim();
      const email   = document.getElementById('rfq-email').value.trim();
      const service = document.getElementById('rfq-service').value;
      const desc    = document.getElementById('rfq-desc').value.trim();

      // Validation
      if (!name || !email || !service || !desc) {
        rfqError.textContent = 'Por favor complete todos los campos obligatorios (*).';
        rfqError.style.display = 'block';
        rfqError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRx.test(email)) {
        rfqError.textContent = 'Por favor ingrese un correo electrónico válido.';
        rfqError.style.display = 'block';
        return;
      }

      // Loading state
      rfqSubmit.disabled = true;
      rfqBtnText.textContent = 'ENVIANDO...';
      const spinSvg = `<svg class="spin-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
      rfqSubmit.insertAdjacentHTML('beforeend', spinSvg);

      try {
        const body = new URLSearchParams(new FormData(rfqForm)).toString();
        await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });

        rfqSuccess.style.display = 'block';
        rfqForm.reset();
        rfqSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        rfqError.textContent = 'Error al enviar. Escríbanos directamente a mcttillero@gmail.com';
        rfqError.style.display = 'block';
      } finally {
        rfqSubmit.disabled = false;
        rfqBtnText.textContent = 'ENVIAR SOLICITUD RFQ';
        const spinEl = rfqSubmit.querySelector('.spin-icon');
        if (spinEl) spinEl.remove();
      }
    });
  }

  /* ============================================================ */
  /* 8. HERO — efecto parallax suave en las imágenes de fondo     */
  /* ============================================================ */
  const heroImgs = document.querySelectorAll('.hero-split__bg-img');
  let ticking = false;

  const handleParallax = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const factor = Math.min(scrollY * 0.08, 30);
        heroImgs.forEach(img => {
          img.style.transform = `translateY(${factor}px)`;
        });
        ticking = false;
      });
      ticking = true;
    }
  };

  // Only enable parallax on non-reduced-motion systems
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', handleParallax, { passive: true });
  }

});
