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
const modalError          = document.getElementById('modal-error');

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
// PANEL DE DETALLE DE EJERCICIO (Hito 15)
// ============================================================
const panelDetalle       = document.getElementById('panel-detalle-ejercicio');
const panelDetalleImg    = document.getElementById('panel-detalle-img');
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
let rutinaActualId = 1;

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
    rutinaActualId: rutinaActualId || null,
    horaInicio: horaInicio || null,
    segundosTranscurridos: segundosTranscurridos || 0,
    ejercicios,
    ejerciciosExtraIds: window.ejerciciosExtraIds || []
  };

  localStorage.setItem('entrenamiento_draft', JSON.stringify(draft));
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
  if (!draft.rutinaActualId) return false;

  const usuarioId = extraerUsuarioIdDelToken();
  const usuarioNombre = extraerNombreDelToken() || 'desconocido';
  console.log(`Intentando restaurar rutina ID: ${draft.rutinaActualId} para usuario: ${usuarioNombre} (ID: ${usuarioId})`);

  try {
    const res = await fetch(`/api/rutinas/${draft.rutinaActualId}`, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    if (!res.ok) {
      // Draft inválido (rutina no existe, no pertenece al usuario o fue eliminada)
      console.warn(`Draft detectado pero no pertenece a este usuario (${res.status}). Limpiando...`);
      limpiarEstadoDeEmergencia();
      return false;
    }
    const json = await res.json();
    if (!json.data) {
      // Datos vacíos, limpiar draft corrupto
      console.warn('Draft con datos vacíos. Limpiando...');
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
            inputPeso.placeholder = 'kg';
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

    mostrarToast('🔄 Entrenamiento restaurado');
    return true;
  } catch {
    return false;
  }
}

// mostrarToast() — Muestra una notificación temporal en el toast
// ubicado en la parte inferior central de la pantalla.
function mostrarToast(mensaje) {
  const toast = document.getElementById('toast-restore');
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.remove('hidden');
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2000);
}

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
    const seriesAnteriores = ultimaSesionData[ejercicioId];
    if (!seriesAnteriores) return;

    const rows = card.querySelectorAll('.serie-row');

    rows.forEach((row, idx) => {
      if (row.querySelector('.anterior-valor')) return;

      const inputReps = row.querySelector('input[data-campo="repeticiones"]');
      if (!inputReps) return;

      const datos = seriesAnteriores[idx];
      if (!datos) return;

      const span = document.createElement('span');
      span.className = 'anterior-valor';
      span.textContent = `${datos.peso}kg x ${datos.repeticiones}`;
      // Insertar DESPUÉS del checkbox (extremo derecho) para que
      // quede simétrico al agregar series nuevas.
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
// renderizarImagenEjercicio(ej)
// ============================================================
// Devuelve el HTML para la imagen de un ejercicio.
// Si el ejercicio tiene imagen_url, muestra un <img> real.
// Si no, muestra el placeholder con icono (fallback visual).
function renderizarImagenEjercicio(ej) {
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
  btnLogout?.classList.add('hidden');
  // Resetear a la vista de login (por si estaba en registro)
  mostrarAuthLogin();
}

// ============================================================
// mostrarApp() — Muestra el contenido privado (rutinas / perfil / entrenar)
// ============================================================
function mostrarApp() {
  loginSection?.classList.add('hidden');
  appContent?.classList.remove('hidden');
  btnLogout?.classList.remove('hidden');
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

  rutinaActualId = id;

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

      // --- CABECERA: orden + nombre + eliminar ---
      const header = document.createElement('div');
      header.className = 'card-header';
      const orden = document.createElement('span');
      orden.className = 'card-orden';
      orden.textContent = ejercicio.orden || '-';
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

      header.appendChild(orden);
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
        s.innerHTML = `<span class="stat-icon">🏋️</span><span class="stat-value">${ejercicio.peso}</span><span class="stat-label">kg (plan)</span>`;
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
        inputPeso.placeholder = 'kg';
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
    let html = `
      <table class="historial-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Rutina</th>
            <th>Duración</th>
            <th>Notas</th>
          </tr>
        </thead>
        <tbody>
    `;

    for (const sesion of historial) {
      // Formateamos la fecha para que se vea linda
      // De "2026-06-07" a "7 de junio, 2026"
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

      html += `
        <tr class="clickable-row">
          <td>📅 ${fechaFormateada}</td>
          <td><span class="rutina-badge">${rutinaNombre}</span></td>
          <td>${duracionTexto}</td>
          <td>${notas}</td>
        </tr>
      `;
    }

    html += `
        </tbody>
      </table>
    `;

    if (historialContainer) {
      historialContainer.innerHTML = html;
    }

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
    const limite = total >= 4;
    let html = '';

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
        <div class="rutina-card" data-rutina-id="${rutina.id}">
          <button class="btn-eliminar-rutina" data-rutina-id="${rutina.id}" data-rutina-nombre="${rutina.nombre}">🗑️</button>
          <div class="rutina-card-nombre">${rutina.nombre}</div>
          <div class="rutina-card-ejercicios">${textoEj}</div>
        </div>
      `;
    }

    // Tarjeta para "Añadir nueva" (solo si no se alcanzó el límite y en Mis Rutinas)
    if (!limite) {
      html += `
        <div id="btn-add-rutina" class="rutina-card rutina-card--add">
          + Nueva Rutina
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
        // No navegar a Entrenar si se clickeó el botón eliminar
        if (e.target.closest('.btn-eliminar-rutina')) return;

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

  } catch (error) {
    console.error('Error al cargar rutinas:', error.message);
  }
}

// ============================================================
// ABRIR / CERRAR MODAL DE CREACIÓN
// ============================================================
function abrirModal() {
  if (modalOverlay) {
    modalOverlay.classList.remove('hidden');
    inputNombreRutina.value = '';
    inputNombreRutina.focus();
    if (modalError) modalError.classList.add('hidden');
    btnModalCrear.disabled = false;
    btnModalCrear.textContent = 'Crear rutina';

    // Limpiar selección temporal al abrir el modal
    ejerciciosSeleccionadosTemp.clear();

    // Cargar catálogo y dibujar checkboxes (Hito 11 Parte 3)
    renderizarCheckboxesEnModal();
  }
}

function cerrarModal() {
  if (modalOverlay) {
    modalOverlay.classList.add('hidden');
  }
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
  crearNuevaRutina(nombre);
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
    peso_actual: fd.get('peso_actual') ? Number(fd.get('peso_actual')) : null,
    estatura_cm: fd.get('estatura_cm') ? Number(fd.get('estatura_cm')) : null,
  };
  // Ocultar formulario, mostrar pregunta
  stepForm?.classList.add('hidden');
  stepPregunta?.classList.remove('hidden');
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
// ELIMINAR CUENTA (Soft Delete)
// ============================================================
btnEliminarCuenta?.addEventListener('click', async () => {
  // ============================================================
  // CONFIRMACIÓN ESTRICTA
  // ============================================================
  // Usamos prompt() para que el usuario tenga que escribir
  // "ELIMINAR" explícitamente. Esto evita clics accidentales
  // y es más seguro que un confirm() simple.
  const confirmacion = prompt(
    '⚠️ ¿Estás seguro?\n\n' +
    'Esta acción desactivará tu cuenta permanentemente.\n' +
    'Tus rutinas e historial se conservarán, pero no podrás iniciar sesión.\n\n' +
    'Escribí "ELIMINAR" (en mayúsculas) para confirmar.'
  );

  // Si el usuario cancela el prompt o no escribe exactamente
  // "ELIMINAR", no hacemos nada.
  if (confirmacion !== 'ELIMINAR') return;

  const token = getToken();
  if (!token) {
    mostrarLogin();
    return;
  }

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
      alert('❌ ' + (datos.message || 'Error al eliminar la cuenta'));
      return;
    }

    // Cuenta desactivada → limpiar sesión y volver al login
    localStorage.removeItem('token');
    mostrarLogin();
    alert('✅ Cuenta desactivada correctamente. Gracias por usar Blackterz.');

  } catch (error) {
    console.error('Error de red:', error);
    alert('❌ Error de conexión con el servidor');
  }
});

