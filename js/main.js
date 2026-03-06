// ============================================
// Navigation
// ============================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const navLinkItems = document.querySelectorAll('.nav-links a');

// Scroll effect on navbar
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveLink();
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('active');
});

// Close mobile menu on link click
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Active nav link on scroll
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < top + height) {
      navLinkItems.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// ============================================
// Animated Counters
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');

  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        counter.textContent = target;
      }
    };

    updateCounter();
  });
}

// ============================================
// Intersection Observer for Animations
// ============================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

// Project showcase animations
const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.project-showcase').forEach(el => {
  projectObserver.observe(el);
});

// Skill bars animation
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fills = entry.target.querySelectorAll('.skill-fill');
      fills.forEach(fill => {
        const level = fill.getAttribute('data-level');
        fill.style.width = `${level}%`;
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.skill-category').forEach(el => {
  skillObserver.observe(el);
});

// Hero stats counter trigger
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

// ============================================
// Particle Background
// ============================================
function createParticles() {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('particles-bg');

  container.appendChild(canvas);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const particleCount = Math.floor(window.innerWidth / 15);

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.08;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
}

createParticles();

// ============================================
// Smooth Scroll
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const top = target.offsetTop - offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    }
  });
});

// ============================================
// Contact Form
// ============================================
// ============================================
// Contact Form — Web3Forms
// ============================================
const contactForm = document.getElementById('contactForm');
const formResult = document.getElementById('formResult');

contactForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  const originalContent = btn.innerHTML;

  // Loading state
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  btn.disabled = true;
  formResult.className = 'form-result';
  formResult.textContent = '';

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });

    const json = await res.json();

    if (res.ok && json.success) {
      // Success
      btn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje Enviado!';
      btn.classList.add('btn-success');
      formResult.className = 'form-result form-result--success';
      formResult.innerHTML = '<i class="fas fa-check-circle"></i> Gracias, te responderé pronto.';
      contactForm.reset();

      setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove('btn-success');
        btn.disabled = false;
        formResult.textContent = '';
      }, 5000);
    } else {
      throw new Error(json.message || 'Error al enviar');
    }
  } catch (err) {
    // Error
    btn.innerHTML = originalContent;
    btn.disabled = false;
    formResult.className = 'form-result form-result--error';
    formResult.innerHTML = '<i class="fas fa-exclamation-circle"></i> No se pudo enviar. Intenta de nuevo.';

    setTimeout(() => { formResult.textContent = ''; }, 5000);
  }
});

