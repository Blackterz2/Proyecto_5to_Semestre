// ============================================================
// seedScraper.js — Scraper de strengthlevel.es (español)
// ============================================================
// Extrae el listado de ejercicios desde strengthlevel.es,
// genera seed.sql con nombres en español y descarga las
// imágenes grandes a color (.avif) de cada ejercicio.
//
// Uso:
//   npm install cheerio axios
//   node seedScraper.js
//
// Requiere: axios, cheerio
// ============================================================

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONFIGURACIÓN
// ============================================================
const STANDARDS_URL = 'https://strengthlevel.es/estandares-de-fuerza';
const IMAGE_BASE_URL = 'https://static.strengthlevel.com/images/exercises';
const IMAGE_DIR = path.join(__dirname, 'public', 'images');
const OUTPUT_SQL = path.join(__dirname, 'seed.sql');

// ============================================================
// MAPA ESPAÑOL → INGLÉS
// ============================================================
// Extraído del listado de strengthlevel.es.
// Necesario para:
//   1. Buscar el mapping muscular (está en inglés)
//   2. Construir la URL de la imagen grande (.avif)
// ============================================================
const ES_TO_EN = {
  // Barra
  'Press de banca':               'Bench Press',
  'Sentadilla':                   'Squat',
  'Peso muerto':                  'Deadlift',
  'Press de hombro':              'Shoulder Press',
  'Curl con barra':               'Barbell Curl',
  'Remo con barra':               'Bent Over Row',
  'Press de banca inclinado':     'Incline Bench Press',
  'Sentadilla frontal':           'Front Squat',
  'Peso muerto con barra hexagonal': 'Hex Bar Deadlift',
  'Empuje de cadera':             'Hip Thrust',
  'Peso muerto rumano':           'Romanian Deadlift',
  'Cargada de potencia':          'Power Clean',
  'Press militar con barra de pie': 'Military Press',
  'Peso Muerto estilo Sumo':      'Sumo Deadlift',
  'Cargada de dos tiempos':       'Clean and Jerk',
  'Curl con barra Z':             'EZ Bar Curl',
  'Extensión de tríceps en banca':'Lying Tricep Extension',
  'Press de banca agarre cerrado':'Close Grip Bench Press',
  'Arrancada':                    'Snatch',
  'Curl predicador con mancuernas':'Preacher Curl',
  'Press de hombro sentado':      'Seated Shoulder Press',
  'Encogimientos con barra':      'Barbell Shrug',
  'Remo en barra T':              'T Bar Row',
  'Cargada':                      'Clean',
  'Empuje de fuerza':             'Push Press',
  'Press de banca en multipower': 'Smith Machine Bench Press',
  'Press de banca declinado':     'Decline Bench Press',

  // Peso corporal
  'Dominadas':                    'Pull Ups',
  'Flexiones':                    'Push Ups',
  'Fondos':                       'Dips',
  'Dominadas supinas':            'Chin Ups',
  'Abdominales':                  'Crunches',
  'Abdominales sentado':          'Sit Ups',
  'Fondos en barra':              'Muscle Ups',
  'Sentadilla con el peso corporal':'Bodyweight Squat',
  'Flexiones con un brao':        'One Arm Push Ups',
  'Dominadas agarre neutro':      'Neutral Grip Pull Ups',
  'Flexiones para tríceps en suelo':'Diamond Push Ups',

  // Mancuerna
  'Press de banca con mancuernas':    'Dumbbell Bench Press',
  'Curl con mancuernas':              'Dumbbell Curl',
  'Press con mancuernas en banco inclinado': 'Incline Dumbbell Bench Press',
  'Press de hombros con mancuernas':  'Dumbbell Shoulder Press',
  'Elevaciones laterales con mancuernas': 'Dumbbell Lateral Raise',
  'Remo con mancuerna':               'Dumbbell Row',
  'Curl con mancuernas agarre martillo': 'Hammer Curl',
  'Press de hombro con mancuernas sentado': 'Seated Dumbbell Shoulder Press',
  'Sentadilla Búlgara con mancuernas':'Dumbbell Bulgarian Split Squat',
  'Sentadilla con mancuerna':         'Goblet Squat',
  'Aperturas con mancuernas':         'Dumbbell Fly',
  'Encogimientos con mancuernas':     'Dumbbell Shrug',

  // Máquina
  'Prensa inclinada':                 'Sled Leg Press',
  'Extensión de piernas':             'Leg Extension',
  'Prensa horizontal en máquina':     'Horizontal Leg Press',
  'Press de pecho en máquina vertical':'Chest Press',
  'Sentadilla Hack':                  'Hack Squat',
  'Press de hombros en máquina':      'Machine Shoulder Press',
  'Aperturas en máquina':             'Machine Chest Fly',
  'Curl femoral sentado':             'Seated Leg Curl',
  'Curl femoral tumbado':             'Lying Leg Curl',
  'Gemelo en máquina de pie':         'Machine Calf Raise',
  'Aductores en máquina':             'Hip Adduction',

  // Polea
  'Jalón dorsal':                     'Lat Pulldown',
  'Jalones de tríceps en polea':      'Tricep Pushdown',
  'Remo en polea sentado':            'Seated Cable Row',
};

