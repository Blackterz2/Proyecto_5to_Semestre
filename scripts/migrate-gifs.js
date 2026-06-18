// ============================================================
// migrate-gifs.js — Migración de videos desde AscendAPI
// ============================================================
//
// Este script recorre TODOS los ejercicios del catálogo,
// consulta la API "EDB with Videos and Images" (AscendAPI vía
// RapidAPI) por el nombre en inglés de cada ejercicio, y
// actualiza la columna gif_url en la base de datos con la
// URL del video (MP4) o imagen (JPG) encontrada.
//
// FLUJO POR EJERCICIO (2 llamadas):
//   1. /search?search=nombre → obtiene exerciseId + imageUrl
//   2. /{exerciseId} → obtiene videoUrl real
//
// Si el video existe → guarda .mp4 en gif_url
// Si no hay video → guarda la imagen (JPG) como fallback
// El frontend ya detecta .mp4 vs .jpg con esVideo()
//
// Requisitos:
//   1. Tener Node.js instalado (v18+)
//   2. Tener suscripción activa a "EDB with Videos and Images"
//      por AscendAPI en RapidAPI
//      (plan gratuito: 2,000 requests/mes)
//   3. Tener MySQL corriendo y accesible
//   4. Haber ejecutado primero: docs/migracion-gif-url.sql
//
// Configuración:
//   Agregá esto a tu archivo .env:
//     ASCENDAPI_KEY=tu_key_de_rapidapi
//
//   (si ya tenés EXERCISEDB_API_KEY con la misma key, también
//    funciona como fallback — pero lo ideal es renombrarla)
//
// Uso:
//   node scripts/migrate-gifs.js           # ejecución real
//   node scripts/migrate-gifs.js --dry-run # solo verificar
//
// Comportamiento:
//   - Usa el nombre en inglés del ejercicio (mapa NOMBRES_ENGLISH
//     o slug del filename) como término de búsqueda
//   - 2 requests por ejercicio (search + detalle)
//   - Prioriza videoUrl sobre imageUrl
//   - Delay de 800ms entre ejercicios para respetar rate limits
//   - Si falla o no encuentra match, salta el ejercicio
//     (no detiene el proceso)
//   - Es IDEMPOTENTE: si ya tiene gif_url, no lo sobreescribe
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const DELAY_MS = 800;           // ms entre requests (rate limiting — 2 llamadas por ej.)
const API_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const API_SEARCH_URL = `https://${API_HOST}/api/v1/exercises/search`;
const API_DETAIL_URL = `https://${API_HOST}/api/v1/exercises`;
const API_KEY = process.env.ASCENDAPI_KEY || process.env.EXERCISEDB_API_KEY;

// Score mínimo de similitud para aceptar un match automático.
// Por debajo de esto, el video casi seguro es de otro ejercicio
// (ej: "chin up" → "Clap Push Up" tiene ~10% similitud, es
// claramente incorrecto). Se prefiere NO guardar nada antes
// que guardar un video equivocado.
const SCORE_MINIMO_ACEPTABLE = 0.2;

// --- Flags de línea de comandos ---
const DRY_RUN = process.argv.includes('--dry-run');
const MOSTRAR_CANDIDATOS = process.argv.includes('--mostrar-candidatos');

// ============================================================
// EXCEPCIONES_EXERCISE_ID — Correcciones manuales
// ============================================================
// Para ejercicios donde el algoritmo de similitud no encuentra
// el match correcto, se puede forzar un exerciseId específico
// obtenido manualmente consultando la API. Estos siempre tienen
// scoreConfianza = 1 (nunca son rechazados por el umbral).
// Formato: { nombreBusqueda: 'exerciseId' }
const EXCEPCIONES_EXERCISE_ID = {
  // Dominadas supinas → Chin-Up (existe en la API con video)
  'chin up': 'exr_41n2hXszY7TgwKy4',
};

