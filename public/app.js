// ============================================================
// app.js — Lógica del Frontend (Login + Dashboard + Rutina)
// ============================================================
// Este script maneja:
//   1. Login con fetch a /api/auth/login
//   2. Almacenamiento del JWT en localStorage
//   3. Dashboard con historial de entrenamientos (GET /api/sesiones)
//   4. Carga de la rutina para entrenar usando el token en headers
//   5. Navegación entre vista "Historial" y "Entrenar"
//   6. Cierre de sesión (logout)

// ============================================================
// REFERENCIAS AL DOM (se obtienen UNA vez al inicio)
// ============================================================
const loginSection    = document.getElementById('login-section');
const appContent      = document.getElementById('app-content');
const loginForm       = document.getElementById('login-form');
const emailInput      = document.getElementById('login-email');
const passwordInput   = document.getElementById('login-password');
const loginError      = document.getElementById('login-error');
const btnLogin        = document.getElementById('btn-login');
const btnLogout       = document.getElementById('btn-logout');

// Navegación entre vistas
const btnTabRutinas   = document.getElementById('btn-tab-rutinas');
const btnTabPerfil    = document.getElementById('btn-tab-perfil');
const btnTabEntrenar  = document.getElementById('btn-tab-entrenar');
const rutinasView     = document.getElementById('rutinas-view');
const perfilView      = document.getElementById('perfil-view');
const entrenarView    = document.getElementById('entrenar-view');
const ajustesView     = document.getElementById('ajustes-view');
const historialContainer = document.getElementById('historial-container');
const perfilEmail     = document.getElementById('perfil-email');
const perfilNombre    = document.getElementById('perfil-nombre');
const perfilAvatarImg = document.getElementById('perfil-avatar-img');
const avatarInput     = document.getElementById('avatar-input');

// Dashboard: rutinas
const rutinasContainer = document.getElementById('rutinas-container');
const limiteMsg        = document.getElementById('limite-msg');

// Modal de creación de rutinas
const modalOverlay        = document.getElementById('modal-overlay');
const inputNombreRutina   = document.getElementById('input-nombre-rutina');
const btnModalCrear       = document.getElementById('btn-modal-crear');
const btnModalCerrar      = document.getElementById('btn-modal-cerrar');
const btnModalCancelar    = document.getElementById('btn-modal-cancelar');
const modalError              = document.getElementById('modal-error');
const inputDescripcionRutina  = document.getElementById('input-descripcion-rutina');

// Vista "Entrenar" (rutina con ejercicios)
const btnFinalizar       = document.getElementById('btn-finalizar');
const btnDescartar       = document.getElementById('btn-descartar');
const accionesEntreno    = document.getElementById('acciones-entreno');
const tituloEl           = document.getElementById('titulo-rutina');
const contenedorEl       = document.getElementById('contenedor-ejercicios');
const nombreEl           = tituloEl?.querySelector('.rutina-nombre');
const descripcionEl      = tituloEl?.querySelector('.rutina-descripcion');

// Selector de ejercicios extra (Hito 11 Parte 3)
const extraEjercicioWrapper  = document.getElementById('extra-ejercicio-wrapper');
const listaEjerciciosExtra   = document.getElementById('lista-ejercicios-extra');

// Checkboxes del modal (Hito 11 Parte 3)
const modalEjercicios        = document.getElementById('modal-ejercicios');

// Temporizador de entrenamiento
const temporizadorEl   = document.getElementById('temporizador');
const timerDisplay     = document.getElementById('timer-display');

// Registro de usuarios
const loginWrapper        = document.getElementById('login-form-wrapper');
const registerWrapper     = document.getElementById('register-form-wrapper');
const regForm             = document.getElementById('register-form');
const regNombre           = document.getElementById('reg-nombre');
const regEmail            = document.getElementById('reg-email');
const regPassword         = document.getElementById('reg-password');
const btnRegister         = document.getElementById('btn-register');
const regError            = document.getElementById('register-error');
const regSuccess          = document.getElementById('register-success');
const toggleToRegister    = document.getElementById('toggle-to-register');
const toggleToLogin       = document.getElementById('toggle-to-login');

// Link "¿Olvidaste tu contraseña?" — se inyecta una sola vez debajo del botón de login
if (!document.getElementById('forgot-pass-link')) {
  const btnLogin = document.getElementById('btn-login');
  if (btnLogin) {
    const forgotLink = document.createElement('p');
    forgotLink.id = 'forgot-pass-link';
    forgotLink.className = 'auth-toggle-link';
    forgotLink.style.marginTop = '8px';
    forgotLink.innerHTML = '<a href="/forgot-password.html" class="auth-toggle-btn">¿Olvidaste tu contraseña?</a>';
    btnLogin.parentNode.insertBefore(forgotLink, btnLogin.nextSibling);
  }
}

// Eliminación de cuenta
const btnEliminarCuenta   = document.getElementById('btn-eliminar-cuenta');

// Onboarding
const modalOnboarding      = document.getElementById('modal-onboarding');
const formOnboarding       = document.getElementById('form-onboarding');
const stepForm             = document.getElementById('onboarding-step-form');
const stepPregunta         = document.getElementById('onboarding-step-pregunta');
const stepSpinner          = document.getElementById('onboarding-step-spinner');
const btnRecomendacionSi   = document.getElementById('btn-recomendacion-si');
const btnRecomendacionNo   = document.getElementById('btn-recomendacion-no');

// Datos del formulario de onboarding (se guardan al hacer submit)
let onboardingData = null;

// ============================================================
// LOGROS — Definición de los 12 logros del sistema
// ============================================================
const LOGROS = [
  {
    id: 1, dias: 1,
    imagen: 'imagen/Logro_1_Un_Dia.png',
    nombre: 'Primer Paso',
    desc: 'Completaste tu primer día de entrenamiento.'
  },
  {
    id: 2, dias: 7,
    imagen: 'imagen/Logro_2_7_Dias.png',
    nombre: 'Semana Imbatible',
    desc: '7 días de entrenamiento completados.'
  },
  {
    id: 3, dias: 15,
    imagen: 'imagen/Logro_3_15_Dias.png',
    nombre: 'Hábito Formado',
    desc: '15 días. Ya es parte de tu rutina.'
  },
  {
    id: 4, dias: 30,
    imagen: 'imagen/Logro_4_30_Dias.png',
    nombre: 'Disciplina de Acero',
    desc: 'Un mes entero entrenando. Imparable.'
  },
  {
    id: 5, dias: 50,
    imagen: 'imagen/Logro_5_50_Dias.png',
    nombre: 'Mitad de Camino',
    desc: '50 días. La plata ya brilla en vos.'
  },
  {
    id: 6, dias: 75,
    imagen: 'imagen/Logro_6_75_Dias.png',
    nombre: 'Rompiendo Barreras',
    desc: '75 días. Nada te detiene.'
  },
  {
    id: 7, dias: 100,
    imagen: 'imagen/Logro_7_100_Dias.png',
    nombre: 'El Club de los 100',
    desc: '100 días. Bienvenido a la élite.'
  },
  {
    id: 8, dias: 150,
    imagen: 'imagen/Logro_8_150_Dias.png',
    nombre: 'Modo Bestia',
    desc: '150 días de pura dedicación.'
  },
  {
    id: 9, dias: 200,
    imagen: 'imagen/Logro_9_200_Dias.png',
    nombre: 'Estilo de Vida',
    desc: '200 días. Esto ya es quién sos.'
  },
  {
    id: 10, dias: 250,
    imagen: 'imagen/Logro_10_250_Dias.png',
    nombre: 'Imparable',
    desc: '250 días. Leyenda en construcción.'
  },
  {
    id: 11, dias: 300,
    imagen: 'imagen/Logro_11_300_Dias.png',
    nombre: 'Titán',
    desc: '300 días. Atlas envidiaría tu constancia.'
  },
  {
    id: 12, dias: 365,
    imagen: 'imagen/Logro_12_365_Dias.png',
    nombre: 'Leyenda del Gym',
    desc: 'Un año completo. Sos una leyenda.'
  },
];

// ============================================================
// PROGRAMA PRINCIPIANTE — 3 rutinas de adaptación (constantes del sistema)
// ============================================================
const PROGRAMA_PRINCIPIANTE = {
  descripcion: `El programa de adaptación está diseñado para que tu cuerpo
aprenda los movimientos básicos antes de aumentar la carga. Seguí el orden
recomendado: Empuje → descanso → Tirón → descanso → Piernas → descanso.
Podés hacer las rutinas en días distintos o adaptarlo a tu disponibilidad —
la app es una guía, no una regla estricta.`,

  descansoPosta: `⏱️ Descansá 2 a 3 minutos entre series y 3 a 4 minutos entre ejercicios.
No apures el descanso — en esta etapa la recuperación es tan importante como el ejercicio.`,

  notaEntrenador: `👨‍🏫 Si tenés entrenador, seguí sus recomendaciones de peso y técnica.
Las sugerencias de esta app son un punto de partida aproximado.`,

  notaPeso: `⚖️ Para el peso inicial: elegí un peso con el que puedas completar
las repeticiones indicadas manteniendo buena técnica. Si llegás a las 12 reps
con facilidad, subí el peso en tu próxima sesión. Si no llegás a 8 reps, bajalo.
El peso correcto es el que te cuesta pero podés controlar.`,

  rutinas: [
    {
      id: 'empuje',
      nombre: 'Día 1 — Empuje',
      emoji: '💪',
      descripcion: 'Pecho, hombros y tríceps. Movimientos de empuje.',
      musculos: 'Pecho · Hombros · Tríceps',
      color: '#e94560',
      ejercicios: [
        {
          nombre: 'Flexiones',
          nombreDB: 'Flexiones',
          tipo: 'calentamiento',
          series: 2,
          repeticiones: '15',
          peso: 'Peso corporal',
          instruccion: 'Calentamiento — activá pecho, hombros y tríceps. Controlá el movimiento, no apures.',
        },
        {
          nombre: 'Press de banca',
          nombreDB: 'Press de banca',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Barra sola (20 kg) para empezar. Subí de a 2.5 kg cuando domines la técnica.',
          instruccion: 'Tumbate en el banco, agarrá la barra al ancho de los hombros. Bajá hasta rozar el pecho y empujá hacia arriba de forma controlada.',
        },
        {
          nombre: 'Press de hombros con mancuernas',
          nombreDB: 'Press de hombros con mancuernas',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con 4-6 kg por mancuerna. Subí cuando puedas completar 12 reps sin perder postura.',
          instruccion: 'Sentado o parado, llevá las mancuernas a la altura de los hombros y empujá hacia arriba sin arquear la espalda.',
        },
        {
          nombre: 'Aperturas en máquina',
          nombreDB: 'Aperturas en máquina',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Peso bajo para empezar (lo que marque la máquina como mínimo). Sentí el pecho trabajar.',
          instruccion: 'Ajustá el asiento para que los mangos queden a la altura del pecho. Cerrá lentamente y volvé con control.',
        },
        {
          nombre: 'Elevaciones laterales con mancuernas',
          nombreDB: 'Elevaciones laterales con mancuernas',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con 2-4 kg. Este ejercicio se siente con poco peso si se hace bien.',
          instruccion: 'Parado, levantá los brazos hacia los lados hasta la altura del hombro con los codos ligeramente flexionados. Bajá con control.',
        },
        {
          nombre: 'Jalones de tríceps en polea',
          nombreDB: 'Jalones de tríceps en polea',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Peso que permita extender el codo completamente sin mover el cuerpo.',
          instruccion: 'Parado frente a la polea, pegá los codos al cuerpo y empujá la cuerda hacia abajo hasta extender los brazos. Volvé con control.',
        },
      ],
    },
    {
      id: 'tiron',
      nombre: 'Día 2 — Tirón',
      emoji: '🏋️',
      descripcion: 'Espalda y bíceps. Movimientos de tracción.',
      musculos: 'Espalda · Bíceps · Hombro posterior',
      color: '#6c63ff',
      ejercicios: [
        {
          nombre: 'Dominadas agarre neutro',
          nombreDB: 'Dominadas agarre neutro',
          tipo: 'calentamiento',
          series: 2,
          repeticiones: '15',
          peso: 'Peso corporal',
          instruccion: 'Calentamiento — si no podés hacer dominadas, hacé el movimiento en máquina asistida o jalones con poco peso.',
        },
        {
          nombre: 'Jalón dorsal',
          nombreDB: 'Jalón dorsal',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con un peso que puedas bajar hasta el pecho sin balancear el torso.',
          instruccion: 'Sentado, agarrá la barra al ancho de los hombros. Jalá hacia el pecho llevando los codos hacia abajo y atrás. Volvé con control.',
        },
        {
          nombre: 'Remo en polea sentado',
          nombreDB: 'Remo en polea sentado',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Peso moderado — sentí la espalda media trabajar, no los brazos.',
          instruccion: 'Sentado, agarrá el agarre en V. Jalá hacia el abdomen llevando los codos atrás y apretando la espalda al final del movimiento.',
        },
        {
          nombre: 'Encogimientos con mancuernas',
          nombreDB: 'Encogimientos con mancuernas',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con 8-12 kg por mancuerna. Subí de a 2 kg.',
          instruccion: 'Parado con mancuernas a los lados, subí los hombros hacia las orejas y mantenelos arriba 1 segundo. Bajá lentamente.',
        },
        {
          nombre: 'Curl con mancuernas agarre martillo',
          nombreDB: 'Curl con mancuernas agarre martillo',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con 4-6 kg. Los pulgares apuntan al techo durante todo el movimiento.',
          instruccion: 'Parado, con las palmas enfrentadas, flexioná el codo subiendo la mancuerna. No balancees el cuerpo. Bajá con control.',
        },
        {
          nombre: 'Remo con mancuerna',
          nombreDB: 'Remo con mancuerna',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con 6-10 kg. Controlá que el movimiento lo haga la espalda, no el brazo.',
          instruccion: 'Apoyá una rodilla y mano en el banco. Con la otra mano jalá la mancuerna hacia la cadera llevando el codo hacia el techo.',
        },
      ],
    },
    {
      id: 'piernas',
      nombre: 'Día 3 — Piernas',
      emoji: '🦵',
      descripcion: 'Cuádriceps, isquiotibiales, glúteos y gemelos.',
      musculos: 'Cuádriceps · Isquiotibiales · Glúteos · Gemelos',
      color: '#00d2aa',
      ejercicios: [
        {
          nombre: 'Sentadilla con el peso corporal',
          nombreDB: 'Sentadilla con el peso corporal',
          tipo: 'calentamiento',
          series: 2,
          repeticiones: '15',
          peso: 'Peso corporal',
          instruccion: 'Calentamiento — activá cuádriceps, glúteos y caderas. Bajá hasta que los muslos queden paralelos al piso.',
        },
        {
          nombre: 'Prensa inclinada',
          nombreDB: 'Prensa inclinada',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con el peso de la máquina vacía. Aprendé la técnica antes de agregar discos.',
          instruccion: 'Ajustá el respaldo. Colocá los pies al ancho de los hombros en la plataforma. Bajá hasta 90° de rodilla y empujá sin bloquear las rodillas arriba.',
        },
        {
          nombre: 'Curl femoral tumbado',
          nombreDB: 'Curl femoral tumbado',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Peso ligero para empezar — el músculo femoral suele ser más débil en principiantes.',
          instruccion: 'Tumbado boca abajo en la máquina, flexioná las rodillas llevando los talones hacia los glúteos. Volvé con control.',
        },
        {
          nombre: 'Extensión de piernas',
          nombreDB: 'Extensión de piernas',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Peso moderado — no bloquees la rodilla al extender.',
          instruccion: 'Sentado en la máquina, extendé las piernas hasta casi llegar a la posición recta. Bajá lentamente sin soltar el peso.',
        },
        {
          nombre: 'Gemelo en máquina de pie',
          nombreDB: 'Gemelo en máquina de pie',
          tipo: 'principal',
          series: 3,
          repeticiones: '10-12',
          peso: 'Empezá con poco peso — los gemelos se trabajan mejor con rango completo de movimiento.',
          instruccion: 'Colocá los hombros bajo los apoyos. Subí en puntas de pie lo más alto posible, mantenelo 1 segundo y bajá hasta sentir el estiramiento.',
        },
      ],
    },
  ],
};

// ============================================================
// CSS DEL TOUR (inyectado dinámicamente)
// ============================================================
const tourCSS = `
  .tour-backdrop {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    pointer-events: all;
    transition: opacity 0.3s;
  }
  .tour-highlight {
    position: relative !important;
    z-index: 10001 !important;
    pointer-events: none;
    background-color: #1b1e31 !important;
    box-shadow: 0 0 0 3px #6c63ff, 0 0 16px rgba(108,99,255,0.5) !important;
  }
  .tour-tooltip {
    position: fixed;
    z-index: 10002;
    background: #6c63ff;
    color: #fff;
    padding: 16px;
    border-radius: 12px;
    width: 280px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    font-size: 14px;
    line-height: 1.5;
    transition: all 0.3s ease;
  }
  .tour-tooltip-btn {
    background: #fff;
    color: #6c63ff;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    float: right;
    margin-top: 12px;
  }
`;
const tourStyleEl = document.createElement('style');
tourStyleEl.textContent = tourCSS;
document.head.appendChild(tourStyleEl);

// ============================================================
// PAGINACIÓN DEL HISTORIAL
// ============================================================
let historialPaginaActual = 1;
const HISTORIAL_POR_PAGINA = 10;
let historialDatosCompletos = [];
let userData = null;

// ============================================================
// PANEL DE DETALLE DE EJERCICIO (Hito 15)
// ============================================================
const panelDetalle       = document.getElementById('panel-detalle-ejercicio');
let   panelDetalleImg    = document.getElementById('panel-detalle-img');
const panelDetalleNombre = document.getElementById('panel-detalle-nombre');
const panelDetalleMusculo = document.getElementById('panel-detalle-musculo');
const panelDetalleDesc   = document.getElementById('panel-detalle-desc');
const panelDetalleBack   = document.getElementById('panel-detalle-back');

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================
// Guardamos el ID de la rutina que se está mostrando actualmente
// en la vista "Entrenar". Se actualiza cada vez que el usuario
// hace clic en una rutina del dashboard.
let rutinaActualId = null;

// Temporizador de entrenamiento activo
let intervaloReloj = null;
let horaInicio     = null;
let segundosTranscurridos = 0;

// Estado de entrenamiento activo
let entrenamientoActivo = false;
let rutinaActivaNombre  = '';
let pendingRutinaId     = null;

// Catálogo de ejercicios (se carga UNA vez desde la API)
// Se usa para:
//   1. Renderizar los checkboxes en el modal de "Nueva Rutina"
//   2. Poblar el <select> de "Agregar Ejercicio Extra"
let catalogoEjercicios = [];

// Hito 16: Caché de la última sesión para sobrecarga progresiva
// { [ejercicio_id]: [{peso, repeticiones}, ...] } | null
let ultimaSesionData = null;

// Buscadores
const buscadorModal  = document.getElementById('buscador-modal-ejercicios');
const buscadorExtra  = document.getElementById('buscador-extra-ejercicios');

// ============================================================
// UTILIDAD: obtener el token guardado
// ============================================================
// localStorage es como un mini almacén que el navegador le da
// a cada sitio web. Los datos persisten aunque cierres la
// pestaña o el navegador.
//
// Acá guardamos el JWT con la clave 'token'. Mientras el
// token no expire (7 días), el usuario no necesita volver
// a iniciar sesión.
function getToken() {
  return localStorage.getItem('token');
}

// ============================================================
// extraerEmailDelToken()
// ============================================================
// Decodifica el payload del JWT (parte central) sin verificar
// la firma — solo lectura, seguro para frontend.
// Devuelve el email si existe, o null si no hay token.
function extraerEmailDelToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.email || null;
  } catch {
    return null;
  }
}

function extraerNombreDelToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.nombre || null;
  } catch {
    return null;
  }
}

// ============================================================
// ESTADO TEMPORAL DE SELECCIÓN PARA MODAL DE EJERCICIOS
// ============================================================
// Set de IDs de ejercicios seleccionados en el modal. Se usa
// para preservar la selección cuando el usuario filtra/busca
// y el DOM se redibuja.
let ejerciciosSeleccionadosTemp = new Set();

// Estado de edición de rutina
// null = modo creación, number = modo edición con ese ID
let rutinaEnEdicionId = null;

// ============================================================
// ONBOARDING — Modal bloqueante para nuevos usuarios
// ============================================================

function mostrarModalOnboarding() {
  modalOnboarding?.classList.remove('hidden');
}

function ocultarModalOnboarding() {
  modalOnboarding?.classList.add('hidden');
}

// ============================================================
// verificarOnboarding() — Busca perfil y muestra modal si falta
// ============================================================
async function verificarOnboarding() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/usuarios/me', {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (!res.ok) return;
    const json = await res.json();
    const usuario = json.data;
    if (usuario && !usuario.onboarding_completado) {
      mostrarModalOnboarding();
    }
  } catch (err) {
    console.error('Error al verificar onboarding:', err.message);
  }
}

// ============================================================
// TEMPORIZADOR DE ENTRENAMIENTO
// ============================================================

