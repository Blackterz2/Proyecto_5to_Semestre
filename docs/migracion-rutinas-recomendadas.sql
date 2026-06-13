-- ============================================================
-- Migración: Agregar es_recomendada a rutinas
-- ============================================================
-- Separa visualmente las rutinas generadas por el sistema
-- (onboarding) de las rutinas creadas manualmente por el usuario.
-- ============================================================

ALTER TABLE rutinas ADD COLUMN es_recomendada BOOLEAN DEFAULT FALSE;