// ============================================================
// MAPA DE TRADUCCIÓN ESPAÑOL → INGLÉS
// ============================================================
// Los nombres de ejercicios en seed.sql están en español.
// ExerciseDB solo entiende inglés. Este mapa traduce los
// nombres exactos para que la búsqueda sea precisa.
//
// Criterio: nombre exacto usado en ExerciseDB
// (https://exercisedb.io)
const NOMBRES_ENGLISH = {
  'Press de banca': 'bench press',
  'Sentadilla': 'barbell squat',
  'Peso muerto': 'deadlift',
  'Press de hombro': 'seated overhead press',
  'Curl con barra': 'barbell curl',
  'Remo con barra': 'bent over row',
  'Press de banca inclinado': 'incline bench press',
  'Sentadilla frontal': 'front squat',
  'Peso muerto con barra hexagonal': 'trap bar deadlift',
  'Empuje de cadera': 'barbell hip thrust',
  'Peso muerto rumano': 'romanian deadlift',
  'Cargada de potencia': 'power clean',
  'Press militar con barra de pie': 'standing barbell press',
  'Peso Muerto estilo Sumo': 'sumo deadlift',
  'Cargada de dos tiempos': 'clean and jerk',
  'Curl con barra Z': 'ez bar curl',
  'Extensión de tríceps en banca': 'lying triceps extension',
  'Press de banca agarre cerrado': 'close grip bench press',
  'Arrancada': 'barbell snatch',
  'Curl predicador con mancuernas': 'preacher curl',
  'Press de hombro sentado': 'seated shoulder press',
  'Encogimientos con barra': 'barbell shrug',
  'Remo en barra T': 't bar row',
  'Cargada': 'barbell clean',
  'Empuje de fuerza': 'push press',
  'Press de banca en multipower': 'smith machine bench press',
  'Press de banca declinado': 'decline bench press',
  'Dominadas': 'pull up',
  'Flexiones': 'push up',
  'Fondos': 'dip',
  'Dominadas supinas': 'chin up',
  'Abdominales': 'crunches',
  'Abdominales sentado': 'sit up',
  'Fondos en barra': 'muscle up',
  'Sentadilla con el peso corporal': 'bodyweight squat',
  'Flexiones con un brazo': 'one arm push up',
  'Dominadas agarre neutro': 'neutral grip pull up',
  'Flexiones para tríceps en suelo': 'diamond push up',
  'Press de banca con mancuernas': 'dumbbell bench press',
  'Curl con mancuernas': 'dumbbell curl',
  'Press con mancuernas en banco inclinado': 'incline dumbbell press',
  'Press de hombros con mancuernas': 'dumbbell shoulder press',
  'Elevaciones laterales con mancuernas': 'dumbbell lateral raise',
  'Remo con mancuerna': 'dumbbell row',
  'Curl con mancuernas agarre martillo': 'hammer curl',
  'Press de hombro con mancuernas sentado': 'seated dumbbell shoulder press',
  'Sentadilla Búlgara con mancuernas': 'bulgarian split squat',
  'Sentadilla con mancuerna': 'goblet squat',
  'Aperturas con mancuernas': 'dumbbell fly',
  'Encogimientos con mancuernas': 'dumbbell shrug',
  'Prensa inclinada': 'sled leg press',
  'Extensión de piernas': 'leg extension',
  'Prensa horizontal en máquina': 'horizontal leg press',
  'Press de pecho en máquina vertical': 'chest press machine',
  'Sentadilla Hack': 'hack squat',
  'Press de hombros en máquina': 'machine shoulder press',
  'Aperturas en máquina': 'machine chest fly',
  'Curl femoral sentado': 'seated leg curl',
  'Curl femoral tumbado': 'lying leg curl',
  'Gemelo en máquina de pie': 'standing calf raise',
  'Aductores en máquina': 'hip adduction machine',
  'Jalón dorsal': 'lat pulldown',
  'Jalones de tríceps en polea': 'tricep pushdown',
  'Remo en polea sentado': 'seated cable row',
};

// ============================================================
// similitud(a, b) → number entre 0 y 1
// ============================================================
// Compara dos strings por palabras en común. Cuantas más
// palabras compartan (relativas al total), mayor el score.
// Usado para elegir el mejor match entre varios resultados
// de /search, en vez de tomar siempre el primero.
function similitud(a, b) {
  const normalizar = (str) => str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // quitar puntuación
    .split(/\s+/)
    .filter(Boolean);

  const palabrasA = normalizar(a);
  const palabrasB = normalizar(b);

  if (palabrasA.length === 0 || palabrasB.length === 0) return 0;

  const coincidencias = palabrasA.filter(p => palabrasB.includes(p)).length;
  return coincidencias / Math.max(palabrasA.length, palabrasB.length);
}

// ============================================================
// sanitizarNombre(nombre) → string
// ============================================================
// Toma el slug del filename (e.g. "bench-press") y lo
// convierte a palabras separadas (e.g. "bench press")
// para usarlo como fallback en ExerciseDB.
function sanitizarNombre(slug) {
  return slug
    .replace(/[-_]/g, ' ')   // kebab → espacios
    .replace(/\s+/g, ' ')    // colapsar espacios múltiples
    .trim();
}

