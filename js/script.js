/* 1. BUSCADOR */
const jagel = window.location.pathname.includes('/pages/') ? '../' : '';

const SEARCH_INDEX = [
    { label: 'Inicio',              url: jagel + 'index.html',                   keywords: ['inicio', 'home', 'principal', 'bienvenido'] },
    { label: 'Quiénes Somos',       url: jagel + 'pages/about.html',              keywords: ['quienes somos', 'quiénes somos', 'nosotros', 'cooperativa', 'sobre'] },
    { label: 'Historia',            url: jagel + 'pages/historia.html',           keywords: ['historia', 'fundacion', 'fundación', 'origen', 'años'] },
    { label: 'Misión y Visión',     url: jagel + 'pages/mision-vision.html',      keywords: ['mision', 'misión', 'vision', 'visión', 'valores', 'objetivos'] },
    { label: 'Ahorro',              url: jagel + 'pages/ahorro.html',             keywords: ['ahorro', 'ahorros', 'cuenta', 'deposito', 'depósito', 'ahorrar'] },
    { label: 'Préstamos',           url: jagel + 'pages/prestamos.html',          keywords: ['prestamo', 'préstamo', 'prestamos', 'préstamos', 'credito', 'crédito', 'financiamiento', 'fianza'] },
    { label: 'Tarjeta de Crédito',  url: jagel + 'pages/tarjeta-credito.html',    keywords: ['tarjeta', 'credito', 'crédito', 'visa', 'tarjeta de credito', 'tarjeta de crédito'] },
    { label: 'Agencias',            url: jagel + 'pages/agencias.html',           keywords: ['agencia', 'agencias', 'sucursal', 'sucursales', 'oficina', 'ubicacion', 'ubicación'] },
    { label: 'Agentes',             url: jagel + 'pages/agentes.html',            keywords: ['agente', 'agentes', 'corresponsal', 'corresponsales', 'punto de servicio'] },
    { label: 'Contáctanos',         url: jagel + 'pages/contactanos.html',        keywords: ['contacto', 'contactanos', 'contáctanos', 'telefono', 'teléfono', 'correo', 'escribir', 'comunicar'] },
    { label: 'Memoria de Labores',  url: jagel + 'pages/memoria-labores.html',    keywords: ['memoria', 'labores', 'memoria de labores', 'informe', 'reporte', 'anual'] },
];

function buscarEnIndice(query) {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return SEARCH_INDEX.find(item =>
        item.keywords.some(kw => kw.includes(q) || q.includes(kw))
    ) || null;
}

function mostrarToast(msg, tipo) {
    let toast = document.getElementById('searchToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'searchToast';
        toast.style.cssText = `
            position:fixed; bottom:30px; left:50%; transform:translateX(-50%) translateY(20px);
            background:#033E81; color:white; padding:14px 28px; border-radius:50px;
            font-size:0.9rem; font-weight:600; z-index:99999; opacity:0;
            transition:opacity 0.3s ease, transform 0.3s ease;
            box-shadow:0 8px 30px rgba(0,0,0,0.2); white-space:nowrap;
        `;
        document.body.appendChild(toast);
    }
    if (tipo === 'error') toast.style.background = '#c0392b';
    else toast.style.background = '#033E81';

    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

function realizarBusqueda() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;

    const resultado = buscarEnIndice(query);
    if (resultado) {
        mostrarToast('Ir a: ' + resultado.label, 'ok');
        setTimeout(() => { window.location.href = resultado.url; }, 500);
    } else {
        mostrarToast('No se encontró "' + query + '" en la página', 'error');
    }
}

function toggleSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    const estaActivo = input.classList.contains('active');

    if (!estaActivo) {
        input.classList.add('active');
        input.focus();
    } else if (input.value.trim() !== '') {
        realizarBusqueda();
    } else {
        input.classList.remove('active');
        input.value = '';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('searchInput');
    if (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') realizarBusqueda();
            if (e.key === 'Escape') {
                input.classList.remove('active');
                input.value = '';
            }
        });
    }
});


/* 2. NAVEGACIÓN */
window.addEventListener('scroll', function () {
    const header = document.getElementById('mainHeader');
    if (header) header.classList.toggle('scrolled', window.scrollY > 30);
});

const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('mainNav');

if (navToggle && mainNav) {

    navToggle.addEventListener('click', function () {
        navToggle.classList.toggle('open');
        mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('.has-dropdown > .nav-link').forEach(link => {
        link.addEventListener('click', function (e) {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                this.closest('.has-dropdown').classList.toggle('mob-open');
            }
        });
    });

    mainNav.querySelectorAll('.drop-link, .nav-item:not(.has-dropdown) .nav-link').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) {
                navToggle.classList.remove('open');
                mainNav.classList.remove('open');
            }
        });
    });
}


/* 3. CARRUSEL 3D */

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

    if (!prevBtn || !nextBtn) return;

    cards = Array.from(document.querySelectorAll('.card-3d'));
    dots  = Array.from(document.querySelectorAll('.dot-3d'));

    prevBtn.addEventListener('click', () => moverCarrusel(-1));
    nextBtn.addEventListener('click', () => moverCarrusel(1));

    dots.forEach((dot, i) => dot.addEventListener('click', () => irA(i)));

    setInterval(() => moverCarrusel(1), 4000);
});


/* 4. EFECTO DE ESCRITURA */

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


/* 5. CONTADORES ANIMADOS */

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


/* 6. SCROLL REVEAL */

const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
        if (e.isIntersecting) setTimeout(() => e.target.classList.add('visible'), i * 80);
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* 7. FLIP CARDS — soporte táctil */

if (window.matchMedia('(hover: none)').matches) {
    document.querySelectorAll('.flip-container').forEach(container => {
        container.addEventListener('click', function () {
            this.classList.toggle('flipped');
        });
    });
}


/* 8. FILTROS DE AGENCIAS */

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