function formatearTiempo(segundos) {
  const m = String(Math.floor(segundos / 60)).padStart(2, '0');
  const s = String(segundos % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function mostrarFloatingTimer() {
  const ft = document.getElementById('floating-timer');
  if (ft) ft.classList.remove('hidden');
  const ftd = document.getElementById('floating-timer-display');
  if (ftd) ftd.textContent = formatearTiempo(segundosTranscurridos);
}

function ocultarFloatingTimer() {
  const ft = document.getElementById('floating-timer');
  if (ft) ft.classList.add('hidden');
}

function iniciarTemporizador() {
  detenerTemporizador();

  segundosTranscurridos = 0;
  horaInicio = Date.now();
  if (timerDisplay) timerDisplay.textContent = '00:00';
  if (temporizadorEl) temporizadorEl.classList.remove('hidden');
  // La burbuja flotante NO se muestra acá — aparece solo cuando
  // el usuario sale de la vista Entrenar con un training activo.

  intervaloReloj = setInterval(() => {
    segundosTranscurridos = Math.floor((Date.now() - horaInicio) / 1000);
    const display = formatearTiempo(segundosTranscurridos);
    if (timerDisplay) timerDisplay.textContent = display;
    // Sincronizar burbuja flotante
    const ftd = document.getElementById('floating-timer-display');
    if (ftd) ftd.textContent = display;
  }, 1000);
}

function detenerTemporizador() {
  if (intervaloReloj) {
    clearInterval(intervaloReloj);
    intervaloReloj = null;
  }
  if (temporizadorEl) temporizadorEl.classList.add('hidden');
  ocultarFloatingTimer();
  return segundosTranscurridos;
}

function obtenerMinutosTranscurridos() {
  // Redondea al minuto más cercano
  return Math.round(segundosTranscurridos / 60);
}

// ============================================================
// FUNCIONES DE PERSISTENCIA DEL ESTADO DEL ENTRENAMIENTO
// ============================================================

// guardarEstadoEntrenamiento() — Guarda el estado actual del
// entrenamiento en localStorage para poder restaurarlo si el
// usuario cierra la página o navega accidentalmente.
function guardarEstadoEntrenamiento() {
  const cards = document.querySelectorAll('#contenedor-ejercicios .card');
  const ejercicios = Array.from(cards).map(card => {
    const seriesRows = card.querySelectorAll('.serie-row');
    return {
      id: Number(card.dataset.ejercicioId),
      checked: card.querySelector('.check-serie')?.checked || false,
      notas: card.querySelector('.ejercicio-notas')?.value || '',
      series: Array.from(seriesRows).map(row => ({
        peso: row.querySelector('input[type="number"]')?.value || '',
        reps: row.querySelectorAll('input[type="number"]')[1]?.value || ''
      }))
    };
  });

  const draft = {
    rutinaActualId: rutinaActualId && Number.isFinite(rutinaActualId) ? rutinaActualId : null,
    horaInicio: horaInicio || null,
    segundosTranscurridos: segundosTranscurridos || 0,
    ejercicios,
    ejerciciosExtraIds: window.ejerciciosExtraIds || []
  };

  localStorage.setItem('entrenamiento_draft', JSON.stringify(draft));

  // ============================================================
  // Mostrar feedback visual de guardado (Hito 5 — Mejora 1)
  // ============================================================
  // Crea un elemento flotante "✓ Guardado" que aparece por
  // 1.5 segundos cada vez que se guarda el draft.
  // clearTimeout evita parpadeos si se llama seguido.
  let feedbackEl = document.getElementById('draft-guardado-feedback');
  if (!feedbackEl) {
    feedbackEl = document.createElement('div');
    feedbackEl.id = 'draft-guardado-feedback';
    feedbackEl.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 16px;
      background: rgba(0,0,0,0.7);
      color: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      z-index: 9999;
    `;
    feedbackEl.textContent = '✓ Guardado';
    document.body.appendChild(feedbackEl);
  }

  feedbackEl.style.opacity = '1';
  clearTimeout(feedbackEl._timeout);
  feedbackEl._timeout = setTimeout(() => {
    feedbackEl.style.opacity = '0';
  }, 1500);
}

// limpiarEstadoEntrenamiento() — Elimina el draft de localStorage
// cuando el entrenamiento finaliza, se descarta, o se hace logout.
function limpiarEstadoEntrenamiento() {
  localStorage.removeItem('entrenamiento_draft');
}

// ============================================================
// limpiarEstadoDeEmergencia() — Destrucción de draft zombie
// ============================================================
// Elimina TODAS las claves de sesión/draft del localStorage.
// No recarga — solo limpia para que el dashboard fluya normal.
//
// ¿CUÁNDO SE USA?
//   Cuando restaurarEstadoEntrenamiento() detecta un draft
//   inválido (404/403) que pertenece a otro usuario o a una
//   rutina eliminada.
function limpiarEstadoDeEmergencia() {
  // Keys conocidas de la app
  localStorage.removeItem('entrenamiento_draft');
  localStorage.removeItem('entrenamiento_en_curso');
  localStorage.removeItem('draft_rutina_id');
}

// extraerUsuarioIdDelToken() — Lee el usuario_id del JWT sin verificar firma
function extraerUsuarioIdDelToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.usuario_id || null;
  } catch {
    return null;
  }
}

// ============================================================
// formatearPeso(kg) — Convierte y formatea un valor de peso
// según la preferencia del usuario en localStorage.
// Siempre recibe kg (como está en la BD) y devuelve
// el string formateado para mostrar al usuario.
// ============================================================
function formatearPeso(kg) {
  if (kg === null || kg === undefined || kg === '' || isNaN(Number(kg))) return '—';
  const unidad = localStorage.getItem('unidad_peso') || 'kg';
  const valor = parseFloat(kg);
  if (unidad === 'lbs') {
    return `${(valor * 2.20462).toFixed(1)} lbs`;
  }
  return `${valor} kg`;
}

function unidadPesoLabel() {
  return localStorage.getItem('unidad_peso') || 'kg';
}

// Convierte el valor que ingresó el usuario a kg para la BD.
// Si la preferencia es lbs, divide por 2.20462.
// Si es kg, devuelve el valor tal cual.
function aKg(valor) {
  if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) return null;
  const unidad = localStorage.getItem('unidad_peso') || 'kg';
  const num = parseFloat(valor);
  return unidad === 'lbs' ? parseFloat((num / 2.20462).toFixed(2)) : num;
}

// Convierte el valor que ingresó el usuario a cm para la BD.
// Si la preferencia es in, multiplica por 2.54.
// Si es cm, devuelve el valor tal cual.
function aCm(valor) {
  if (valor === null || valor === undefined || valor === '' || isNaN(Number(valor))) return null;
  const unidad = localStorage.getItem('unidad_estatura') || 'cm';
  const num = parseFloat(valor);
  return unidad === 'in' ? parseFloat((num * 2.54).toFixed(1)) : num;
}

// restaurarEstadoEntrenamiento() — Intenta recuperar un draft
// guardado. Si existe y la rutina sigue disponible, restaura
// el estado visual (checkboxes, notas) y el temporizador.
//
// Devuelve true si se restauró, false si no había draft o falló.
// Es NO-BLOQUEANTE: si falla, la app sigue su flujo normal.
async function restaurarEstadoEntrenamiento() {
  const raw = localStorage.getItem('entrenamiento_draft');
  if (!raw) return false;

  let draft;
  try { draft = JSON.parse(raw); } catch { return false; }

  const usuarioId = extraerUsuarioIdDelToken();
  const usuarioNombre = extraerNombreDelToken() || 'desconocido';
  console.log(`Intentando restaurar rutina ID: ${draft.rutinaActualId} para usuario: ${usuarioNombre} (ID: ${usuarioId})`);

  // ============================================================
  // VALIDACIÓN: ID inválido en el draft
  // ============================================================
  // Si el draft se guardó con null/undefined/NaN (ej: después de
  // finalizar o descartar), o con el string "null" (error de
  // serialización previa), no es un draft zombie — solo está
  // corrupto. No ejecutamos limpiarEstadoDeEmergencia porque
  // el usuario no perdió nada. Simplemente ignoramos.
  const draftId = Number(draft.rutinaActualId);
  if (!draftId || !Number.isFinite(draftId) || draft.rutinaActualId === 'null') {
    console.warn('Draft sin ID de rutina válido. Ignorando.');
    localStorage.removeItem('entrenamiento_draft');
    return false;
  }

  try {
    const res = await fetch(`/api/rutinas/${draftId}`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!res.ok) {
      // Draft inválido: la rutina NO existe o NO pertenece al usuario
      console.warn(`Draft inválido — la rutina ${draftId} no está disponible para este usuario (${res.status}). Limpiando...`);
      limpiarEstadoDeEmergencia();
      return false;
    }
    const json = await res.json();
    if (!json.data) {
      // Datos vacíos (caso extremo, no debería pasar con 200)
      console.warn('Draft con datos vacíos del servidor. Limpiando...');
      limpiarEstadoDeEmergencia();
      return false;
    }
    const rutina = json.data;

    // Renderizar la rutina usando la función existente
    await cargarRutina(draft.rutinaActualId);

    // Asegurar que el catálogo de ejercicios esté cargado
    // para poder reconstruir los ejercicios extra
    await cargarCatalogoEjercicios();

    // ============================================================
    // RECONCILIAR DOM CON EL DRAFT
    // ============================================================
    // 1. Sacar del DOM los ejercicios que fueron eliminados
    const draftIds = new Set(draft.ejercicios.map(e => e.id));
    document.querySelectorAll('#contenedor-ejercicios .card').forEach(card => {
      if (!draftIds.has(Number(card.dataset.ejercicioId))) {
        card.remove();
      }
    });

    // 2. Agregar al DOM los ejercicios extra que estaban en el draft
    const originalIds = new Set(rutina.ejercicios.map(e => e.id));
    for (const savedEj of draft.ejercicios) {
      if (!originalIds.has(savedEj.id)) {
        const ejercicio = catalogoEjercicios?.find(e => e.id === savedEj.id);
        if (ejercicio) {
          const card = crearCardEjercicioExtra(ejercicio, savedEj.notas || '');
          // Quitar el mensaje empty si existe
          const emptyMsg = contenedorEl?.querySelector('.empty');
          if (emptyMsg) emptyMsg.remove();
          contenedorEl?.appendChild(card);
        }
      }
    }

    // Refrescar el panel de ejercicios extra para que los que
    // ya están en el DOM desaparezcan de la lista disponible
    poblarListaEjerciciosExtra(buscadorExtra?.value);

    // Restaurar checkboxes y notas en las cards ya renderizadas
    const cards = document.querySelectorAll('#contenedor-ejercicios .card');
    cards.forEach(card => {
      const id = Number(card.dataset.ejercicioId);
      const saved = draft.ejercicios.find(e => e.id === id);
      if (saved) {
        const check = card.querySelector('.check-serie');
        if (check) check.checked = saved.checked;
        const nota = card.querySelector('.ejercicio-notas');
        if (nota) nota.value = saved.notas;
      }
    });

    // Restaurar series desde el draft (reemplaza las de la DB)
    cards.forEach(card => {
      const id = Number(card.dataset.ejercicioId);
      const saved = draft.ejercicios.find(e => e.id === id);
      if (saved && saved.series && saved.series.length > 0) {
        const seriesContainer = card.querySelector('.series-inputs');
        if (seriesContainer) {
          // Limpiar series actuales (las que vienen de la DB)
          seriesContainer.innerHTML = '';
          // Reconstruir desde el draft con la estructura real del DOM
          saved.series.forEach((serie, idx) => {
            const row = document.createElement('div');
            row.className = 'serie-row';

            const label = document.createElement('span');
            label.className = 'serie-label';
            label.textContent = `Serie ${idx + 1}`;

            const inputPeso = document.createElement('input');
            inputPeso.type = 'number';
            inputPeso.className = 'input-serie';
            inputPeso.placeholder = unidadPesoLabel();
            inputPeso.min = 0;
            inputPeso.step = 0.5;
            inputPeso.dataset.campo = 'peso';
            inputPeso.value = serie.peso;

            const inputReps = document.createElement('input');
            inputReps.type = 'number';
            inputReps.className = 'input-serie';
            inputReps.placeholder = 'reps';
            inputReps.min = 0;
            inputReps.step = 1;
            inputReps.dataset.campo = 'repeticiones';
            inputReps.value = serie.reps;

            const checkSerie = document.createElement('input');
            checkSerie.type = 'checkbox';
            checkSerie.className = 'check-serie';

            const btnDelete = document.createElement('button');
            btnDelete.type = 'button';
            btnDelete.className = 'btn-delete-serie';
            btnDelete.dataset.action = 'delete-serie';
            btnDelete.textContent = '🗑️';

            row.appendChild(btnDelete);
            row.appendChild(label);
            row.appendChild(inputPeso);
            row.appendChild(inputReps);
            row.appendChild(checkSerie);
            seriesContainer.appendChild(row);
          });
        }
      }
    });

    // Re-inyectar datos históricos (Hito 16) después de reconstruir
    // las series del draft. El innerHTML = '' de arriba borró los
    // .anterior-valor que ya había inyectado cargarRutina(), así
    // que los volvemos a pintar con la data que ya está en memoria.
    inyectarAnteriorEnCards();

    // Restaurar timer: detenemos el que inició cargarRutina
    // y lo reemplazamos con el tiempo guardado
    detenerTemporizador();
    horaInicio = draft.horaInicio || (Date.now() - ((draft.segundosTranscurridos || 0) * 1000));
    segundosTranscurridos = Math.floor((Date.now() - horaInicio) / 1000);
    rutinaActualId = draft.rutinaActualId;
    entrenamientoActivo = true;
    rutinaActivaNombre = rutina.nombre || 'Rutina';
    window.ejerciciosExtraIds = draft.ejerciciosExtraIds || [];

    // Iniciar el temporizador desde el tiempo restaurado
    if (timerDisplay) timerDisplay.textContent = formatearTiempo(segundosTranscurridos);
    if (temporizadorEl) temporizadorEl.classList.remove('hidden');

    intervaloReloj = setInterval(() => {
      segundosTranscurridos = Math.floor((Date.now() - horaInicio) / 1000);
      const display = formatearTiempo(segundosTranscurridos);
      if (timerDisplay) timerDisplay.textContent = display;
      const ftd = document.getElementById('floating-timer-display');
      if (ftd) ftd.textContent = display;
    }, 1000);

    // Hito 16: Cargar última sesión para sobrecarga progresiva
    ultimaSesionData = null;
    cargarUltimaSesion(rutinaActualId).then(() => inyectarAnteriorEnCards());

    // Re-guardar el draft con el timer ya restaurado (cargarRutina()
    // pisó horaInicio al llamar a iniciarTemporizador())
    guardarEstadoEntrenamiento();

    mostrarToast('🔄 Entrenamiento restaurado');
    return true;
  } catch {
    return false;
  }
}

// mostrarToast() — Muestra una notificación temporal en el toast
// ubicado en la parte inferior central de la pantalla.
// tipo opcional: 'success' (verde) o 'error' (rojo).
function mostrarToast(mensaje, tipo) {
  const toast = document.getElementById('toast-restore');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.remove('hidden');
  toast.style.opacity = '1';
  // Aplicar color según tipo
  toast.style.background = tipo === 'error' ? '#d32f2f' :
                           tipo === 'success' ? '#2e7d32' :
                           'rgba(233, 69, 96, 0.95)';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2000);
}

// ============================================================
// confirmarAccion({ titulo, mensaje, textoBtnConfirmar, colorBtn, onConfirmar })
// ============================================================
// Modal de confirmación genérico para reemplazar confirm() nativo.
// Crea el modal una sola vez y lo reutiliza.
//
// Uso:
//   confirmarAccion({
//     titulo: 'Eliminar',
//     mensaje: '¿Estás seguro?',
//     textoBtnConfirmar: 'Eliminar',
//     colorBtn: 'btn-logout',      // 'btn-login' o 'btn-logout'
//     onConfirmar: () => { ... }
//   });
function confirmarAccion({ titulo, mensaje, textoBtnConfirmar = 'Confirmar', colorBtn = 'btn-login', onConfirmar }) {
  // Reusar modal si ya existe
  let overlay = document.getElementById('modal-confirmar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-confirmar-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width: 420px;">
        <div class="modal-header">
          <h3 id="modal-confirmar-titulo"></h3>
        </div>
        <div class="modal-body">
          <p id="modal-confirmar-mensaje" style="margin: 0 0 24px; line-height: 1.5;"></p>
          <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="modal-confirmar-cancelar" class="btn-logout">Cancelar</button>
            <button id="modal-confirmar-ok" class="btn-login">Confirmar</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Cerrar al hacer clic fuera
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarConfirmar();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        cerrarConfirmar();
      }
    });
  }

  function cerrarConfirmar() {
    overlay.classList.add('hidden');
    // Limpiar listener del botón OK para evitar listeners fantasma
    const btnOk = document.getElementById('modal-confirmar-ok');
    btnOk.replaceWith(btnOk.cloneNode(true));
  }

  // Setear contenido dinámico
  document.getElementById('modal-confirmar-titulo').textContent = titulo;
  document.getElementById('modal-confirmar-mensaje').textContent = mensaje;

  const btnOk = document.getElementById('modal-confirmar-ok');
  btnOk.textContent = textoBtnConfirmar;
  btnOk.className = colorBtn;

  // Cancelar
  document.getElementById('modal-confirmar-cancelar').onclick = cerrarConfirmar;

  // Confirmar
  btnOk.addEventListener('click', () => {
    cerrarConfirmar();
    onConfirmar();
  });

  overlay.classList.remove('hidden');
}

// ============================================================
// MOTOR DE TOUR GENÉRICO
// ============================================================
function ejecutarTour(pasos, storageKey) {
  if (localStorage.getItem(storageKey)) return;

  let pasoActualTour = 0;
  let elementoResaltadoTour = null;
  let estilosOriginalesTour = '';

  const backdrop = document.createElement('div');
  backdrop.className = 'tour-backdrop';
  document.body.appendChild(backdrop);

  const tooltip = document.createElement('div');
  tooltip.className = 'tour-tooltip';
  document.body.appendChild(tooltip);

  function finalizarTour() {
    if (elementoResaltadoTour) {
      elementoResaltadoTour.classList.remove('tour-highlight');
      elementoResaltadoTour.style.cssText = estilosOriginalesTour;
    }
    backdrop.remove();
    tooltip.remove();
    localStorage.setItem(storageKey, 'true');
    elementoResaltadoTour = null;
    estilosOriginalesTour = '';
  }

  function mostrarPasoTour() {
    if (elementoResaltadoTour) {
      elementoResaltadoTour.classList.remove('tour-highlight');
      elementoResaltadoTour.style.cssText = estilosOriginalesTour;
    }

    if (pasoActualTour >= pasos.length) {
      finalizarTour();
      return;
    }

    const paso = pasos[pasoActualTour];
    const targetEl = typeof paso.selector === 'function'
      ? paso.selector()
      : document.querySelector(paso.selector);

    if (!targetEl) {
      pasoActualTour++;
      mostrarPasoTour();
      return;
    }

    estilosOriginalesTour = targetEl.style.cssText;
    targetEl.classList.add('tour-highlight');
    elementoResaltadoTour = targetEl;

    // Scrollear al card contenedor si el elemento es chico (botón)
    const scrollTarget = targetEl.closest('.rutina-card') || targetEl;
    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const esUltimo = pasoActualTour === pasos.length - 1;
    tooltip.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
        <strong style="font-size:16px;">${paso.titulo}</strong>
        <button class="tour-btn-cerrar" style="
          background:transparent; border:none; color:#fff;
          font-size:18px; cursor:pointer; opacity:0.6; line-height:1;
        ">✕</button>
      </div>
      <p style="margin: 0 0 8px; opacity:0.8; font-size:12px;">
        Paso ${pasoActualTour + 1} de ${pasos.length}
      </p>
      ${paso.mensaje}
      <br>
      <button class="tour-tooltip-btn">
        ${esUltimo ? '¡Entendido! ✓' : 'Siguiente →'}
      </button>
    `;

    tooltip.style.bottom = '32px';
    tooltip.style.top = 'auto';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';

    tooltip.querySelector('.tour-tooltip-btn').onclick = () => {
      pasoActualTour++;
      mostrarPasoTour();
    };
    tooltip.querySelector('.tour-btn-cerrar').onclick = finalizarTour;
    backdrop.onclick = finalizarTour;
  }

  mostrarPasoTour();
}

// ============================================================
// RESETEAR TOURS (para desarrollo)
// ============================================================
function resetearTours() {
  localStorage.removeItem('tourRutinasVisto');
  localStorage.removeItem('tourEntrenarVisto');
  localStorage.removeItem('tourEntrenarVisto_v2');
  localStorage.removeItem('tourEntrenarVisto_v3');
  localStorage.removeItem('tourPerfilVisto');
  console.log('✅ Tours reseteados. Recargá la página.');
}
window.resetearTours = resetearTours;

// ============================================================
// cargarCatalogoEjercicios()
// ============================================================
// Obtiene TODOS los ejercicios del catálogo desde la API
// y los guarda en la variable global catalogoEjercicios.
//
// Se llama:
//   1. Al abrir el modal "Nueva Rutina" (para los checkboxes)
//   2. Al cargar la vista "Entrenar" (para el <select> de extra)
//
// Si ya se cargó antes, usa el cache (no hace otra request).
async function cargarCatalogoEjercicios() {
  // Si ya tenemos el catálogo, no pedimos de nuevo
  if (catalogoEjercicios.length > 0) return catalogoEjercicios;

  const token = getToken();
  if (!token) return [];

  try {
    const respuesta = await fetch('/api/ejercicios', {
      headers: { 'Authorization': 'Bearer ' + token },
    });

    if (!respuesta.ok) return [];

    const datos = await respuesta.json();
    if (datos.status === 'ok' && Array.isArray(datos.data)) {
      catalogoEjercicios = datos.data;
    }
  } catch (error) {
    console.error('Error al cargar catálogo:', error.message);
  }

  return catalogoEjercicios;
}

// ============================================================
// cargarUltimaSesion(rutinaId) — Hito 16: Sobrecarga Progresiva
// ============================================================
// Obtiene la última sesión completada para esta rutina y
// guarda los datos en ultimaSesionData para que la función
// inyectarAnteriorEnCards() los muestre en las cards.
async function cargarUltimaSesion(rutinaId) {
  try {
    const token = getToken();
    if (!token) return;
    const res = await fetch(`/api/sesiones/ultima/${rutinaId}`, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    if (res.ok) {
      const json = await res.json();
      ultimaSesionData = json.data ? json.data.ejercicios : null;
    }
  } catch (err) {
    console.error('Error al cargar última sesión:', err);
    ultimaSesionData = null;
  }
}

// ============================================================
// inyectarAnteriorEnCards() — Hito 16: Sobrecarga Progresiva
// ============================================================
// Recorre todas las cards de ejercicios en el DOM e inyecta
// los valores de la sesión anterior al lado de cada serie.
//
// Comportamiento:
//   - Si no hay datos globales, no hace nada.
//   - Si un ejercicio no tiene historial, deja el espacio vacío.
//   - Si ya se inyectó (detecta .anterior-valor existente), salta.
//   - No muestra "ANTERIOR" como header — solo el valor (estilo limpio).
function inyectarAnteriorEnCards() {
  if (!ultimaSesionData) return;

  document.querySelectorAll('#contenedor-ejercicios .card').forEach(card => {
    const ejercicioId = Number(card.dataset.ejercicioId);

    // Compatibilidad por si ultimaSesionData es directo o viene anidado en .ejercicios
    const seriesAnteriores = ultimaSesionData.ejercicios
      ? ultimaSesionData.ejercicios[ejercicioId]
      : ultimaSesionData[ejercicioId];

    if (!seriesAnteriores || seriesAnteriores.length === 0) return;

    // 1. INYECTAR EL RESUMEN DE LA TARJETA (Si no existe ya)
    if (!card.querySelector('.resumen-anterior')) {
      // Calcular máximos
      const maxPeso = Math.max(...seriesAnteriores.map(s => Number(s.peso) || 0));
      const totalSeries = seriesAnteriores.length;

      // Crear elemento visual
      const resumenDiv = document.createElement('div');
      resumenDiv.className = 'resumen-anterior';
      resumenDiv.style.cssText = 'font-size: 13px; color: #a0a0a0; margin-top: 2px; margin-bottom: 8px; font-weight: 500;';
      resumenDiv.innerHTML = `⏱️ Última vez: ${totalSeries} series, Máx <strong>${maxPeso}kg</strong>`;

      // Insertar justo después del título
      const title = card.querySelector('.card-title');
      if (title) {
        // Insertamos el resumen después del contenedor del título (el header flex)
        title.parentNode.insertAdjacentElement('afterend', resumenDiv);
      }
    }

    // 2. INYECTAR EL DETALLE POR FILA (Lógica original)
    const rows = card.querySelectorAll('.serie-row');
    rows.forEach((row, idx) => {
      if (row.querySelector('.anterior-valor')) return;
      const inputReps = row.querySelector('input[data-campo="repeticiones"]');
      if (!inputReps) return;

      const datos = seriesAnteriores[idx];
      if (!datos) return;

      const span = document.createElement('span');
      span.className = 'anterior-valor';
      span.style.cssText = 'font-size: 12px; color: #6c63ff; opacity: 0.8; margin-left: 8px; white-space: nowrap;';
      span.textContent = `(${formatearPeso(datos.peso)} x ${datos.repeticiones})`;

      const checkSerie = row.querySelector('.check-serie');
      if (checkSerie) {
        checkSerie.parentNode.insertBefore(span, checkSerie.nextSibling);
      } else {
        inputReps.parentNode.insertBefore(span, inputReps.nextSibling);
      }
    });
  });
}

// ============================================================
// filtrarCatalogo(termino)
// ============================================================
// Filtra el catálogo global por nombre de ejercicio O nombre
// de grupo muscular (campo 'musculos' traído del backend).
// Si el término está vacío, devuelve el catálogo completo.
function filtrarCatalogo(termino) {
  if (!termino || termino.trim() === '') return catalogoEjercicios;
  const lower = termino.toLowerCase().trim();
  return catalogoEjercicios.filter((ej) => {
    if (ej.nombre.toLowerCase().includes(lower)) return true;
    if (ej.musculos && ej.musculos.toLowerCase().includes(lower)) return true;
    return false;
  });
}

// ============================================================
// obtenerIdsEjerciciosActivos()
// ============================================================
// Escanea el DOM actual y devuelve un array con los IDs de
// los ejercicios que YA están en pantalla (tarjetas visibles).
//
// Se usa para filtrar el catálogo y no mostrar ejercicios
// que ya se están haciendo en el panel "Agregar Extra".
function obtenerIdsEjerciciosActivos() {
  const cards = document.querySelectorAll('#contenedor-ejercicios .card');
  const ids = [];
  cards.forEach((card) => {
    const id = Number(card.dataset.ejercicioId);
    if (id) ids.push(id);
  });
  return ids;
}

// ============================================================
// poblarListaEjerciciosExtra(terminoBusqueda)
// ============================================================
// Renderiza la lista visual de ejercicios disponibles para
// agregar durante el entrenamiento activo.
//
// ANTI-DUPLICADOS: antes de renderizar, escanea el DOM para
// detectar qué ejercicios ya están en pantalla y los excluye.
//
// FILTRO DE BÚSQUEDA: si se pasa un término, filtra por nombre
// de ejercicio o grupo muscular.
//
// Cada fila muestra: imagen (o placeholder), nombre + categoría,
// y un botón "+" para inyectar el ejercicio al DOM.
async function poblarListaEjerciciosExtra(terminoBusqueda) {
  const catalogo = await cargarCatalogoEjercicios();

  if (!listaEjerciciosExtra || catalogo.length === 0) return;

  // Aplicar filtro de búsqueda (por nombre o grupo muscular)
  let filtrados = terminoBusqueda ? filtrarCatalogo(terminoBusqueda) : catalogo;

  // ============================================================
  // FILTRO ANTI-DUPLICADOS
  // ============================================================
  const idsActivos = obtenerIdsEjerciciosActivos();
  const disponibles = filtrados.filter(
    (ej) => !idsActivos.includes(ej.id)
  );

  if (disponibles.length === 0) {
    const msg = (terminoBusqueda && terminoBusqueda.trim())
      ? `😕 No hay resultados para "${terminoBusqueda.trim()}"`
      : '✅ Ya están todos los ejercicios disponibles en pantalla';
    listaEjerciciosExtra.innerHTML = `<div class="empty" style="padding: 14px 0;">${msg}</div>`;
    if (extraEjercicioWrapper) {
      extraEjercicioWrapper.classList.remove('hidden');
    }
    return;
  }

  let html = '';
  for (const ej of disponibles) {
    const categoria = ej.categoria || 'general';
    const musculos = ej.musculos ? ` | ${ej.musculos}` : '';
    html += `
      <div class="ejercicio-list-item" data-ejercicio-id="${ej.id}">
        ${renderizarImagenEjercicio(ej)}
        <div class="ejercicio-info">
          <div class="ejercicio-nombre">${ej.nombre}</div>
          <div class="ejercicio-categoria">${categoria}${musculos}</div>
        </div>
        <button type="button" class="btn-agregar-ejercicio" data-action="add-extra-ejercicio">
          +
        </button>
      </div>
    `;
  }
  listaEjerciciosExtra.innerHTML = html;

  if (extraEjercicioWrapper) {
    extraEjercicioWrapper.classList.remove('hidden');
  }
}

// ============================================================
// esVideo(url) — Detecta si una URL apunta a un video .mp4
// ============================================================
function esVideo(url) {
  if (!url) return false;
  return /\.mp4(\?|$)/i.test(url);
}

// ============================================================
// renderizarImagenEjercicio(ej)
// ============================================================
// Devuelve el HTML para representar un ejercicio: <video> si
// gif_url apunta a .mp4, <img> si es GIF/JPG, o placeholder.
function renderizarImagenEjercicio(ej) {
  if (ej.gif_url) {
    if (esVideo(ej.gif_url)) {
      return `<video
        src="${ej.gif_url}"
        class="img-ejercicio-thumb"
        autoplay loop muted playsinline
        preload="metadata"
      ></video>`;
    }
    return `<img src="${ej.gif_url}" alt="${ej.nombre}" class="img-ejercicio-thumb" loading="lazy" />`;
  }
  if (ej.imagen_url) {
    return `<img src="/images/${ej.imagen_url}" alt="${ej.nombre}" class="img-ejercicio-thumb" />`;
  }
  return `<div class="ejercicio-img-placeholder"><span class="ejercicio-img-icon">🏋️</span></div>`;
}

// ============================================================
// renderizarCheckboxesEnModal(terminoBusqueda)
// ============================================================
// Dibuja la lista visual de ejercicios dentro del modal de
// "Nueva Rutina". Cada fila tiene: imagen (o placeholder),
// nombre + categoría/músculos, y un checkbox a la derecha.
// Si se pasa un término, filtra por nombre o grupo muscular.
async function renderizarCheckboxesEnModal(terminoBusqueda) {
  if (!modalEjercicios) return;

  const catalogo = await cargarCatalogoEjercicios();

  if (catalogo.length === 0) {
    modalEjercicios.innerHTML = '<div class="empty" style="padding: 14px 0;">No hay ejercicios disponibles</div>';
    return;
  }

  // Aplicar filtro si hay término de búsqueda
  const lista = terminoBusqueda ? filtrarCatalogo(terminoBusqueda) : catalogo;

  if (lista.length === 0) {
    modalEjercicios.innerHTML = `<div class="empty" style="padding: 14px 0;">😕 No hay resultados para "${terminoBusqueda.trim()}"</div>`;
    return;
  }

  let html = '';
  for (const ej of lista) {
    const categoria = ej.categoria || 'general';
    const musculos = ej.musculos ? ` | ${ej.musculos}` : '';
    const checked = ejerciciosSeleccionadosTemp.has(ej.id) ? ' checked' : '';
    html += `
      <div class="ejercicio-list-item" data-ejercicio-id="${ej.id}">
        ${renderizarImagenEjercicio(ej)}
        <div class="ejercicio-info">
          <div class="ejercicio-nombre">${ej.nombre}</div>
          <div class="ejercicio-categoria">${categoria}${musculos}</div>
        </div>
        <input type="checkbox" id="check-ej-${ej.id}" value="${ej.id}" class="check-ejercicio"${checked} />
      </div>
    `;
  }
  modalEjercicios.innerHTML = html;
}

// ============================================================
// mostrarAuthLogin() / mostrarAuthRegister()
// ============================================================
// Alternan entre el formulario de login y registro dentro
// de la pantalla de autenticación.
function mostrarAuthLogin() {
  registerWrapper?.classList.add('hidden');
  loginWrapper?.classList.remove('hidden');
  // Limpiar campos y mensajes del registro
  regForm?.reset();
  regError?.classList.add('hidden');
  regSuccess?.classList.add('hidden');
}

function mostrarAuthRegister() {
  loginWrapper?.classList.add('hidden');
  registerWrapper?.classList.remove('hidden');
  // Limpiar errores previos
  regError?.classList.add('hidden');
  regSuccess?.classList.add('hidden');
}

// ============================================================
// mostrarLogin() / mostrarRutina()
// ============================================================
// Controlan qué se ve en pantalla intercambiando la clase
// .hidden entre las secciones de login y rutina.
function mostrarLogin() {
  loginSection?.classList.remove('hidden');
  appContent?.classList.add('hidden');
  document.getElementById('header-user-area')?.classList.add('hidden');
  // Resetear a la vista de login (por si estaba en registro)
  mostrarAuthLogin();
}

// ============================================================
// mostrarApp() — Muestra el contenido privado (rutinas / perfil / entrenar)
// ============================================================
function mostrarApp() {
  loginSection?.classList.add('hidden');
  appContent?.classList.remove('hidden');

  const headerUserArea = document.getElementById('header-user-area');
  const saludoEl = document.getElementById('header-saludo-usuario');

  if (headerUserArea) headerUserArea.classList.remove('hidden');

  if (saludoEl) {
    const nombre = extraerNombreDelToken();
    saludoEl.textContent = nombre ? `Hola, ${nombre} 👋` : '';
  }
}

// ============================================================
// mostrarVistaRutinas() / mostrarVistaPerfil() / mostrarEntrenar()
// ============================================================
// Controlan QUÉ vista se muestra dentro de app-content.
// Una a la vez (las otras quedan ocultas).
// También actualizan la pestaña activa en la navegación.

function mostrarVistaRutinas() {
  rutinasView?.classList.remove('hidden');
  perfilView?.classList.add('hidden');
  entrenarView?.classList.add('hidden');
  ajustesView?.classList.add('hidden');
  btnTabRutinas?.classList.add('nav-tab--active');
  btnTabPerfil?.classList.remove('nav-tab--active');
  btnTabEntrenar?.classList.remove('nav-tab--active');
  // Si hay entrenamiento activo, mostrar burbuja flotante
  if (entrenamientoActivo) mostrarFloatingTimer();
}

function mostrarVistaPerfil() {
  rutinasView?.classList.add('hidden');
  perfilView?.classList.remove('hidden');
  entrenarView?.classList.add('hidden');
  ajustesView?.classList.add('hidden');
  btnTabRutinas?.classList.remove('nav-tab--active');
  btnTabPerfil?.classList.add('nav-tab--active');
  btnTabEntrenar?.classList.remove('nav-tab--active');
  // Si hay entrenamiento activo, mostrar burbuja flotante
  if (entrenamientoActivo) mostrarFloatingTimer();
}

function mostrarEntrenar() {
  rutinasView?.classList.add('hidden');
  perfilView?.classList.add('hidden');
  entrenarView?.classList.remove('hidden');
  ajustesView?.classList.add('hidden');
  btnTabRutinas?.classList.remove('nav-tab--active');
  btnTabPerfil?.classList.remove('nav-tab--active');
  btnTabEntrenar?.classList.add('nav-tab--active');
  // Al entrar a la vista Entrenar, ocultar burbuja flotante
  // (el cronómetro grande ya está visible ahí)
  ocultarFloatingTimer();
}

// ============================================================
// cargarRutina(rutinaId)
// ============================================================
// Obtiene UNA rutina específica por su ID usando el token JWT.
// Si no se pasa ID, usa la rutina actualmente seleccionada.
//
// ¿Cuándo se llama?
//   - Al hacer clic en "Entrenar" (usa rutinaActualId)
//   - Al hacer clic en una rutina del dashboard (pasa el ID)
async function cargarRutina(rutinaId) {
  const token = getToken();

  // Si no hay token, mostramos el login
  if (!token) {
    mostrarLogin();
    return;
  }

  if (!contenedorEl || !nombreEl) return;

  // Actualizamos el ID de la rutina actual
  const id = rutinaId || rutinaActualId;

  // ============================================================
  // ESTADO RESIDUAL: si no hay rutina seleccionada
  // ============================================================
  // Después de descartar o finalizar un entrenamiento,
  // rutinaActualId se setea a null. Si el usuario hace clic
  // en "Entrenar" sin seleccionar una rutina, mostramos un
  // mensaje pidiendo que elija una desde el Dashboard.
  if (!id) {
    mostrarApp();
    mostrarEntrenar();
    nombreEl.textContent = 'Ninguna rutina seleccionada';
    if (descripcionEl) descripcionEl.textContent = '';
    contenedorEl.innerHTML = `
      <div class="empty">
        <strong>Seleccioná una rutina</strong>
        <p>Andá al Dashboard y hacé clic en una rutina para empezar a entrenar.</p>
      </div>
    `;
    if (accionesEntreno) accionesEntreno.classList.add('hidden');
    if (extraEjercicioWrapper) extraEjercicioWrapper.classList.add('hidden');
    return;
  }

  rutinaActualId = Number(id);

  // ============================================================
  // LIMPIAR ESTADO RESIDUAL DE LA VISTA ANTERIOR
  // ============================================================
  // Cada vez que se carga una rutina (incluso la misma), hay que
  // limpiar el DOM, los botones de acción y el panel extra para
  // que no queden residuos de la rutina anterior.
  //
  // Esto evita el bug donde, al cambiar de una rutina con
  // ejercicios a una sin, el panel extra y los botones de acción
  // quedaban visibles del estado anterior.
  if (contenedorEl) contenedorEl.innerHTML = '';
  if (nombreEl) nombreEl.textContent = 'Cargando rutina...';
  if (descripcionEl) descripcionEl.textContent = '';
  if (accionesEntreno) accionesEntreno.classList.add('hidden');
  if (extraEjercicioWrapper) extraEjercicioWrapper.classList.add('hidden');
  if (listaEjerciciosExtra) {
    listaEjerciciosExtra.innerHTML = '<div class="loading" style="padding: 14px 0;">Cargando ejercicios...</div>';
  }
  if (buscadorExtra) buscadorExtra.value = '';
  // Detener temporizador de la sesión anterior
  detenerTemporizador();

  try {
    // ============================================================
    // FETCH CON TOKEN EN HEADERS
    // ============================================================
    // Acá está la MAGIA de la autenticación:
    // Leemos el token del localStorage y lo mandamos en el
    // header Authorization con el formato "Bearer <token>".
    //
    // Del lado del servidor, authMiddleware.verificarToken()
    // extrae este header, verifica la firma del JWT, y si
    // es válido, deja pasar la request.
    //
    // Si el token expiró o es inválido, el servidor responde
    // con 401 y nosotros capturamos el error acá.
    // La URL usa el ID de la rutina seleccionada.
    const respuesta = await fetch('/api/rutinas/' + id, {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });

    // ============================================================
    // MANEJO DE ERROR 401 (TOKEN EXPIRADO O INVÁLIDO)
    // ============================================================
    if (respuesta.status === 401) {
      // El token no sirve más. Lo borramos y mostramos login.
      localStorage.removeItem('token');
      mostrarLogin();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (datos.status !== 'ok' || !datos.data) {
      throw new Error(datos.message || 'Error al obtener la rutina');
    }

    const rutina = datos.data;

    // ============================================================
    // MOSTRAR VISTA "ENTRENAR"
    // ============================================================
    // Llamamos a mostrarApp() si es la primera vez que se carga
    // (cuando se navega desde login o historial), y a
    // mostrarEntrenar() para activar la pestaña correcta.
    mostrarApp();
    mostrarEntrenar();
    nombreEl.textContent = rutina.nombre || 'Rutina sin nombre';
    if (rutina.descripcion) descripcionEl.textContent = rutina.descripcion;

    // Marcar entrenamiento como activo e iniciar temporizador
    entrenamientoActivo = true;
    rutinaActivaNombre = rutina.nombre || 'Rutina';
    iniciarTemporizador();

    if (!rutina.ejercicios || rutina.ejercicios.length === 0) {
      contenedorEl.innerHTML = '<div class="empty">Esta rutina no tiene ejercicios asignados aún 🤷</div>';
      // Mostrar acciones de entreno y panel de ejercicios extra
      // para que el usuario pueda agregar ejercicios sobre la marcha
      if (accionesEntreno) accionesEntreno.classList.remove('hidden');
      poblarListaEjerciciosExtra(buscadorExtra?.value);
      guardarEstadoEntrenamiento();
      return;
    }

    contenedorEl.innerHTML = '';

    for (const ejercicio of rutina.ejercicios) {
      // ============================================================
      // CREAR TARJETA (CARD) POR EJERCICIO
      // ============================================================
      // Le ponemos un data-atributo con el ID del ejercicio para
      // poder identificar qué inputs pertenecen a qué ejercicio
      // cuando después recorramos el DOM para armar el JSON.
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.ejercicioId = ejercicio.id;

      // --- CABECERA: miniatura (click → detalle) + nombre + eliminar ---
      const header = document.createElement('div');
      header.className = 'card-header';

      // Miniatura del ejercicio (reemplaza el viejo círculo con número)
      const thumbWrapper = document.createElement('div');
      thumbWrapper.className = 'card-thumb';
      thumbWrapper.innerHTML = renderizarImagenEjercicio(ejercicio);

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = ejercicio.nombre || 'Ejercicio';

      // Botón para eliminar este ejercicio completo de la vista
      const btnEliminarEj = document.createElement('button');
      btnEliminarEj.type = 'button';
      btnEliminarEj.className = 'btn-eliminar-ejercicio';
      btnEliminarEj.dataset.action = 'delete-ejercicio';
      btnEliminarEj.textContent = '🗑️';
      btnEliminarEj.title = 'Eliminar este ejercicio';

      header.appendChild(thumbWrapper);
      header.appendChild(title);
      header.appendChild(btnEliminarEj);

      // --- NOTAS DEL EJERCICIO (textarea editable) ---
      const notasTextarea = document.createElement('textarea');
      notasTextarea.className = 'ejercicio-notas';
      notasTextarea.placeholder = 'Notas del ejercicio...';
      notasTextarea.dataset.ejercicioId = ejercicio.id;
      notasTextarea.value = window.notesCache?.[ejercicio.id] || '';

      // --- STATS PLANIFICADOS (solo referencia visual) ---
      // Mostramos los valores planeados para que el usuario sepa
      // cuántas series hacer y con qué peso/repeticiones de referencia.
      const stats = document.createElement('div');
      stats.className = 'card-stats';

      if (ejercicio.series) {
        const s = document.createElement('div');
        s.className = 'stat';
        s.innerHTML = `<span class="stat-icon">🔄</span><span class="stat-value">${ejercicio.series}</span><span class="stat-label">series</span>`;
        stats.appendChild(s);
      }
      if (ejercicio.repeticiones) {
        const s = document.createElement('div');
        s.className = 'stat';
        s.innerHTML = `<span class="stat-icon">🔁</span><span class="stat-value">${ejercicio.repeticiones}</span><span class="stat-label">repeticiones</span>`;
        stats.appendChild(s);
      }
      if (ejercicio.peso) {
        const s = document.createElement('div');
        s.className = 'stat';
        s.innerHTML = `<span class="stat-icon">🏋️</span><span class="stat-value">${formatearPeso(ejercicio.peso)}</span><span class="stat-label">(plan)</span>`;
        stats.appendChild(s);
      }

      // --- INPUTS POR CADA SERIE ---
      // ============================================================
      // Acá reemplazamos el texto estático por inputs de verdad.
      // Por cada serie planificada (ej: 4 series), creamos UNA
      // FILA con dos inputs: peso y repeticiones.
      //
      // El usuario puede modificar estos valores durante el
      // entrenamiento (por ejemplo: "hoy levanto menos porque
      // estoy cansado").
      //
      // Pre-cargamos los valores planificados como valor inicial
      // para que el usuario no tenga que escribir todo desde cero.
      // ============================================================
      const seriesInputsDiv = document.createElement('div');
      seriesInputsDiv.className = 'series-inputs';

      // ¿Cuántas series tiene este ejercicio?
      // Si no tiene series definidas, mostramos al menos 1.
      const cantidadSeries = ejercicio.series || 1;

      for (let i = 1; i <= cantidadSeries; i++) {
        const serieRow = document.createElement('div');
        serieRow.className = 'serie-row';

        // Label: "Serie 1", "Serie 2", etc.
        const label = document.createElement('span');
        label.className = 'serie-label';
        label.textContent = `Serie ${i}`;

        // Input de PESO (kg)
        // data-campo="peso" nos permite identificar qué input es
        // cuando después recorramos el DOM para armar el JSON.
        const inputPeso = document.createElement('input');
        inputPeso.type = 'number';
        inputPeso.className = 'input-serie';
        inputPeso.placeholder = unidadPesoLabel();
        inputPeso.min = 0;
        inputPeso.step = 0.5;
        inputPeso.dataset.campo = 'peso';
        // Pre-cargamos el peso planificado como valor por defecto
        if (ejercicio.peso) inputPeso.value = ejercicio.peso;

        // Input de REPETICIONES
        const inputReps = document.createElement('input');
        inputReps.type = 'number';
        inputReps.className = 'input-serie';
        inputReps.placeholder = 'reps';
        inputReps.min = 0;
        inputReps.step = 1;
        inputReps.dataset.campo = 'repeticiones';
        // Pre-cargamos las reps planificadas como valor por defecto
        if (ejercicio.repeticiones) inputReps.value = ejercicio.repeticiones;

        // ============================================================
        // CHECKBOX DE COMPLETADO + BOTÓN ELIMINAR (UX Correcciones)
        // ============================================================
        // Checkbox para marcar la serie como completada.
        const checkSerie = document.createElement('input');
        checkSerie.type = 'checkbox';
        checkSerie.className = 'check-serie';

        // Botón para eliminar esta serie individualmente.
        const btnDelete = document.createElement('button');
        btnDelete.type = 'button';
        btnDelete.className = 'btn-delete-serie';
        btnDelete.dataset.action = 'delete-serie';
        btnDelete.textContent = '🗑️';

        serieRow.appendChild(btnDelete);
        serieRow.appendChild(label);
        serieRow.appendChild(inputPeso);
        serieRow.appendChild(inputReps);
        serieRow.appendChild(checkSerie);
        seriesInputsDiv.appendChild(serieRow);
      }

      // --- BOTÓN "+ SERIE" (Hito 11 Parte 3) ---
      // Permite agregar más series al vuelo durante el
      // entrenamiento. Cada clic duplica la última fila.
      const btnSerieWrapper = document.createElement('div');
      btnSerieWrapper.className = 'btn-serie-wrapper';
      const btnSerie = document.createElement('button');
      btnSerie.type = 'button';
      btnSerie.className = 'btn-serie';
      btnSerie.dataset.action = 'add-serie';
      btnSerie.textContent = '+ Serie';
      btnSerieWrapper.appendChild(btnSerie);

      // --- ARMAR LA TARJETA COMPLETA ---
      card.appendChild(header);
      card.appendChild(notasTextarea);
      card.appendChild(stats);
      card.appendChild(seriesInputsDiv);

      // --- BLOQUE DESCANSO ---
      const descansoWrapper = document.createElement('div');
      descansoWrapper.className = 'descanso-wrapper';
      descansoWrapper.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 0 4px;
        border-top: 1px solid rgba(255,255,255,0.07);
        margin-top: 8px;
      `;

      // Label
      const descansoLabel = document.createElement('span');
      descansoLabel.style.cssText = 'font-size:13px; opacity:0.6; white-space:nowrap;';
      descansoLabel.textContent = '⏸️ Descanso:';

      // Input de segundos configurable
      const descansoInput = document.createElement('input');
      descansoInput.type = 'number';
      descansoInput.className = 'descanso-input input-serie';
      descansoInput.min = '5';
      descansoInput.max = '300';
      descansoInput.value = '60';
      descansoInput.style.cssText = 'width: 56px; text-align:center;';
      descansoInput.title = 'Segundos de descanso';

      // Label "seg"
      const descansoSeg = document.createElement('span');
      descansoSeg.style.cssText = 'font-size:13px; opacity:0.6;';
      descansoSeg.textContent = 'seg';

      descansoWrapper.appendChild(descansoLabel);
      descansoWrapper.appendChild(descansoInput);
      descansoWrapper.appendChild(descansoSeg);

      card.appendChild(descansoWrapper);
      card.appendChild(btnSerieWrapper);
      contenedorEl.appendChild(card);
    }

    // ============================================================
    // MOSTRAR ACCIONES DE ENTRENO (Finalizar / Descartar)
    // ============================================================
    // El wrapper acciones-entreno está oculto por defecto.
    // Lo mostramos SOLO cuando la rutina cargó correctamente.
    if (accionesEntreno) {
      accionesEntreno.classList.remove('hidden');
    }

    // ============================================================
    // POBLAR SELECTOR DE EJERCICIOS EXTRA (Hito 11 Parte 3)
    // ============================================================
    // Cargamos el catálogo si no está cacheado y poblamos el
    // panel con las opciones disponibles.
    poblarListaEjerciciosExtra(buscadorExtra?.value);

    // ============================================================
    // Hito 16: Cargar última sesión para sobrecarga progresiva
    // ============================================================
    ultimaSesionData = null;
    if (rutinaId) {
      await cargarUltimaSesion(rutinaId);
      inyectarAnteriorEnCards();
    }

    // Forzar guardado del draft inmediatamente al cargar la rutina
    guardarEstadoEntrenamiento();

    // ============================================================
    // Fase 3 — Tour Entrenar (una vez por dispositivo)
    // ============================================================
    if (document.querySelector('.card')) {
      ejecutarTour([
        {
          selector: '.card',
          titulo: '🏋️ Ejercicios de tu rutina',
          mensaje: 'Cada tarjeta es un ejercicio. Podés agregar series, registrar el peso y las repeticiones.'
        },
        {
          selector: '.card-thumb',
          titulo: '🎬 Mirá cómo se hace',
          mensaje: 'Hacé clic en la miniatura para ver el video del ejercicio en bucle, junto con la ficha técnica completa.'
        },
        {
          selector: '.serie-row',
          titulo: '📋 Una serie',
          mensaje: 'Cada fila es una serie. Ingresá el peso y las repeticiones que hiciste.'
        },
        {
          selector: '.input-serie',
          titulo: '⚖️ Peso y repeticiones',
          mensaje: 'Escribí el peso usado y cuántas veces lo repetiste. Dejá en 0 si es sin peso.'
        },
        {
          selector: '.check-serie',
          titulo: '✅ Marcar serie completada',
          mensaje: 'Tachá la serie cuando la terminés. Solo las series marcadas cuentan para tu volumen total.'
        },
        {
          selector: '.descanso-wrapper',
          titulo: '⏸️ Temporizador de descanso',
          mensaje: 'Configurá los segundos acá. Al marcar una serie como completada, aparece una barra global abajo con el countdown.'
        },
        {
          selector: '#timer-display',
          titulo: '⏱️ Cronómetro',
          mensaje: 'El tiempo corre desde que cargás la rutina. Así sabés cuánto duró tu sesión.'
        },
        {
          selector: '#buscador-extra-ejercicios',
          titulo: '🔍 Agregar ejercicio extra',
          mensaje: '¿Querés sumar un ejercicio que no está en tu rutina? Buscalo acá y se agrega al instante.'
        },
        {
          selector: '#btn-finalizar',
          titulo: '💾 Finalizar entrenamiento',
          mensaje: 'Cuando termines, guardá la sesión. Se registra en tu historial con volumen y duración.'
        },
        {
          selector: '#btn-descartar',
          titulo: '🗑️ Descartar sesión',
          mensaje: 'Si no querés guardar esta sesión, descartala. El draft se borra y volvés al dashboard.'
        }
      ], 'tourEntrenarVisto_v3');
    }

  } catch (error) {
    console.error('Error:', error.message);
    if (contenedorEl) {
      contenedorEl.innerHTML = `
        <div class="error">
          ❌ Error al cargar la rutina<br />
          <small>${error.message}</small>
        </div>
      `;
    }
    if (nombreEl) nombreEl.textContent = 'Error al cargar';
  }
}

let graficoInstancia = null;

// ============================================================
// renderGraficoVolumen(historial)
// ============================================================
// Toma el array de sesiones del historial y dibuja un gráfico
// de barras con el volumen semanal usando Chart.js.
//
// Si el historial está vacío, oculta el contenedor.
// Incluye un <select> para filtrar por rutina específica.
// ============================================================
function renderGraficoVolumen(historial) {
  const container = document.getElementById('grafico-volumen-container');
  const canvas = document.getElementById('grafico-volumen');
  const selectRutina = document.getElementById('grafico-filtro-rutina');

  if (!container || !canvas || !historial || historial.length === 0) {
    if (container) container.style.display = 'none';
    return;
  }

  // Poblar el select con las rutinas únicas del historial
  const rutinasUnicas = [...new Set(historial.map(s => s.rutina_nombre).filter(Boolean))];
  selectRutina.innerHTML = '<option value="todas">Todas las rutinas</option>';
  rutinasUnicas.forEach(nombre => {
    const opt = document.createElement('option');
    opt.value = nombre;
    opt.textContent = nombre;
    selectRutina.appendChild(opt);
  });

  // Función interna para dibujar con los datos filtrados
  function dibujar(filtroRutina) {
    const datos = filtroRutina === 'todas'
      ? historial
      : historial.filter(s => s.rutina_nombre === filtroRutina);

    // Agrupar por semana (lunes de cada semana como clave)
    const porSemana = {};
    datos.forEach(sesion => {
      if (!sesion.fecha || !sesion.volumen_total_kg) return;
    // T00:00:00 fuerza interpretación local — evita bug de zona horaria UTC
      const fechaLimpia = sesion.fecha.split('T')[0];
      const fecha = new Date(fechaLimpia + 'T00:00:00');
      const diaSemana = fecha.getDay() || 7; // 0=domingo → 7
      const lunes = new Date(fecha);
      lunes.setDate(fecha.getDate() - diaSemana + 1);
      const clave = lunes.toISOString().split('T')[0];
      porSemana[clave] = (porSemana[clave] || 0) + Number(sesion.volumen_total_kg);
    });

    // Ordenar semanas cronológicamente y tomar las últimas 8
    const semanas = Object.keys(porSemana).sort().slice(-8);
    const labels = semanas.map(fecha => {
      const d = new Date(fecha + 'T00:00:00');
      return `${d.getDate()}/${d.getMonth() + 1}`;
    });
    const valores = semanas.map(s => Math.round(porSemana[s]));

    // Destruir instancia anterior si existe
    if (graficoInstancia) {
      graficoInstancia.destroy();
      graficoInstancia = null;
    }

    graficoInstancia = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `Volumen (${unidadPesoLabel()})`,
          data: valores,
          backgroundColor: 'rgba(108, 99, 255, 0.7)',
          borderColor: 'rgba(108, 99, 255, 1)',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => {
                const unidad = unidadPesoLabel();
                const val = unidad === 'lbs'
                  ? (ctx.parsed.y * 2.20462).toFixed(1)
                  : ctx.parsed.y.toLocaleString('es-ES');
                return ` ${val} ${unidad}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: 'rgba(255,255,255,0.6)',
              font: { size: 11 },
              autoSkip: false,
              maxRotation: 45,
            }
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: {
              color: 'rgba(255,255,255,0.6)',
              font: { size: 11 },
              callback: val => {
                const unidad = unidadPesoLabel();
                const v = unidad === 'lbs'
                  ? (val * 2.20462).toFixed(1)
                  : val.toLocaleString('es-ES');
                return `${v} ${unidad}`;
              }
            },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 🔥 Mostrar el contenedor ANTES de dibujar — Chart.js necesita
  // el canvas visible para medir dimensiones correctamente
  container.style.display = 'block';

  // Dibujar con "todas" por defecto
  dibujar('todas');

  // Listener del filtro — remover anterior con cloneNode para
  // evitar listeners fantasma
  const nuevoSelect = selectRutina.cloneNode(true);
  nuevoSelect.innerHTML = selectRutina.innerHTML;
  selectRutina.parentNode.replaceChild(nuevoSelect, selectRutina);
  nuevoSelect.addEventListener('change', e => dibujar(e.target.value));
}

// ============================================================
// renderTablaHistorial(pagina)
// ============================================================
// Renderiza una página de la tabla del historial a partir del
// cache historialDatosCompletos. Agrega controles Anterior /
// Siguiente si hay más de una página.
// ============================================================
function renderTablaHistorial(pagina) {
  historialPaginaActual = pagina;
  const total = historialDatosCompletos.length;
  const totalPaginas = Math.ceil(total / HISTORIAL_POR_PAGINA);

  const inicio = (pagina - 1) * HISTORIAL_POR_PAGINA;
  const fin = inicio + HISTORIAL_POR_PAGINA;
  const sesiones = historialDatosCompletos.slice(inicio, fin);

  let html = `
    <table class="historial-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Rutina</th>
          <th>Duración</th>
          <th>Volumen</th>
          <th>Series</th>
          <th>Notas</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const sesion of sesiones) {
    const fechaParts = sesion.fecha ? sesion.fecha.split('-') : [];
    let fechaFormateada = sesion.fecha || '-';
    if (fechaParts.length === 3) {
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
      ];
      const dia   = parseInt(fechaParts[2], 10);
      const mes   = meses[parseInt(fechaParts[1], 10) - 1] || fechaParts[1];
      const anio  = fechaParts[0];
      fechaFormateada = `${dia} de ${mes}, ${anio}`;
    }

    const rutinaNombre = sesion.rutina_nombre || 'Rutina';
    const notas = sesion.notas || '—';
    let duracionTexto = '—';
    if (sesion.duracion_minutos) {
      duracionTexto = `⏱️ ${sesion.duracion_minutos} min`;
    }

    let volumenTexto = '—';
    if (sesion.volumen_total_kg && Number(sesion.volumen_total_kg) > 0) {
      volumenTexto = `💪 ${formatearPeso(sesion.volumen_total_kg)}`;
    }

    let seriesTexto = '—';
    if (sesion.total_series && sesion.total_series > 0) {
      seriesTexto = `🔄 ${sesion.total_series} series`;
    }

    html += `
      <tr class="historial-row" data-sesion-id="${sesion.id}" style="cursor:pointer;">
        <td>📅 ${fechaFormateada}</td>
        <td><span class="rutina-badge">${rutinaNombre}</span></td>
        <td>${duracionTexto}</td>
        <td>${volumenTexto}</td>
        <td>${seriesTexto}</td>
        <td>${notas}</td>
      </tr>
    `;
  }

  html += `
      </tbody>
    </table>
  `;

  // ── Controles de paginación ──
  if (totalPaginas > 1) {
    html += `
      <div id="historial-paginacion" style="
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 20px 0 8px;
        font-size: 14px;
      ">
        <button
          id="hist-btn-prev"
          style="
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            color: inherit;
            border-radius: 6px;
            padding: 6px 14px;
            cursor: pointer;
            opacity: ${pagina === 1 ? '0.4' : '1'};
          "
          ${pagina === 1 ? 'disabled' : ''}
        >← Anterior</button>

        <span style="opacity: 0.7;">
          Página ${pagina} de ${totalPaginas}
          <span style="opacity:0.5; font-size:12px;">
            (${total} sesiones)
          </span>
        </span>

        <button
          id="hist-btn-next"
          style="
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            color: inherit;
            border-radius: 6px;
            padding: 6px 14px;
            cursor: pointer;
            opacity: ${pagina === totalPaginas ? '0.4' : '1'};
          "
          ${pagina === totalPaginas ? 'disabled' : ''}
        >Siguiente →</button>
      </div>
    `;
  }

  if (historialContainer) {
    historialContainer.innerHTML = html;
  }

  // Agregar listeners a los botones de paginación
  document.getElementById('hist-btn-prev')?.addEventListener('click', () => {
    if (historialPaginaActual > 1) renderTablaHistorial(historialPaginaActual - 1);
  });
  document.getElementById('hist-btn-next')?.addEventListener('click', () => {
    if (historialPaginaActual < totalPaginas) renderTablaHistorial(historialPaginaActual + 1);
  });
}

// ============================================================
// renderizarPerfil()
// ============================================================
// renderizarPerfil()
// ============================================================
// Trae los datos del perfil (GET /api/usuario/perfil), los
// guarda en userData e inyecta peso, estatura y nivel en el
// bloque #header-ficha (lado derecho del header).
// Usa .dato-card para que se vea como ficha técnica profesional.
// ============================================================
async function renderizarPerfil() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/usuario/perfil', {
      headers: { 'Authorization': 'Bearer ' + token },
    });

    if (!res.ok) throw new Error('Error del servidor');

    const body = await res.json();
    userData = body.data || {};

    // Inyectar en #header-ficha
    const ficha = document.getElementById('header-ficha');
    if (!ficha) return;

    const unidadPeso = localStorage.getItem('unidad_peso') || 'kg';
    const unidadEstatura = localStorage.getItem('unidad_estatura') || 'cm';

    let pesoStr = '—';
    if (userData.peso_actual) {
      const kg = parseFloat(userData.peso_actual);
      pesoStr = unidadPeso === 'lbs'
        ? `${(kg * 2.20462).toFixed(1)} lbs`
        : `${kg} kg`;
    }

    let estaturaStr = '—';
    if (userData.estatura_cm) {
      const cm = parseInt(userData.estatura_cm, 10);
      estaturaStr = unidadEstatura === 'in'
        ? `${(cm / 2.54).toFixed(0)} in`
        : `${cm} cm`;
    }

    const nivel = userData.nivel_experiencia || '—';

    ficha.innerHTML = `
      <div class="dato-card">
        <span class="dato-card__value">${pesoStr}</span>
        <span class="dato-card__label">Peso</span>
      </div>
      <div class="dato-card">
        <span class="dato-card__value">${estaturaStr}</span>
        <span class="dato-card__label">Estatura</span>
      </div>
      <div class="dato-card">
        <span class="dato-card__value">${nivel}</span>
        <span class="dato-card__label">Nivel</span>
      </div>
    `;

  } catch (error) {
    console.error('Error al cargar datos del perfil:', error.message);
  }
}

// ============================================================
// cargarVitrinaPRs()
// ============================================================
// Trae los Récords Personales (PRs) del usuario y renderiza
// tarjetas en #progreso-placeholder.
//
// Si no hay registros, muestra un mensaje que invite a entrenar.
// Si hay, pinta un grid con nombre del ejercicio + peso máximo.
async function cargarVitrinaPRs() {
  const placeholder = document.getElementById('progreso-placeholder');
  if (!placeholder) return;

  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch('/api/estadisticas/prs', {
      headers: { 'Authorization': 'Bearer ' + token },
    });

    if (!res.ok) throw new Error('Error del servidor');

    const body = await res.json();
    const prs = body.data || [];

    if (prs.length === 0) {
      placeholder.innerHTML = `
        <span class="progreso-icon">💪</span>
        <p>¡Aún no hay récords, a entrenar!</p>
      `;
      return;
    }

    placeholder.innerHTML = `
      <h3 style="margin-bottom: 15px; color: #fff; font-size: 1.1rem;">Mis Récords Personales 🏆</h3>
      <div class="progreso-grid">
        ${prs.map(ejercicio => `
          <div style="background: #1b1e31; padding: 10px; border-radius: 8px; border: 1px solid #3a3f58; text-align: center;">
            <span style="display:block; color: #888; font-size: 11px; margin-bottom: 4px;">${ejercicio.ejercicio_nombre}</span>
            <span style="font-size: 16px; font-weight: bold; color: #6c63ff;">${parseFloat(ejercicio.peso_maximo)} kg</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (error) {
    console.error('Error al cargar PRs:', error.message);
    placeholder.innerHTML = `
      <span class="progreso-icon">⚠️</span>
      <p>No se pudieron cargar los récords personales</p>
    `;
  }
}

// ============================================================
// cargarHistorial()
// ============================================================
// Obtiene el historial de entrenamientos del usuario autenticado
// llamando a GET /api/sesiones (protegido con JWT).
//
// Después renderiza una tabla con los resultados en el dashboard.
// Si el usuario no tiene sesiones guardadas, muestra un mensaje
// amigable invitándolo a entrenar.
async function cargarHistorial() {
  const token = getToken();
  if (!token) {
    mostrarLogin();
    return;
  }

  // Mostramos la app y la vista perfil
  mostrarApp();
  mostrarVistaPerfil();

  // ============================================================
  // CARGAR DATOS DEL PERFIL (nombre, email, avatar) desde el server
  // ============================================================
  // Mostrar loading state (Hito 5 — Mejora 2C)
  const perfilLoadingEl = document.createElement('div');
  perfilLoadingEl.id = 'perfil-loading-indicator';
  perfilLoadingEl.className = 'loading';
  perfilLoadingEl.style.cssText = 'padding: 24px; text-align: center;';
  perfilLoadingEl.textContent = 'Cargando perfil...';
  perfilView?.prepend(perfilLoadingEl);

  try {
    const respPerfil = await fetch('/api/usuarios/me', {
      headers: { 'Authorization': 'Bearer ' + token },
    });

    if (respPerfil.ok) {
      const perfilData = await respPerfil.json();
      const usuario = perfilData.data;

      if (perfilNombre) {
        perfilNombre.textContent = usuario.nombre || 'Usuario';
      }
      if (perfilEmail) {
        perfilEmail.textContent = usuario.email || 'usuario@email.com';
      }
      if (perfilAvatarImg && usuario.avatar_url) {
        perfilAvatarImg.src = usuario.avatar_url;
        perfilAvatarImg.classList.remove('hidden');
      } else if (perfilAvatarImg) {
        // Sin foto: mostrar avatar generado con iniciales
        const nombre = usuario.nombre || 'Usuario';
        perfilAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=e94560&color=fff&size=128&font-size=0.4&rounded=true`;
        perfilAvatarImg.classList.remove('hidden');
      }
    } else {
      // Fallback al JWT si falla el endpoint
      const email = extraerEmailDelToken();
      if (perfilEmail) perfilEmail.textContent = email || 'usuario@email.com';
      const nombre = extraerNombreDelToken() || 'Usuario';
      if (perfilNombre) perfilNombre.textContent = nombre;
      if (perfilAvatarImg) {
        perfilAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=e94560&color=fff&size=128&font-size=0.4&rounded=true`;
        perfilAvatarImg.classList.remove('hidden');
      }
    }

    // Inicializar formularios de editar nombre y cambiar contraseña
    inicializarFormulariosPerfil();

    // Remover loading indicator del perfil
    document.getElementById('perfil-loading-indicator')?.remove();

    // ============================================================
    // Fase 3 — Tour Perfil (una vez por dispositivo)
    // ============================================================
    ejecutarTour([
      {
        selector: '#avatar-label',
        titulo: '📷 Tu foto de perfil',
        mensaje: 'Hacé clic en la foto para subir una imagen. Se actualiza al instante.'
      },
      {
        selector: '#btn-ir-ajustes',
        titulo: '⚙️ Ajustes',
        mensaje: 'Desde acá podés cambiar tu nombre, email, unidades, contraseña o eliminar tu cuenta.'
      },
      {
        selector: () => {
          const el = document.getElementById('grafico-volumen-container');
          return el && el.style.display !== 'none' ? el : null;
        },
        titulo: '📊 Tu progreso semanal',
        mensaje: 'El gráfico muestra el volumen total (kg) que levantaste cada semana. Podés filtrar por rutina.'
      },
      {
        selector: '#historial-container',
        titulo: '📋 Tu historial',
        mensaje: 'Cada fila es una sesión guardada con fecha, duración, volumen y series completadas.'
      }
    ], 'tourPerfilVisto');

  } catch {
    // Si hay error de red, usar datos del JWT como fallback
    if (perfilEmail) perfilEmail.textContent = extraerEmailDelToken() || 'usuario@email.com';
    const nombre = extraerNombreDelToken() || 'Usuario';
    if (perfilNombre) perfilNombre.textContent = nombre;
    if (perfilAvatarImg) {
      perfilAvatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=e94560&color=fff&size=128&font-size=0.4&rounded=true`;
      perfilAvatarImg.classList.remove('hidden');
    }
  }

  // Mostrar loading state del historial (Hito 5 — Mejora 2B)
  if (historialContainer) {
    historialContainer.innerHTML = '<div class="loading" style="padding: 24px; text-align: center;">Cargando historial...</div>';
  }

  try {
    const respuesta = await fetch('/api/sesiones', {
      headers: {
        'Authorization': 'Bearer ' + token,
      },
    });

    // --- Token expirado ---
    if (respuesta.status === 401) {
      localStorage.removeItem('token');
      mostrarLogin();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (datos.status !== 'ok' || !datos.data) {
      throw new Error(datos.message || 'Error al obtener el historial');
    }

    const historial = datos.data;

    // ============================================================
    // RENDERIZAR HISTORIAL
    // ============================================================
    // Si no hay sesiones guardadas, mostramos un mensaje vacío
    // con un llamado a la acción para ir a entrenar.
    if (!historial || historial.length === 0) {
      if (historialContainer) {
        historialContainer.innerHTML = `
          <div class="historial-empty">
            <strong>📭 Todavía no tenés entrenamientos guardados</strong>
            <p>Completá tu primera rutina y guardala para verla acá.</p>
            <button id="btn-ir-entrenar" class="btn-login" style="margin-top: 20px; display: inline-block; width: auto; padding: 12px 28px;">
              🏋️ Ir a entrenar
            </button>
          </div>
        `;

        // Al hacer clic en "Ir a entrenar", navegamos a la rutina
        document.getElementById('btn-ir-entrenar')?.addEventListener('click', () => {
          cargarRutina();
        });
      }
      cargarLogros();
      return;
    }

    // ============================================================
    // ARMAR TABLA HTML
    // ============================================================
    // Recorremos el array de sesiones y generamos filas de tabla.
    //
    // Columnas:
    //   Fecha   | Rutina   | Notas
    //
    // Cada fila tiene un data-sesion-id para poder identificar
    // la sesión si después queremos agregar un "ver detalle".
    // ============================================================
    // Renderizar gráfico de volumen semanal antes de la tabla
    // Guardar datos completos en cache para paginación
    historialDatosCompletos = historial;
    historialPaginaActual = 1;

    // El gráfico recibe TODOS los datos — no la página actual
    renderGraficoVolumen(historial);

    // La tabla recibe solo la página 1
    renderTablaHistorial(1);

    // Cargar logros después de mostrar el historial
    cargarLogros();

  } catch (error) {
    console.error('Error al cargar historial:', error.message);
    if (historialContainer) {
      historialContainer.innerHTML = `
        <div class="error">
          ❌ Error al cargar el historial<br />
          <small>${error.message}</small>
        </div>
      `;
    }
  }
}

// ============================================================
// cargarLogros()
// ============================================================
// Obtiene los días entrenados desde el backend y renderiza
// la grilla de logros con estado bloqueado/desbloqueado/próximo.
async function cargarLogros() {
  const grid = document.getElementById('logros-grid');
  const contador = document.getElementById('logros-dias-contador');
  if (!grid) return;

  try {
    const res = await fetch('/api/sesiones/logros', {
      headers: { 'Authorization': 'Bearer ' + getToken() },
    });

    if (!res.ok) {
      grid.innerHTML = '<p style="opacity:0.5;">No se pudieron cargar los logros.</p>';
      return;
    }

    const json = await res.json();
    const dias = json.data.dias_totales || 0;

    // Contador de días
    if (contador) {
      contador.textContent = dias === 0
        ? 'Completá tu primer entrenamiento para desbloquear logros.'
        : `Días entrenados: ${dias} — seguí así 💪`;
    }

    // Siguiente logro a desbloquear
    const siguiente = LOGROS.find(l => l.dias > dias);

    // Renderizar grid
    grid.innerHTML = LOGROS.map(logro => {
      const desbloqueado = dias >= logro.dias;
      const esSiguiente = siguiente && logro.id === siguiente.id;

      return `
        <div
          ${desbloqueado ? `data-logro-id="${logro.id}"` : ''}
          style="
            cursor: ${desbloqueado ? 'pointer' : 'default'};
            background: ${desbloqueado
              ? 'rgba(255,255,255,0.06)'
              : 'rgba(255,255,255,0.02)'};
          border: 1px solid ${desbloqueado
            ? 'rgba(233,69,96,0.4)'
            : 'rgba(255,255,255,0.08)'};
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          transition: transform 0.2s;
          position: relative;
          ${!desbloqueado ? 'opacity: 0.4;' : ''}
          ${esSiguiente ? 'opacity: 0.7; border-color: rgba(233,69,96,0.3);' : ''}
        ">
          ${esSiguiente ? '<div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%);background:#e94560;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:10px;">PRÓXIMO</div>' : ''}
          <div style="margin-bottom: 8px;">
            <img
              src="${logro.imagen}"
              alt="${logro.nombre}"
              style="
                width: 72px;
                height: 72px;
                object-fit: contain;
                display: block;
                margin: 0 auto;
                ${!desbloqueado ? 'filter: grayscale(1) opacity(0.4);' : ''}
              "
              onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
            >
            <div style="display:none; font-size:2rem;">🏆</div>
          </div>
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px;">
            ${logro.nombre}
          </div>
          <div style="font-size: 11px; opacity: 0.6; margin-bottom: 8px; line-height: 1.3;">
            ${logro.desc}
          </div>
          <div style="font-size: 11px; font-weight: 600; color: ${desbloqueado ? '#00d2aa' : 'inherit'};">
            ${desbloqueado ? '✓ Desbloqueado' : `${logro.dias} días`}
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    grid.innerHTML = '<p style="opacity:0.5;">Error al cargar los logros.</p>';
  }
}

// ============================================================
// lanzarConfetti()
// ============================================================
// Crea 60 piezas de confetti que caen desde arriba y se
// eliminan solas al terminar la animación.
function lanzarConfetti() {
  const colores = ['#e94560', '#00d2aa', '#FFD700', '#6c63ff', '#fff'];
  const total = 60;

  for (let i = 0; i < total; i++) {
    const pieza = document.createElement('div');
    pieza.className = 'confetti-piece';

    pieza.style.left = Math.random() * 100 + 'vw';
    pieza.style.top = '-10px';
    pieza.style.background = colores[Math.floor(Math.random() * colores.length)];

    const size = 6 + Math.random() * 8;
    pieza.style.width = size + 'px';
    pieza.style.height = size + 'px';

    const duracion = 2 + Math.random() * 2;
    pieza.style.animationDuration = duracion + 's';
    pieza.style.animationDelay = Math.random() * 0.8 + 's';

    document.body.appendChild(pieza);
    setTimeout(() => pieza.remove(), (duracion + 1) * 1000);
  }
}

// ============================================================
// mostrarModalLogro(logro)
// ============================================================
// Muestra un modal con la imagen grande del logro, nombre,
// descripción y confetti. Reusa o crea el overlay una vez.
function mostrarModalLogro(logro) {
  let overlay = document.getElementById('modal-logro-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-logro-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div id="modal-logro-content" class="modal-content" style="
        max-width: 360px;
        text-align: center;
        padding: 32px 24px;
        border: 1px solid rgba(233,69,96,0.4);
      ">
        <img id="modal-logro-img" src="" alt=""
          style="width:140px; height:140px; object-fit:contain;
                 margin: 0 auto 20px; display:block;"
        >
        <div style="
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          color: #e94560; text-transform: uppercase; margin-bottom: 8px;
        ">🏆 Logro Desbloqueado</div>
        <h3 id="modal-logro-nombre" style="
          font-size: 22px; font-weight: 800;
          margin: 0 0 10px;
        "></h3>
        <p id="modal-logro-desc" style="
          font-size: 14px; opacity: 0.7;
          line-height: 1.5; margin: 0 0 24px;
        "></p>
        <button id="modal-logro-cerrar" class="btn-login" style="width:100%;">
          ¡Genial! 💪
        </button>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarModalLogro();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        cerrarModalLogro();
      }
    });

    document.getElementById('modal-logro-cerrar')
      .addEventListener('click', cerrarModalLogro);
  }

  const content = document.getElementById('modal-logro-content');
  content.style.animation = 'none';
  content.offsetHeight; // forzar reflow para reiniciar animación
  content.style.animation = '';

  document.getElementById('modal-logro-img').src = logro.imagen;
  document.getElementById('modal-logro-img').alt = logro.nombre;
  document.getElementById('modal-logro-nombre').textContent = logro.nombre;
  document.getElementById('modal-logro-desc').textContent = logro.desc;

  overlay.classList.remove('hidden');
  lanzarConfetti();
}

function cerrarModalLogro() {
  document.getElementById('modal-logro-overlay')?.classList.add('hidden');
}

// ============================================================
// abrirDetalleSesion(sesionId)
// ============================================================
// Abre un modal con el detalle completo de una sesión:
// qué ejercicios se hicieron, con qué peso y repeticiones en cada serie.
// ============================================================
async function abrirDetalleSesion(sesionId) {
  let overlay = document.getElementById('modal-detalle-sesion-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-detalle-sesion-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width: 560px; max-height: 80vh; overflow-y: auto;">
        <div class="modal-header">
          <h3 id="detalle-sesion-titulo">Detalle de sesión</h3>
          <button id="btn-cerrar-detalle-sesion" class="modal-cerrar">&times;</button>
        </div>
        <div class="modal-body" id="detalle-sesion-body">
          <div class="loading">Cargando...</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.add('hidden');
    });
    document.getElementById('btn-cerrar-detalle-sesion').addEventListener('click', () => {
      overlay.classList.add('hidden');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        overlay.classList.add('hidden');
      }
    });
  }

  const body = document.getElementById('detalle-sesion-body');
  const titulo = document.getElementById('detalle-sesion-titulo');
  body.innerHTML = '<div class="loading">Cargando...</div>';
  overlay.classList.remove('hidden');

  try {
    const res = await fetch(`/api/sesiones/${sesionId}`, {
      headers: { 'Authorization': 'Bearer ' + getToken() },
    });

    if (res.status === 401) {
      localStorage.removeItem('token');
      mostrarLogin();
      return;
    }

    if (!res.ok) {
      body.innerHTML = '<p style="opacity:0.7;">No se pudo cargar el detalle de esta sesi\u00f3n.</p>';
      return;
    }

    const json = await res.json();
    const sesion = json.data;

    const fecha = new Date(sesion.fecha.split('T')[0] + 'T00:00:00');
    const fechaTexto = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    titulo.textContent = `${sesion.rutina_nombre || 'Entrenamiento'} \u2014 ${fechaTexto}`;

    let html = `
      <p style="opacity:0.7; font-size:13px; margin-bottom:16px;">
        \u23f1\ufe0f ${sesion.duracion_minutos || 0} min
        ${sesion.notas ? `\u00b7 \ud83d\udcdd ${sesion.notas}` : ''}
      </p>
    `;

    if (!sesion.ejercicios || sesion.ejercicios.length === 0) {
      html += '<p style="opacity:0.6;">Esta sesi\u00f3n no tiene ejercicios registrados.</p>';
    } else {
      sesion.ejercicios.forEach(ej => {
        html += `
          <div style="margin-bottom:20px; padding-bottom:16px; border-bottom:1px solid rgba(255,255,255,0.07);">
            <h4 style="margin:0 0 8px; font-size:15px;">${ej.nombre}</h4>
        `;

        if (ej.series.length === 0) {
          html += '<p style="opacity:0.5; font-size:13px;">Sin series registradas.</p>';
        } else {
          html += `
            <table style="width:100%; font-size:13px; border-collapse:collapse;">
              <thead>
                <tr style="opacity:0.6;">
                  <td style="padding:4px 0;">Serie</td>
                  <td style="padding:4px 0;">Peso</td>
                  <td style="padding:4px 0;">Reps</td>
                </tr>
              </thead>
              <tbody>
          `;
          ej.series.forEach(s => {
            html += `
              <tr>
                <td style="padding:2px 0;">#${s.numero_serie}</td>
                <td style="padding:2px 0;">${formatearPeso(s.peso || 0)}</td>
                <td style="padding:2px 0;">${s.repeticiones || 0}</td>
              </tr>
            `;
          });
          html += `</tbody></table>`;
        }

        if (ej.notas) {
          html += `<p style="opacity:0.6; font-size:12px; margin-top:6px;">\ud83d\udcdd ${ej.notas}</p>`;
        }

        html += `</div>`;
      });
    }

    body.innerHTML = html;
  } catch (err) {
    body.innerHTML = '<p style="opacity:0.7;">Error de conexi\u00f3n al cargar el detalle.</p>';
  }
}

// ============================================================
// inicializarFormulariosPerfil()
// ============================================================
// Inyecta el botón "⚙️ Ajustes" debajo del email en la vista
// perfil. El botón navega a #ajustes-view donde están los
// formularios de edición agrupados (datos personales, unidades,
// seguridad, eliminar cuenta).
// ============================================================
function inicializarFormulariosPerfil() {

  // ============================================================
  // Botón "⚙️ Ajustes" debajo del email — reemplaza el viejo
  // modal perfil. Abre ajustes-view en lugar de un modal.
  // ============================================================
  if (!document.getElementById('btn-ir-ajustes')) {
    const btnAjustes = document.createElement('button');
    btnAjustes.id = 'btn-ir-ajustes';
    btnAjustes.className = 'btn-logout';
    btnAjustes.textContent = '⚙️ Ajustes';
    btnAjustes.style.marginTop = '12px';

    const infoDiv = document.querySelector('.perfil-info');
    if (infoDiv) infoDiv.appendChild(btnAjustes);
  }

  // ============================================================
  // Evento: al hacer clic en btn-ir-ajustes → mostrar ajustes
  // ============================================================
  const btnIrAjustes = document.getElementById('btn-ir-ajustes');
  if (btnIrAjustes) {
    const btnClonado = btnIrAjustes.cloneNode(true);
    btnIrAjustes.parentNode.replaceChild(btnClonado, btnIrAjustes);
    btnClonado.addEventListener('click', mostrarVistaAjustes);
  }
}

// ============================================================
// mostrarVistaAjustes() / volverAPerfil()
// ============================================================
// Navegan entre #perfil-view y #ajustes-view sin cambiar la
// pestaña activa de la navegación porque ajustes es un sub-nivel
// de perfil.
// ============================================================
function mostrarVistaAjustes() {
  perfilView?.classList.add('hidden');
  ajustesView?.classList.remove('hidden');
  precargarAjustes();
  cargarUnidades();
}

function volverAPerfil() {
  ajustesView?.classList.add('hidden');
  perfilView?.classList.remove('hidden');
  // Refrescar display de peso/estatura y gráfico con la unidad activa
  renderizarPerfil();
  if (historialDatosCompletos && historialDatosCompletos.length > 0) {
    renderGraficoVolumen(historialDatosCompletos);
  }
}

// ============================================================
// PROGRAMA PRINCIPIANTE — Vista y navegación
// ============================================================
function crearVistaProgramaPrincipiante() {
  if (document.getElementById('programa-principiante-view')) return;

  const vista = document.createElement('div');
  vista.id = 'programa-principiante-view';
  vista.className = 'hidden';
  vista.style.cssText = 'padding: 0 16px 80px;';

  vista.innerHTML = `
    <!-- Header -->
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:24px; padding-top:16px;">
      <button id="btn-volver-desde-principiante" style="
        background:transparent; border:none; color:var(--text-secondary);
        cursor:pointer; font-size:14px; padding:0;
      ">← Volver</button>
      <h2 style="margin:0; font-size:20px; font-weight:700;">🔰 Programa Principiante</h2>
    </div>

    <!-- Descripción general -->
    <div class="ajuste-caja" style="margin-bottom:20px;">
      <p style="font-size:14px; line-height:1.6; margin:0 0 12px; opacity:0.9;">
        ${PROGRAMA_PRINCIPIANTE.descripcion}
      </p>
      <p style="font-size:13px; line-height:1.5; margin:0 0 8px; color:var(--text-secondary);">
        ${PROGRAMA_PRINCIPIANTE.descansoPosta}
      </p>
      <p style="font-size:13px; line-height:1.5; margin:0; color:var(--text-secondary);">
        ${PROGRAMA_PRINCIPIANTE.notaEntrenador}
      </p>
    </div>

    <!-- Nota de peso -->
    <div class="ajuste-caja" style="margin-bottom:24px; border-color:rgba(233,69,96,0.3);">
      <p style="font-size:13px; line-height:1.5; margin:0;">
        ${PROGRAMA_PRINCIPIANTE.notaPeso}
      </p>
    </div>

    <!-- Orden recomendado -->
    <div style="
      display:flex; align-items:center; justify-content:center;
      gap:8px; margin-bottom:24px; font-size:13px; opacity:0.7;
      flex-wrap:wrap;
    ">
      <span>💪 Empuje</span>
      <span>→</span>
      <span>😴 Descanso</span>
      <span>→</span>
      <span>🏋️ Tirón</span>
      <span>→</span>
      <span>😴 Descanso</span>
      <span>→</span>
      <span>🦵 Piernas</span>
      <span>→</span>
      <span>😴 Descanso</span>
    </div>

    <!-- Cards de las 3 rutinas -->
    <div id="programa-rutinas-grid" style="display:flex; flex-direction:column; gap:16px;">
      ${PROGRAMA_PRINCIPIANTE.rutinas.map(rutina => `
        <div class="ajuste-caja programa-rutina-card" data-rutina-id="${rutina.id}"
          style="cursor:pointer; border-color:${rutina.color}33; transition:border-color 0.2s;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <div>
              <div style="font-size:17px; font-weight:700; margin-bottom:2px;">
                ${rutina.emoji} ${rutina.nombre}
              </div>
              <div style="font-size:12px; opacity:0.6;">${rutina.musculos}</div>
            </div>
            <button class="btn-comenzar-rutina" data-rutina-id="${rutina.id}" style="
              background:${rutina.color}; color:#fff; border:none;
              border-radius:8px; padding:8px 16px; font-size:13px;
              font-weight:700; cursor:pointer; white-space:nowrap;
            ">Comenzar →</button>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${rutina.ejercicios.map((ej, i) => `
              <div style="
                font-size:12px; padding:4px 8px; border-radius:6px;
                background:rgba(255,255,255,0.04);
                display:flex; align-items:center; gap:8px;
              ">
                <span style="opacity:0.5; min-width:16px;">${i + 1}.</span>
                <span style="opacity:0.9;">${ej.nombre}</span>
                <span style="opacity:0.4; margin-left:auto; font-size:11px;">
                  ${ej.tipo === 'calentamiento' ? '🔥 Calentamiento' : `${ej.series}×${ej.repeticiones}`}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Insertar en el app-content antes de rutinas-view
  const rutinasView = document.getElementById('rutinas-view');
  rutinasView?.parentNode?.insertBefore(vista, rutinasView);
}

function mostrarVistaProgramaPrincipiante() {
  crearVistaProgramaPrincipiante();

  // Ocultar todas las vistas
  document.getElementById('rutinas-view')?.classList.add('hidden');
  document.getElementById('perfil-view')?.classList.add('hidden');
  document.getElementById('entrenar-view')?.classList.add('hidden');
  document.getElementById('ajustes-view')?.classList.add('hidden');

  document.getElementById('programa-principiante-view')?.classList.remove('hidden');

  // Listener del botón volver (una sola vez)
  const btnVolver = document.getElementById('btn-volver-desde-principiante');
  if (btnVolver && !btnVolver.dataset.listenerAdded) {
    btnVolver.addEventListener('click', () => {
      document.getElementById('programa-principiante-view')?.classList.add('hidden');
      mostrarApp();
      mostrarVistaRutinas();
      cargarRutinasUsuario();
    });
    btnVolver.dataset.listenerAdded = 'true';
  }

  // Listeners de "Comenzar →" (delegación)
  const grid = document.getElementById('programa-rutinas-grid');
  if (grid && !grid.dataset.listenerAdded) {
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-comenzar-rutina');
      if (btn) {
        const rutinaId = btn.dataset.rutinaId;
        iniciarSesionAdaptacion(rutinaId);
      }
    });
    grid.dataset.listenerAdded = 'true';
  }
}

function iniciarSesionAdaptacion(rutinaId) {
  const rutina = PROGRAMA_PRINCIPIANTE.rutinas.find(r => r.id === rutinaId);
  if (!rutina) return;

  crearVistaSesionAdaptacion(rutina);
  mostrarVistaSesionAdaptacion();
}

// ============================================================
// PASO 1 — crearVistaSesionAdaptacion(rutina)
// ============================================================

function crearVistaSesionAdaptacion(rutina) {
  // Siempre recrear la vista con la rutina nueva
  const existente = document.getElementById('sesion-adaptacion-view');
  if (existente) existente.remove();

  const vista = document.createElement('div');
  vista.id = 'sesion-adaptacion-view';
  vista.className = 'hidden';
  vista.style.cssText = 'padding: 0 16px 100px;';

  vista.innerHTML = `
    <!-- Header -->
    <div style="
      display:flex; align-items:center; gap:12px;
      margin-bottom:20px; padding-top:16px;
    ">
      <button id="btn-volver-sesion-adaptacion" style="
        background:transparent; border:none;
        color:var(--text-secondary); cursor:pointer;
        font-size:14px; padding:0;
      ">← Volver</button>
      <div>
        <h2 style="margin:0; font-size:19px; font-weight:700;">
          ${rutina.emoji} ${rutina.nombre}
        </h2>
        <div style="font-size:12px; opacity:0.5; margin-top:2px;">
          ${rutina.musculos}
        </div>
      </div>
    </div>

    <!-- Timer de sesión -->
    <div style="
      display:flex; align-items:center; justify-content:center;
      gap:8px; margin-bottom:20px; font-size:22px; font-weight:700;
      color:var(--text-secondary);
    ">
      <span>⏱️</span>
      <span id="adaptacion-timer-display">00:00</span>
    </div>

    <!-- Nota de descanso -->
    <div style="
      background:rgba(108,99,255,0.08); border:1px solid rgba(108,99,255,0.2);
      border-radius:10px; padding:12px 16px; margin-bottom:20px;
      font-size:13px; color:var(--text-secondary); line-height:1.4;
    ">
      ${PROGRAMA_PRINCIPIANTE.descansoPosta}
    </div>

    <!-- Ejercicios -->
    <div id="adaptacion-ejercicios-container" style="
      display:flex; flex-direction:column; gap:16px;
    ">
      ${rutina.ejercicios.map((ej, idx) => `
        <div class="adaptacion-ejercicio-card" data-ejercicio-idx="${idx}" style="
          background:var(--bg-card);
          border:1px solid var(--border);
          border-radius:14px;
          overflow:hidden;
        ">
          <!-- Cabecera del ejercicio -->
          <div style="padding:16px 16px 12px; display:flex; gap:12px; align-items:flex-start;">
            <div style="
              background:${rutina.color}22;
              color:${rutina.color};
              border-radius:8px;
              width:32px; height:32px;
              display:flex; align-items:center; justify-content:center;
              font-size:13px; font-weight:700; flex-shrink:0;
            ">${idx + 1}</div>
            <div style="flex:1;">
              <div style="font-size:15px; font-weight:700; margin-bottom:2px;">
                ${ej.nombre}
              </div>
              <div style="font-size:11px; opacity:0.5; margin-bottom:6px;">
                ${ej.tipo === 'calentamiento'
                  ? '🔥 Calentamiento — Peso corporal'
                  : `${ej.series} series × ${ej.repeticiones} repeticiones`}
              </div>
              <div style="
                font-size:12px; color:var(--text-secondary);
                background:rgba(255,255,255,0.04);
                border-radius:6px; padding:8px 10px;
                line-height:1.5;
              ">
                💡 <strong>Peso sugerido:</strong> ${ej.peso}
              </div>
            </div>
          </div>

          <!-- Instrucción técnica -->
          <div style="
            padding:0 16px 12px;
            font-size:12px; color:var(--text-secondary);
            line-height:1.6; border-top:1px solid rgba(255,255,255,0.05);
            padding-top:10px; margin-top:0;
          ">
            📋 ${ej.instruccion}
          </div>

          <!-- Series -->
          <div style="padding:0 16px 16px;">
            ${Array.from({length: ej.series}, (_, s) => `
              <div class="adaptacion-serie-row" data-serie="${s + 1}" style="
                display:flex; align-items:center; gap:10px;
                padding:8px 0;
                border-top:1px solid rgba(255,255,255,0.04);
              ">
                <span style="
                  font-size:12px; opacity:0.5;
                  min-width:50px;
                ">Serie ${s + 1}</span>
                <span style="font-size:12px; opacity:0.6; min-width:60px;">
                  ${ej.repeticiones} reps
                </span>
                <span style="font-size:12px; opacity:0.5; flex:1;">
                  ${ej.tipo === 'calentamiento' ? 'Peso corporal' : 'Peso libre'}
                </span>
                <input
                  type="checkbox"
                  class="adaptacion-check-serie"
                  data-ejercicio="${idx}"
                  data-serie="${s}"
                  style="width:18px; height:18px; cursor:pointer; accent-color:${rutina.color};"
                />
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Acciones finales -->
    <div style="
      position:fixed; bottom:0; left:0; right:0;
      background:var(--bg-secondary);
      border-top:1px solid var(--border);
      padding:12px 16px;
      display:flex; gap:10px;
      z-index:100;
    ">
      <button id="adaptacion-btn-cancelar" class="btn-logout" style="flex:1;">
        Cancelar
      </button>
      <button id="adaptacion-btn-finalizar" class="btn-login" style="flex:2;">
        💾 Finalizar entrenamiento
      </button>
    </div>
  `;

  const rutinasView = document.getElementById('rutinas-view');
  rutinasView?.parentNode?.insertBefore(vista, rutinasView);

  // Iniciar timer de sesión
  iniciarTimerAdaptacion();

  // Listeners internos
  vista.querySelector('#btn-volver-sesion-adaptacion')
    ?.addEventListener('click', () => {
      confirmarAccion({
        titulo: '¿Salir de la sesión?',
        mensaje: 'Tu progreso no se guardará. El entrenamiento quedará activo y podés volver cuando quieras.',
        textoBtnConfirmar: 'Salir',
        colorBtn: 'btn-logout',
        onConfirmar: () => {
          document.getElementById('sesion-adaptacion-view')?.classList.add('hidden');
          mostrarVistaProgramaPrincipiante();
        }
      });
    });

  vista.querySelector('#adaptacion-btn-cancelar')
    ?.addEventListener('click', () => {
      confirmarAccion({
        titulo: '⚠️ Cancelar entrenamiento',
        mensaje: 'Se descartará esta sesión y no se guardará en tu historial.',
        textoBtnConfirmar: 'Sí, cancelar',
        colorBtn: 'btn-logout',
        onConfirmar: cancelarSesionAdaptacion
      });
    });

  vista.querySelector('#adaptacion-btn-finalizar')
    ?.addEventListener('click', finalizarSesionAdaptacion);
}

// ============================================================
// PASO 2 — Timer de la sesión
// ============================================================

let adaptacionTimerInterval = null;
let adaptacionSegundos = 0;

function iniciarTimerAdaptacion() {
  clearInterval(adaptacionTimerInterval);
  adaptacionSegundos = 0;
  adaptacionTimerInterval = setInterval(() => {
    adaptacionSegundos++;
    const m = Math.floor(adaptacionSegundos / 60);
    const s = adaptacionSegundos % 60;
    const display = document.getElementById('adaptacion-timer-display');
    if (display) {
      display.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }
  }, 1000);
}

function detenerTimerAdaptacion() {
  clearInterval(adaptacionTimerInterval);
  adaptacionTimerInterval = null;
}

// ============================================================
// PASO 3 — mostrarVistaSesionAdaptacion()
// ============================================================

function mostrarVistaSesionAdaptacion() {
  document.getElementById('rutinas-view')?.classList.add('hidden');
  document.getElementById('perfil-view')?.classList.add('hidden');
  document.getElementById('entrenar-view')?.classList.add('hidden');
  document.getElementById('ajustes-view')?.classList.add('hidden');
  document.getElementById('programa-principiante-view')?.classList.add('hidden');
  document.getElementById('sesion-adaptacion-view')?.classList.remove('hidden');
}

// ============================================================
// PASO 4 — Placeholders para 3B
// ============================================================

function cancelarSesionAdaptacion() {
  detenerTimerAdaptacion();
  document.getElementById('sesion-adaptacion-view')?.remove();
  mostrarApp();
  mostrarVistaRutinas();
  cargarRutinasUsuario();
  mostrarToast('Sesión cancelada', 'error');
}

function finalizarSesionAdaptacion() {
  // Se implementa en 3B — guardado en historial + limpieza
  mostrarToast('Guardando sesión... (próximo hito)', 'success');
}

// ============================================================
// cargarRutinasUsuario()
// ============================================================
// Obtiene TODAS las rutinas del usuario autenticado
// (GET /api/rutinas/) y las muestra en el dashboard como
// tarjetas clickeables.
//
// Si el usuario llegó a 4 rutinas, oculta el botón "+" y
// muestra el mensaje de límite alcanzado.
async function cargarRutinasUsuario() {
  const token = getToken();
  if (!token) return;

  if (!rutinasContainer) return;

  // Mostrar loading state (Hito 5 — Mejora 2A)
  rutinasContainer.innerHTML = '<div class="loading" style="padding: 24px; text-align: center;">Cargando rutinas...</div>';

  try {
    const respuesta = await fetch('/api/rutinas/', {
      headers: { 'Authorization': 'Bearer ' + token },
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        localStorage.removeItem('token');
        mostrarLogin();
      }
      return;
    }

    const datos = await respuesta.json();
    if (datos.status !== 'ok' || !datos.data) return;

    const rutinas = datos.data;
    const recomendadas = rutinas.filter(r => r.es_recomendada);
    const misRutinas   = rutinas.filter(r => !r.es_recomendada);
    const total = misRutinas.length;
    const restantes = 4 - total;
    const limite = total >= 4;
    let html = '';

    // ── Card Programa Principiante (siempre visible) ──
    html += `\n      <div id=\"card-programa-principiante\" class=\"programa-principiante-card programa-principiante-static\">
        <div class=\"programa-principiante-badge\">🔰 PROGRAMA GUIADO</div>
        <div class=\"programa-principiante-titulo\">Empuje · Tirón · Piernas</div>
        <div class=\"programa-principiante-subtitulo\">
          Programa de adaptación para principiantes — 3 días, 5 ejercicios por sesión
        </div>
        <div class=\"programa-principiante-cta\">Ver programa →</div>\n      </div>\n    `;

    // Sección: Recomendadas
    if (recomendadas.length > 0) {
      html += `<h3 class="dashboard-section-title">⭐ Recomendadas</h3><div class="rutinas-grid">`;
      for (const rutina of recomendadas) {
        const totalEj = rutina.total_ejercicios || 0;
        const textoEj = totalEj === 1 ? '1 ejercicio' : totalEj + ' ejercicios';
        html += `
          <div class="rutina-card rutina-card--recomendada" data-rutina-id="${rutina.id}">
            <div class="rutina-card-nombre">${rutina.nombre}</div>
            <div class="rutina-card-ejercicios">${textoEj}</div>
          </div>
        `;
      }
      html += `</div>`;
    }

    // Sección: Mis Rutinas
    html += `<h3 class="dashboard-section-title">📋 Mis Rutinas</h3><div class="rutinas-grid">`;
    for (const rutina of misRutinas) {
      const totalEj = rutina.total_ejercicios || 0;
      const textoEj = totalEj === 1 ? '1 ejercicio' : totalEj + ' ejercicios';
      html += `
        <div class="rutina-card" data-rutina-id="${rutina.id}" style="position: relative;">
          <div style="position: absolute; top: 12px; right: 12px; display: flex; gap: 12px;">
            <button class="btn-editar-rutina" data-rutina-id="${rutina.id}" data-rutina-nombre="${rutina.nombre}" title="Editar" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; opacity: 0.7; transition: opacity 0.2s; position: static;">✏️</button>
            <button class="btn-eliminar-rutina" data-rutina-id="${rutina.id}" data-rutina-nombre="${rutina.nombre}" title="Eliminar" style="background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 4px; opacity: 0.7; transition: opacity 0.2s; position: static;">🗑️</button>
          </div>
          <div class="rutina-card-nombre">${rutina.nombre}</div>
          <div class="rutina-card-ejercicios">${textoEj}</div>
        </div>
      `;
    }

    // Tarjeta para "Añadir nueva" (solo si no se alcanzó el límite y en Mis Rutinas)
    if (!limite) {
      const textoContador = total >= 3
        ? `+ Nueva Rutina <span style="font-size:0.75rem; opacity:0.7; display:block; margin-top:4px;">
             (${restantes} lugar${restantes === 1 ? '' : 'es'} disponible${restantes === 1 ? '' : 's'})
           </span>`
        : '+ Nueva Rutina';
      html += `
        <div id="btn-add-rutina" class="rutina-card rutina-card--add">
          ${textoContador}
        </div>
      `;
    }
    html += `</div>`;

    rutinasContainer.innerHTML = html;

    // Mostrar/ocultar mensaje de límite
    if (limiteMsg) {
      if (limite) {
        limiteMsg.classList.remove('hidden');
      } else {
        limiteMsg.classList.add('hidden');
      }
    }

    // ============================================================
    // EVENTOS: clic en cada rutina
    // ============================================================
    // Cada tarjeta de rutina navega a la vista "Entrenar" con
    // el ID de esa rutina.
    document.querySelectorAll('.rutina-card[data-rutina-id]').forEach((card) => {
      card.addEventListener('click', (e) => {
        // No navegar a Entrenar si se clickeó eliminar o editar
        if (e.target.closest('.btn-eliminar-rutina')) return;
        if (e.target.closest('.btn-editar-rutina')) return;

        const id = Number(card.dataset.rutinaId);
        if (!id) return;

        // Si ya hay un entrenamiento activo, mostrar conflicto
        if (entrenamientoActivo) {
          mostrarConflictModal(id);
          return;
        }

        // Guardamos el ID y cargamos la rutina
        rutinaActualId = id;
        cargarRutina(id);
      });
    });

    // Evento para abrir el modal de creación
    const btnAdd = document.getElementById('btn-add-rutina');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        abrirModal();
      });
    }

    // ============================================================
    // TOUR DE RUTINAS (solo si hay rutinas creadas)
    // ============================================================
    const rutinasExisten = document.querySelector('.rutina-card:not(.rutina-card--add)');
    if (rutinasExisten) {
      ejecutarTour([
        {
          selector: '.rutina-card:not(.rutina-card--add)',
          titulo: '🏋️ Tus Rutinas',
          mensaje: 'Cada tarjeta es un entrenamiento. Hacé clic sobre ella para comenzar una sesión.'
        },
        {
          selector: '.btn-editar-rutina',
          titulo: '✏️ Editar Rutina',
          mensaje: 'Cambiá el nombre, descripción o los ejercicios de esta rutina cuando quieras.'
        },
        {
          selector: '.btn-eliminar-rutina',
          titulo: '🗑️ Eliminar Rutina',
          mensaje: 'Borrá una rutina que ya no uses. Tu historial de sesiones se mantiene intacto.'
        },
        {
          selector: '#btn-add-rutina',
          titulo: '➕ Nueva Rutina',
          mensaje: '¿Listo para un nuevo desafío? Tocá acá para armar una rutina personalizada desde cero.'
        }
      ], 'tourRutinasVisto');
    }

  } catch (error) {
    console.error('Error al cargar rutinas:', error.message);
  }
}

// ============================================================
// ABRIR / CERRAR MODAL DE CREACIÓN
// ============================================================
function abrirModal() {
  // Resetear modo edición → modo creación
  rutinaEnEdicionId = null;

  if (modalOverlay) {
    modalOverlay.classList.remove('hidden');
    inputNombreRutina.value = '';
    if (inputDescripcionRutina) inputDescripcionRutina.value = '';
    inputNombreRutina.focus();

    // Título según modo
    const modalHeader = modalOverlay.querySelector('.modal-header h3');
    if (modalHeader) modalHeader.textContent = '➕ Nueva Rutina';

    if (modalError) modalError.classList.add('hidden');
    btnModalCrear.disabled = false;
    btnModalCrear.textContent = 'Crear rutina';

    // Limpiar selección temporal al abrir el modal
    ejerciciosSeleccionadosTemp.clear();

    // Cargar catálogo y dibujar checkboxes (Hito 11 Parte 3)
    renderizarCheckboxesEnModal();
  }
}

// ============================================================
// abrirModalEdicion(rutinaId)
// ============================================================
// Abre el modal en modo edición. Carga los datos actuales de
// la rutina, pre-selecciona los ejercicios, y cambia el título
// y botón a "Guardar cambios".
async function abrirModalEdicion(rutinaId) {
  const token = getToken();
  if (!token) return;

  try {
    // Cargar datos completos de la rutina desde el backend
    const respuesta = await fetch(`/api/rutinas/${rutinaId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!respuesta.ok) throw new Error('No se pudo cargar la rutina');

    const datos = await respuesta.json();
    const rutina = datos.data;
    if (!rutina) throw new Error('Rutina no encontrada');

    // Configurar estado de edición
    rutinaEnEdicionId = rutinaId;

    // Pre-cargar campos
    inputNombreRutina.value = rutina.nombre || '';
    if (inputDescripcionRutina) inputDescripcionRutina.value = rutina.descripcion || '';

    // Pre-seleccionar ejercicios
    ejerciciosSeleccionadosTemp.clear();
    if (rutina.ejercicios && Array.isArray(rutina.ejercicios)) {
      rutina.ejercicios.forEach(ej => {
        ejerciciosSeleccionadosTemp.add(ej.id);
      });
    }

    // Cambiar título del modal
    const modalHeader = modalOverlay.querySelector('.modal-header h3');
    if (modalHeader) modalHeader.textContent = '✏️ Editar Rutina';

    // Cambiar texto del botón
    btnModalCrear.textContent = 'Guardar cambios';
    btnModalCrear.disabled = false;

    if (modalError) modalError.classList.add('hidden');

    // Renderizar checkboxes con selección ya poblada
    modalOverlay.classList.remove('hidden');
    renderizarCheckboxesEnModal();

  } catch (error) {
    console.error('Error al cargar rutina para editar:', error.message);
    mostrarToast('Error al cargar los datos de la rutina', 'error');
  }
}

function cerrarModal() {
  if (modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
  // Resetear estado de edición al cerrar para evitar
  // inconsistencias si se abre de nuevo el modal.
  rutinaEnEdicionId = null;
}

// ============================================================
// crearNuevaRutina(nombre)
// ============================================================
// Llama a POST /api/rutinas/crear con el nombre ingresado.
// Si el servidor responde 403, muestra el mensaje de límite.
// Si responde 201, cierra el modal y refresca la lista.
async function crearNuevaRutina(nombre) {
  const token = getToken();
  if (!token) return;

  try {
    btnModalCrear.disabled = true;
    btnModalCrear.textContent = 'Creando...';
    if (modalError) modalError.classList.add('hidden');

    // ============================================================
    // RECOLECTAR EJERCICIOS SELECCIONADOS (Hito 11 Parte 3)
    // ============================================================
    // Leemos del Set temporal (preservado aunque el DOM se haya
    // redibujado por filtros de búsqueda).
    const ejercicios_ids = Array.from(ejerciciosSeleccionadosTemp);

    const body = { nombre: nombre.trim() };
    if (ejercicios_ids.length > 0) {
      body.ejercicios_ids = ejercicios_ids;
    }

    const respuesta = await fetch('/api/rutinas/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(body),
    });

    const datos = await respuesta.json();

    // --- Límite alcanzado (403) ---
    if (respuesta.status === 403) {
      if (modalError) {
        modalError.textContent = '❌ ' + datos.message;
        modalError.classList.remove('hidden');
      }
      return;
    }

    // --- Error de validación (400) ---
    if (respuesta.status === 400) {
      if (modalError) {
        modalError.textContent = '❌ ' + (datos.message || 'Datos inválidos');
        modalError.classList.remove('hidden');
      }
      return;
    }

    // --- Error del servidor ---
    if (!respuesta.ok) {
      throw new Error(datos.message || 'Error del servidor');
    }

    // --- Éxito (201) ---
    cerrarModal();
    cargarRutinasUsuario(); // refrescar la lista

  } catch (error) {
    console.error('Error al crear rutina:', error.message);
    if (modalError) {
      modalError.textContent = '❌ ' + error.message;
      modalError.classList.remove('hidden');
    }
  } finally {
    btnModalCrear.disabled = false;
    btnModalCrear.textContent = 'Crear rutina';
  }
}

// ============================================================
// actualizarRutina(rutinaId, nombre)
// ============================================================
// Llama a PUT /api/rutinas/:id con nombre, descripción y
// ejercicios seleccionados. Cierra el modal y refresca.
async function actualizarRutina(rutinaId, nombre) {
  const token = getToken();
  if (!token) return;

  try {
    btnModalCrear.disabled = true;
    btnModalCrear.textContent = 'Guardando...';
    if (modalError) modalError.classList.add('hidden');

    const descripcion = inputDescripcionRutina?.value?.trim() || null;
    const ejercicios_ids = Array.from(ejerciciosSeleccionadosTemp);

    const body = { nombre: nombre.trim() };
    if (descripcion) body.descripcion = descripcion;
    if (ejercicios_ids.length > 0) {
      body.ejercicios_ids = ejercicios_ids;
    }

    const respuesta = await fetch(`/api/rutinas/${rutinaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(body),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      if (respuesta.status === 400 || respuesta.status === 404) {
        if (modalError) {
          modalError.textContent = '❌ ' + (datos.message || 'Error al guardar');
          modalError.classList.remove('hidden');
        }
        return;
      }
      throw new Error(datos.message || 'Error del servidor');
    }

    // ✅ Éxito
    cerrarModal();
    rutinaEnEdicionId = null; // reset
    mostrarToast('Rutina actualizada correctamente', 'success');
    cargarRutinasUsuario();

  } catch (error) {
    console.error('Error al actualizar rutina:', error.message);
    if (modalError) {
      modalError.textContent = '❌ ' + error.message;
      modalError.classList.remove('hidden');
    }
  } finally {
    btnModalCrear.disabled = false;
    btnModalCrear.textContent = 'Guardar cambios';
  }
}

// ============================================================
// EVENTOS DEL MODAL
// ============================================================
btnModalCrear?.addEventListener('click', () => {
  const nombre = inputNombreRutina?.value?.trim();
  if (!nombre) {
    if (modalError) {
      modalError.textContent = '❌ El nombre de la rutina es obligatorio';
      modalError.classList.remove('hidden');
    }
    return;
  }

  if (rutinaEnEdicionId) {
    actualizarRutina(rutinaEnEdicionId, nombre);
  } else {
    crearNuevaRutina(nombre);
  }
});

// Cerrar al hacer clic en la X o en Cancelar
btnModalCerrar?.addEventListener('click', cerrarModal);
btnModalCancelar?.addEventListener('click', cerrarModal);

// Cerrar al hacer clic fuera del modal
modalOverlay?.addEventListener('click', (e) => {
  if (e.target === modalOverlay) cerrarModal();
});

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOverlay && !modalOverlay.classList.contains('hidden')) {
    cerrarModal();
  }
});

// Enviar con Enter en el input
inputNombreRutina?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    btnModalCrear?.click();
  }
});

// ============================================================
// MODAL DE CONFLICTO: entrenamiento activo
// ============================================================
function mostrarConflictModal(nuevaRutinaId) {
  pendingRutinaId = nuevaRutinaId;

  const overlay = document.getElementById('modal-conflict-overlay');
  const nombreEl = document.getElementById('conflict-rutina-nombre');
  const tiempoEl = document.getElementById('conflict-tiempo');

  if (nombreEl) nombreEl.textContent = rutinaActivaNombre || 'Rutina activa';
  if (tiempoEl) tiempoEl.textContent = '⏱️ ' + formatearTiempo(segundosTranscurridos);
  if (overlay) overlay.classList.remove('hidden');
}

// Cerrar conflicto con Escape (mismo comportamiento que el modal de creación)
document.addEventListener('keydown', (e) => {
  const overlay = document.getElementById('modal-conflict-overlay');
  if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
    overlay.classList.add('hidden');
    pendingRutinaId = null;
  }
});

// Clic fuera del modal de conflicto lo cierra
document.getElementById('modal-conflict-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.classList.add('hidden');
    pendingRutinaId = null;
  }
});

