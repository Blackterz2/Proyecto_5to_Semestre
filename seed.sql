-- ============================================================
-- seed.sql — Generado por seedScraper.js
-- Fecha: 2026-06-08
-- Fuente: https://strengthlevel.es/estandares-de-fuerza (español)
-- ============================================================

-- GRUPOS MUSCULARES
INSERT INTO grupos_musculares (id, nombre) VALUES (1, 'Hombros');
INSERT INTO grupos_musculares (id, nombre) VALUES (2, 'Tríceps');
INSERT INTO grupos_musculares (id, nombre) VALUES (3, 'Pecho');
INSERT INTO grupos_musculares (id, nombre) VALUES (4, 'Aductores');
INSERT INTO grupos_musculares (id, nombre) VALUES (5, 'Antebrazos');
INSERT INTO grupos_musculares (id, nombre) VALUES (6, 'Bíceps');
INSERT INTO grupos_musculares (id, nombre) VALUES (7, 'Core');
INSERT INTO grupos_musculares (id, nombre) VALUES (8, 'Cuádriceps');
INSERT INTO grupos_musculares (id, nombre) VALUES (9, 'Espalda Baja');
INSERT INTO grupos_musculares (id, nombre) VALUES (10, 'Espalda Media');
INSERT INTO grupos_musculares (id, nombre) VALUES (11, 'Flexores Cadera');
INSERT INTO grupos_musculares (id, nombre) VALUES (12, 'Gemelos');
INSERT INTO grupos_musculares (id, nombre) VALUES (13, 'Glúteos');
INSERT INTO grupos_musculares (id, nombre) VALUES (14, 'Isquiotibiales');
INSERT INTO grupos_musculares (id, nombre) VALUES (15, 'Trampas');

-- EJERCICIOS + EJERCICIOS_GRUPOS_MUSCULARES

INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (1, 'Press de banca', '1. Acostate en el banco plano con los pies firmes en el piso.\n2. Agarrá la barra con las manos un poco más separadas que el ancho de los hombros (agarre prono).\n3. Desenganchá la barra y mantenela sobre el pecho con brazos extendidos.\n4. Inhalá y bajá la barra controladamente hasta que toque el pecho, manteniendo los codos a 45° del cuerpo.\n5. Exhalá y empujá la barra hacia arriba hasta extender los brazos sin bloquear los codos.\n6. Repetí.', 'fuerza', 'bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (1, 1, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (2, 1, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (3, 1, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (2, 'Sentadilla', '1. Ubicá la barra sobre los trapecios y separá los pies al ancho de los hombros.\n2. Inhalá, bajá la cadera hacia atrás y abajo como si te sentaras, manteniendo el pecho arriba.\n3. Exhalá y empujá el piso con los talones para volver a la posición inicial sin meter las rodillas hacia adentro.', 'fuerza', 'squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (4, 2, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (5, 2, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (6, 2, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (7, 2, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (8, 2, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (3, 'Peso muerto', '1. Parate con los pies al ancho de las caderas y la barra pegada a las tibias.\n2. Agarrá la barra por fuera de las rodillas, bajá la cadera y sacá pecho.\n3. Inhalá, apretá el core y empujá el piso con las piernas mientras levantás el torso.\n4. Exhalá arriba, apretando glúteos sin arquear la espalda baja.', 'fuerza', 'deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (9, 3, 9, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (10, 3, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (11, 3, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (12, 3, 15, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (13, 3, 5, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (14, 3, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (4, 'Press de hombro', '1. Agarrá la barra un poco más ancho que tus hombros y apoyala en las clavículas.\n2. Apretá el abdomen, inhalá y empujá la barra hacia arriba en línea recta.\n3. Exhalá al bloquear los codos y pasá la cabeza ligeramente hacia adelante.\n4. Bajá la barra controladamente a la posición inicial.', 'fuerza', 'shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (15, 4, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (16, 4, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (5, 'Curl con barra', '1. Parate derecho, agarrá la barra al ancho de los hombros con agarre supino (palmas hacia arriba).\n2. Pegá los codos a las costillas y mantenelos fijos durante todo el movimiento.\n3. Inhalá y subí la barra contrayendo los bíceps sin balancear el torso.\n4. Exhalá y bajá controladamente hasta extender los brazos por completo.', 'fuerza', 'barbell-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (17, 5, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (18, 5, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (6, 'Remo con barra', '1. Flexioná un poco las rodillas e incliná el torso hacia adelante casi paralelo al piso, manteniendo la espalda recta.\n2. Agarrá la barra con las palmas hacia abajo (prono).\n3. Inhalá y tirá de la barra hacia el ombligo, juntando las escápulas fuerte atrás.\n4. Exhalá y bajá la barra estirando los brazos por completo.', 'fuerza', 'bent-over-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (19, 6, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (20, 6, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (21, 6, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (7, 'Press de banca inclinado', '1. Acostate en el banco inclinado (30°-45°) con los pies firmes en el piso y retracción escapular.\n2. Agarrá la barra un poco más ancho que tus hombros y desenganchala.\n3. Inhalá y bajá la barra controladamente hasta la parte alta del pecho.\n4. Exhalá y empujá hacia arriba con fuerza sin despegar la espalda.', 'fuerza', 'incline-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (22, 7, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (23, 7, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (24, 7, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (8, 'Sentadilla frontal', '1. Apoyá la barra sobre la parte frontal de los hombros, levantando los codos lo más que puedas apuntando al frente.\n2. Inhalá, bajá profundo manteniendo el torso bien vertical y los codos arriba.\n3. Exhalá y empujá con los cuádriceps para volver a pararte de forma explosiva.', 'fuerza', 'front-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (25, 8, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (26, 8, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (27, 8, 7, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (28, 8, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (9, 'Peso muerto con barra hexagonal', '1. Parate dentro de la barra hexagonal y bajá la cadera para agarrar las manijas.\n2. Sacá pecho, mantené la espalda recta y mirá al frente.\n3. Inhalá, apretá el core y empujá el piso con las piernas como si hicieras una prensa.\n4. Exhalá al extender cadera y rodillas, bloqueando arriba.', 'fuerza', 'hex-bar-deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (29, 9, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (30, 9, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (31, 9, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (32, 9, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (10, 'Empuje de cadera', '1. Apoyá la parte superior de la espalda en el banco y colocá la barra sobre el pliegue de la cadera.\n2. Separá los pies al ancho de los hombros (rodillas a 90° en la parte alta).\n3. Inhalá, bajá la cadera controladamente y empujá con fuerza hacia arriba usando los talones.\n4. Exhalá y apretá los glúteos un segundo en la posición más alta.', 'fuerza', 'hip-thrust.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (33, 10, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (34, 10, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (35, 10, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (11, 'Peso muerto rumano', '1. Sostené la barra a la altura de la cadera con los pies al ancho de los hombros.\n2. Destrabá un poco las rodillas pero mantenelas fijas en esa posición.\n3. Inhalá y empujá la cadera bien hacia atrás, bajando la barra pegada a las piernas hasta sentir el tirón en los isquiotibiales.\n4. Exhalá y empujá la cadera hacia adelante para volver a pararte.', 'fuerza', 'romanian-deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (36, 11, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (37, 11, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (38, 11, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (39, 11, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (12, 'Cargada de potencia', '1. Parate con los pies al ancho de las caderas y agarrá la barra con agarre prono por fuera de las rodillas.\n2. Inhalá, levantá la barra de forma explosiva extendiendo cadera, rodillas y tobillos.\n3. Exhalá, metete rápido debajo de la barra rotando los codos hacia adelante y recibila en los hombros.', 'fuerza', 'power-clean.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (40, 12, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (41, 12, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (42, 12, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (43, 12, 15, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (44, 12, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (13, 'Press militar con barra de pie', '1. Parate derecho, agarrá la barra un poco más ancho que los hombros y apoyala en las clavículas.\n2. Apretá fuerte los glúteos y el abdomen para estabilizar el torso.\n3. Inhalá y empujá la barra hacia arriba en línea recta, pasando la cabeza hacia adelante al bloquear.\n4. Exhalá y bajá controladamente hasta la posición inicial.', 'fuerza', 'military-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (45, 13, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (46, 13, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (47, 13, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (14, 'Peso Muerto estilo Sumo', '1. Separá los pies bien anchos con las puntas hacia afuera y bajá la cadera manteniendo la espalda recta.\n2. Agarrá la barra por dentro de las piernas con los brazos completamente extendidos.\n3. Inhalá y empujá el piso hacia afuera con los pies, levantando el torso y la barra al mismo tiempo.\n4. Exhalá y apretá los glúteos al extenderte por completo arriba.', 'fuerza', 'sumo-deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (48, 14, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (49, 14, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (50, 14, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (51, 14, 8, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (52, 14, 15, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (15, 'Cargada de dos tiempos', '1. Hacé una cargada explosiva llevando la barra desde el piso hasta los hombros (Clean).\n2. Inhalá, hacé una pequeña flexión de rodillas y empujá la barra hacia arriba con fuerza (Jerk).\n3. Exhalá mientras te metés debajo de la barra bloqueando los codos, moviendo los pies en tijera o a los lados.\n4. Recuperá la posición de pie con la barra controlada sobre la cabeza.', 'fuerza', 'clean-and-jerk.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (53, 15, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (54, 15, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (55, 15, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (56, 15, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (57, 15, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (16, 'Curl con barra Z', '1. Agarrá la barra Z por las curvas interiores (agarre semi-supino) para cuidar las muñecas.\n2. Parate derecho, pegá los codos a las costillas y mantenelos fijos ahí.\n3. Inhalá y subí la barra contrayendo los bíceps sin balancear la espalda.\n4. Exhalá y bajá lento hasta extender los brazos casi por completo.', 'fuerza', 'ez-bar-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (58, 16, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (59, 16, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (17, 'Extensión de tríceps en banca', '1. Acostate en el banco plano sosteniendo la barra con los brazos extendidos sobre el pecho.\n2. Inhalá y bajá la barra flexionando solo los codos hasta que llegue cerca de tu frente.\n3. Mantené los codos apuntando siempre hacia arriba, sin que se abran hacia los lados.\n4. Exhalá y empujá la barra de vuelta a la posición inicial contrayendo fuerte los tríceps.', 'fuerza', 'lying-tricep-extension.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (60, 17, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (61, 17, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (62, 17, 3, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (18, 'Press de banca agarre cerrado', '1. Acostate en el banco y agarrá la barra con una separación igual al ancho de tus hombros.\n2. Inhalá y bajá la barra hacia la parte baja del pecho, manteniendo los codos bien pegados al cuerpo.\n3. Exhalá y empujá la barra con fuerza hacia arriba enfocando el esfuerzo en los tríceps.\n4. Mantené la espalda alta apoyada y las escápulas retraídas en todo momento.', 'fuerza', 'close-grip-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (63, 18, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (64, 18, 3, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (65, 18, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (19, 'Arrancada', '1. Parate frente a la barra, bajá la cadera y tomala con un agarre bien amplio.\n2. Inhalá y realizá un tirón explosivo extendiendo el cuerpo por completo hacia arriba.\n3. Exhalá y metete rápido debajo de la barra, recibiéndola con los brazos estirados en posición de sentadilla profunda.\n4. Parate por completo manteniendo la barra bloqueada sobre la cabeza.', 'fuerza', 'snatch.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (66, 19, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (67, 19, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (68, 19, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (69, 19, 15, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (70, 19, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (20, 'Curl predicador con mancuernas', '1. Sentate en el banco predicador y apoyá la parte posterior de los brazos firme sobre el cojín.\n2. Agarrá el peso con las palmas hacia arriba y bajá controladamente al inhalar.\n3. Exhalá y subí contrayendo los bíceps, sin despegar los brazos del soporte.\n4. Hacé el movimiento completo sin hiper-extender los codos abajo.', 'fuerza', 'preacher-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (71, 20, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (72, 20, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (21, 'Press de hombro sentado', '1. Sentate en un banco con respaldo a 90° y agarrá la barra a la altura de los hombros.\n2. Apoyá bien la espalda en el banco, plantá los pies en el piso y sacá pecho.\n3. Inhalá y empujá el peso recto hacia arriba hasta casi bloquear los codos.\n4. Exhalá y bajá controladamente hasta la posición inicial sin dejar caer el peso.', 'fuerza', 'seated-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (73, 21, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (74, 21, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (22, 'Encogimientos con barra', '1. Parate derecho y agarrá la barra con las manos al ancho de los hombros (agarre prono).\n2. Inhalá y encogé los hombros hacia las orejas lo más alto posible, manteniendo los brazos estirados.\n3. Sostené la contracción un segundo arriba sin rodar los hombros.\n4. Exhalá y bajá el peso controladamente a la posición inicial.', 'fuerza', 'barbell-shrug.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (75, 22, 15, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (76, 22, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (23, 'Remo en barra T', '1. Parate sobre la plataforma, flexioná un poco las rodillas e incliná el torso manteniendo la espalda recta.\n2. Agarrá las manijas de la barra T con firmeza y sacá pecho.\n3. Inhalá y tirá del peso hacia tu abdomen, juntando las escápulas fuerte en la parte alta.\n4. Exhalá y bajá el peso controladamente hasta estirar los brazos.', 'fuerza', 't-bar-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (77, 23, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (78, 23, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (79, 23, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (24, 'Cargada', '1. Agarrá la barra desde el piso con las manos por fuera de las rodillas, cadera baja y espalda recta.\n2. Inhalá y realizá un tirón explosivo hacia arriba extendiendo cadera, rodillas y tobillos al mismo tiempo.\n3. Metete rápido debajo de la barra rotando los codos hacia adelante para recibirla sobre los hombros frontales.\n4. Exhalá y parate por completo para estabilizar el peso.', 'fuerza', 'clean.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (80, 24, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (81, 24, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (82, 24, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (83, 24, 15, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (25, 'Empuje de fuerza', '1. Apoyá la barra sobre tus clavículas y hombros frontales, con los pies al ancho de las caderas.\n2. Inhalá, hacé una pequeña y rápida flexión de rodillas manteniendo el torso bien derecho.\n3. Exhalá y empujá el piso explosivamente con las piernas para lanzar la barra hacia arriba.\n4. Bloqueá los codos sobre la cabeza y bajá la barra controladamente.', 'fuerza', 'push-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (84, 25, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (85, 25, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (86, 25, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (26, 'Press de banca en multipower', '1. Acostate en el banco de la máquina Smith asegurando que la barra baje a la altura del medio del pecho.\n2. Agarrá la barra, desenganchala con un giro de muñeca y mantené las escápulas retraídas.\n3. Inhalá y bajá la barra de forma controlada hasta rozar el pecho.\n4. Exhalá y empujá con fuerza hacia arriba sin despegar la espalda baja del banco.', 'fuerza', 'smith-machine-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (87, 26, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (88, 26, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (89, 26, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (27, 'Press de banca declinado', '1. Acostate en el banco declinado y trabá bien los pies en los rodillos para estar estable.\n2. Desenganchá la barra con un agarre un poco más ancho que tus hombros.\n3. Inhalá y bajá la barra controladamente hacia la parte baja de tu pecho (zona inferior).\n4. Exhalá y empujá con fuerza hacia arriba, manteniendo la tensión en los pectorales.', 'fuerza', 'decline-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (90, 27, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (91, 27, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (92, 27, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (28, 'Dominadas', '1. Colgáte de la barra con las manos más separadas que el ancho de los hombros (agarre prono).\n2. Inhalá, sacá pecho y tirá de la barra hacia abajo juntando las escápulas.\n3. Exhalá al pasar el mentón por encima de la barra.\n4. Bajá de forma controlada hasta extender los brazos por completo.', 'fuerza', 'pull-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (93, 28, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (94, 28, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (95, 28, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (29, 'Flexiones', '1. Apoyá las manos en el piso al ancho de los hombros y extendé las piernas, apretando fuerte el abdomen.\n2. Inhalá y bajá el cuerpo en bloque hasta que el pecho roce el piso.\n3. Mantené los codos a 45 grados de tu torso, sin abrirlos en forma de T.\n4. Exhalá y empujá el piso con fuerza para volver a la posición inicial.', 'fuerza', 'push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (96, 29, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (97, 29, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (98, 29, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (99, 29, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (30, 'Fondos', '1. Agarrá las barras paralelas y suspendé tu cuerpo con los brazos estirados y el torso inclinado un poco hacia adelante.\n2. Inhalá y bajá controladamente hasta que tus hombros estén por debajo de los codos.\n3. Exhalá y empujá con fuerza para subir, concentrando el esfuerzo en el pecho y los tríceps.', 'fuerza', 'dips.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (100, 30, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (101, 30, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (102, 30, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (31, 'Dominadas supinas', '1. Colgáte de la barra con las palmas mirando hacia vos (agarre supino), al ancho de los hombros.\n2. Inhalá, apretá el core y subí tirando de la barra hasta que la parte alta del pecho casi la toque.\n3. Exhalá arriba y bajá lento hasta estirar bien los bíceps y la espalda.', 'fuerza', 'chin-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (103, 31, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (104, 31, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (105, 31, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (32, 'Abdominales', '1. Acostate boca arriba con las rodillas flexionadas, los pies en el piso y las manos a los lados de la cabeza.\n2. Exhalá y enrollá la columna despegando solo la parte alta de la espalda, apretando el abdomen.\n3. Inhalá y bajá lento sin llegar a relajar la tensión en la zona media en ningún momento.', 'fuerza', 'crunches.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (106, 32, 7, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (33, 'Abdominales sentado', '1. Acostate boca arriba con las rodillas flexionadas y los pies firmes en el piso.\n2. Exhalá y levantá todo el torso hasta quedar sentado, usando la fuerza del abdomen y no el impulso de los brazos.\n3. Inhalá y desenrollá la espalda controladamente, apoyando vértebra por vértebra hasta el piso.', 'fuerza', 'sit-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (107, 33, 7, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (108, 33, 11, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (34, 'Fondos en barra', '1. Subite a una barra recta apoyando las manos al ancho de los hombros y los brazos extendidos (torso sobre la barra).\n2. Inhalá, inclinate ligeramente hacia adelante y bajá hasta que la parte baja del pecho toque la barra.\n3. Exhalá y empujá explosivamente hacia arriba para bloquear los codos otra vez.', 'fuerza', 'muscle-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (109, 34, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (110, 34, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (111, 34, 3, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (112, 34, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (113, 34, 6, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (35, 'Sentadilla con el peso corporal', '1. Separá los pies al ancho de los hombros con las puntas ligeramente apuntando hacia afuera.\n2. Inhalá y bajá la cadera hacia atrás y abajo, manteniendo el pecho erguido y la espalda recta.\n3. Bajá hasta romper el paralelo (cadera por debajo de las rodillas) sin levantar los talones.\n4. Exhalá y empujá el piso para pararte, apretando glúteos arriba.', 'fuerza', 'bodyweight-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (114, 35, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (115, 35, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (116, 35, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (117, 35, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (36, 'Flexiones con un brao', '1. Separá las piernas más del ancho de tus hombros para tener una base estable y apoyá una sola mano centrada debajo del pecho.\n2. Llevá la otra mano a la espalda y apretá el abdomen y los glúteos al máximo.\n3. Inhalá y bajá controladamente manteniendo el codo pegado al cuerpo.\n4. Exhalá y empujá el piso con fuerza explosiva para subir, evitando rotar demasiado el torso.', 'fuerza', 'one-arm-push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (118, 36, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (119, 36, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (120, 36, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (121, 36, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (37, 'Dominadas agarre neutro', '1. Agarrá los soportes paralelos (palmas mirándose entre sí) y colgáte con los brazos estirados.\n2. Inhalá, sacá pecho y tirá hacia arriba enfocándote en usar los dorsales y bíceps.\n3. Exhalá al pasar la cabeza por encima del nivel de las manos.\n4. Bajá de forma controlada sin dejarte caer.', 'fuerza', 'neutral-grip-pull-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (122, 37, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (123, 37, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (124, 37, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (38, 'Flexiones para tríceps en suelo', '1. Apoyá las manos juntas en el piso debajo del pecho, formando un diamante con índices y pulgares (o cerradas al ancho de hombros).\n2. Inhalá y bajá el cuerpo recto en bloque, rozando los codos contra tus costillas.\n3. Exhalá y empujá hacia arriba extendiendo los brazos por completo, contrayendo fuerte los tríceps.', 'fuerza', 'diamond-push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (125, 38, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (126, 38, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (127, 38, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (39, 'Press de banca con mancuernas', '1. Acostate en el banco plano con una mancuerna en cada mano sobre el pecho y los brazos extendidos.\n2. Inhalá y bajá las mancuernas controladamente a los lados del pecho, formando un ángulo de 45° con los codos.\n3. Exhalá y empujá hacia arriba, juntando ligeramente las mancuernas al final del movimiento.', 'fuerza', 'dumbbell-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (128, 39, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (129, 39, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (130, 39, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (40, 'Curl con mancuernas', '1. Parate derecho sosteniendo una mancuerna en cada mano a los lados con agarre supino (palmas hacia el frente).\n2. Pegá los codos a las costillas, inhalá y subí las mancuernas contrayendo los bíceps.\n3. Exhalá y bajá lento hasta extender casi por completo, evitando balancear la espalda.', 'fuerza', 'dumbbell-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (131, 40, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (132, 40, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (41, 'Press con mancuernas en banco inclinado', '1. Acostate en el banco a 30°-45° con las mancuernas apoyadas sobre el pecho.\n2. Inhalá y bajá las mancuernas hacia los lados hasta sentir el estiramiento en la parte alta del pectoral.\n3. Exhalá y empujá fuerte hacia arriba alineándolas sobre tus hombros en la parte más alta.', 'fuerza', 'incline-dumbbell-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (133, 41, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (134, 41, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (135, 41, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (42, 'Press de hombros con mancuernas', '1. Parate derecho con los pies al ancho de hombros, agarrando las mancuernas a la altura de las orejas.\n2. Apretá fuerte el core y los glúteos, inhalá y empujá las mancuernas recto hacia arriba.\n3. Exhalá al bloquear los codos y bajá controladamente sin dejar caer el peso de golpe.', 'fuerza', 'dumbbell-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (136, 42, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (137, 42, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (43, 'Elevaciones laterales con mancuernas', '1. Parate con las mancuernas a los lados, rodillas apenas destrabadas y el pecho arriba.\n2. Inhalá y elevá los brazos hacia los costados hasta la altura de los hombros, manteniendo una leve flexión en los codos (como sirviendo agua de una jarra).\n3. Exhalá y bajá aguantando la fase excéntrica.', 'fuerza', 'dumbbell-lateral-raise.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (138, 43, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (139, 43, 15, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (44, 'Remo con mancuerna', '1. Apoyá una rodilla y la mano del mismo lado en un banco plano, dejando tu espalda paralela al piso.\n2. Agarrá la mancuerna con la otra mano y dejá caer el brazo estirado.\n3. Inhalá y tirá de la mancuerna hacia tu cadera, juntando la escápula atrás.\n4. Exhalá y bajá el peso controladamente hasta estirar el dorsal.', 'fuerza', 'dumbbell-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (140, 44, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (141, 44, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (142, 44, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (45, 'Curl con mancuernas agarre martillo', '1. Parate sosteniendo las mancuernas a los lados con las palmas mirándose entre sí (agarre neutro).\n2. Manteniendo ese agarre de martillo y los codos fijos, inhalá y subí el peso apuntando hacia tus hombros.\n3. Exhalá y bajá estirando los brazos sin perder la tensión en ningún momento.', 'fuerza', 'hammer-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (143, 45, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (144, 45, 5, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (46, 'Press de hombro con mancuernas sentado', '1. Sentate en un banco con respaldo a 90° y apoyá bien toda la espalda.\n2. Subí las mancuernas a la altura de los hombros con las palmas hacia adelante y sacá pecho.\n3. Inhalá y empujá hacia arriba hasta extender los brazos casi por completo.\n4. Exhalá y bajá lento a la posición inicial.', 'fuerza', 'seated-dumbbell-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (145, 46, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (146, 46, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (47, 'Sentadilla Búlgara con mancuernas', '1. Parate de espaldas a un banco, sosteniendo una mancuerna en cada mano, y apoyá el empeine de un pie atrás sobre el banco.\n2. Inhalá y bajá la cadera de forma vertical hasta que el muslo delantero quede paralelo al piso.\n3. Exhalá y empujá con el talón del pie delantero para volver a subir, manteniendo el torso firme.', 'fuerza', 'dumbbell-bulgarian-split-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (147, 47, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (148, 47, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (149, 47, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (150, 47, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (48, 'Sentadilla con mancuerna', '1. Sostené una sola mancuerna de forma vertical pegada a tu pecho con ambas manos (estilo Copa/Goblet), con los codos apuntando abajo.\n2. Separá los pies al ancho de los hombros, inhalá y bajá la cadera manteniendo el torso bien erguido.\n3. Exhalá y empujá el piso con fuerza para pararte.', 'fuerza', 'goblet-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (151, 48, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (152, 48, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (153, 48, 7, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (154, 48, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (49, 'Aperturas con mancuernas', '1. Acostate en un banco plano sosteniendo las mancuernas sobre el pecho con los codos levemente flexionados (como si abrazaras un árbol).\n2. Inhalá y abrí los brazos hacia los lados en un movimiento circular hasta estirar los pectorales.\n3. Exhalá y volvé a subir por el mismo arco, apretando el pecho arriba.', 'fuerza', 'dumbbell-fly.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (155, 49, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (156, 49, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (50, 'Encogimientos con mancuernas', '1. Parate derecho sosteniendo una mancuerna pesada en cada mano a los lados del cuerpo.\n2. Inhalá y elevá los hombros directamente hacia las orejas en línea recta, sin girarlos ni doblar los codos.\n3. Aguantá un segundo la contracción arriba y exhalá bajando el peso lentamente.', 'fuerza', 'dumbbell-shrug.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (157, 50, 15, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (158, 50, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (51, 'Prensa inclinada', '1. Sentate en la prensa, apoyá bien la espalda y colocá los pies al ancho de hombros en la plataforma.\n2. Liberá los seguros, inhalá y bajá la plataforma controladamente hasta que tus rodillas lleguen a 90°.\n3. Exhalá y empujá la plataforma con los talones, evitando bloquear las rodillas al extender.', 'fuerza', 'sled-leg-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (159, 51, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (160, 51, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (161, 51, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (52, 'Extensión de piernas', '1. Sentate en la máquina con la espalda apoyada y ajustá el rodillo justo por encima de tus tobillos.\n2. Inhalá y extendé las piernas hacia adelante hasta que estén casi rectas, apretando los cuádriceps arriba.\n3. Exhalá y bajá el peso de forma controlada sin que los discos golpeen la torre.', 'fuerza', 'leg-extension.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (162, 52, 8, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (53, 'Prensa horizontal en máquina', '1. Sentate, apoyá bien los pies en la plataforma y mantené la espalda pegada al respaldo.\n2. Inhalá y dejá que la plataforma venga hacia vos hasta que tus rodillas formen un ángulo de 90°.\n3. Exhalá y empujá la plataforma con fuerza, sintiendo el trabajo en los cuádriceps y glúteos.', 'fuerza', 'horizontal-leg-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (163, 53, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (164, 53, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (165, 53, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (54, 'Press de pecho en máquina vertical', '1. Ajustá el asiento para que las manijas queden a la altura de tu pecho medio.\n2. Apoyá la espalda firmemente, inhalá y empujá las manijas hacia adelante extendiendo los brazos.\n3. Exhalá y volvé despacio hacia atrás, estirando los pectorales sin perder la tensión.', 'fuerza', 'chest-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (166, 54, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (167, 54, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (168, 54, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (55, 'Sentadilla Hack', '1. Apoyá la espalda y los hombros en la máquina, colocando los pies al ancho de hombros en la plataforma.\n2. Inhalá y bajá el cuerpo controladamente hasta que los muslos estén paralelos a la plataforma.\n3. Exhalá y empujá con fuerza desde los talones para volver a subir sin bloquear rodillas.', 'fuerza', 'hack-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (169, 55, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (170, 55, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (171, 55, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (56, 'Press de hombros en máquina', '1. Sentate, apoyá bien la espalda y agarrá las manijas. Ajustá la altura si es necesario.\n2. Inhalá y empujá las manijas hacia arriba, manteniendo el control en todo el recorrido.\n3. Exhalá al bajar el peso lentamente hasta que las manijas lleguen a la altura de tus orejas.', 'fuerza', 'machine-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (172, 56, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (173, 56, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (57, 'Aperturas en máquina', '1. Sentate, apoyá los antebrazos en las almohadillas y ajustá el asiento para estirar bien el pecho.\n2. Inhalá y juntá los brazos hacia el centro del cuerpo, apretando fuerte los pectorales.\n3. Exhalá y abrí los brazos controladamente, sintiendo el estiramiento profundo.', 'fuerza', 'machine-chest-fly.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (174, 57, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (175, 57, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (58, 'Curl femoral sentado', '1. Sentate y ajustá el rodillo sobre los tobillos y el otro sobre los muslos.\n2. Inhalá y flexioná las piernas hacia atrás apretando bien los isquiotibiales en el punto máximo.\n3. Exhalá y soltá el peso lentamente sin perder el control en la fase de estiramiento.', 'fuerza', 'seated-leg-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (176, 58, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (177, 58, 13, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (59, 'Curl femoral tumbado', '1. Acostate boca abajo en la máquina y ajustá el rodillo a la altura de tus talones.\n2. Inhalá y flexioná las piernas llevando los talones hacia tus glúteos.\n3. Exhalá y bajá el peso controladamente hasta estirar por completo las piernas.', 'fuerza', 'lying-leg-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (178, 59, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (179, 59, 13, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (60, 'Gemelo en máquina de pie', '1. Parate en la máquina de gemelos con los hombros bajo las almohadillas y la punta de los pies en el borde.\n2. Bajá los talones todo lo posible para estirar bien la pantorrilla.\n3. Inhalá y subí con fuerza hasta quedar en puntas de pie, apretando un segundo arriba.\n4. Exhalá y bajá lento.', 'fuerza', 'machine-calf-raise.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (180, 60, 12, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (61, 'Aductores en máquina', '1. Sentate y ajustá las almohadillas para que queden contra la parte interna de tus rodillas.\n2. Inhalá y cerrá las piernas haciendo fuerza desde los aductores hacia el centro.\n3. Exhalá y abrí las piernas lentamente, manteniendo siempre la tensión en los músculos internos.', 'fuerza', 'hip-adduction.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (181, 61, 4, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (62, 'Jalón dorsal', '1. Sentate y agarrá la barra con las manos más separadas que tus hombros.\n2. Inhalá y tirá de la barra hacia tu pecho superior, inclinando el torso levemente hacia atrás.\n3. Exhalá y subí la barra estirando los brazos, sintiendo cómo se estiran los dorsales.', 'fuerza', 'lat-pulldown.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (182, 62, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (183, 62, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (184, 62, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (63, 'Jalones de tríceps en polea', '1. Parate frente a la polea y agarrá la cuerda o barra recta con las palmas hacia abajo.\n2. Pegá los codos a tus costillas y mantenelos fijos.\n3. Inhalá y bajá el peso extendiendo los brazos por completo, apretando fuerte los tríceps abajo.\n4. Exhalá y subí el peso hasta que tus antebrazos queden paralelos al piso.', 'fuerza', 'tricep-pushdown.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (185, 63, 2, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (64, 'Remo en polea sentado', '1. Sentate frente a la polea, apoyá los pies y agarrá el triángulo (o barra) con los brazos estirados.\n2. Sacá pecho, mantené la espalda recta e inhalá al tirar del peso hacia tu abdomen, juntando las escápulas.\n3. Exhalá y estirá los brazos controladamente sin encorvar la espalda.', 'fuerza', 'seated-cable-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (186, 64, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (187, 64, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (188, 64, 9, 'secundario');

-- FIN DEL SEED