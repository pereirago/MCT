document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DEL DOM ---
  const header = document.querySelector('.header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const counterItems = document.querySelectorAll('.hero__metric-num');
  const rfqForm = document.getElementById('rfq-form');
  const formSuccess = document.getElementById('form-success');
  const formError = document.getElementById('form-error');

  // --- MENU MÓVIL ---
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('nav-menu--open');
      menuToggle.classList.toggle('menu-toggle--active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('nav-menu--open');
        menuToggle.classList.remove('menu-toggle--active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- CABECERA SCROLL EFECTO ---
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Ejecutar en carga por si inicia con scroll

  // --- SECCIÓN ACTIVA EN MENÚ DE NAVEGACIÓN ---
  const navObserverOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('nav-link--active');
          } else {
            link.classList.remove('nav-link--active');
          }
        });
      }
    });
  }, navObserverOptions);

  sections.forEach(section => navObserver.observe(section));

  // --- ANIMACIÓN DE APARICIÓN SCROLL-DRIVEN (FADE-UP) ---
  const fadeUpElements = document.querySelectorAll('.fade-up-init');
  const fadeUpObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-up-active');
        observer.unobserve(entry.target); // Animación ocurre una sola vez
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeUpElements.forEach(el => fadeUpObserver.observe(el));

  // --- CONTADORES ANIMADOS DE ESTADÍSTICAS ---
  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000; // 2 segundos
    const stepTime = 20;
    const steps = duration / stepTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.round((target / steps) * step);
      if (step >= steps) {
        el.textContent = target.toLocaleString('es-ES') + suffix;
        clearInterval(timer);
      } else {
        el.textContent = current.toLocaleString('es-ES') + suffix;
      }
    }, stepTime);
  };

  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target); // Solo animar una vez
      }
    });
  }, {
    root: null,
    threshold: 0.5
  });

  counterItems.forEach(counter => counterObserver.observe(counter));

  // --- FILTRADO DE PROYECTOS EN PORTAFOLIO ---
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover clase activa de todos los botones
      filterButtons.forEach(b => b.classList.remove('filter-btn--active'));
      // Agregar al botón clicado
      btn.classList.add('filter-btn--active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          // Animación de fade-in al mostrar
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- VALIDACIÓN Y ENVÍO DE FORMULARIO RFQ ---
  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Ocultar estados anteriores
      formSuccess.style.display = 'none';
      formError.style.display = 'none';

      // Capturar inputs
      const name = document.getElementById('rfq-name').value.trim();
      const company = document.getElementById('rfq-company').value.trim();
      const email = document.getElementById('rfq-email').value.trim();
      const phone = document.getElementById('rfq-phone').value.trim();
      const service = document.getElementById('rfq-service').value;
      const desc = document.getElementById('rfq-desc').value.trim();

      // Validación simple
      if (!name || !email || !service || !desc) {
        formError.textContent = 'Por favor complete todos los campos obligatorios (*).';
        formError.style.display = 'block';
        return;
      }

      // Simular llamada a API / Envío
      const submitBtn = rfqForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg class="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24" style="animation: spin 1s linear infinite;"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity: 0.25;"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ENVIANDO...';

      setTimeout(() => {
        // Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;

        // Mostrar éxito
        formSuccess.style.display = 'block';
        rfqForm.reset();
        
        // Auto-desplazamiento suave al mensaje de éxito
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 1500);
    });
  }
});

// Estilos dinámicos para animación de carga del formulario
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin {
    display: inline-block;
    vertical-align: middle;
  }
`;
document.head.appendChild(styleSheet);