// Botón: Descartar y empezar nueva
document.getElementById('conflict-btn-descartar')?.addEventListener('click', () => {
  const overlay = document.getElementById('modal-conflict-overlay');
  if (overlay) overlay.classList.add('hidden');

  const id = pendingRutinaId;
  pendingRutinaId = null;

  if (id) {
    limpiarVistaEntrenamiento();
    cargarRutina(id);
  }
});

// Botón: Volver al entrenamiento actual
document.getElementById('conflict-btn-cancelar')?.addEventListener('click', () => {
  const overlay = document.getElementById('modal-conflict-overlay');
  if (overlay) overlay.classList.add('hidden');
  pendingRutinaId = null;

  // Navegar al entrenamiento activo
  mostrarApp();
  mostrarEntrenar();
});

// Clic en la burbuja flotante → ir al entrenamiento activo
document.getElementById('floating-timer')?.addEventListener('click', () => {
  mostrarApp();
  mostrarEntrenar();
});

// ============================================================
// MANEJAR LOGIN (submit del formulario)
// ============================================================
loginForm?.addEventListener('submit', async (e) => {
  // Prevenimos que el formulario recargue la página
  e.preventDefault();

  // Ocultamos errores previos
  loginError?.classList.add('hidden');

  // Deshabilitamos el botón mientras se procesa
  btnLogin.disabled = true;
  btnLogin.textContent = 'Entrando...';

  try {
    // ============================================================
    // FETCH A /api/auth/login
    // ============================================================
    const respuesta = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value,
        password: passwordInput.value,
      }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      // Mostramos el error específico del servidor
      if (loginError) {
        loginError.textContent = '❌ ' + (datos.message || 'Error al iniciar sesión');
        loginError.classList.remove('hidden');
      }
      return;
    }

    // ============================================================
    // LOGIN EXITOSO → GUARDAR TOKEN EN LOCALSTORAGE
    // ============================================================
    // localStorage.setItem('clave', valor) guarda datos de forma
    // persistente en el navegador del usuario.
    //
    // Acá guardamos el token JWT que nos devuelve el servidor.
    // A partir de ahora, todas las requests a rutas protegidas
    // van a incluir este token en el header Authorization.
    localStorage.setItem('token', datos.data.token);

    // Limpiamos el formulario
    loginForm.reset();

    // ============================================================
    // MOSTRAR RUTINAS DESPUÉS DEL LOGIN
    // ============================================================
    mostrarApp();
    mostrarVistaRutinas();
    await cargarRutinasUsuario();

    // Verificar si el usuario completó el onboarding
    verificarOnboarding();

  } catch (error) {
    console.error('Error de red:', error);
    if (loginError) {
      loginError.textContent = '❌ Error de conexión con el servidor';
      loginError.classList.remove('hidden');
    }
  } finally {
    // Restauramos el botón
    btnLogin.disabled = false;
    btnLogin.textContent = 'Entrar';
  }
});

