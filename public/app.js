// ============================================================
// app.js — Lógica del Frontend
// ============================================================
// Este script se ejecuta en el NAVEGADOR (no en Node.js).
// Su trabajo es:
//   1. Llamar a la API (GET /api/rutinas/1)
//   2. Tomar los datos JSON que devuelve
//   3. Crear elementos HTML dinámicamente con createElement
//   4. Inyectarlos en el DOM para que el usuario los vea
//
// ⚠️ Acá NO hay require, NO hay module.exports, NO hay pool.
//    Esto es JavaScript del lado del cliente, puro y duro.

// ============================================================
// cargarRutina()
// ============================================================
// Función principal que orquesta todo.
// async: porque vamos a esperar (await) la respuesta del fetch.
async function cargarRutina() {
  // ============================================================
  // REFERENCIAS AL DOM
  // ============================================================
  // Obtenemos los elementos HTML donde vamos a inyectar datos.
  // Si el elemento no existe, getElementById devuelve null.
  const tituloEl = document.getElementById('titulo-rutina');
  const contenedorEl = document.getElementById('contenedor-ejercicios');

  // Verificamos que los elementos existan (seguridad ante todo)
  if (!tituloEl || !contenedorEl) {
    console.error('No se encontraron los elementos del DOM');
    return;
  }

  // Elementos dentro del título de la rutina
  const nombreEl = tituloEl.querySelector('.rutina-nombre');
  const descripcionEl = tituloEl.querySelector('.rutina-descripcion');

  try {
    // ============================================================
    // 1. FETCH A LA API
    // ============================================================
    // fetch() hace una petición HTTP GET al servidor.
    // Como el frontend está siendo servido por el mismo Express
    // (mismo puerto 3000), usamos una ruta RELATIVA.
    // Si el frontend estuviera en otro puerto, necesitaríamos
    // la URL completa: http://localhost:3000/api/rutinas/1
    const respuesta = await fetch('/api/rutinas/1');

    // Verificamos que la respuesta sea OK (código 200)
    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    // Convertimos la respuesta de JSON a objeto JavaScript
    const datos = await respuesta.json();

    // ============================================================
    // 2. VERIFICAR QUE LA API RESPONDIÓ BIEN
    // ============================================================
    if (datos.status !== 'ok' || !datos.data) {
      throw new Error(datos.message || 'Error al obtener la rutina');
    }

    const rutina = datos.data;

    // ============================================================
    // 3. MOSTRAR EL TÍTULO DE LA RUTINA
    // ============================================================
    nombreEl.textContent = rutina.nombre || 'Rutina sin nombre';

    if (rutina.descripcion) {
      descripcionEl.textContent = rutina.descripcion;
    }

    // ============================================================
    // 4. GENERAR LAS TARJETAS DE EJERCICIOS
    // ============================================================
    // Si no hay ejercicios, mostramos un mensaje
    if (!rutina.ejercicios || rutina.ejercicios.length === 0) {
      contenedorEl.innerHTML = '<div class="empty">Esta rutina no tiene ejercicios asignados aún 🤷</div>';
      return;
    }

    // Limpiamos el contenedor por si había algo (útil si
    // recargamos la rutina múltiples veces)
    contenedorEl.innerHTML = '';

    // Recorremos cada ejercicio y creamos su tarjeta
    for (const ejercicio of rutina.ejercicios) {
      // Crear la tarjeta
      const card = document.createElement('div');
      card.className = 'card';

      // ============================================================
      // 4a. CABECERA: orden + nombre
      // ============================================================
      const header = document.createElement('div');
      header.className = 'card-header';

      const orden = document.createElement('span');
      orden.className = 'card-orden';
      orden.textContent = ejercicio.orden || '-';

      const title = document.createElement('h3');
      title.className = 'card-title';
      title.textContent = ejercicio.nombre || 'Ejercicio';

      header.appendChild(orden);
      header.appendChild(title);

      // ============================================================
      // 4b. DESCRIPCIÓN (si tiene)
      // ============================================================
      let descripcionEl_ = null;
      if (ejercicio.descripcion) {
        descripcionEl_ = document.createElement('p');
        descripcionEl_.className = 'card-descripcion';
        descripcionEl_.textContent = ejercicio.descripcion;
      }

      // ============================================================
      // 4c. STATS: series, repes, peso
      // ============================================================
      const stats = document.createElement('div');
      stats.className = 'card-stats';

      // Series
      if (ejercicio.series) {
        const statSeries = document.createElement('div');
        statSeries.className = 'stat';
        statSeries.innerHTML = `
          <span class="stat-icon">🔄</span>
          <span class="stat-value">${ejercicio.series}</span>
          <span class="stat-label">series</span>
        `;
        stats.appendChild(statSeries);
      }

      // Repeticiones
      if (ejercicio.repeticiones) {
        const statReps = document.createElement('div');
        statReps.className = 'stat';
        statReps.innerHTML = `
          <span class="stat-icon">🔁</span>
          <span class="stat-value">${ejercicio.repeticiones}</span>
          <span class="stat-label">repeticiones</span>
        `;
        stats.appendChild(statReps);
      }

      // Peso (si tiene)
      if (ejercicio.peso) {
        const statPeso = document.createElement('div');
        statPeso.className = 'stat';
        statPeso.innerHTML = `
          <span class="stat-icon">🏋️</span>
          <span class="stat-value">${ejercicio.peso}</span>
          <span class="stat-label">kg</span>
        `;
        stats.appendChild(statPeso);
      }

      // ============================================================
      // ARMAR LA TARJETA COMPLETA
      // ============================================================
      card.appendChild(header);
      if (descripcionEl_) card.appendChild(descripcionEl_);
      card.appendChild(stats);

      // Agregar la tarjeta al contenedor
      contenedorEl.appendChild(card);
    }

  } catch (error) {
    // ============================================================
    // 5. MANEJO DE ERRORES
    // ============================================================
    console.error('Error al cargar rutina:', error);

    // Mostrar un mensaje de error al usuario
    contenedorEl.innerHTML = `
      <div class="error">
        ❌ Error al cargar la rutina<br />
        <small>${error.message}</small>
      </div>
    `;

    nombreEl.textContent = 'Error al cargar';
  }
}

// ============================================================
// EJECUTAR CUANDO EL DOM ESTÉ LISTO
// ============================================================
// DOMContentLoaded se dispara cuando el HTML terminó de cargarse
// (pero no espera a imágenes, CSS externo, etc.).
// Es más rápido que window.onload y es el momento justo para
// empezar a manipular el DOM.
document.addEventListener('DOMContentLoaded', cargarRutina);
