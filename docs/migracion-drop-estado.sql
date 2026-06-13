-- ============================================================
-- Migración: Eliminar columna estado de sesiones_entrenamiento
-- ============================================================
-- Motivo: El sistema solo persiste sesiones completadas, por lo
-- que la columna estado es redundante. Toda sesión en la tabla
-- está completada por definición arquitectónica.
-- ============================================================

ALTER TABLE sesiones_entrenamiento DROP COLUMN estado;