// ============================================================
// MANEJAR REGISTRO (submit del formulario)
// ============================================================
async function manejarRegistro(e) {
  e.preventDefault();

  // Ocultar mensajes previos
  regError?.classList.add('hidden');
  regSuccess?.classList.add('hidden');

  const nombre   = regNombre?.value.trim() || '';
  const email    = regEmail?.value.trim();
  const password = regPassword?.value;

  // Validación rápida del lado del cliente
  if (!email || !password) {
    if (regError) {
      regError.textContent = '❌ Completá todos los campos obligatorios';
      regError.classList.remove('hidden');
    }
    return;
  }

  if (password.length < 6) {
    if (regError) {
      regError.textContent = '❌ La contraseña debe tener al menos 6 caracteres';
      regError.classList.remove('hidden');
    }
    return;
  }

  // Deshabilitar botón mientras se procesa
  if (btnRegister) {
    btnRegister.disabled = true;
    btnRegister.textContent = 'Creando cuenta...';
  }

  try {
    const respuesta = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      if (regError) {
        regError.textContent = '❌ ' + (datos.message || 'Error al registrarse');
        regError.classList.remove('hidden');
      }
      return;
    }

    // Registro exitoso → mostrar mensaje y volver al login
    if (regSuccess) {
      regSuccess.classList.remove('hidden');
    }

    // Después de 2 segundos, volver al formulario de login
    setTimeout(() => {
      mostrarAuthLogin();
    }, 2000);

  } catch (error) {
    console.error('Error de red:', error);
    if (regError) {
      regError.textContent = '❌ Error de conexión con el servidor';
      regError.classList.remove('hidden');
    }
  } finally {
    if (btnRegister) {
      btnRegister.disabled = false;
      btnRegister.textContent = 'Crear cuenta';
    }
  }
}

