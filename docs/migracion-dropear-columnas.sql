-- ============================================================
-- MIGRACIÓN: Dropear columnas duplicadas/redundantes
-- ============================================================
-- Enfoque Híbrido — Conservamos las columnas estratégicas
-- y eliminamos las que son lastre/deuda técnica.
--
-- CONSERVADAS (Reserva Estratégica):
--   sesion_ejercicios.orden           → pilar relacional para ordenar ejercicios
--   sesiones_entrenamiento.estado     → para sesiones Pendientes/Canceladas futuro
--   sesion_series.completada          → checkboxes de series → base de datos
--   ejercicios_rutinas.tiempo_descanso → temporizador de descanso entre series
--
-- ELIMINADAS (Lastre y Deuda Técnica):
--   sesion_ejercicios.series_planificadas   → doble registro innecesario
--   sesion_ejercicios.repeticiones_planificadas → doble registro, edición al vuelo
--   sesion_ejercicios.peso_planificado       → doble registro, edición al vuelo
--   sesion_ejercicios.completado            → redundante: ejercicios completado si
--                                              todas sus series lo están
--   sesion_series.duracion_segundos          → micro-gestión excesiva
--   sesion_series.tiempo_descanso            → redundante con ejercicios_rutinas
-- ============================================================

USE fitness_app;

-- Eliminar columnas en sesion_ejercicios
ALTER TABLE sesion_ejercicios DROP COLUMN series_planificadas;
ALTER TABLE sesion_ejercicios DROP COLUMN repeticiones_planificadas;
ALTER TABLE sesion_ejercicios DROP COLUMN peso_planificado;
ALTER TABLE sesion_ejercicios DROP COLUMN completado;

-- Eliminar columnas en sesion_series
ALTER TABLE sesion_series DROP COLUMN duracion_segundos;
ALTER TABLE sesion_series DROP COLUMN tiempo_descanso;