// ============================================
// Typing Effect for Terminal
// ============================================
function typeWriter(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Activate typing on scroll
const terminalObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const command = entry.target.querySelector('.command');
      if (command && !command.dataset.typed) {
        const text = command.textContent;
        typeWriter(command, text, 80);
        command.dataset.typed = 'true';
      }
      terminalObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const terminal = document.querySelector('.terminal-window');
if (terminal) {
  terminalObserver.observe(terminal);
}

// ============================================
// Page Load Animation
// ============================================
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// ============================================
// Platzi Certifications Carousel
// ============================================
const PLATZI_FALLBACK_COURSES = [
  {
    id: 12651,
    title: "Curso de Claude AI",
    badge_url: "https://static.platzi.com/media/achievements/6d6c2042-0597-464f-8262-7e4bf0a3c057-2951adb6-cb05-46b5-ba25-ce4b82f7b765.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/12651-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/12651-course/diploma-og/og.jpeg",
      approved_date: "2026-02-24T03:57:35.367Z"
    }
  },
  {
    id: 12319,
    title: "Curso de ChatGPT",
    badge_url: "https://static.platzi.com/media/achievements/piezas-curso-chatgpt-25-badge-5feef4cd-616a-4234-9282-f88c1bac62a3.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/12319-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/12319-course/diploma-og/og.jpeg",
      approved_date: "2026-02-12T17:01:27.779Z"
    }
  },
  {
    id: 12546,
    title: "Curso de Gemini",
    badge_url: "https://static.platzi.com/media/achievements/a83591ca-8d6f-4ced-9dcd-7a39a9da4e59-1be3c029-3247-4f9c-b311-2020714cadaf.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/12546-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/12546-course/diploma-og/og.jpeg",
      approved_date: "2026-01-15T23:38:39.754Z"
    }
  },
  {
    id: 11944,
    title: "Curso de Inglés Básico A1: Verbo To Be",
    badge_url: "https://static.platzi.com/media/achievements/piezas-ingles-basico-a1-verbo-to-be_badge-fa1d266e-db37-47d3-93d8-7f14dce67e17.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/11944-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/11944-course/diploma-og/og.jpeg",
      approved_date: "2025-09-02T03:22:19.639Z"
    }
  },
  {
    id: 10629,
    title: "Curso de Inglés Básico A1 para Principiantes",
    badge_url: "https://static.platzi.com/media/achievements/badge-c9748016-2a80-4013-be2e-f744163e7fc9.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/10629-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/10629-course/diploma-og/og.jpeg",
      approved_date: "2025-09-02T03:17:22.610Z"
    }
  },
  {
    id: 11997,
    title: "Curso de Fundamentos de Ingeniería de Software",
    badge_url: "https://static.platzi.com/media/achievements/piezas-fundamentosde-ingenieria-de-software_badge-d9c5b559-837f-44a3-8543-d_bkcvYTp.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/11997-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/11997-course/diploma-og/og.jpeg",
      approved_date: "2025-08-13T02:53:36.213Z"
    }
  },
  {
    id: 7965,
    title: "Curso de Herramientas de Inteligencia Artificial para Equipos de Datos",
    badge_url: "https://static.platzi.com/media/achievements/nteligencia-artificial-para-equipos-de-datos-badge-f5810628-a56b-468b-a674-982ce16e.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/7965-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/7965-course/diploma-og/og.jpeg",
      approved_date: "2025-06-03T22:42:30.544Z"
    }
  },
  {
    id: 5813,
    title: "Curso Sobre la Historia del Dinero",
    badge_url: "https://static.platzi.com/media/achievements/piezas-landing-historia-dinero_badge-18926804-def4-41fc-a17a-5d985879e53a.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/5813-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/5813-course/diploma-og/og.jpeg",
      approved_date: "2025-04-14T02:37:59.128Z"
    }
  },
  {
    id: 1764,
    title: "Curso de Introducción al Pensamiento Computacional con Python",
    badge_url: "https://static.platzi.com/media/achievements/badges-python-7649ea5b-11c5-4b9b-ab45-5b16f1ac778f.png",
    diploma: {
      diploma_url: "https://platzi.com/p/DanielVRamirez/curso/1764-course/diploma/detalle/",
      diploma_image: "https://platzi.com/DanielVRamirez/curso/1764-course/diploma-og/og.jpeg",
      approved_date: "2020-10-27T18:09:14.130Z"
    }
  }
];

// ── Estado del carrusel ────────────────────────────────────────────────────
let certCurrentIndex = 0;   // índice dentro del set original
let certTotalCards   = 0;
let certResizeTimer  = null;
let certAutoTimer    = null;
let certResumeTimer  = null;
let certIsAnimating  = false;

// ── Helpers ────────────────────────────────────────────────────────────────
function getCertCardsPerView() {
  if (window.innerWidth <= 768)  return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function getCertCardWidth() {
  const container = document.getElementById('certCarouselContainer');
  const perView   = getCertCardsPerView();
  const gap       = 24;
  return (container.offsetWidth - (perView - 1) * gap) / perView;
}

function formatCertDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
}

function createCertCard(course) {
  const card = document.createElement('div');
  card.className = 'cert-card';

  const dateStr   = course.diploma?.approved_date ? formatCertDate(course.diploma.approved_date) : '';
  const diplomaUrl = course.diploma?.diploma_url  || '#';
  const diplomaImg = course.diploma?.diploma_image || '';

  card.innerHTML = `
    <div class="cert-badge-wrap">
      <img class="cert-badge-img" src="${course.badge_url}" alt="${course.title}" loading="lazy">
    </div>
    <div class="cert-card-content">
      <h4 class="cert-card-title">${course.title}</h4>
      <p class="cert-card-date"><i class="fas fa-calendar-check"></i> ${dateStr}</p>
    </div>
    <div class="cert-diploma-preview">
      <img src="${diplomaImg}" alt="Diploma de ${course.title}" loading="lazy">
      <div class="cert-diploma-overlay"><i class="fas fa-award"></i></div>
    </div>
    <a href="${diplomaUrl}" target="_blank" rel="noopener noreferrer" class="cert-view-btn">
      <i class="fas fa-external-link-alt"></i> Ver Diploma
    </a>
  `;

  const previewEl = card.querySelector('.cert-diploma-preview');
  previewEl.querySelector('img').addEventListener('error', () => {
    previewEl.style.display = 'none';
  });

  return card;
}