// ============================================================
// EVENT LISTENERS DE AUTENTICACIÓN
// ============================================================

// Toggle entre login y registro
toggleToRegister?.addEventListener('click', mostrarAuthRegister);
toggleToLogin?.addEventListener('click', mostrarAuthLogin);

// Submit del formulario de registro
regForm?.addEventListener('submit', manejarRegistro);

// ============================================================
// ONBOARDING FORM — Paso 1: guardar datos, mostrar pregunta
// ============================================================
formOnboarding?.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(formOnboarding);
  onboardingData = {
    nivel_experiencia: fd.get('nivel_experiencia'),
    sexo: fd.get('sexo'),
    peso_actual: fd.get('peso_actual') ? aKg(fd.get('peso_actual')) : null,
    estatura_cm: fd.get('estatura_cm') ? aCm(fd.get('estatura_cm')) : null,
  };
  // Saltar la pregunta de rutina recomendada —
  // el programa principiante está en el dashboard
  enviarOnboarding(false);
});

// ============================================================
// ONBOARDING — Paso 2: el usuario decide si quiere recomendación
// ============================================================
function enviarOnboarding(quiereRecomendacion) {
  if (!onboardingData) return;

  // Si el usuario aceptó y es principiante → mostrar spinner
  if (quiereRecomendacion && onboardingData.nivel_experiencia === 'Principiante') {
    stepPregunta?.classList.add('hidden');
    stepSpinner?.classList.remove('hidden');
    // Labor Illusion: 2.5s de delay para simular procesamiento
    setTimeout(() => {
      enviarPostOnboarding(quiereRecomendacion);
    }, 2500);
  } else {
    // No quiere recomendación, o no es principiante → POST directo
    enviarPostOnboarding(quiereRecomendacion);
  }
}

