-- ============================================================
-- Migración: Agregar columna activo a la tabla usuarios
-- ============================================================
-- Ejecutar en MySQL Workbench o consola MySQL.
-- 
-- ¿Qué hace?
--   Agrega la columna `activo` con valor por defecto TRUE (1).
--   Los usuarios existentes quedan con activo = 1 automáticamente.
--   Un UPDATE simple desactiva: UPDATE usuarios SET activo = FALSE WHERE id = ?;
--
-- ¿Por qué TINYINT(1)?
--   MySQL no tiene BOOLEAN real. BOOLEAN es un sinónimo de
--   TINYINT(1). TRUE = 1, FALSE = 0.
-- ============================================================

USE fitness_app;
ALTER TABLE usuarios
  ADD COLUMN activo BOOLEAN DEFAULT TRUE;
