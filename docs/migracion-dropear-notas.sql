-- ============================================================
-- MIGRACIÓN: Dropear columnas notas no utilizadas
-- ============================================================
-- Elimina las columnas `notas` de tablas donde nunca se
-- escriben ni se leen desde el código:
--   - ejercicios_rutinas.notas  (INSERT no la incluye)
--   - rutinas.notas             (INSERT no la incluye)
--   - sesion_series.notas       (INSERT no la incluye)
--
-- Las columnas que se conservan:
--   - sesiones_entrenamiento.notas  (se escribe en INSERT)
--   - sesion_ejercicios.notas       (se escribe en INSERT)
-- ============================================================

USE fitness_app;

ALTER TABLE ejercicios_rutinas DROP COLUMN notas;
ALTER TABLE rutinas DROP COLUMN notas;
ALTER TABLE sesion_series DROP COLUMN notas;