async function enviarPostOnboarding(quiereRecomendacion) {
  try {
    const body = { ...onboardingData, quiere_recomendacion: quiereRecomendacion };
    const res = await fetch('/api/usuarios/onboarding', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      ocultarModalOnboarding();
      // Resetear el modal para el próximo usuario
      stepSpinner?.classList.add('hidden');
      stepPregunta?.classList.add('hidden');
      stepForm?.classList.remove('hidden');
      formOnboarding?.reset();
      onboardingData = null;
      // Refrescar lista de rutinas
      if (typeof cargarRutinas === 'function') cargarRutinas();
      cargarRutinasUsuario();
    } else {
      const errData = await res.json();
      console.error('Onboarding error:', errData.message);
      // Volver al formulario en caso de error
      stepSpinner?.classList.add('hidden');
      stepPregunta?.classList.add('hidden');
      stepForm?.classList.remove('hidden');
      onboardingData = null;
    }
  } catch (err) {
    console.error('Onboarding error:', err);
    stepSpinner?.classList.add('hidden');
    stepPregunta?.classList.add('hidden');
    stepForm?.classList.remove('hidden');
    onboardingData = null;
  }
}

btnRecomendacionSi?.addEventListener('click', () => enviarOnboarding(true));
btnRecomendacionNo?.addEventListener('click', () => enviarOnboarding(false));

// ============================================================
// SUBIR AVATAR (foto de perfil)
// ============================================================
avatarInput?.addEventListener('change', async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  const token = getToken();
  if (!token) {
    mostrarLogin();
    return;
  }

  // Validar tipo de archivo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!tiposPermitidos.includes(file.type)) {
    alert('❌ Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
    avatarInput.value = '';
    return;
  }

  // Validar tamaño (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('❌ La imagen no puede superar los 2MB');
    avatarInput.value = '';
    return;
  }

  try {
    const formData = new FormData();
    formData.append('avatar', file);

    const respuesta = await fetch('/api/usuarios/avatar', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        // NO poner Content-Type — fetch lo setea solo con el boundary
      },
      body: formData,
    });

    const datos = await respuesta.json();

    if (!respuesta.ok) {
      alert('❌ ' + (datos.message || 'Error al subir la foto'));
      return;
    }

    // Actualizar la imagen en tiempo real
    if (perfilAvatarImg && datos.data?.avatar_url) {
      perfilAvatarImg.src = datos.data.avatar_url;
      perfilAvatarImg.classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error al subir avatar:', error);
    alert('❌ Error de conexión con el servidor');
  } finally {
    avatarInput.value = '';
  }
});

