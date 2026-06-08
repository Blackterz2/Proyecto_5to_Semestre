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
const btnTabHistorial = document.getElementById('btn-tab-historial');
const btnTabEntrenar  = document.getElementById('btn-tab-entrenar');
const dashboardView   = document.getElementById('dashboard-view');
const entrenarView    = document.getElementById('entrenar-view');
const historialContainer = document.getElementById('historial-container');

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

// ============================================================
// ESTADO DE LA APLICACIÓN
// ============================================================
// Guardamos el ID de la rutina que se está mostrando actualmente
// en la vista "Entrenar". Se actualiza cada vez que el usuario
// hace clic en una rutina del dashboard.
let rutinaActualId = 1;

// Catálogo de ejercicios (se carga UNA vez desde la API)
// Se usa para:
//   1. Renderizar los checkboxes en el modal de "Nueva Rutina"
//   2. Poblar el <select> de "Agregar Ejercicio Extra"
let catalogoEjercicios = [];

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
    html += `
      <div class="ejercicio-list-item">
        ${renderizarImagenEjercicio(ej)}
        <div class="ejercicio-info">
          <div class="ejercicio-nombre">${ej.nombre}</div>
          <div class="ejercicio-categoria">${categoria}${musculos}</div>
        </div>
        <input type="checkbox" id="check-ej-${ej.id}" value="${ej.id}" class="check-ejercicio" />
      </div>
    `;
  }
  modalEjercicios.innerHTML = html;
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
}

// ============================================================
// mostrarApp() — Muestra el contenido privado (dashboard + rutina)
// ============================================================
function mostrarApp() {
  loginSection?.classList.add('hidden');
  appContent?.classList.remove('hidden');
  btnLogout?.classList.remove('hidden');
}

// ============================================================
// mostrarDashboard() / mostrarEntrenar() — Cambiar entre vistas
// ============================================================
// Estas funciones controlan QUÉ vista se muestra dentro de
// app-content. Una a la vez (la otra queda oculta).
//
// También actualizan la pestaña activa en la navegación.

function mostrarDashboard() {
  dashboardView?.classList.remove('hidden');
  entrenarView?.classList.add('hidden');
  btnTabHistorial?.classList.add('nav-tab--active');
  btnTabEntrenar?.classList.remove('nav-tab--active');
}

