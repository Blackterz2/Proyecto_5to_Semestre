// ============================================================
// migrate-gifs.js — Migración de GIFs desde ExerciseDB API
// ============================================================
//
// Este script recorre TODOS los ejercicios del catálogo,
// consulta la API de ExerciseDB (RapidAPI) por el nombre en
// inglés de cada ejercicio, y actualiza la columna gif_url
// en la base de datos con la URL del GIF encontrado.
//
// Requisitos:
//   1. Tener Node.js instalado (v18+)
//   2. Tener una API Key de RapidAPI para ExerciseDB
//   3. Tener MySQL corriendo y accesible
//   4. Haber ejecutado primero: docs/migracion-gif-url.sql
//      para agregar la columna gif_url a la tabla
//
// Configuración:
//   Agregá esto a tu archivo .env:
//     EXERCISEDB_API_KEY=tu_key_de_rapidapi
//
// Uso:
//   node scripts/migrate-gifs.js
//
// Comportamiento:
//   - Usa el nombre en inglés del ejercicio (derivado del
//     filename imagen_url) como término de búsqueda
//   - Convierte kebab-case a palabras separadas
//   - Toma el primer resultado de ExerciseDB
//   - Delay de 500ms entre requests para respetar rate limits
//   - Si falla o no encuentra match, salta el ejercicio
//     (no detiene el proceso)
//   - Es IDEMPOTENTE: si ya tiene gif_url, no lo sobreescribe
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const DELAY_MS = 600;           // ms entre requests (rate limiting)
const API_BASE = 'https://exercisedb.p.rapidapi.com/exercises/name';
const API_HOST = 'exercisedb.p.rapidapi.com';
const API_KEY = process.env.EXERCISEDB_API_KEY;

// --- Flag: --dry-run solo muestra resultados sin modificar la DB ---
const DRY_RUN = process.argv.includes('--dry-run');

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
// buscarGifEnExerciseDB(nombreBusqueda) → string|null
// ============================================================
// Consulta la API de ExerciseDB y devuelve la URL del primer
// GIF que coincida. Si no encuentra nada, devuelve null.
async function buscarGifEnExerciseDB(nombreBusqueda) {
  if (!API_KEY) {
    console.warn('  ⚠️  EXERCISEDB_API_KEY no configurada en .env — saltando');
    return null;
  }

  const url = `${API_BASE}/${encodeURIComponent(nombreBusqueda)}?limit=5`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': API_HOST,
      },
    });

    if (!response.ok) {
      // 429 = rate limit; 404 = no encontrado
      if (response.status === 429) {
        console.warn(`  ⚠️  Rate limited (429). Esperando 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        return buscarGifEnExerciseDB(nombreBusqueda); // reintentar
      }
      if (response.status === 404) return null;
      console.warn(`  ⚠️  HTTP ${response.status} para "${nombreBusqueda}"`);
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    // Buscar el que tenga gifUrl y que el nombre se parezca
    const match = data.find(e => e.gifUrl);
    return match?.gifUrl || null;
  } catch (err) {
    console.warn(`  ⚠️  Error de red: ${err.message}`);
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
  console.log('║   Migración de GIFs — ExerciseDB API        ║');
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

  for (let i = 0; i < ejercicios.length; i++) {
    const ej = ejercicios[i];
    const idx = `${i + 1}/${ejercicios.length}`;

    // Si ya tiene gif_url, saltar (idempotente)
    if (ej.gif_url) {
      console.log(`  [${idx}] ${ej.nombre} — ya tiene GIF (saltando)`);
      saltados++;
      continue;
    }

    // Determinar el nombre de búsqueda en inglés
    const nombreBusqueda = NOMBRES_ENGLISH[ej.nombre]
      || sanitizarNombre(ej.imagen_url?.replace(/\.avif$/i, '') || '')
      || ej.nombre;

    process.stdout.write(`  [${idx}] Buscando "${ej.nombre}" → "${nombreBusqueda}"... `);

    const gifUrl = await buscarGifEnExerciseDB(nombreBusqueda);

    if (gifUrl) {
      if (DRY_RUN) {
        console.log(`✔ → ${gifUrl}`);
      } else {
        await pool.execute(
          'UPDATE ejercicios SET gif_url = ? WHERE id = ?',
          [gifUrl, ej.id]
        );
        console.log('✔');
      }
      actualizados++;
    } else {
      console.log('✖ (no encontrado)');
      errores++;
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
  console.log(`║  Sin match:    ${String(errores).padStart(4)} no encontrados       ║`);
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