// ============================================================
// buscarExerciseId(nombreBusqueda) → { exerciseId, imageUrl,
//                                     nombreEncontrado,
//                                     scoreConfianza,
//                                     todosLosCandidatos } | null
// ============================================================
// Consulta /search de la API y, entre todos los resultados,
// elige el que tenga mayor similitud de nombre con el término
// buscado — en vez de tomar ciegamente el primero.
//
// También devuelve todosLosCandidatos (array ordenado por score
// descendente) para que --mostrar-candidatos pueda mostrarlos.
//
// Las excepciones manuales (EXCEPCIONES_EXERCISE_ID) bypassan
// toda la lógica de similitud y usan scoreConfianza = 1.
async function buscarExerciseId(nombreBusqueda) {
  if (!API_KEY) {
    console.warn('  ⚠️  ASCENDAPI_KEY no configurada en .env — saltando');
    return null;
  }

  // --- Excepción manual: bypass total de la API ---
  if (EXCEPCIONES_EXERCISE_ID[nombreBusqueda]) {
    return {
      exerciseId: EXCEPCIONES_EXERCISE_ID[nombreBusqueda],
      imageUrl: null,
      nombreEncontrado: nombreBusqueda,
      scoreConfianza: 1,
      todosLosCandidatos: [],
    };
  }

  const url = `${API_SEARCH_URL}?search=${encodeURIComponent(nombreBusqueda)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`  ⚠️  Rate limited (429). Esperando 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        return buscarExerciseId(nombreBusqueda);
      }
      if (response.status === 403) {
        console.warn(`  ⚠️  HTTP 403 — revisá tu suscripción a "EDB with Videos and Images by AscendAPI" en RapidAPI`);
      } else {
        console.warn(`  ⚠️  HTTP ${response.status} en /search para "${nombreBusqueda}"`);
      }
      return null;
    }

    const data = await response.json();
    if (!data.success || !Array.isArray(data.data) || data.data.length === 0) {
      return null;
    }

    // Calcular score de similitud para cada candidato
    const candidatosConScore = data.data.map(c => ({
      exerciseId: c.exerciseId,
      name: c.name,
      imageUrl: c.imageUrl,
      score: similitud(nombreBusqueda, c.name),
    }));

    // Ordenar por score descendente
    candidatosConScore.sort((a, b) => b.score - a.score);

    return {
      exerciseId: candidatosConScore[0].exerciseId,
      imageUrl: candidatosConScore[0].imageUrl,
      nombreEncontrado: candidatosConScore[0].name,
      scoreConfianza: candidatosConScore[0].score,
      todosLosCandidatos: candidatosConScore,
    };
  } catch (err) {
    console.warn(`  ⚠️  Error de red en /search: ${err.message}`);
    return null;
  }
}

// ============================================================
// obtenerVideoUrlPorId(exerciseId) → string|null
// ============================================================
// Consulta el detalle de un ejercicio por ID para obtener
// el videoUrl real (MP4).
async function obtenerVideoUrlPorId(exerciseId) {
  const url = `${API_DETAIL_URL}/${exerciseId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': API_HOST,
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`  ⚠️  Rate limited (429) en detalle. Esperando 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        return obtenerVideoUrlPorId(exerciseId);
      }
      console.warn(`  ⚠️  HTTP ${response.status} en detalle`);
      return null;
    }

    const data = await response.json();
    const detalle = data.data || data;
    return detalle.videoUrl || null;
  } catch (err) {
    console.warn(`  ⚠️  Error de red en detalle: ${err.message}`);
    return null;
  }
}