function mostrarEntrenar() {
  dashboardView?.classList.add('hidden');
  entrenarView?.classList.remove('hidden');
  btnTabHistorial?.classList.remove('nav-tab--active');
  btnTabEntrenar?.classList.add('nav-tab--active');
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

  // Limpiar el buscador de ejercicios extra al cargar rutina
  if (buscadorExtra) buscadorExtra.value = '';

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

    if (!rutina.ejercicios || rutina.ejercicios.length === 0) {
      contenedorEl.innerHTML = '<div class="empty">Esta rutina no tiene ejercicios asignados aún 🤷</div>';
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

      // --- DESCRIPCIÓN ---
      let descEl = null;
      if (ejercicio.descripcion) {
        descEl = document.createElement('p');
        descEl.className = 'card-descripcion';
        descEl.textContent = ejercicio.descripcion;
      }

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

        serieRow.appendChild(label);
        serieRow.appendChild(inputPeso);
        serieRow.appendChild(inputReps);
        serieRow.appendChild(checkSerie);
        serieRow.appendChild(btnDelete);
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
      if (descEl) card.appendChild(descEl);
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

  // Mostramos la app y la vista dashboard
  mostrarApp();
  mostrarDashboard();

  // Cargamos las rutinas del usuario en paralelo con el historial
  cargarRutinasUsuario();

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

      html += `
        <tr class="clickable-row">
          <td>📅 ${fechaFormateada}</td>
          <td><span class="rutina-badge">${rutinaNombre}</span></td>
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
    const total = rutinas.length;
    const limite = total >= 4;

    // ============================================================
    // RENDERIZAR GRILLA DE RUTINAS
    // ============================================================
    let html = '';

    for (const rutina of rutinas) {
      const totalEj = rutina.total_ejercicios || 0;
      const textoEj = totalEj === 1 ? '1 ejercicio' : totalEj + ' ejercicios';

      html += `
        <div class="rutina-card" data-rutina-id="${rutina.id}">
          <div class="rutina-card-nombre">${rutina.nombre}</div>
          <div class="rutina-card-ejercicios">${textoEj}</div>
        </div>
      `;
    }

    // Tarjeta para "Añadir nueva" (solo si no se alcanzó el límite)
    if (!limite) {
      html += `
        <div id="btn-add-rutina" class="rutina-card rutina-card--add">
          + Nueva Rutina
        </div>
      `;
    }

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
      card.addEventListener('click', () => {
        const id = Number(card.dataset.rutinaId);
        if (id) {
          // Guardamos el ID y cargamos la rutina
          rutinaActualId = id;
          cargarRutina(id);
        }
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
    // Recorremos los checkboxes del modal y armamos un array
    // con los IDs de los ejercicios seleccionados.
    const checkboxes = modalEjercicios?.querySelectorAll(
      '.check-ejercicio:checked'
    );
    const ejercicios_ids = [];
    if (checkboxes) {
      checkboxes.forEach((cb) => {
        const id = Number(cb.value);
        if (id) ejercicios_ids.push(id);
      });
    }

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
    // CARGAR EL HISTORIAL (que a su vez oculta el login y
    // muestra el dashboard con los entrenamientos anteriores)
    // ============================================================
    await cargarHistorial();

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
// CERRAR SESIÓN (LOGOUT)
// ============================================================
btnLogout?.addEventListener('click', () => {
  // Borramos el token del localStorage
  localStorage.removeItem('token');

  // Limpiamos el contenido de la rutina
  if (contenedorEl) contenedorEl.innerHTML = '';
  if (nombreEl) nombreEl.textContent = 'Cargando rutina...';
  if (descripcionEl) descripcionEl.textContent = '';

  // Ocultamos los botones de acción de entrenamiento
  if (accionesEntreno) accionesEntreno.classList.add('hidden');
  if (extraEjercicioWrapper) extraEjercicioWrapper.classList.add('hidden');

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

    const totalFilas = seriesContainer.querySelectorAll('.serie-row').length;
    const label = nuevaFila.querySelector('.serie-label');
    if (label) {
      label.textContent = 'Serie ' + (totalFilas + 1);
    }

    seriesContainer.appendChild(nuevaFila);
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
    return;
  }
});
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
  // CREAR TARJETA COMPLETA (mismo formato que cargarRutina)
  // ============================================================
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

  // --- DESCRIPCIÓN (si tiene) ---
  let descEl = null;
  if (ejercicio.descripcion) {
    descEl = document.createElement('p');
    descEl.className = 'card-descripcion';
    descEl.textContent = ejercicio.descripcion;
  }

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

  serieRow.appendChild(label);
  serieRow.appendChild(inputPeso);
  serieRow.appendChild(inputReps);
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
  if (descEl) card.appendChild(descEl);
  card.appendChild(seriesInputsDiv);
  card.appendChild(btnSerieWrapper);

  // Insertar la tarjeta DENTRO del contenedor principal
  // (ANTES se insertaba fuera y por eso no funcionaba ni el
  //  botón eliminar ni el filtro anti-duplicados)
  contenedorEl?.appendChild(card);

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
btnTabHistorial?.addEventListener('click', () => {
  // Si ya estamos en historial, no hacemos nada
  if (!dashboardView?.classList.contains('hidden')) return;

  cargarHistorial();
});

btnTabEntrenar?.addEventListener('click', () => {
  // Si ya estamos en entrenar, no hacemos nada
  if (!entrenarView?.classList.contains('hidden')) return;

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
      ejercicios.push({
        ejercicio_id: ejercicioId,
        series: series,
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

  // Restaurar título
  if (nombreEl) nombreEl.textContent = 'Cargando rutina...';
  if (descripcionEl) descripcionEl.textContent = '';

  // Navegar al Dashboard y refrescar datos
  mostrarDashboard();
  cargarHistorial();
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
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  if (token) {
    cargarHistorial();
  } else {
    mostrarLogin();
  }
});