// ── Dots ───────────────────────────────────────────────────────────────────
function buildCarouselDots() {
  const dotsEl = document.getElementById('carouselDots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';
  for (let i = 0; i < certTotalCards; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('aria-label', `Certificación ${i + 1}`);
    dot.addEventListener('click', () => {
      pauseAutoPlay();
      goTo(i, true);
      resumeAutoPlaySoon();
    });
    dotsEl.appendChild(dot);
  }
}

function updateDots(activeIndex) {
  document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex);
  });
}

// ── Traducción del track ───────────────────────────────────────────────────
function applyTrackTranslate(index, animate) {
  const track   = document.getElementById('certTrack');
  const w       = getCertCardWidth();
  const gap     = 24;
  const offset  = index * (w + gap);

  track.style.transition = animate
    ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    : 'none';
  track.style.transform  = `translateX(-${offset}px)`;
}

function setAllCardWidths() {
  const track = document.getElementById('certTrack');
  const w     = getCertCardWidth();
  track.querySelectorAll('.cert-card').forEach(card => {
    card.style.width    = `${w}px`;
    card.style.minWidth = `${w}px`;
  });
}

// ── Navegación ─────────────────────────────────────────────────────────────
function goTo(index, animate) {
  certCurrentIndex = index;
  applyTrackTranslate(certCurrentIndex, animate);
  updateDots(certCurrentIndex % certTotalCards);
}

function advanceOne() {
  if (certIsAnimating) return;
  const nextIdx = certCurrentIndex + 1;

  if (nextIdx >= certTotalCards) {
    // Animar hacia el clon del primer set
    certIsAnimating = true;
    applyTrackTranslate(certTotalCards, true);

    // Tras la animación, saltar silenciosamente al índice 0 real
    setTimeout(() => {
      certCurrentIndex = 0;
      applyTrackTranslate(0, false);
      updateDots(0);
      certIsAnimating = false;
    }, 570);
  } else {
    goTo(nextIdx, true);
  }
}

function retreatOne() {
  if (certIsAnimating) return;

  if (certCurrentIndex <= 0) {
    // Saltar silenciosamente al clon del final y luego animar hacia atrás
    certIsAnimating = true;
    applyTrackTranslate(certTotalCards, false); // posición del clon final (= inicio)
    requestAnimationFrame(() => requestAnimationFrame(() => {
      certCurrentIndex = certTotalCards - 1;
      applyTrackTranslate(certCurrentIndex, true);
      updateDots(certCurrentIndex);
      setTimeout(() => { certIsAnimating = false; }, 570);
    }));
  } else {
    goTo(certCurrentIndex - 1, true);
  }
}

// ── Autoplay ───────────────────────────────────────────────────────────────
function startAutoPlay() {
  clearInterval(certAutoTimer);
  certAutoTimer = setInterval(advanceOne, 3200);
}

function pauseAutoPlay() {
  clearInterval(certAutoTimer);
  clearTimeout(certResumeTimer);
}

function resumeAutoPlaySoon() {
  clearTimeout(certResumeTimer);
  certResumeTimer = setTimeout(startAutoPlay, 4000);
}

// ── Carga principal ────────────────────────────────────────────────────────
async function loadCertifications() {
  const track = document.getElementById('certTrack');
  if (!track) return;

  let courses    = PLATZI_FALLBACK_COURSES;
  let totalCount = 104;

  try {
    const res = await fetch(
      'https://api.platzi.com/students/v1/diplomas/DanielVRamirez/?page=1&page_size=10',
      { mode: 'cors' }
    );
    if (res.ok) {
      const json = await res.json();
      if (json.data && Array.isArray(json.data.courses) && json.data.courses.length > 0) {
        courses    = json.data.courses;
        totalCount = json.data.approved_courses || totalCount;
      }
    }
  } catch (_) { /* usa fallback */ }

  const countEl = document.getElementById('platziCount');
  if (countEl) countEl.textContent = totalCount;

  certTotalCards   = courses.length;
  certCurrentIndex = 0;

  // Renderizar originales + clones para el loop infinito
  track.innerHTML = '';
  courses.forEach(course => track.appendChild(createCertCard(course)));
  const originals = [...track.querySelectorAll('.cert-card')];
  originals.forEach(c => track.appendChild(c.cloneNode(true)));

  buildCarouselDots();
  setAllCardWidths();
  goTo(0, false);
  startAutoPlay();

  // Botones
  document.getElementById('certPrev').addEventListener('click', () => {
    pauseAutoPlay();
    retreatOne();
    resumeAutoPlaySoon();
  });
  document.getElementById('certNext').addEventListener('click', () => {
    pauseAutoPlay();
    advanceOne();
    resumeAutoPlaySoon();
  });

  // Siempre habilitados (loop infinito)
  document.getElementById('certPrev').disabled = false;
  document.getElementById('certNext').disabled = false;

  // Swipe táctil
  const container = document.getElementById('certCarouselContainer');
  let touchStartX = 0;
  container.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 48) {
      pauseAutoPlay();
      if (diff > 0) advanceOne(); else retreatOne();
      resumeAutoPlaySoon();
    }
  }, { passive: true });

  // Pausar al hover
  container.addEventListener('mouseenter', pauseAutoPlay);
  container.addEventListener('mouseleave', startAutoPlay);

  // Recalcular en resize
  window.addEventListener('resize', () => {
    clearTimeout(certResizeTimer);
    certResizeTimer = setTimeout(() => {
      setAllCardWidths();
      applyTrackTranslate(certCurrentIndex, false);
    }, 150);
  });
}