// ============================================================
// MAIN — Ejecuta la migración
// ============================================================
async function main() {
  console.log('');
  const modo = DRY_RUN ? 'LECTURA (dry-run)' : 'ESCRITURA';
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   Migración de Videos/Imágenes — AscendAPI  ║');
  console.log(`║   Modo: ${modo.padEnd(31)}║`);
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  // --- 1. Conectar a la DB ---
  let pool;
  try {
    pool = mysql.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 3306,
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME     || 'fitness_app',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });

    // Verificar conexión
    const [rows] = await pool.execute('SELECT 1 AS test');
    if (!rows[0]) throw new Error('No se pudo conectar');
    console.log('✔  Conexión a MySQL establecida');
  } catch (err) {
    console.error('✖  Error conectando a MySQL:', err.message);
    process.exit(1);
  }

  // --- 2. Leer todos los ejercicios ---
  const [ejercicios] = await pool.execute(
    'SELECT id, nombre, imagen_url, gif_url FROM ejercicios ORDER BY id'
  );
  console.log(`✔  ${ejercicios.length} ejercicios encontrados`);
  console.log('');

  // --- 3. Recorrer y actualizar ---
  let actualizados = 0;
  let saltados = 0;
  let errores = 0;
  let matchesDudosos = 0;
  let sinMatch = 0;

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const idx = `${i + 1}/${ejercicios.length}`;

    // Si ya tiene gif_url, saltar (idempotente)
    if (ej.gif_url) {
      console.log(`  [${idx}] ${ej.nombre} — ya tiene media (saltando)`);
      saltados++;
      continue;
    }

    // Determinar el nombre de búsqueda en inglés
    const nombreBusqueda = NOMBRES_ENGLISH[ej.nombre]
      || sanitizarNombre(ej.imagen_url?.replace(/\.avif$/i, '') || '')
      || ej.nombre;

    process.stdout.write(`  [${idx}] "${ej.nombre}" → "${nombreBusqueda}"... `);

    const resultado = await buscarExerciseId(nombreBusqueda);

    if (!resultado) {
      console.log('✖ (no encontrado en /search)');
      errores++;
    } else {
      // Alerta visual si el match es dudoso (menos de 50% de
      // palabras en común) — para revisar manualmente después
      const alertaConfianza = resultado.scoreConfianza < 0.5 ? ' ⚠️ MATCH DUDOSO' : '';
      if (resultado.scoreConfianza < 0.5) matchesDudosos++;

      // Rechazar matches por debajo del umbral mínimo — preferimos
      // NO guardar nada antes que guardar un video incorrecto.
      // Las excepciones manuales (scoreConfianza forzado a 1) nunca
      // se rechazan acá.
      const matchRechazado = resultado.scoreConfianza < SCORE_MINIMO_ACEPTABLE;

      if (!matchRechazado) {
        // Pausa breve entre search y detalle
        await new Promise(r => setTimeout(r, 300));

        const videoUrl = await obtenerVideoUrlPorId(resultado.exerciseId);
        // Prioridad: video > imagen
        const mediaUrl = videoUrl || resultado.imageUrl;

        if (mediaUrl) {
          if (DRY_RUN) {
            console.log(`✔ → "${resultado.nombreEncontrado}" (${Math.round(resultado.scoreConfianza * 100)}% match)${alertaConfianza} → ${mediaUrl} ${videoUrl ? '(video)' : '(imagen)'}`);

            if (resultado.scoreConfianza < 0.5 && MOSTRAR_CANDIDATOS && resultado.todosLosCandidatos.length > 0) {
              console.log(`        Candidatos para "${ej.nombre}":`);
              resultado.todosLosCandidatos.forEach((c, i) => {
                console.log(`          [${i}] ${c.exerciseId} — "${c.name}" (${Math.round(c.score * 100)}%)`);
              });
            }
          } else {
            await pool.execute(
              'UPDATE ejercicios SET gif_url = ? WHERE id = ?',
              [mediaUrl, ej.id]
            );
            console.log(`✔ ${videoUrl ? '🎥' : '🖼️'}`);
          }
          actualizados++;
        } else {
          console.log('✖ (sin video ni imagen)');
          errores++;
        }
      } else {
        console.log(`✖ RECHAZADO — mejor match "${resultado.nombreEncontrado}" solo ${Math.round(resultado.scoreConfianza * 100)}% — se deja sin video`);

        if (MOSTRAR_CANDIDATOS && resultado.todosLosCandidatos && resultado.todosLosCandidatos.length > 0) {
          console.log(`        Candidatos para "${ej.nombre}" (ninguno superó el umbral de ${Math.round(SCORE_MINIMO_ACEPTABLE * 100)}%):`);
          resultado.todosLosCandidatos.forEach((c, i) => {
            console.log(`          [${i}] ${c.exerciseId} — "${c.name}" (${Math.round(c.score * 100)}%)`);
          });
        }
        sinMatch++;
      }
    }

    // Delay para rate limiting
    if (i < ejercicios.length - 1) {
      await new Promise(r => setTimeout(r, DELAY_MS));
    }
  }

  // --- 4. Resumen ---
  console.log('');
  const accion = DRY_RUN ? 'Coinciden' : 'Actualizados';
  console.log('╔══════════════════════════════════════════════╗');
  console.log(`║   ${DRY_RUN ? 'VERIFICACIÓN (dry-run)' : 'RESULTADO'}${' '.repeat(DRY_RUN ? 12 : 21)}║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  Total:        ${String(ejercicios.length).padStart(4)} ejercicios        ║`);
  console.log(`║  ${accion}:${String(actualizados).padStart(5)}            ║`);
  console.log(`║  Saltados:     ${String(saltados).padStart(4)} ya tenían           ║`);
  console.log(`║  Dudosos:      ${String(matchesDudosos).padStart(4)} revisar manual       ║`);
  console.log(`║  Sin match:    ${String(sinMatch).padStart(4)} quedan sin video    ║`);
  console.log(`║  Errores:      ${String(errores).padStart(4)} no encontrados       ║`);
  if (DRY_RUN) {
    const pct = ejercicios.length > 0 ? ((actualizados / ejercicios.length) * 100).toFixed(1) : '0.0';
    console.log(`║  Cobertura:    ${String(pct).padStart(5)}%                    ║`);
  }
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');

  await pool.end();
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