// ============================================================
// ELIMINAR CUENTA (Soft Delete) — Modal de confirmación
// ============================================================
// En lugar de prompt() del navegador, usamos un modal estilizado
// con input de confirmación y botón deshabilitado hasta que se
// escriba exactamente "ELIMINAR".
function abrirModalEliminarCuenta() {
  // ============================================================
  // CREAR MODAL UNA SOLA VEZ (patrón lazy singleton)
  // ============================================================
  let overlay = document.getElementById('modal-eliminar-cuenta-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'modal-eliminar-cuenta-overlay';
    overlay.className = 'modal-overlay hidden';
    overlay.innerHTML = `
      <div class="modal-content" style="max-width: 440px; border: 1px solid rgba(233,69,96,0.3);">
        <div class="modal-header">
          <h3 style="color:#e94560;">⚠️ Eliminar cuenta</h3>
          <button class="modal-cerrar btn-cerrar-eliminar-cuenta">&times;</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:12px;">
            Esta acción <strong>desactivará tu cuenta</strong>. Tus rutinas
            e historial se conservarán, pero no podrás iniciar sesión hasta
            que un administrador la reactive.
          </p>
          <p style="margin-bottom:16px; opacity:0.7; font-size:13px;">
            Escribí <strong>"ELIMINAR"</strong> en mayúsculas para confirmar.
          </p>
          <input
            id="input-confirmar-eliminar"
            type="text"
            placeholder="Escribí ELIMINAR"
            autocomplete="off"
            style="
              width:100%; padding:10px 12px; border-radius:8px;
              border:1px solid rgba(255,255,255,0.15);
              background:rgba(255,255,255,0.06); color:#fff;
              font-size:14px; outline:none; box-sizing:border-box;
              margin-bottom:16px;
            "
          />
          <div style="display:flex; gap:10px; justify-content:flex-end;">
            <button class="btn-cerrar-eliminar-cuenta" style="
              padding:10px 20px; border-radius:8px; border:none;
              background:rgba(255,255,255,0.1); color:#fff;
              cursor:pointer; font-size:14px;
            ">Cancelar</button>
            <button id="btn-confirmar-eliminar" disabled style="
              padding:10px 20px; border-radius:8px; border:none;
              background:#e94560; color:#fff; cursor:pointer;
              font-size:14px; opacity:0.4;
            ">Eliminar cuenta</button>
          </div>
          <div id="eliminar-status" style="margin-top:12px; font-size:13px;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Cerrar con overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrarModalEliminar();
    });

    // Cerrar con botones .btn-cerrar-eliminar-cuenta
    overlay.querySelectorAll('.btn-cerrar-eliminar-cuenta').forEach(btn => {
      btn.addEventListener('click', cerrarModalEliminar);
    });

    // Escuchar input para habilitar/deshabilitar botón
    const input = document.getElementById('input-confirmar-eliminar');
    const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
    input.addEventListener('input', () => {
      const valido = input.value === 'ELIMINAR';
      btnConfirmar.disabled = !valido;
      btnConfirmar.style.opacity = valido ? '1' : '0.4';
    });

    // Enter en el input = hacer clic en confirmar si está habilitado
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !btnConfirmar.disabled) {
        btnConfirmar.click();
      }
    });

    // Escape cierra el modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        cerrarModalEliminar();
      }
    });

    // Acción principal: confirmar eliminación
    btnConfirmar.addEventListener('click', ejecutarEliminarCuenta);
  }

  // Limpiar estado previo y mostrar
  document.getElementById('input-confirmar-eliminar').value = '';
  document.getElementById('btn-confirmar-eliminar').disabled = true;
  document.getElementById('btn-confirmar-eliminar').style.opacity = '0.4';
  document.getElementById('eliminar-status').textContent = '';
  overlay.classList.remove('hidden');
  document.getElementById('input-confirmar-eliminar').focus();
}

// Ahora vinculamos ambos botones a la misma función
btnEliminarCuenta?.addEventListener('click', abrirModalEliminarCuenta);
document.getElementById('btn-eliminar-ajustes')?.addEventListener('click', abrirModalEliminarCuenta);

// ============================================================
// cerrarModalEliminar() — Cierra el modal sin hacer nada
// ============================================================
function cerrarModalEliminar() {
  const overlay = document.getElementById('modal-eliminar-cuenta-overlay');
  if (overlay) overlay.classList.add('hidden');
}

// ============================================================
// ejecutarEliminarCuenta() — DELETE /api/usuarios/me
// ============================================================
async function ejecutarEliminarCuenta() {
  const statusEl = document.getElementById('eliminar-status');
  const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
  const input = document.getElementById('input-confirmar-eliminar');

  // Doble verificación por si acaso
  if (input.value !== 'ELIMINAR') return;

  const token = getToken();
  if (!token) {
    mostrarLogin();
    cerrarModalEliminar();
    return;
  }

  // Estado "cargando"
  btnConfirmar.disabled = true;
  btnConfirmar.textContent = 'Eliminando...';
  statusEl.textContent = '⏳ Desactivando cuenta...';
  statusEl.style.color = 'rgba(255,255,255,0.6)';

  try {
    const respuesta = await fetch('/api/usuarios/me', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    });

    if (!respuesta.ok) {
      const datos = await respuesta.json();
      statusEl.textContent = '❌ ' + (datos.message || 'Error al eliminar la cuenta');
      statusEl.style.color = '#e94560';
      btnConfirmar.textContent = 'Eliminar cuenta';
      return;
    }

    // Éxito — cerrar modal, limpiar token, redirigir
    cerrarModalEliminar();
    localStorage.removeItem('token');
    mostrarLogin();
    mostrarToast('✅ Cuenta desactivada. Gracias por usar Blackterz.', 'exito');

  } catch (error) {
    console.error('Error de red:', error);
    statusEl.textContent = '❌ Error de conexión con el servidor';
    statusEl.style.color = '#e94560';
    btnConfirmar.textContent = 'Eliminar cuenta';
  }
}

// ============================================================
// CERRAR SESIÓN (LOGOUT)
// ============================================================
btnLogout?.addEventListener('click', () => {
  limpiarEstadoDeEmergencia();
  // Limpiar estado de entrenamiento activo (si lo hay)
  // Sin esto, al volver a iniciar sesión queda entrenamientoActivo = true,
  // rutinaActualId apunta a un ID viejo, y el timer sigue corriendo en background.
  entrenamientoActivo = false;
  rutinaActivaNombre = '';
  detenerTemporizador();
  rutinaActualId = null;
  if (contenedorEl) contenedorEl.innerHTML = '';
  if (nombreEl) nombreEl.textContent = 'Cargando rutina...';
  if (descripcionEl) descripcionEl.textContent = '';
  if (accionesEntreno) accionesEntreno.classList.add('hidden');
  if (extraEjercicioWrapper) extraEjercicioWrapper.classList.add('hidden');

  // Limpiar avatar para que no herede la foto del usuario anterior
  if (perfilAvatarImg) perfilAvatarImg.src = '';

  // Borramos el token del localStorage
  localStorage.removeItem('token');

  // Mostramos el login
  mostrarLogin();
});

// ============================================================
// BUSCADORES DE EJERCICIOS (filtro en tiempo real)
// ============================================================
// Buscador del modal "Nueva Rutina"
buscadorModal?.addEventListener('input', (e) => {
  renderizarCheckboxesEnModal(e.target.value);
});

// Buscador del panel "Agregar ejercicio extra"
buscadorExtra?.addEventListener('input', (e) => {
  poblarListaEjerciciosExtra(e.target.value);
});

// Limpiar buscador del modal cada vez que se abre
const _abrirModalOriginal = abrirModal;
abrirModal = function () {
  if (buscadorModal) buscadorModal.value = '';
  _abrirModalOriginal();
};

// ============================================================
// DELEGACIÓN: sincronizar checkboxes del modal con el Set
// ============================================================
// Cada vez que el usuario marca/desmarca un checkbox en el
// modal de ejercicios, actualizamos ejerciciosSeleccionadosTemp.
// Esto permite que al filtrar/buscar (que redibuja el DOM)
// la selección se preserve.
document.addEventListener('change', (e) => {
  const cb = e.target.closest('.check-ejercicio');
  if (!cb) return;
  const id = Number(cb.value);
  if (!id) return;
  if (cb.checked) {
    ejerciciosSeleccionadosTemp.add(id);
  } else {
    ejerciciosSeleccionadosTemp.delete(id);
  }
});

// ============================================================
// CACHE DE NOTAS POR EJERCICIO
// ============================================================
// Guardamos las notas localmente para que no se pierdan si
// el usuario cambia de vista y vuelve durante el mismo
// entrenamiento.
window.notesCache = window.notesCache || {};
document.addEventListener('input', (e) => {
  const ta = e.target.closest('.ejercicio-notas');
  if (ta) window.notesCache[ta.dataset.ejercicioId] = ta.value;
});

// ============================================================
// GUARDADO AUTOMÁTICO DEL ESTADO DEL ENTRENAMIENTO (Hito 14)
// ============================================================
// Cada vez que el usuario marca/desmarca un checkbox de serie
// o escribe en las notas, guardamos el estado en localStorage.
document.addEventListener('change', (e) => {
  if (e.target.closest('.check-serie')) {
    guardarEstadoEntrenamiento();
    // Activar barra de descanso global solo al MARCAR (checked=true)
    const checkbox = e.target.closest('.check-serie');
    if (checkbox.checked) {
      const card = checkbox.closest('.card');
      const inputDescanso = card?.querySelector('.descanso-input');
      const tituloElement = card?.querySelector('.card-title');
      if (inputDescanso && tituloElement) {
        const segundos = parseInt(inputDescanso.value) || 60;
        const titulo = tituloElement.textContent.trim();
        if (segundos > 0) iniciarDescansoGlobal(segundos, titulo);
      }
    }
  }
});
document.addEventListener('input', (e) => {
  if (e.target.closest('.ejercicio-notas')) guardarEstadoEntrenamiento();
  if (e.target.closest('.input-serie')) guardarEstadoEntrenamiento();
});

// ============================================================
// EVENTOS DEL CONTENEDOR DE EJERCICIOS (Delegación)
// ============================================================
// Escuchamos TODOS los clics dentro del contenedor y decidimos
// qué hacer según el data-action del elemento clickeado.
//
// ¿Por qué DELEGACIÓN?
//   Porque las tarjetas se crean DINÁMICAMENTE. Si asignáramos
//   el evento en el momento de crear la tarjeta, perderíamos
//   la referencia al clonar o al inyectar nuevas tarjetas.
//   Con delegación, el evento vive en el PADRE (contenedorEl)
//   y funciona para TODOS los hijos, incluso los futuros.
contenedorEl?.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  // ============================================================
  // ACCIÓN: "+ SERIE"
  // ============================================================
  if (action === 'add-serie') {
    const card = target.closest('.card');
    if (!card) return;

    const seriesContainer = card.querySelector('.series-inputs');
    if (!seriesContainer) return;

    const ultimaFila = seriesContainer.querySelector('.serie-row:last-child');
    if (!ultimaFila) return;

    const nuevaFila = ultimaFila.cloneNode(true);

    // Limpiamos valores de inputs y desmarcamos checkbox
    const inputs = nuevaFila.querySelectorAll('input');
    inputs.forEach((input) => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });

    // Remover el span .anterior-valor clonado (Hito 16).
    // La fila nueva no tiene datos históricos reales — solo los
    // heredó por el cloneNode(true) de la última fila existente.
    const anteriorClonado = nuevaFila.querySelector('.anterior-valor');
    if (anteriorClonado) anteriorClonado.remove();

    const totalFilas = seriesContainer.querySelectorAll('.serie-row').length;
    const label = nuevaFila.querySelector('.serie-label');
    if (label) {
      label.textContent = 'Serie ' + (totalFilas + 1);
    }

    seriesContainer.appendChild(nuevaFila);
    guardarEstadoEntrenamiento();
    return;
  }

  // ============================================================
  // ACCIÓN: ELIMINAR SERIE (🗑️)
  // ============================================================
  if (action === 'delete-serie') {
    const serieRow = target.closest('.serie-row');
    if (!serieRow) return;

    // No permitir eliminar la ÚNICA serie que queda
    const card = target.closest('.card');
    if (!card) return;

    const todasLasFilas = card.querySelectorAll('.serie-row');
    if (todasLasFilas.length <= 1) {
      alert('No podés eliminar la única serie del ejercicio.');
      return;
    }

    // Eliminar la fila
    serieRow.remove();

    // Re-enumerar las series restantes
    const filasRestantes = card.querySelectorAll('.serie-row');
    filasRestantes.forEach((row, i) => {
      const label = row.querySelector('.serie-label');
      if (label) {
        label.textContent = 'Serie ' + (i + 1);
      }
    });
    guardarEstadoEntrenamiento();
    return;
  }

  // ============================================================
  // ACCIÓN: ELIMINAR EJERCICIO COMPLETO (🗑️ en el header)
  // ============================================================
  if (action === 'delete-ejercicio') {
    const card = target.closest('.card');
    if (!card) return;

    // Confirmación antes de eliminar
    const nombreEj = card.querySelector('.card-title')?.textContent || 'este ejercicio';
    confirmarAccion({
      titulo: 'Eliminar ejercicio',
      mensaje: `¿Eliminar "${nombreEj}" de la rutina actual?`,
      textoBtnConfirmar: 'Eliminar',
      colorBtn: 'btn-logout',
      onConfirmar: () => {
        card.remove();
        poblarListaEjerciciosExtra(buscadorExtra?.value);
        guardarEstadoEntrenamiento();
      }
    });
    return;
  }
});
// ============================================================
// crearCardEjercicioExtra(ejercicio, notasValue) — Construye una
// card completa para un ejercicio extra. Reutilizable desde el
// panel de agregar y desde la restauración de estado.
// ============================================================
function crearCardEjercicioExtra(ejercicio, notasValue) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.ejercicioId = ejercicio.id;

  // --- CABECERA ---
  const header = document.createElement('div');
  header.className = 'card-header';
  const orden = document.createElement('span');
  orden.className = 'card-orden';
  orden.textContent = '+';
  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = ejercicio.nombre;

  // Botón para eliminar este ejercicio extra
  const btnEliminarEj = document.createElement('button');
  btnEliminarEj.type = 'button';
  btnEliminarEj.className = 'btn-eliminar-ejercicio';
  btnEliminarEj.dataset.action = 'delete-ejercicio';
  btnEliminarEj.textContent = '🗑️';
  btnEliminarEj.title = 'Eliminar este ejercicio';

  header.appendChild(orden);
  header.appendChild(title);
  header.appendChild(btnEliminarEj);

  // --- NOTAS DEL EJERCICIO (textarea editable) ---
  const notasTextarea = document.createElement('textarea');
  notasTextarea.className = 'ejercicio-notas';
  notasTextarea.placeholder = 'Notas del ejercicio...';
  notasTextarea.dataset.ejercicioId = ejercicio.id;
  notasTextarea.value = notasValue || '';

  // --- UNA SERIE POR DEFECTO ---
  const seriesInputsDiv = document.createElement('div');
  seriesInputsDiv.className = 'series-inputs';

  const serieRow = document.createElement('div');
  serieRow.className = 'serie-row';

  const label = document.createElement('span');
  label.className = 'serie-label';
  label.textContent = 'Serie 1';

  const inputPeso = document.createElement('input');
  inputPeso.type = 'number';
  inputPeso.className = 'input-serie';
  inputPeso.placeholder = unidadPesoLabel();
  inputPeso.min = 0;
  inputPeso.step = 0.5;
  inputPeso.dataset.campo = 'peso';

  const inputReps = document.createElement('input');
  inputReps.type = 'number';
  inputReps.className = 'input-serie';
  inputReps.placeholder = 'reps';
  inputReps.min = 0;
  inputReps.step = 1;
  inputReps.dataset.campo = 'repeticiones';

  // Checkbox para marcar la serie como completada
  const checkSerie = document.createElement('input');
  checkSerie.type = 'checkbox';
  checkSerie.className = 'check-serie';

  // Botón para eliminar esta serie individualmente
  const btnDelete = document.createElement('button');
  btnDelete.type = 'button';
  btnDelete.className = 'btn-delete-serie';
  btnDelete.dataset.action = 'delete-serie';
  btnDelete.textContent = '🗑️';

  serieRow.appendChild(btnDelete);
  serieRow.appendChild(label);
  serieRow.appendChild(inputPeso);
  serieRow.appendChild(inputReps);
  serieRow.appendChild(checkSerie);
  seriesInputsDiv.appendChild(serieRow);

  // --- BOTÓN "+ SERIE" ---
  const btnSerieWrapper = document.createElement('div');
  btnSerieWrapper.className = 'btn-serie-wrapper';
  const btnSerie = document.createElement('button');
  btnSerie.type = 'button';
  btnSerie.className = 'btn-serie';
  btnSerie.dataset.action = 'add-serie';
  btnSerie.textContent = '+ Serie';
  btnSerieWrapper.appendChild(btnSerie);

  // --- ARMAR TARJETA ---
  card.appendChild(header);
  card.appendChild(notasTextarea);
  card.appendChild(seriesInputsDiv);

  // --- BLOQUE DESCANSO ---
  const descansoWrapper = document.createElement('div');
  descansoWrapper.className = 'descanso-wrapper';
  descansoWrapper.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0 4px;
    border-top: 1px solid rgba(255,255,255,0.07);
    margin-top: 8px;
  `;

  const descansoLabel = document.createElement('span');
  descansoLabel.style.cssText = 'font-size:13px; opacity:0.6; white-space:nowrap;';
  descansoLabel.textContent = '⏸️ Descanso:';

  const descansoInput = document.createElement('input');
  descansoInput.type = 'number';
  descansoInput.className = 'descanso-input input-serie';
  descansoInput.min = '5';
  descansoInput.max = '300';
  descansoInput.value = '60';
  descansoInput.style.cssText = 'width: 56px; text-align:center;';
  descansoInput.title = 'Segundos de descanso';

  const descansoSeg = document.createElement('span');
  descansoSeg.style.cssText = 'font-size:13px; opacity:0.6;';
  descansoSeg.textContent = 'seg';

  descansoWrapper.appendChild(descansoLabel);
  descansoWrapper.appendChild(descansoInput);
  descansoWrapper.appendChild(descansoSeg);

  card.appendChild(descansoWrapper);
  card.appendChild(btnSerieWrapper);

  return card;
}

// ============================================================
// Escuchamos clics en la lista de ejercicios extra. Si el clic
// fue en un botón con data-action="add-extra-ejercicio", buscamos
// el ejercicio en el catálogo y lo inyectamos al DOM.
listaEjerciciosExtra?.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action="add-extra-ejercicio"]');
  if (!btn) return;

  // Buscamos el item de la lista que contiene el botón
  const item = btn.closest('.ejercicio-list-item');
  if (!item) return;

  const ejercicioId = Number(item.dataset.ejercicioId);
  if (!ejercicioId) return;

  // Buscamos el ejercicio en el catálogo
  const ejercicio = catalogoEjercicios.find((ej) => ej.id === ejercicioId);
  if (!ejercicio) return;

  // ============================================================
  // CREAR TARJETA COMPLETA usando la función reutilizable
  // ============================================================
  const card = crearCardEjercicioExtra(ejercicio, window.notesCache?.[ejercicio.id] || '');

  // Si el contenedor tenía un mensaje vacío (rutina sin ejercicios),
  // removerlo antes de agregar el primer ejercicio extra
  const emptyMsg = contenedorEl?.querySelector('.empty');
  if (emptyMsg) emptyMsg.remove();

  // Insertar la tarjeta DENTRO del contenedor principal
  // (ANTES se insertaba fuera y por eso no funcionaba ni el
  //  botón eliminar ni el filtro anti-duplicados)
  contenedorEl?.appendChild(card);
  guardarEstadoEntrenamiento();

  // Hito 16: Inyectar columna ANTERIOR en la nueva card
  inyectarAnteriorEnCards();

  // Refrescar la lista de extra: el ejercicio agregado
  // desaparece del panel (anti-duplicados) y respeta el filtro activo
  poblarListaEjerciciosExtra(buscadorExtra?.value);
});

// ============================================================
// NAVEGACIÓN: PESTAÑAS (Historial ↔ Entrenar)
// ============================================================
// Cuando el usuario hace clic en "Historial", cargamos el
// historial desde la API y mostramos el dashboard.
//
// Cuando hace clic en "Entrenar", cargamos la rutina actual
// con los ejercicios e inputs.
btnTabRutinas?.addEventListener('click', () => {
  if (!rutinasView?.classList.contains('hidden')) return;
  mostrarVistaRutinas();
  cargarRutinasUsuario();
});

btnTabPerfil?.addEventListener('click', () => {
  if (!perfilView?.classList.contains('hidden')) return;
  cargarHistorial();
  renderizarPerfil();
  cargarVitrinaPRs();
});

// ============================================================
// AJUSTES: Volver al perfil
// ============================================================
document.getElementById('btn-volver-perfil')?.addEventListener('click', volverAPerfil);

// ============================================================
// AJUSTES: Guardar Datos Personales (PATCH /api/usuario/perfil)
// ============================================================
document.getElementById('btn-guardar-ajustes-personal')?.addEventListener('click', async () => {
  ocultarErrorAjustes('ajustes-error-personal');

  const nombre     = document.getElementById('ajustes-input-nombre').value.trim();
  const email      = document.getElementById('ajustes-input-email').value.trim();
  const nivel      = document.getElementById('ajustes-input-nivel').value;

  if (!nombre) {
    mostrarErrorAjustes('ajustes-error-personal', 'El nombre es obligatorio');
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    mostrarErrorAjustes('ajustes-error-personal', 'Ingresá un email válido');
    return;
  }

  const body = { nombre, email, nivel_experiencia: nivel };

  const token = getToken();
  if (!token) { mostrarLogin(); return; }

  try {
    const res = await fetch('/api/usuario/perfil', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (!res.ok) {
      mostrarErrorAjustes('ajustes-error-personal', result.message || 'Error al guardar');
      return;
    }

    if (result.token) {
      localStorage.setItem('token', result.token);
    }

    userData = result.data;
    if (userData) {
      const nombreEl = document.getElementById('perfil-nombre');
      if (nombreEl) nombreEl.textContent = userData.nombre || 'Usuario';
      const emailEl = document.getElementById('perfil-email');
      if (emailEl) emailEl.textContent = userData.email || '';
      const saludoEl = document.getElementById('header-saludo-usuario');
      if (saludoEl && userData.nombre) {
        saludoEl.textContent = `Hola, ${userData.nombre} 👋`;
      }
      renderizarPerfil();
    }

    mostrarToast('Perfil actualizado ✓', 'success');

  } catch (err) {
    mostrarErrorAjustes('ajustes-error-personal', 'Error de conexión al servidor');
    console.error(err);
  }
});

// ============================================================
// AJUSTES: Guardar Contraseña (PUT /api/usuarios/contrasena)
// ============================================================
document.getElementById('btn-guardar-ajustes-seguridad')?.addEventListener('click', async () => {
  ocultarErrorAjustes('ajustes-error-seguridad');

  const passActual  = document.getElementById('ajustes-input-pass-actual').value;
  const passNueva   = document.getElementById('ajustes-input-pass-nueva').value;
  const passRepetir = document.getElementById('ajustes-input-pass-repetir').value;

  const todosVacios = !passActual && !passNueva && !passRepetir;
  if (todosVacios) {
    mostrarToast('Contraseña no modificada (campos vacíos)', 'info');
    return;
  }

  if (!passActual) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'Ingresá tu contraseña actual');
    return;
  }
  if (!passNueva) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'Ingresá la nueva contraseña');
    return;
  }
  if (passNueva.length < 8) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'La nueva contraseña debe tener al menos 8 caracteres');
    return;
  }
  if (!/(?=.*[a-z])/.test(passNueva)) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'La nueva contraseña debe tener al menos una minúscula');
    return;
  }
  if (!/(?=.*[A-Z])/.test(passNueva)) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'La nueva contraseña debe tener al menos una mayúscula');
    return;
  }
  if (!/(?=.*\d)/.test(passNueva)) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'La nueva contraseña debe tener al menos un número');
    return;
  }
  if (!/(?=.*[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'\/`~])/.test(passNueva)) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'La nueva contraseña debe tener al menos un carácter especial');
    return;
  }
  if (passNueva !== passRepetir) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'Las contraseñas nuevas no coinciden');
    return;
  }

  const token = getToken();
  if (!token) { mostrarLogin(); return; }

  try {
    const res = await fetch('/api/usuarios/contrasena', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({
        passwordActual: passActual,
        passwordNueva: passNueva,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      if (res.status === 401) {
        mostrarErrorAjustes('ajustes-error-seguridad', 'Contraseña actual incorrecta');
      } else {
        mostrarErrorAjustes('ajustes-error-seguridad', err.message || 'Error al cambiar contraseña');
      }
      return;
    }

    document.getElementById('ajustes-input-pass-actual').value  = '';
    document.getElementById('ajustes-input-pass-nueva').value   = '';
    document.getElementById('ajustes-input-pass-repetir').value = '';

    mostrarToast('Contraseña actualizada ✓', 'success');

  } catch (err) {
    mostrarErrorAjustes('ajustes-error-seguridad', 'Error de conexión al servidor');
    console.error(err);
  }
});

// ============================================================
// AJUSTES: Unidades (guardar preferencia en localStorage)
// ============================================================
function cargarUnidades() {
  const pesoPref = localStorage.getItem('unidad_peso') || 'kg';
  const estaturaPref = localStorage.getItem('unidad_estatura') || 'cm';
  const selPeso = document.getElementById('ajustes-unidad-peso');
  const selEstatura = document.getElementById('ajustes-unidad-estatura');
  if (selPeso) selPeso.value = pesoPref;
  if (selEstatura) selEstatura.value = estaturaPref;
}

document.getElementById('ajustes-unidad-peso')?.addEventListener('change', (e) => {
  localStorage.setItem('unidad_peso', e.target.value);
  renderizarPerfil(); // refrescar vista perfil si está visible
});

document.getElementById('ajustes-unidad-estatura')?.addEventListener('change', (e) => {
  localStorage.setItem('unidad_estatura', e.target.value);
  renderizarPerfil(); // refrescar vista perfil si está visible
});

// Cargar unidades al mostrar ajustes
function precargarAjustes() {
  const data = userData || {};
  const get = (id) => document.getElementById(id);
  if (get('ajustes-input-nombre'))   get('ajustes-input-nombre').value   = data.nombre || '';
  if (get('ajustes-input-email'))    get('ajustes-input-email').value    = data.email || '';
  const nivelSelect = get('ajustes-input-nivel');
  if (nivelSelect) nivelSelect.value = data.nivel_experiencia || 'Principiante';
  if (get('ajustes-input-pass-actual'))  get('ajustes-input-pass-actual').value  = '';
  if (get('ajustes-input-pass-nueva'))   get('ajustes-input-pass-nueva').value   = '';
  if (get('ajustes-input-pass-repetir')) get('ajustes-input-pass-repetir').value = '';
  ocultarErrorAjustes('ajustes-error-personal');
  ocultarErrorAjustes('ajustes-error-seguridad');
  cargarUnidades();
}

