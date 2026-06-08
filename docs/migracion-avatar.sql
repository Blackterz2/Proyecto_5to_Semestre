-- ============================================================
-- Migración: Agregar columna avatar_url a la tabla usuarios
-- ============================================================
-- Ejecutar en MySQL Workbench después de seleccionar la DB:
--   USE blackterz;
--
-- ¿Qué hace?
--   Agrega avatar_url para almacenar la ruta de la foto de perfil.
--   DEFAULT NULL = los usuarios existentes quedan sin foto.
--   No afecta ninguna tabla ni query existente.
-- ============================================================

USE fitness_app;
ALTER TABLE usuarios
  ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