loadCertifications();

// ============================================
// Hero Photo — Fallback si no existe la imagen
// ============================================
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto) {
  heroPhoto.addEventListener('error', () => {
    const heroAvatar = document.querySelector('.hero-avatar');
    if (heroAvatar) heroAvatar.style.display = 'none';
  });
}

// Igual para la foto del CV
const cvPhotoImg = document.querySelector('.cv-photo-img');
if (cvPhotoImg) {
  cvPhotoImg.addEventListener('error', () => {
    const ring = document.querySelector('#cv-printable .cv-photo-ring');
    if (ring) {
      ring.innerHTML = '<div style="width:100%;height:100%;border-radius:50%;background:#16162a;display:flex;align-items:center;justify-content:center;"><i class="fas fa-user" style="font-size:2.5rem;color:#00ff88;"></i></div>';
    }
  });
}

// ============================================
// Descargar CV como PDF
// ============================================

const downloadCvBtn = document.getElementById('downloadCvBtn');
if (downloadCvBtn) {
  downloadCvBtn.addEventListener('click', async () => {
    const btn = downloadCvBtn;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    btn.disabled = true;

    // Overlay de carga
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0a0f;z-index:10000;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px;';
    overlay.innerHTML = '<div style="width:52px;height:52px;border:3px solid rgba(0,255,136,0.2);border-top-color:#00ff88;border-radius:50%;animation:cv-spin 0.8s linear infinite;"></div><p style="color:#00ff88;font-family:Inter,sans-serif;font-size:0.9rem;margin:0;">Generando PDF...</p><style>@keyframes cv-spin{to{transform:rotate(360deg)}}</style>';
    document.body.appendChild(overlay);

    const prevScroll = window.scrollY;
    window.scrollTo(0, 0);

    // 1. Retirar partículas
    const particlesBg      = document.getElementById('particles-bg');
    const particlesParent  = particlesBg.parentNode;
    const particlesNextSib = particlesBg.nextSibling;
    particlesParent.removeChild(particlesBg);

    // 2. Ocultar absolutamente TODO excepto el CV y el overlay
    const mainContent = [];
    [...document.body.children].forEach(el => {
      if (el.id !== 'cv-printable' && el !== overlay && el.tagName !== 'SCRIPT') {
        mainContent.push({ el, prev: el.style.display });
        el.style.display = 'none';
      }
    });

    // 3. Mostrar el CV en su contenedor original
    const cvEl = document.getElementById('cv-printable');
    cvEl.style.display = 'block';

    // Esperar
    await new Promise(res => setTimeout(res, 400));

    const opt = {
      margin:      0,
      filename:    'CV-Daniel-Vaca-Ramirez.pdf',
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale:           2,
        useCORS:         false,
        allowTaint:      false,
        backgroundColor: '#0a0a0f',
        logging:         false,
        width:           794,
        height:          1123,
        windowWidth:     794,
        windowHeight:    1123,
        x:               0,
        y:               0,
        scrollX:         0,
        scrollY:         0
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(cvEl).save();
    } finally {
      cvEl.style.display = 'none';
      
      // Restaurar todo
      mainContent.forEach(({ el, prev }) => el.style.display = prev);
      if (particlesNextSib) {
        particlesParent.insertBefore(particlesBg, particlesNextSib);
      } else {
        particlesParent.appendChild(particlesBg);
      }
      
      overlay.remove();
      window.scrollTo(0, prevScroll);
      btn.innerHTML = originalContent;
      btn.disabled  = false;
    }
  });
}