// ============================================================
// MAPA MÚSCULO → EJERCICIOS (en inglés, clave = nombre EN)
// ============================================================
const EXERCISE_MUSCLE_MAP = {
  'Bench Press':              { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Squat':                    { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Isquiotibiales', 'Espalda Baja', 'Core'],      categoria: 'fuerza' },
  'Deadlift':                 { principal: ['Espalda Baja', 'Isquiotibiales', 'Glúteos'], secundario: ['Trampas', 'Antebrazos', 'Core'],  categoria: 'fuerza' },
  'Shoulder Press':           { principal: ['Hombros'],                  secundario: ['Tríceps'],                                      categoria: 'fuerza' },
  'Barbell Curl':             { principal: ['Bíceps'],                   secundario: ['Antebrazos'],                                   categoria: 'fuerza' },
  'Bent Over Row':            { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Espalda Baja'],                       categoria: 'fuerza' },
  'Incline Bench Press':      { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Front Squat':              { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Core', 'Espalda Baja'],                         categoria: 'fuerza' },
  'Hex Bar Deadlift':         { principal: ['Isquiotibiales', 'Glúteos'], secundario: ['Espalda Baja', 'Cuádriceps'],                  categoria: 'fuerza' },
  'Hip Thrust':               { principal: ['Glúteos'],                  secundario: ['Isquiotibiales', 'Espalda Baja'],               categoria: 'fuerza' },
  'Romanian Deadlift':        { principal: ['Isquiotibiales', 'Glúteos'], secundario: ['Espalda Baja', 'Antebrazos'],                  categoria: 'fuerza' },
  'Power Clean':              { principal: ['Glúteos', 'Isquiotibiales'], secundario: ['Hombros', 'Trampas', 'Cuádriceps'],            categoria: 'fuerza' },
  'Military Press':           { principal: ['Hombros'],                  secundario: ['Tríceps', 'Core'],                              categoria: 'fuerza' },
  'Sumo Deadlift':            { principal: ['Isquiotibiales', 'Glúteos'], secundario: ['Espalda Baja', 'Cuádriceps', 'Trampas'],      categoria: 'fuerza' },
  'Clean and Jerk':           { principal: ['Glúteos', 'Cuádriceps'],    secundario: ['Hombros', 'Tríceps', 'Espalda Baja'],           categoria: 'fuerza' },
  'EZ Bar Curl':              { principal: ['Bíceps'],                   secundario: ['Antebrazos'],                                   categoria: 'fuerza' },
  'Lying Tricep Extension':   { principal: ['Tríceps'],                  secundario: ['Hombros', 'Pecho'],                             categoria: 'fuerza' },
  'Close Grip Bench Press':   { principal: ['Tríceps'],                  secundario: ['Pecho', 'Hombros'],                             categoria: 'fuerza' },
  'Snatch':                   { principal: ['Glúteos', 'Isquiotibiales'], secundario: ['Hombros', 'Trampas', 'Cuádriceps'],            categoria: 'fuerza' },
  'Preacher Curl':            { principal: ['Bíceps'],                   secundario: ['Antebrazos'],                                   categoria: 'fuerza' },
  'Seated Shoulder Press':    { principal: ['Hombros'],                  secundario: ['Tríceps'],                                      categoria: 'fuerza' },
  'Barbell Shrug':            { principal: ['Trampas'],                  secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'T Bar Row':                { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Espalda Baja'],                       categoria: 'fuerza' },
  'Clean':                    { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Espalda Baja', 'Trampas'],                      categoria: 'fuerza' },
  'Push Press':               { principal: ['Hombros'],                  secundario: ['Tríceps', 'Cuádriceps'],                        categoria: 'fuerza' },
  'Smith Machine Bench Press': { principal: ['Pecho'],                   secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Decline Bench Press':      { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Pull Ups':                 { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Hombros'],                            categoria: 'fuerza' },
  'Push Ups':                 { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps', 'Core'],                   categoria: 'fuerza' },
  'Dips':                     { principal: ['Pecho', 'Tríceps'],         secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Chin Ups':                 { principal: ['Espalda Media', 'Bíceps'],  secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Crunches':                 { principal: ['Core'],                     secundario: [],                                               categoria: 'fuerza' },
  'Sit Ups':                  { principal: ['Core'],                     secundario: ['Flexores Cadera'],                              categoria: 'fuerza' },
  'Muscle Ups':               { principal: ['Espalda Media', 'Tríceps'], secundario: ['Pecho', 'Hombros', 'Bíceps'],                   categoria: 'fuerza' },
  'Bodyweight Squat':         { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Isquiotibiales', 'Core'],                       categoria: 'fuerza' },
  'One Arm Push Ups':         { principal: ['Pecho', 'Hombros'],         secundario: ['Tríceps', 'Core'],                              categoria: 'fuerza' },
  'Neutral Grip Pull Ups':    { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Hombros'],                            categoria: 'fuerza' },
  'Diamond Push Ups':         { principal: ['Tríceps', 'Pecho'],         secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Dumbbell Bench Press':     { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Dumbbell Curl':            { principal: ['Bíceps'],                   secundario: ['Antebrazos'],                                   categoria: 'fuerza' },
  'Incline Dumbbell Bench Press': { principal: ['Pecho'],                secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Dumbbell Shoulder Press':  { principal: ['Hombros'],                  secundario: ['Tríceps'],                                      categoria: 'fuerza' },
  'Dumbbell Lateral Raise':   { principal: ['Hombros'],                  secundario: ['Trampas'],                                      categoria: 'fuerza' },
  'Dumbbell Row':             { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Espalda Baja'],                       categoria: 'fuerza' },
  'Hammer Curl':              { principal: ['Bíceps', 'Antebrazos'],     secundario: [],                                               categoria: 'fuerza' },
  'Seated Dumbbell Shoulder Press': { principal: ['Hombros'],            secundario: ['Tríceps'],                                      categoria: 'fuerza' },
  'Dumbbell Bulgarian Split Squat': { principal: ['Cuádriceps', 'Glúteos'], secundario: ['Isquiotibiales', 'Core'],                    categoria: 'fuerza' },
  'Goblet Squat':             { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Core', 'Isquiotibiales'],                       categoria: 'fuerza' },
  'Dumbbell Fly':             { principal: ['Pecho'],                    secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Dumbbell Shrug':           { principal: ['Trampas'],                  secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Sled Leg Press':           { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Isquiotibiales'],                                categoria: 'fuerza' },
  'Leg Extension':            { principal: ['Cuádriceps'],               secundario: [],                                               categoria: 'fuerza' },
  'Horizontal Leg Press':     { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Isquiotibiales'],                                categoria: 'fuerza' },
  'Chest Press':              { principal: ['Pecho'],                    secundario: ['Hombros', 'Tríceps'],                          categoria: 'fuerza' },
  'Hack Squat':               { principal: ['Cuádriceps', 'Glúteos'],    secundario: ['Isquiotibiales'],                                categoria: 'fuerza' },
  'Machine Shoulder Press':   { principal: ['Hombros'],                  secundario: ['Tríceps'],                                      categoria: 'fuerza' },
  'Machine Chest Fly':        { principal: ['Pecho'],                    secundario: ['Hombros'],                                      categoria: 'fuerza' },
  'Seated Leg Curl':          { principal: ['Isquiotibiales'],           secundario: ['Glúteos'],                                      categoria: 'fuerza' },
  'Lying Leg Curl':           { principal: ['Isquiotibiales'],           secundario: ['Glúteos'],                                      categoria: 'fuerza' },
  'Machine Calf Raise':       { principal: ['Gemelos'],                  secundario: [],                                               categoria: 'fuerza' },
  'Hip Adduction':            { principal: ['Aductores'],                secundario: [],                                               categoria: 'fuerza' },
  'Lat Pulldown':             { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Hombros'],                            categoria: 'fuerza' },
  'Tricep Pushdown':          { principal: ['Tríceps'],                  secundario: [],                                               categoria: 'fuerza' },
  'Seated Cable Row':         { principal: ['Espalda Media'],            secundario: ['Bíceps', 'Espalda Baja'],                       categoria: 'fuerza' },
};

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

function nameToSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñ]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escSQL(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// ============================================================
// SCRAPER PRINCIPAL
// ============================================================

async function scrapeExercises() {
  console.log('🌐 Fetching', STANDARDS_URL, '...');

  try {
    const response = await axios.get(STANDARDS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const exercisesByEquipment = {};
    const equipmentCategories = ['Barra', 'Peso corporal', 'Mancuerna', 'Máquina', 'Polea'];

    for (const eq of equipmentCategories) {
      exercisesByEquipment[eq] = [];
    }

    $('h2, h3').each((i, el) => {
      const text = $(el).text().trim();
      const match = equipmentCategories.find(eq =>
        text.toLowerCase().includes(eq.toLowerCase())
      );
      if (match) {
        let current = $(el).next();
        let found = [];
        while (current.length && !current.is('h2, h3')) {
          current.find('a').each((j, a) => {
            const exerciseName = $(a).text().trim();
            if (exerciseName && exerciseName.length > 1) {
              found.push(exerciseName);
            }
          });
          current = current.next();
        }
        exercisesByEquipment[match] = found;
      }
    });

    const totalScraped = Object.values(exercisesByEquipment).reduce((s, arr) => s + arr.length, 0);

    for (const [eq, list] of Object.entries(exercisesByEquipment)) {
      console.log(`   ${eq}: ${list.length} ejercicios`);
    }
    console.log(`\n✅ Total ejercicios encontrados: ${totalScraped}`);

    return totalScraped > 0 ? exercisesByEquipment : null;
  } catch (err) {
    console.error('❌ Error fetching page:', err.message);
    return null;
  }
}

// ============================================================
// LISTA OFFLINE (fallback)
// ============================================================

function getOfflineList() {
  return {
    'Barra': [
      'Press de banca', 'Sentadilla', 'Peso muerto', 'Press de hombro', 'Curl con barra',
      'Remo con barra', 'Press de banca inclinado', 'Sentadilla frontal',
      'Peso muerto con barra hexagonal', 'Empuje de cadera', 'Peso muerto rumano',
      'Cargada de potencia', 'Press militar con barra de pie', 'Peso Muerto estilo Sumo',
      'Cargada de dos tiempos', 'Curl con barra Z', 'Extensión de tríceps en banca',
      'Press de banca agarre cerrado', 'Arrancada', 'Curl predicador con mancuernas',
      'Press de hombro sentado', 'Encogimientos con barra', 'Remo en barra T',
      'Cargada', 'Empuje de fuerza', 'Press de banca en multipower', 'Press de banca declinado',
    ],
    'Peso corporal': [
      'Dominadas', 'Flexiones', 'Fondos', 'Dominadas supinas', 'Abdominales',
      'Abdominales sentado', 'Fondos en barra', 'Sentadilla con el peso corporal',
      'Flexiones con un brao', 'Dominadas agarre neutro', 'Flexiones para tríceps en suelo',
    ],
    'Mancuerna': [
      'Press de banca con mancuernas', 'Curl con mancuernas',
      'Press con mancuernas en banco inclinado', 'Press de hombros con mancuernas',
      'Elevaciones laterales con mancuernas', 'Remo con mancuerna',
      'Curl con mancuernas agarre martillo', 'Press de hombro con mancuernas sentado',
      'Sentadilla Búlgara con mancuernas', 'Sentadilla con mancuerna',
      'Aperturas con mancuernas', 'Encogimientos con mancuernas',
    ],
    'Máquina': [
      'Prensa inclinada', 'Extensión de piernas', 'Prensa horizontal en máquina',
      'Press de pecho en máquina vertical', 'Sentadilla Hack',
      'Press de hombros en máquina', 'Aperturas en máquina', 'Curl femoral sentado',
      'Curl femoral tumbado', 'Gemelo en máquina de pie', 'Aductores en máquina',
    ],
    'Polea': [
      'Jalón dorsal', 'Jalones de tríceps en polea', 'Remo en polea sentado',
    ],
  };
}

// ============================================================
// LIMPIAR ICONOS VIEJOS
// ============================================================

function cleanOldIcons() {
  // Los iconos viejos son los .jpg que descargó la versión anterior.
  // Solo borramos los que coinciden con slugs en inglés (los iconos).
  // NO borramos elevaciones_laterales_mancuernas.jpg (existía antes).
  const keptFiles = ['elevaciones_laterales_mancuernas.jpg'];
  let deleted = 0;

  if (fs.existsSync(IMAGE_DIR)) {
    const files = fs.readdirSync(IMAGE_DIR);
    for (const file of files) {
      if (file.endsWith('.jpg') && !keptFiles.includes(file)) {
        fs.unlinkSync(path.join(IMAGE_DIR, file));
        deleted++;
      }
    }
  }

  console.log(`🗑️  Iconos viejos eliminados: ${deleted}`);
}

// ============================================================
// GENERAR SQL (con nombres en español)
// ============================================================

function generateSQL(exercisesByEquipment) {
  const lines = [];
  const timestamp = new Date().toISOString().split('T')[0];

  lines.push('-- ============================================================');
  lines.push('-- seed.sql — Generado por seedScraper.js');
  lines.push(`-- Fecha: ${timestamp}`);
  lines.push(`-- Fuente: ${STANDARDS_URL} (español)`);
  lines.push('-- ============================================================');
  // NOTA: No dejar línea vacía después del último comentario antes del primer
  // INSERT.  El script de importación usa split(';') y filtra líneas que
  // empiezan con '--', así que el primer INSERT debe estar en su propio segmento.
  lines.push('');

  // Colectar y ordenar músculos
  const allMuscles = new Set();
  const existingMuscles = ['Hombros', 'Tríceps', 'Pecho'];

  for (const eq of Object.values(exercisesByEquipment)) {
    for (const name of eq) {
      const enName = ES_TO_EN[name];
      const data = enName ? EXERCISE_MUSCLE_MAP[enName] : null;
      if (data) {
        for (const m of data.principal) allMuscles.add(m);
        for (const m of data.secundario) allMuscles.add(m);
      }
    }
  }

  const sortedMuscles = [];
  for (const m of existingMuscles) {
    if (allMuscles.has(m)) {
      sortedMuscles.push(m);
      allMuscles.delete(m);
    }
  }
  const newMuscles = Array.from(allMuscles).sort();
  sortedMuscles.push(...newMuscles);

  lines.push('-- GRUPOS MUSCULARES');
  const muscleIds = {};
  sortedMuscles.forEach((m, i) => {
    const id = i + 1;
    muscleIds[m] = id;
    lines.push(`INSERT INTO grupos_musculares (id, nombre) VALUES (${id}, ${escSQL(m)});`);
  });

  lines.push('');
  lines.push('-- EJERCICIOS + EJERCICIOS_GRUPOS_MUSCULARES');
  lines.push('');

  let ejercicioId = 0;
  let relId = 0;
  const equipmentOrder = ['Barra', 'Peso corporal', 'Mancuerna', 'Máquina', 'Polea'];
  const equipmentNames = {
    'Barra': 'barra',
    'Peso corporal': 'peso corporal',
    'Mancuerna': 'mancuerna',
    'Máquina': 'máquina',
    'Polea': 'polea',
  };

  for (const eq of equipmentOrder) {
    const exercises = exercisesByEquipment[eq] || [];
    for (const name of exercises) {
      const enName = ES_TO_EN[name];
      if (!enName) {
        console.log(`   ⚠️  Sin mapeo ES→EN: "${name}" — se omite`);
        continue;
      }
      const data = EXERCISE_MUSCLE_MAP[enName];
      if (!data) {
        console.log(`   ⚠️  Sin mapping muscular: "${enName}" — se omite`);
        continue;
      }

      ejercicioId++;
      const enSlug = nameToSlug(enName);
      const imagenUrl = `${enSlug}.avif`;

      lines.push(`INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)`);
      const descripcion = `Ejercicio de ${equipmentNames[eq] || eq} para ${data.principal.join(', ')}.`;
      lines.push(`VALUES (${ejercicioId}, ${escSQL(name)}, ${escSQL(descripcion)}, ${escSQL(data.categoria)}, ${escSQL(imagenUrl)});`);

      for (const m of data.principal) {
        relId++;
        lines.push(`INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)`);
        lines.push(`VALUES (${relId}, ${ejercicioId}, ${muscleIds[m]}, 'principal');`);
      }
      for (const m of data.secundario) {
        relId++;
        lines.push(`INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)`);
        lines.push(`VALUES (${relId}, ${ejercicioId}, ${muscleIds[m]}, 'secundario');`);
      }
    }
  }

  lines.push('');
  lines.push('-- FIN DEL SEED');
  return lines.join('\n');
}

// ============================================================
// DESCARGA DE IMÁGENES .avif (grandes, a color)
// ============================================================

async function downloadImages(exercisesByEquipment) {
  if (!fs.existsSync(IMAGE_DIR)) {
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
  }

  const downloadQueue = [];

  for (const eq of Object.values(exercisesByEquipment)) {
    for (const name of eq) {
      const enName = ES_TO_EN[name];
      if (!enName) continue;

      const enSlug = nameToSlug(enName);
      const imgUrl = `${IMAGE_BASE_URL}/${enSlug}/${enSlug}-400.avif`;
      const imgPath = path.join(IMAGE_DIR, `${enSlug}.avif`);

      if (fs.existsSync(imgPath)) {
        console.log(`   ⏭️  ${enSlug}.avif ya existe`);
        continue;
      }

      downloadQueue.push({ name: enName, slug: enSlug, imgUrl, imgPath });
    }
  }

  if (downloadQueue.length === 0) {
    console.log('   📦 No hay imágenes nuevas para descargar.');
    return;
  }

  console.log(`\n📥 Descargando ${downloadQueue.length} imágenes a color (.avif)...`);

  // Descargar con concurrencia limitada (5 a la vez)
  const CONCURRENCY = 5;
  let ok = 0, fail = 0;

  async function downloadOne(item) {
    try {
      const resp = await axios.get(item.imgUrl, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      fs.writeFileSync(item.imgPath, resp.data);
      console.log(`   ✅ ${item.slug}.avif`);
      return true;
    } catch (err) {
      console.log(`   ⚠️  ${item.slug}.avif — ${err.message}`);
      return false;
    }
  }

  for (let i = 0; i < downloadQueue.length; i += CONCURRENCY) {
    const batch = downloadQueue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(downloadOne));
    ok += results.filter(Boolean).length;
    fail += results.filter(r => !r).length;
  }

  console.log(`\n📊 Imágenes: ${ok} descargadas, ${fail} fallidas`);
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  seedScraper.js — Strength Level ES (español)');
  console.log('═══════════════════════════════════════════════\n');

  // 1. Scrape Spanish page
  let exercisesByEquipment = await scrapeExercises();
  if (!exercisesByEquipment) {
    console.log('\n📋 Usando lista offline...\n');
    exercisesByEquipment = getOfflineList();
    for (const [eq, list] of Object.entries(exercisesByEquipment)) {
      console.log(`   ${eq}: ${list.length} ejercicios`);
    }
  }

  // 2. Delete old icon .jpgs
  console.log('\n🗑️  Limpiando iconos viejos...');
  cleanOldIcons();

  // 3. Generate SQL (spanish names)
  console.log('\n📝 Generando seed.sql ...');
  const sql = generateSQL(exercisesByEquipment);
  fs.writeFileSync(OUTPUT_SQL, sql, 'utf-8');
  console.log(`   ✅ seed.sql generado (${(sql.length / 1024).toFixed(1)} KB)`);

  // 4. Download .avif images
  console.log('\n🖼️  Descargando imágenes a color...');
  await downloadImages(exercisesByEquipment);

  // 5. Summary
  const totalExercises = Object.values(exercisesByEquipment)
    .reduce((s, arr) => s + arr.length, 0);
  const mappedExercises = Object.values(exercisesByEquipment)
    .reduce((s, arr) => s + arr.filter(n => ES_TO_EN[n] && EXERCISE_MUSCLE_MAP[ES_TO_EN[n]]).length, 0);

  console.log('\n═══════════════════════════════════════════════');
  console.log('  📊 RESUMEN');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Ejercicios encontrados:  ${totalExercises}`);
  console.log(`  Ejercicios con mapping:  ${mappedExercises}`);
  console.log(`  seed.sql generado en:    ${OUTPUT_SQL}`);
  console.log(`  Imágenes .avif en:       ${IMAGE_DIR}`);
  console.log('');
  console.log('  ▶  Para importar a MySQL:');
  console.log('     node -e "require(\\"dotenv\\").config(); require(\\"./src/config/db\\")..."');
  console.log('     (o simplemente reiniciá el servidor que ya se importa solo)');
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n❌ Error fatal:', err.message);
  process.exit(1);
});