// ============================================================
// CERRAR SESIÓN (LOGOUT)
// ============================================================
btnLogout?.addEventListener('click', () => {
  limpiarEstadoEntrenamiento();
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
  if (e.target.closest('.check-serie')) guardarEstadoEntrenamiento();
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
    if (!confirm(`¿Eliminar "${nombreEj}" de la rutina actual?`)) return;

    // Eliminar la tarjeta completa del DOM
    card.remove();

    // Refrescar la lista de ejercicios extra para que el ejercicio
    // eliminado vuelva a estar disponible
    poblarListaEjerciciosExtra(buscadorExtra?.value);
    guardarEstadoEntrenamiento();
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
  inputPeso.placeholder = 'kg';
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
});

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
      const peso = inputPeso ? Number(inputPeso.value) || 0 : 0;
      const repeticiones = inputReps ? Number(inputReps.value) || 0 : 0;

      series.push({
        numero_serie: index + 1, // 1-indexed como en la DB
        peso: peso,
        repeticiones: repeticiones,
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
  // VALIDACIÓN: si NO hay ejercicios con datos, abortamos
  // ============================================================
  if (ejercicios.length === 0) {
    alert('⚠️ No hay ejercicios con datos para guardar.\nCargá peso y repeticiones en al menos un ejercicio.');
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
  const confirmacion = confirm('¿Estás seguro de que deseas descartar el entrenamiento en progreso?');
  if (confirmacion) {
    limpiarEstadoEntrenamiento();
    limpiarVistaEntrenamiento();
  }
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

  if (!confirm(`¿Estás seguro de que deseas eliminar la rutina "${nombre}"? Esta acción no borrará tu historial de entrenamientos.`)) return;

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
      alert('Error al eliminar la rutina');
      return;
    }

    // Remover la tarjeta del DOM inmediatamente
    btn.closest('.rutina-card')?.remove();

    // Refrescar desde el servidor para sincronizar estado
    await cargarRutinasUsuario();
  } catch (err) {
    console.error('Error al eliminar rutina:', err);
  }
});

// ============================================================
// mostrarDetalleEjercicio(id) — Abre el panel de detalle
// buscando el ejercicio en el catálogo global
// ============================================================
function mostrarDetalleEjercicio(ejercicioId) {
  const ejercicio = catalogoEjercicios?.find(e => e.id === ejercicioId);
  if (!ejercicio) return;

  // Imagen
  const imgSrc = ejercicio.imagen_url ? `/images/${ejercicio.imagen_url}` : '';
  panelDetalleImg.src = imgSrc;
  panelDetalleImg.alt = ejercicio.nombre || 'Ejercicio';

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
  const img = e.target.closest('.img-ejercicio-thumb, .card-img img');
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
});
