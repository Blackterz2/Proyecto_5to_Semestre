// ============================================================
// verify-mappings.js — Verifica cobertura del mapa español→inglés
// ============================================================
//
// SIN necesidad de API key ni DB. Lee seed.sql y muestra qué
// término de búsqueda se usaría para cada ejercicio.
//
// Uso:
//   node scripts/verify-mappings.js
// ============================================================

const fs = require('fs');
const path = require('path');

// Mapa español→inglés (copiado de migrate-gifs.js)
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

function sanitizarNombre(slug) {
  return slug
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Leer seed.sql
const seedPath = path.resolve(__dirname, '..', 'seed.sql');
const content = fs.readFileSync(seedPath, 'utf-8');
const regex = /VALUES \((\d+), '([^']+)', '([^']*)', '([^']*)', '([^']*)'\)/g;

const ejercicios = [];
let match;
while ((match = regex.exec(content)) !== null) {
  ejercicios.push({
    id: parseInt(match[1], 10),
    nombre: match[2],
    descripcion: match[3],
    categoria: match[4],
    imagen_url: match[5],
  });
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  VERIFICACIÓN DE MAPA — Español → ExerciseDB API');
console.log(`  ${ejercicios.length} ejercicios analizados desde seed.sql`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

let ok = 0;
let slugFallback = 0;
let missing = 0;

for (const ej of ejercicios) {
  const slug = ej.imagen_url.replace(/\.avif$/i, '');

  if (NOMBRES_ENGLISH[ej.nombre]) {
    const busqueda = NOMBRES_ENGLISH[ej.nombre];
    console.log(`  ✔ [${String(ej.id).padStart(2)}] "${ej.nombre}"`);
    console.log(`       → Término: "${busqueda}"`);
    ok++;
  } else {
    const fallback = sanitizarNombre(slug);
    console.log(`  ⚠ [${String(ej.id).padStart(2)}] "${ej.nombre}"`);
    console.log(`       Sin traducción exacta — fallback: "${fallback}"`);
    slugFallback++;
  }
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  RESUMEN');
console.log('═══════════════════════════════════════════════════════════');
console.log(`  Total ejercicios:   ${ejercicios.length}`);
console.log(`  Traducción exacta:  ${ok} (${((ok / ejercicios.length) * 100).toFixed(0)}%)`);
console.log(`  Fallback (slug):    ${slugFallback} (${((slugFallback / ejercicios.length) * 100).toFixed(0)}%)`);
console.log(`  Sin cobertura:      ${missing}`);
const cobertura = ((ok / ejercicios.length) * 100).toFixed(0);
console.log(`  Cobertura total:    ${cobertura}%`);
console.log('');

if (cobertura >= 95) {
  console.log('  ✅ COBERTURA EXCELENTE (≥95%)');
} else if (cobertura >= 90) {
  console.log('  ✅ COBERTURA BUENA (≥90%)');
} else if (cobertura >= 80) {
  console.log('  ⚠️  COBERTURA ACEPTABLE (≥80%) — revisá los que faltan');
} else {
  console.log('  ❌ COBERTURA BAJA (<80%) — necesitás agregar más traducciones');
}
console.log('');
