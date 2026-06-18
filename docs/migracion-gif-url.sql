-- ============================================================
-- migracion-gif-url.sql — Agrega columna gif_url a ejercicios
-- ============================================================
-- Agrega un campo opcional para almacenar la URL del GIF
-- animado del ejercicio (desde ExerciseDB API).
-- Si el GIF no está disponible, el frontend muestra la
-- imagen estática (imagen_url) como fallback.
--
-- Ejecutar:
--   mysql -u root -p fitness_app < docs/migracion-gif-url.sql
-- ============================================================

ALTER TABLE ejercicios
  ADD COLUMN gif_url VARCHAR(500) DEFAULT NULL AFTER imagen_url;
