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
VALUES (1, 'Press de banca', 'Ejercicio de barra para Pecho.', 'fuerza', 'bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (1, 1, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (2, 1, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (3, 1, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (2, 'Sentadilla', 'Ejercicio de barra para Cuádriceps, Glúteos.', 'fuerza', 'squat.avif');
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
VALUES (3, 'Peso muerto', 'Ejercicio de barra para Espalda Baja, Isquiotibiales, Glúteos.', 'fuerza', 'deadlift.avif');
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
VALUES (4, 'Press de hombro', 'Ejercicio de barra para Hombros.', 'fuerza', 'shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (15, 4, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (16, 4, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (5, 'Curl con barra', 'Ejercicio de barra para Bíceps.', 'fuerza', 'barbell-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (17, 5, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (18, 5, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (6, 'Remo con barra', 'Ejercicio de barra para Espalda Media.', 'fuerza', 'bent-over-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (19, 6, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (20, 6, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (21, 6, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (7, 'Press de banca inclinado', 'Ejercicio de barra para Pecho.', 'fuerza', 'incline-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (22, 7, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (23, 7, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (24, 7, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (8, 'Sentadilla frontal', 'Ejercicio de barra para Cuádriceps, Glúteos.', 'fuerza', 'front-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (25, 8, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (26, 8, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (27, 8, 7, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (28, 8, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (9, 'Peso muerto con barra hexagonal', 'Ejercicio de barra para Isquiotibiales, Glúteos.', 'fuerza', 'hex-bar-deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (29, 9, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (30, 9, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (31, 9, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (32, 9, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (10, 'Empuje de cadera', 'Ejercicio de barra para Glúteos.', 'fuerza', 'hip-thrust.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (33, 10, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (34, 10, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (35, 10, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (11, 'Peso muerto rumano', 'Ejercicio de barra para Isquiotibiales, Glúteos.', 'fuerza', 'romanian-deadlift.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (36, 11, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (37, 11, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (38, 11, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (39, 11, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (12, 'Cargada de potencia', 'Ejercicio de barra para Glúteos, Isquiotibiales.', 'fuerza', 'power-clean.avif');
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
VALUES (13, 'Press militar con barra de pie', 'Ejercicio de barra para Hombros.', 'fuerza', 'military-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (45, 13, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (46, 13, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (47, 13, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (14, 'Peso Muerto estilo Sumo', 'Ejercicio de barra para Isquiotibiales, Glúteos.', 'fuerza', 'sumo-deadlift.avif');
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
VALUES (15, 'Cargada de dos tiempos', 'Ejercicio de barra para Glúteos, Cuádriceps.', 'fuerza', 'clean-and-jerk.avif');
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
VALUES (16, 'Curl con barra Z', 'Ejercicio de barra para Bíceps.', 'fuerza', 'ez-bar-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (58, 16, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (59, 16, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (17, 'Extensión de tríceps en banca', 'Ejercicio de barra para Tríceps.', 'fuerza', 'lying-tricep-extension.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (60, 17, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (61, 17, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (62, 17, 3, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (18, 'Press de banca agarre cerrado', 'Ejercicio de barra para Tríceps.', 'fuerza', 'close-grip-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (63, 18, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (64, 18, 3, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (65, 18, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (19, 'Arrancada', 'Ejercicio de barra para Glúteos, Isquiotibiales.', 'fuerza', 'snatch.avif');
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
VALUES (20, 'Curl predicador con mancuernas', 'Ejercicio de barra para Bíceps.', 'fuerza', 'preacher-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (71, 20, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (72, 20, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (21, 'Press de hombro sentado', 'Ejercicio de barra para Hombros.', 'fuerza', 'seated-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (73, 21, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (74, 21, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (22, 'Encogimientos con barra', 'Ejercicio de barra para Trampas.', 'fuerza', 'barbell-shrug.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (75, 22, 15, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (76, 22, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (23, 'Remo en barra T', 'Ejercicio de barra para Espalda Media.', 'fuerza', 't-bar-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (77, 23, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (78, 23, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (79, 23, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (24, 'Cargada', 'Ejercicio de barra para Cuádriceps, Glúteos.', 'fuerza', 'clean.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (80, 24, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (81, 24, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (82, 24, 9, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (83, 24, 15, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (25, 'Empuje de fuerza', 'Ejercicio de barra para Hombros.', 'fuerza', 'push-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (84, 25, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (85, 25, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (86, 25, 8, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (26, 'Press de banca en multipower', 'Ejercicio de barra para Pecho.', 'fuerza', 'smith-machine-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (87, 26, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (88, 26, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (89, 26, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (27, 'Press de banca declinado', 'Ejercicio de barra para Pecho.', 'fuerza', 'decline-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (90, 27, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (91, 27, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (92, 27, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (28, 'Dominadas', 'Ejercicio de peso corporal para Espalda Media.', 'fuerza', 'pull-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (93, 28, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (94, 28, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (95, 28, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (29, 'Flexiones', 'Ejercicio de peso corporal para Pecho.', 'fuerza', 'push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (96, 29, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (97, 29, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (98, 29, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (99, 29, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (30, 'Fondos', 'Ejercicio de peso corporal para Pecho, Tríceps.', 'fuerza', 'dips.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (100, 30, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (101, 30, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (102, 30, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (31, 'Dominadas supinas', 'Ejercicio de peso corporal para Espalda Media, Bíceps.', 'fuerza', 'chin-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (103, 31, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (104, 31, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (105, 31, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (32, 'Abdominales', 'Ejercicio de peso corporal para Core.', 'fuerza', 'crunches.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (106, 32, 7, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (33, 'Abdominales sentado', 'Ejercicio de peso corporal para Core.', 'fuerza', 'sit-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (107, 33, 7, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (108, 33, 11, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (34, 'Fondos en barra', 'Ejercicio de peso corporal para Espalda Media, Tríceps.', 'fuerza', 'muscle-ups.avif');
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
VALUES (35, 'Sentadilla con el peso corporal', 'Ejercicio de peso corporal para Cuádriceps, Glúteos.', 'fuerza', 'bodyweight-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (114, 35, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (115, 35, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (116, 35, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (117, 35, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (36, 'Flexiones con un brao', 'Ejercicio de peso corporal para Pecho, Hombros.', 'fuerza', 'one-arm-push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (118, 36, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (119, 36, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (120, 36, 2, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (121, 36, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (37, 'Dominadas agarre neutro', 'Ejercicio de peso corporal para Espalda Media.', 'fuerza', 'neutral-grip-pull-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (122, 37, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (123, 37, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (124, 37, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (38, 'Flexiones para tríceps en suelo', 'Ejercicio de peso corporal para Tríceps, Pecho.', 'fuerza', 'diamond-push-ups.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (125, 38, 2, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (126, 38, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (127, 38, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (39, 'Press de banca con mancuernas', 'Ejercicio de mancuerna para Pecho.', 'fuerza', 'dumbbell-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (128, 39, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (129, 39, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (130, 39, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (40, 'Curl con mancuernas', 'Ejercicio de mancuerna para Bíceps.', 'fuerza', 'dumbbell-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (131, 40, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (132, 40, 5, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (41, 'Press con mancuernas en banco inclinado', 'Ejercicio de mancuerna para Pecho.', 'fuerza', 'incline-dumbbell-bench-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (133, 41, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (134, 41, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (135, 41, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (42, 'Press de hombros con mancuernas', 'Ejercicio de mancuerna para Hombros.', 'fuerza', 'dumbbell-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (136, 42, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (137, 42, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (43, 'Elevaciones laterales con mancuernas', 'Ejercicio de mancuerna para Hombros.', 'fuerza', 'dumbbell-lateral-raise.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (138, 43, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (139, 43, 15, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (44, 'Remo con mancuerna', 'Ejercicio de mancuerna para Espalda Media.', 'fuerza', 'dumbbell-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (140, 44, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (141, 44, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (142, 44, 9, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (45, 'Curl con mancuernas agarre martillo', 'Ejercicio de mancuerna para Bíceps, Antebrazos.', 'fuerza', 'hammer-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (143, 45, 6, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (144, 45, 5, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (46, 'Press de hombro con mancuernas sentado', 'Ejercicio de mancuerna para Hombros.', 'fuerza', 'seated-dumbbell-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (145, 46, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (146, 46, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (47, 'Sentadilla Búlgara con mancuernas', 'Ejercicio de mancuerna para Cuádriceps, Glúteos.', 'fuerza', 'dumbbell-bulgarian-split-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (147, 47, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (148, 47, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (149, 47, 14, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (150, 47, 7, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (48, 'Sentadilla con mancuerna', 'Ejercicio de mancuerna para Cuádriceps, Glúteos.', 'fuerza', 'goblet-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (151, 48, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (152, 48, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (153, 48, 7, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (154, 48, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (49, 'Aperturas con mancuernas', 'Ejercicio de mancuerna para Pecho.', 'fuerza', 'dumbbell-fly.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (155, 49, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (156, 49, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (50, 'Encogimientos con mancuernas', 'Ejercicio de mancuerna para Trampas.', 'fuerza', 'dumbbell-shrug.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (157, 50, 15, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (158, 50, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (51, 'Prensa inclinada', 'Ejercicio de máquina para Cuádriceps, Glúteos.', 'fuerza', 'sled-leg-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (159, 51, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (160, 51, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (161, 51, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (52, 'Extensión de piernas', 'Ejercicio de máquina para Cuádriceps.', 'fuerza', 'leg-extension.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (162, 52, 8, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (53, 'Prensa horizontal en máquina', 'Ejercicio de máquina para Cuádriceps, Glúteos.', 'fuerza', 'horizontal-leg-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (163, 53, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (164, 53, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (165, 53, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (54, 'Press de pecho en máquina vertical', 'Ejercicio de máquina para Pecho.', 'fuerza', 'chest-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (166, 54, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (167, 54, 1, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (168, 54, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (55, 'Sentadilla Hack', 'Ejercicio de máquina para Cuádriceps, Glúteos.', 'fuerza', 'hack-squat.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (169, 55, 8, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (170, 55, 13, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (171, 55, 14, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (56, 'Press de hombros en máquina', 'Ejercicio de máquina para Hombros.', 'fuerza', 'machine-shoulder-press.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (172, 56, 1, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (173, 56, 2, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (57, 'Aperturas en máquina', 'Ejercicio de máquina para Pecho.', 'fuerza', 'machine-chest-fly.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (174, 57, 3, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (175, 57, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (58, 'Curl femoral sentado', 'Ejercicio de máquina para Isquiotibiales.', 'fuerza', 'seated-leg-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (176, 58, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (177, 58, 13, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (59, 'Curl femoral tumbado', 'Ejercicio de máquina para Isquiotibiales.', 'fuerza', 'lying-leg-curl.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (178, 59, 14, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (179, 59, 13, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (60, 'Gemelo en máquina de pie', 'Ejercicio de máquina para Gemelos.', 'fuerza', 'machine-calf-raise.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (180, 60, 12, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (61, 'Aductores en máquina', 'Ejercicio de máquina para Aductores.', 'fuerza', 'hip-adduction.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (181, 61, 4, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (62, 'Jalón dorsal', 'Ejercicio de polea para Espalda Media.', 'fuerza', 'lat-pulldown.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (182, 62, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (183, 62, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (184, 62, 1, 'secundario');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (63, 'Jalones de tríceps en polea', 'Ejercicio de polea para Tríceps.', 'fuerza', 'tricep-pushdown.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (185, 63, 2, 'principal');
INSERT INTO ejercicios (id, nombre, descripcion, categoria, imagen_url)
VALUES (64, 'Remo en polea sentado', 'Ejercicio de polea para Espalda Media.', 'fuerza', 'seated-cable-row.avif');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (186, 64, 10, 'principal');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (187, 64, 6, 'secundario');
INSERT INTO ejercicios_grupos_musculares (id, ejercicio_id, grupo_muscular_id, tipo)
VALUES (188, 64, 9, 'secundario');

-- FIN DEL SEED