function ocultarErrorAjustes(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}
function mostrarErrorAjustes(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

btnTabEntrenar?.addEventListener('click', () => {
  if (!entrenarView?.classList.contains('hidden')) return;
  // Si ya hay un entrenamiento activo, solo mostrar la vista
  // sin reiniciar el temporizador ni recargar la rutina.
  if (entrenamientoActivo) {
    mostrarApp();
    mostrarEntrenar();
    return;
  }
  cargarRutina();
});

// ============================================================
// FINALIZAR ENTRENAMIENTO — Enviar sesión al backend
// ============================================================
// Este event listener se ejecuta cuando el usuario hace clic
// en "Finalizar Entrenamiento". Su trabajo es:
//
//   1. Recorrer el DOM para leer los valores de los inputs
//   2. Armar el objeto JSON con la estructura que espera la API
//   3. Enviarlo via fetch POST con el token JWT en headers
//   4. Manejar éxito (201) o error (401 expirado, etc.)
//
// ============================================================
btnFinalizar?.addEventListener('click', async () => {
  // ============================================================
  // PASO 1: OBTENER EL TOKEN
  // ============================================================
  const token = getToken();
  if (!token) {
    mostrarLogin();
    return;
  }

  // ============================================================
  // PASO 2: RECORRER EL DOM Y EXTRAER DATOS
  // ============================================================
  // ¿CÓMO FUNCIONA LA RECOLECCIÓN?
  //
  // 1. Seleccionamos TODAS las tarjetas dentro del contenedor
  //    usando querySelectorAll('#contenedor-ejercicios .card').
  //
  // 2. Por cada tarjeta, leemos:
  //      a) card.dataset.ejercicioId — el ID del ejercicio
  //         (lo seteamos cuando creamos la tarjeta más arriba)
  //      b) Todos los .serie-row dentro de .series-inputs
  //
  // 3. Por cada serie-row, buscamos los inputs con
  //    input[data-campo="peso"] y input[data-campo="repeticiones"]
  //    y leemos su .value.
  //
  // 4. Armamos el array de ejercicios con sus series.
  //
  // Esto se llama "DOM traversal" — recorrer el árbol del DOM
  // para extraer información. Es la alternativa vanilla JS a
  // usar frameworks como React o Vue que tienen su propio
  // sistema de estados y binding.
  // ============================================================

  const cards = document.querySelectorAll('#contenedor-ejercicios .card');
  const ejercicios = [];

  for (const card of cards) {
    const ejercicioId = Number(card.dataset.ejercicioId);
    if (!ejercicioId) continue; // seguridad: si falta ID, salteamos

    // Seleccionamos TODAS las filas de serie dentro de esta tarjeta
    const serieRows = card.querySelectorAll('.serie-row');
    const series = [];

    serieRows.forEach((row, index) => {
      // Buscamos los inputs por su data-campo
      const inputPeso = row.querySelector('input[data-campo="peso"]');
      const inputReps = row.querySelector('input[data-campo="repeticiones"]');
      const checkbox = row.querySelector('.check-serie');

      // ============================================================
      // FILTRO POR CHECKBOX (UX Correcciones)
      // ============================================================
      // Solo incluimos la serie si el checkbox está marcado.
      // Si no está marcado, la descartamos completamente.
      if (!checkbox || !checkbox.checked) return; // saltea esta serie

      // Convertimos a número. Si está vacío o no es número, usamos 0.
      const pesoIngresado = inputPeso ? Number(inputPeso.value) || 0 : 0;
      const pesoEnKg = aKg(pesoIngresado); // convertir a kg antes de enviar
      const repeticiones = inputReps ? Number(inputReps.value) || 0 : 0;

      series.push({
        numero_serie: index + 1, // 1-indexed como en la DB
        peso: pesoEnKg,
        repeticiones: repeticiones,
        completada: true,
      });
    });

    // ============================================================
    // FILTRO INTELIGENTE: solo incluir ejercicios con series
    // checkeadas (UX Correcciones)
    // ============================================================
    // Si después del filtro por checkbox no queda ninguna serie,
    // descartamos el ejercicio completo. El usuario no marcó
    // ninguna serie como completada.
    const tieneDatos = series.length > 0;

    if (tieneDatos) {
      const textarea = card.querySelector('.ejercicio-notas');
      ejercicios.push({
        ejercicio_id: ejercicioId,
        series: series,
        notas: textarea?.value || null,
      });
    }
  }

  // ============================================================
  // VALIDACIÓN BLOQUEANTE: inputs con datos sin checkbox
  // ============================================================
  // Recorremos TODAS las tarjetas y sus series. Si alguna fila
  // tiene datos en peso o repeticiones PERO el checkbox no está
  // marcado, BLOQUEAMOS la finalización.
  //
  // Esto evita que el usuario "pierda" datos porque se olvidó
  // de marcar el check. Le pedimos que los marque o los borre.
  let hayBloqueo = false;
  for (const card of cards) {
    const serieRows = card.querySelectorAll('.serie-row');
    for (const row of serieRows) {
      const inputPeso = row.querySelector('input[data-campo="peso"]');
      const inputReps = row.querySelector('input[data-campo="repeticiones"]');
      const checkbox  = row.querySelector('.check-serie');

      const tienePeso = inputPeso && inputPeso.value.trim() !== '';
      const tieneReps = inputReps && inputReps.value.trim() !== '';

      // Si hay datos en algún input pero el checkbox NO está marcado
      if ((tienePeso || tieneReps) && checkbox && !checkbox.checked) {
        hayBloqueo = true;
        break; // salimos del bucle interno
      }
    }
    if (hayBloqueo) break; // salimos del bucle externo
  }

  if (hayBloqueo) {
    mostrarToast(
      'No puedes terminar el entrenamiento porque tienes campos con datos sin marcar. Por favor, márcalos como hechos o quítalos.',
      'error'
    );
    return;
  }

  // ============================================================
  // VALIDACIÓN: si NO hay ejercicios con datos, abortamos
  // ============================================================
  if (ejercicios.length === 0) {
    mostrarToast('No hay ejercicios con datos para guardar. Completá al menos un ejercicio.', 'error');
    return;
  }

  // ============================================================
  // PASO 3: ARMAR EL BODY COMPLETO
  // ============================================================
  // Estructura que espera POST /api/sesiones:
  //
  //   {
  //     rutina_id: 1,
  //     fecha: "2026-06-07",       ← fecha actual por defecto
  //     ejercicios: [
  //       {
  //         ejercicio_id: 1,
  //         series: [
  //           { numero_serie: 1, peso: 50, repeticiones: 10 },
  //           { numero_serie: 2, peso: 55, repeticiones: 8  }
  //         ]
  //       }
  //     ]
  //   }
  //
  // Usamos la fecha de HOY en formato YYYY-MM-DD.
  // El backend la valida como campo obligatorio.
  // ============================================================
  const hoy = new Date().toISOString().split('T')[0]; // "2026-06-07"

  const body = {
    rutina_id: rutinaActualId,
    fecha: hoy,
    ejercicios: ejercicios,
    duracion_minutos: obtenerMinutosTranscurridos(),
  };

  // ============================================================
  // PASO 4: ENVIAR AL BACKEND (FETCH POST)
  // ============================================================
  // Misma mecánica que el login: fetch con headers y body JSON.
  //
  // DIFERENCIA CLAVE: acá mandamos el token JWT en el header
  // Authorization para que el middleware authMiddleware
  // verifique que el usuario está autenticado.
  //
  // Si no mandamos el token, el backend responde 401.
  // ============================================================
  try {
    // Deshabilitamos el botón mientras se procesa
    btnFinalizar.disabled = true;
    btnFinalizar.textContent = 'Guardando...';

    const respuesta = await fetch('/api/sesiones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(body),
    });

    // ============================================================
    // PASO 5: MANEJAR LA RESPUESTA
    // ============================================================

    // --- Caso: TOKEN EXPIRADO (401) ---
    // El backend rechazó el token porque expiró o es inválido.
    // Hacemos lo mismo que en cargarRutina(): borramos el token
    // y mostramos el login.
    if (respuesta.status === 401) {
      localStorage.removeItem('token');
      mostrarLogin();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }

    // --- Caso: ERROR DE VALIDACIÓN (400) ---
    if (respuesta.status === 400) {
      const errorData = await respuesta.json();
      alert('❌ Error: ' + (errorData.message || 'Datos inválidos'));
      return;
    }

    // --- Caso: ERROR DEL SERVIDOR (500) ---
    if (!respuesta.ok) {
      throw new Error(`Error del servidor: ${respuesta.status}`);
    }

    // --- Caso: ÉXITO (201 Created) ---
    // La sesión se guardó correctamente en la base de datos.
    // El modelo usó una transacción SQL para asegurar que
    // todos los datos (sesión + ejercicios + series) se
    // guardaron de forma atómica.
    //
    // Limpiamos la vista y redirigimos al Dashboard para que
    // el usuario vea el historial actualizado.
    const resultado = await respuesta.json();

    // 1. Mostrar banner de éxito rápido
    mostrarExito('✅ ¡Entrenamiento guardado!');

    // ============================================================
    // PASO 2 — Sincronización automática de la rutina base (PUT)
    // ============================================================
    // Si este entrenamiento pertenece a una rutina existente,
    // actualizamos la plantilla con los ejercicios actuales
    // (incluyendo los agregados "al vuelo").
    //
    // Es fire-and-forget: no bloquea el flujo de éxito. Si falla,
    // solo se loguea en consola — el entrenamiento ya se guardó.
    if (rutinaActualId) {
      const allCards = document.querySelectorAll('#contenedor-ejercicios .card');
      const idsEjercicios = [];
      for (const card of allCards) {
        const ejId = Number(card.dataset.ejercicioId);
        if (ejId) idsEjercicios.push(ejId);
      }

      const descripcion = descripcionEl?.textContent?.trim() || null;

      fetch(`/api/rutinas/${rutinaActualId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          nombre: rutinaActivaNombre || 'Rutina',
          descripcion: descripcion,
          ejercicios_ids: idsEjercicios,
        }),
      }).catch(err => {
        console.error('Error al sincronizar plantilla de rutina:', err.message);
      });
    }

    limpiarEstadoEntrenamiento();

    // 2. Limpiar vista y volver al Dashboard después de 1.5s
    setTimeout(limpiarVistaEntrenamiento, 1500);

  } catch (error) {
    console.error('Error al guardar sesión:', error.message);

    // Si el error NO fue por token expirado (que ya manejamos
    // arriba con el 401), mostramos una alerta genérica.
    if (!error.message.includes('Sesión expirada')) {
      alert('❌ Error al guardar: ' + error.message);
    }

  } finally {
    // Restauramos el botón
    if (btnFinalizar) {
      btnFinalizar.disabled = false;
      btnFinalizar.textContent = '🏁 Finalizar Entrenamiento';
    }
  }
});

// ============================================================
// EVENTO: DESCARTAR ENTRENO
// ============================================================
// Al hacer clic en "Descartar Entreno", mostramos un confirm()
// y si el usuario confirma, limpiamos la vista y volvemos al
// Dashboard.
btnDescartar?.addEventListener('click', () => {
  confirmarAccion({
    titulo: '⚠️ Descartar entrenamiento',
    mensaje: '¿Estás seguro? El progreso de esta sesión se perderá y no se guardará.',
    textoBtnConfirmar: 'Sí, descartar',
    colorBtn: 'btn-logout',
    onConfirmar: () => {
      limpiarEstadoEntrenamiento();
      limpiarVistaEntrenamiento();
    }
  });
});

// ============================================================
// limpiarVistaEntrenamiento()
// ============================================================
// Limpia por completo la vista de entrenamiento activo y
// redirige al Dashboard. Se llama desde:
//   1. El éxito de btnFinalizar (POST 201)
//   2. La confirmación de btnDescartar
//
// ¿Qué hace exactamente?
//   - Vacía el contenedor de ejercicios
//   - Oculta los botones de acción (Finalizar / Descartar)
//   - Oculta el selector de ejercicios extra
//   - Navega a la vista Dashboard
//   - Refresca el historial desde el servidor
function limpiarVistaEntrenamiento() {
  // Ocultar barra de descanso global si está activa
  detenerDescansoGlobal();

  // Marcar entrenamiento como inactivo
  entrenamientoActivo = false;
  rutinaActivaNombre = '';

  // Detener el temporizador de entrenamiento
  detenerTemporizador();

  // Resetear estado global de entrenamiento activo
  // Al poner rutinaActualId = null, la pestaña "Entrenar" va a
  // pedir que selecciones una rutina en vez de mostrar datos viejos.
  rutinaActualId = null;

  // Limpiar contenido de ejercicios (DOM completamente vacío)
  if (contenedorEl) contenedorEl.innerHTML = '';

  // Ocultar acciones de entrenamiento
  if (accionesEntreno) accionesEntreno.classList.add('hidden');
  if (extraEjercicioWrapper) extraEjercicioWrapper.classList.add('hidden');

  // Limpiar la lista de ejercicios extra
  if (listaEjerciciosExtra) {
    listaEjerciciosExtra.innerHTML = '<div class="loading" style="padding: 14px 0;">Cargando ejercicios...</div>';
  }

  // Limpiar cache de notas
  window.notesCache = {};

  // Restaurar título
  if (nombreEl) nombreEl.textContent = 'Cargando rutina...';
  if (descripcionEl) descripcionEl.textContent = '';

  // Navegar a Rutinas y refrescar datos
  mostrarVistaRutinas();
  cargarRutinasUsuario();
}

// ============================================================
// mostrarExito(mensaje) — Banner verde temporario
// ============================================================
// Crea un banner de éxito, lo inserta arriba del botón de
// finalizar, y lo borra automáticamente después de 4 segundos.
function mostrarExito(mensaje) {
  // Sacamos cualquier banner anterior
  const anterior = document.querySelector('.alert-success');
  if (anterior) anterior.remove();

  const banner = document.createElement('div');
  banner.className = 'alert-success';
  banner.textContent = mensaje;

  // Lo insertamos justo antes del wrapper de acciones
  const wrapper = document.querySelector('.acciones-entreno');
  if (wrapper) {
    wrapper.parentNode.insertBefore(banner, wrapper);
  }

  // Auto-remover después de 4 segundos
  setTimeout(() => {
    if (banner.parentNode) banner.remove();
  }, 4000);
}

// ============================================================
// limpiarInputs() — Resetear todos los inputs a sus valores
// ============================================================
// Después de guardar exitosamente, volvemos todos los inputs
// de peso y repeticiones a sus valores planificados originales.
//
// ¿POR QUÉ NO LOS VACIAMOS?
// Porque si el usuario entrena la misma rutina mañana, quiere
// ver los valores de referencia, no arrancar desde cero.
//
// Para "resetear" simplemente recargamos la rutina desde la API,
// que es más limpio que tratar de recordar los valores originales.
function limpiarInputs() {
  // Recargar la rutina desde el servidor restablece todo
  cargarRutina();
}

// ============================================================
// EVENTO: ELIMINAR RUTINA (borrado lógico)
// ============================================================
// Delegación de eventos sobre el contenedor de rutinas.
// El botón .btn-eliminar-rutina se genera dinámicamente
// en cargarRutinasUsuario(), por eso usamos delegación.
document.querySelector('#rutinas-view')?.addEventListener('click', async (e) => {
  const btn = e.target.closest('.btn-eliminar-rutina');
  if (!btn) return;

  // Evitar que el clic en eliminar active la navegación a la rutina
  e.stopPropagation();

  const id = Number(btn.dataset.rutinaId);
  const nombre = btn.dataset.rutinaNombre;

  confirmarAccion({
    titulo: '🗑️ Eliminar rutina',
    mensaje: `¿Eliminar "${nombre}"? Esta acción no borrará tu historial de entrenamientos.`,
    textoBtnConfirmar: 'Eliminar',
    colorBtn: 'btn-logout',
    onConfirmar: async () => {
      try {
        const res = await fetch(`/api/rutinas/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': 'Bearer ' + getToken() },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          mostrarLogin();
          return;
        }

        if (!res.ok) {
          mostrarToast('Error al eliminar la rutina', 'error');
          return;
        }

        // Remover la tarjeta del DOM inmediatamente
        btn.closest('.rutina-card')?.remove();

        // Refrescar desde el servidor para sincronizar estado
        await cargarRutinasUsuario();
      } catch (err) {
        console.error('Error al eliminar rutina:', err);
        mostrarToast('Error de conexión', 'error');
      }
    }
  });
});

// ============================================================
// mostrarDetalleEjercicio(id) — Abre el panel de detalle
// buscando el ejercicio en el catálogo global
// ============================================================
function mostrarDetalleEjercicio(ejercicioId) {
  const ejercicio = catalogoEjercicios?.find(e => e.id === ejercicioId);
  if (!ejercicio) return;

  // Imagen/Video: prioridad gif_url (MP4 o GIF/JPG) > imagen estática
  const imgSrc = ejercicio.gif_url || (ejercicio.imagen_url ? `/images/${ejercicio.imagen_url}` : '');

  // Buscar el elemento actual (puede ser <img> o <video> de una
  // apertura anterior del panel)
  let mediaActual = document.getElementById('panel-detalle-img');

  if (esVideo(imgSrc)) {
    // Si el elemento actual NO es un <video>, reemplazarlo
    if (mediaActual.tagName !== 'VIDEO') {
      const video = document.createElement('video');
      video.id = 'panel-detalle-img';
      video.className = mediaActual.className;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      mediaActual.replaceWith(video);
      mediaActual = video;
      // Re-cachear la referencia global para futuras llamadas
      panelDetalleImg = video;
    }
    mediaActual.src = imgSrc;
  } else {
    // Si el elemento actual NO es un <img>, reemplazarlo
    if (mediaActual.tagName !== 'IMG') {
      const img = document.createElement('img');
      img.id = 'panel-detalle-img';
      img.className = mediaActual.className;
      mediaActual.replaceWith(img);
      mediaActual = img;
      panelDetalleImg = img;
    }
    mediaActual.src = imgSrc;
    mediaActual.alt = ejercicio.nombre || 'Ejercicio';
  }

  // Nombre
  panelDetalleNombre.textContent = ejercicio.nombre || '';

  // Grupo muscular (badge)
  const grupoMuscular = ejercicio.musculos || ejercicio.grupo_muscular || 'General';
  panelDetalleMusculo.textContent = grupoMuscular;

  // Descripción técnica
  panelDetalleDesc.textContent = ejercicio.descripcion || 'Sin descripción disponible.';

  // Mostrar panel con animación
  panelDetalle.classList.remove('hidden');
}

// ============================================================
// PANEL DETALLE — Abrir al hacer clic en una miniatura
// ============================================================
// Delegación global: captura clics en .img-ejercicio-thumb
// Busca el id del ejercicio en el catálogo para mostrar datos completos
document.addEventListener('click', (e) => {
  // Click en card del programa principiante
  if (e.target.closest('#card-programa-principiante')) {
    mostrarVistaProgramaPrincipiante();
    return;
  }

  // Click en una fila del historial → abrir detalle de sesión
  const filaHistorial = e.target.closest('.historial-row');
  if (filaHistorial) {
    const sesionId = filaHistorial.dataset.sesionId;
    if (sesionId) abrirDetalleSesion(sesionId);
    return;
  }

  // Click en tarjeta de logro desbloqueada → mostrar modal
  const tarjetaLogro = e.target.closest('[data-logro-id]');
  if (tarjetaLogro) {
    const logroId = parseInt(tarjetaLogro.dataset.logroId);
    const logro = LOGROS.find(l => l.id === logroId);
    if (logro) mostrarModalLogro(logro);
    return;
  }

  const img = e.target.closest('.img-ejercicio-thumb, .card-img img, .card-thumb');
  if (!img) return;

  const card = img.closest('.ejercicio-list-item, .card');
  if (!card) return;

  // Obtener ID del ejercicio desde el dataset del contenedor
  // o desde el atributo data-ejercicio-id del item
  const ejercicioId = Number(card.dataset.ejercicioId) ||
                      Number(card.closest('[data-ejercicio-id]')?.dataset.ejercicioId);
  if (!ejercicioId) return;

  mostrarDetalleEjercicio(ejercicioId);
});

// ============================================================
// PANEL DETALLE — Cerrar
// ============================================================
function cerrarPanelDetalle() {
  panelDetalle.classList.add('hidden');
}

panelDetalleBack?.addEventListener('click', cerrarPanelDetalle);

// También cerrar con clic en el overlay (pero no en el contenido)
panelDetalle?.addEventListener('click', (e) => {
  if (e.target === panelDetalle) cerrarPanelDetalle();
});

// Tecla Escape cierra el panel
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && panelDetalle && !panelDetalle.classList.contains('hidden')) {
    cerrarPanelDetalle();
  }
});

// ============================================================
// EVENTO: editar rutina (delegado en el contenedor)
// ============================================================
// Usamos delegación porque las tarjetas se recrean cada vez
// que se refresca la lista (cargarRutinasUsuario). Al estar
// fuera de DOMContentLoaded no se acumulan listeners.
rutinasContainer?.addEventListener('click', async (e) => {
  const btnEditar = e.target.closest('.btn-editar-rutina');
  if (!btnEditar) return;

  const rutinaId = Number(btnEditar.dataset.rutinaId);
  if (!rutinaId) return;

  // Si hay entrenamiento activo, no permitir editar
  if (entrenamientoActivo) {
    mostrarToast('Finalizá el entrenamiento antes de editar', 'error');
    return;
  }

  await abrirModalEdicion(rutinaId);
});

// ============================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================================
// Al cargar la página, verificamos si hay un token guardado.
//
// Si existe:
//   1. Cargamos el HISTORIAL primero (dashboard con los
//      entrenamientos anteriores).
//   2. El usuario puede navegar a "Entrenar" desde el dashboard
//      o usando la pestaña de navegación.
//
// Si no existe: mostramos el formulario de login.
document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  if (token) {
    // Intentar restaurar un entrenamiento guardado (Hito 14)
    const restaurado = await restaurarEstadoEntrenamiento();
    if (!restaurado) {
      // No había draft o falló la restauración → flujo normal
      mostrarApp();
      mostrarVistaRutinas();
      cargarRutinasUsuario();

      // Verificar onboarding después de cargar rutinas
      verificarOnboarding();
    }
  } else {
    mostrarLogin();
  }

  // ============================================================
  // BANNER OFFLINE
  // ============================================================
  const bannerOffline = document.getElementById('banner-offline');

  function mostrarBannerOffline() {
    if (bannerOffline) bannerOffline.style.display = 'block';
  }

  function ocultarBannerOffline() {
    if (bannerOffline) bannerOffline.style.display = 'none';
  }

  // Verificar estado inicial al cargar
  if (!navigator.onLine) mostrarBannerOffline();

  // Escuchar cambios de conexión
  window.addEventListener('offline', mostrarBannerOffline);
  window.addEventListener('online', ocultarBannerOffline);

});

// ============================================================
// SISTEMA DE DESCANSO GLOBAL — Barra Flotante en Bottom
// ============================================================
let descansoGlobalInterval = null;
let descansoRestanteGlobal = 0;

function crearBarraDescanso() {
  if (document.getElementById('barra-descanso-global')) return;

  const barra = document.createElement('div');
  barra.id = 'barra-descanso-global';
  barra.style.cssText = `
    position: fixed; bottom: 0; left: 0; width: 100%;
    background: rgba(27, 30, 49, 0.95);
    backdrop-filter: blur(10px); border-top: 1px solid #6c63ff;
    color: white; padding: 12px 20px; box-sizing: border-box;
    display: none; align-items: center; justify-content: space-between;
    z-index: 9999; box-shadow: 0 -4px 20px rgba(0,0,0,0.5);
    border-radius: 16px 16px 0 0;
  `;

  barra.innerHTML = `
    <div style="display:flex; flex-direction:column; max-width:40%;">
      <span style="font-size: 11px; opacity: 0.7; text-transform: uppercase; letter-spacing: 1px;">⏸️ Descanso</span>
      <span id="barra-ej-nombre" style="font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #6c63ff;">Ejercicio</span>
    </div>
    <div style="display:flex; align-items:center; gap: 12px;">
      <button id="btn-desc-menos" style="background:rgba(255,255,255,0.1); border:none; color:white; border-radius:8px; padding:6px 10px; font-weight:bold; cursor:pointer;">-15s</button>
      <span id="barra-tiempo-display" style="font-size: 24px; font-weight: bold; width: 65px; text-align: center; font-variant-numeric: tabular-nums;">00:00</span>
      <button id="btn-desc-mas" style="background:rgba(255,255,255,0.1); border:none; color:white; border-radius:8px; padding:6px 10px; font-weight:bold; cursor:pointer;">+15s</button>
    </div>
    <button id="btn-desc-omitir" style="background:#6c63ff; border:none; color:white; border-radius:8px; padding:8px 12px; font-weight:bold; cursor:pointer;">Omitir</button>
  `;

  document.body.appendChild(barra);

  document.getElementById('btn-desc-menos').onclick = () => sumarDescanso(-15);
  document.getElementById('btn-desc-mas').onclick = () => sumarDescanso(15);
  document.getElementById('btn-desc-omitir').onclick = detenerDescansoGlobal;
}

function reproducirAlertaDescanso() {
  if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    setTimeout(() => osc.stop(), 400);
  } catch (e) { console.log('Audio API no soportada'); }
}

function actualizarDisplayDescanso() {
  if (descansoRestanteGlobal <= 0) {
    detenerDescansoGlobal();
    reproducirAlertaDescanso();
    mostrarToast('⏰ ¡A entrenar!', 'success');
    return;
  }
  const mins = Math.floor(descansoRestanteGlobal / 60).toString().padStart(2, '0');
  const secs = (descansoRestanteGlobal % 60).toString().padStart(2, '0');
  document.getElementById('barra-tiempo-display').textContent = `${mins}:${secs}`;
}

function sumarDescanso(segs) {
  descansoRestanteGlobal += segs;
  if (descansoRestanteGlobal < 0) descansoRestanteGlobal = 0;
  actualizarDisplayDescanso();
}

function detenerDescansoGlobal() {
  if (descansoGlobalInterval) clearInterval(descansoGlobalInterval);
  const barra = document.getElementById('barra-descanso-global');
  if (barra) barra.style.display = 'none';
}

function iniciarDescansoGlobal(segundos, nombreEjercicio) {
  crearBarraDescanso();
  detenerDescansoGlobal();

  descansoRestanteGlobal = segundos;
  document.getElementById('barra-ej-nombre').textContent = nombreEjercicio;
  document.getElementById('barra-descanso-global').style.display = 'flex';

  actualizarDisplayDescanso();
  descansoGlobalInterval = setInterval(() => {
    descansoRestanteGlobal--;
    actualizarDisplayDescanso();
  }, 1000);
}
