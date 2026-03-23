/* ==============================================
   ARCHIVO: script.js
   PROYECTO: Cooperativa San Pedro
   DESCRIPCIÓN: Funciones interactivas de la página
   ============================================== */


/* ==============================================
   1. BUSCADOR DEL HEADER
   ============================================== */

function toggleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    input.classList.toggle('active');

    if (input.classList.contains('active')) {
        input.focus();
    } else {
        input.value = '';
    }
}


/* ==============================================
   2. NAVEGACIÓN
   - Clase .scrolled al hacer scroll
   - Hamburger mobile
   - Acordeón mobile para dropdowns
   ============================================== */

// Scroll → añade clase .scrolled al header
window.addEventListener('scroll', function () {
    const header = document.getElementById('mainHeader');
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
});

// Hamburger toggle
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

if (navToggle && mainNav) {

    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('open');
        mainNav.classList.toggle('open');
    });

    // Acordeón: tap en link de dropdown en mobile
    mainNav.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                this.closest('.has-dropdown').classList.toggle('mob-open');
            }
        });
    });

    // Cierra el nav al tocar un enlace hoja en mobile
    mainNav.querySelectorAll('.drop-link, .nav-item:not(.has-dropdown) .nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) {
                navToggle.classList.remove('open');
                mainNav.classList.remove('open');
            }
        });
    });
}


/* ==============================================
   3. CARRUSEL 3D
   Solo se activa si la página tiene los elementos
   ============================================== */

let actual = 0;
let cards  = [];
let dots   = [];

function actualizarCarrusel() {
    const total = cards.length;
    const prev  = (actual - 1 + total) % total;
    const next  = (actual + 1) % total;

    cards.forEach(c => c.className = 'card-3d');
    dots.forEach(d => d.classList.remove('active'));

    cards[actual].classList.add('active');
    cards[next].classList.add('next');
    cards[prev].classList.add('prev');
    dots[actual].classList.add('active');
}

function moverCarrusel(dir) {
    actual = (actual + dir + cards.length) % cards.length;
    actualizarCarrusel();
}

function irA(index) {
    actual = index;
    actualizarCarrusel();
}

document.addEventListener('DOMContentLoaded', function () {
    const prevBtn = document.querySelector('.btn-3d-prev');
    const nextBtn = document.querySelector('.btn-3d-next');

    if (!prevBtn || !nextBtn) return; // No es la página del carrusel

    cards = Array.from(document.querySelectorAll('.card-3d'));
    dots  = Array.from(document.querySelectorAll('.dot-3d'));

    prevBtn.addEventListener('click', () => moverCarrusel(-1));
    nextBtn.addEventListener('click', () => moverCarrusel(1));

    dots.forEach((dot, i) => dot.addEventListener('click', () => irA(i)));

    // Autoplay cada 4 segundos
    setInterval(() => moverCarrusel(1), 4000);
});


/* ==============================================
   4. EFECTO DE ESCRITURA
   Solo se activa si existe #fraseTexto
   ============================================== */

const fraseEl = document.getElementById('fraseTexto');

if (fraseEl) {
    const texto = "Tu cooperativa de confianza, comprometida con tu bienestar financiero y el desarrollo de nuestra comunidad.";
    let i = 0;

    function escribir() {
        if (i < texto.length) {
            fraseEl.innerHTML = texto.substring(0, i + 1);
            i++;
            setTimeout(escribir, 45);
        }
    }

    setTimeout(escribir, 500);
}


/* ==============================================
   5. CONTADORES ANIMADOS
   Solo se activa si existe .stats-section
   ============================================== */

function animarContador(el, target, duracion) {
    let inicio = 0;
    const incremento = target / (duracion / 16);

    const timer = setInterval(() => {
        inicio += incremento;
        if (inicio >= target) {
            el.textContent = target.toLocaleString();
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(inicio).toLocaleString();
        }
    }, 16);
}

const statsSection = document.querySelector('.stats-section');

if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.querySelectorAll('.stat-numero').forEach(num => {
                    const target = parseInt(num.getAttribute('data-target'));
                    animarContador(num, target, 2000);
                });
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    statsObserver.observe(statsSection);
}


/* ==============================================
   6. SCROLL REVEAL
   Añade clase .visible a elementos .reveal al entrar en viewport
   ============================================== */

const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 80);
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ==============================================
   7. FLIP CARDS — Soporte táctil (móvil / tablet)
   En dispositivos sin hover, el flip se activa al tocar
   ============================================== */

if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.flip-container').forEach(container => {
        container.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
    });
}


/* ==============================================
   8. FILTROS Y BUSCADOR DE AGENCIAS
   Solo se activa si existe #sinResultados
   ============================================== */

const sinResultados = document.getElementById('sinResultados');
if (sinResultados) {

    function filtrar(tipo, btn) {
        document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        document.querySelectorAll('.ag-item').forEach(item => {
            item.style.display = (tipo === 'todas' || item.dataset.tipo === tipo) ? 'flex' : 'none';
        });
        verificar();
    }

    function buscar(q) {
        document.querySelectorAll('.ag-item').forEach(item => {
            item.style.display = item.dataset.nombre.includes(q.toLowerCase()) ? 'flex' : 'none';
        });
        verificar();
    }

    function verificar() {
        const visibles = [...document.querySelectorAll('.ag-item')].filter(i => i.style.display !== 'none').length;
        sinResultados.style.display = visibles === 0 ? 'block' : 'none';
    }
}
