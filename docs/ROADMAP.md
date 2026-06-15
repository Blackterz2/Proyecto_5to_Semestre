# Roadmap y Backlog del Proyecto Blackterz

> **Nota de fases:** La Fase 1 comprendió los Hitos 1 al 17 (base, auth, frontend, rutinas, sesiones, temporizador, sobrecarga progresiva, onboarding, etc.).
> La **Fase 2** arranca con los hitos pendientes de pulido y funcionalidad core faltante.

## 🔴 Prioridad Crítica (Funcionalidad Core)
- [ ] **F2 Hito 1. Editar una rutina (PUT):** Implementar endpoint y UI para editar nombre, descripción y ejercicios de una rutina existente (actualmente solo se puede borrar y crear de nuevo).
- [x] **F2 Hito 2. Editar perfil/contraseña:** Implementar `PUT /api/usuarios/me` para permitir al usuario cambiar su nombre y contraseña desde la vista de perfil.
- [ ] **F2 Hito 3. Recuperación de contraseña:** Implementar flujo de "Olvidé mi clave" con envío de correos (Nodemailer) y tokens temporales para evitar pérdida permanente de cuentas.

## 🟡 Prioridad Media (UX y Retención)
- [ ] **4. Volumen en historial:** Añadir a la tabla del historial la cantidad de ejercicios realizados y el volumen total (kg × series × reps) para medir el progreso.
- [ ] **5. Feedback "guardado":** Añadir una pequeña confirmación visual (ej. "✓ Guardado") que aparezca temporalmente al autoguardar un draft, para reducir ansiedad del usuario.
- [ ] **6. Modal personalizado:** Reemplazar el `confirm()` nativo del navegador (que es bloqueante y antiestético) por un modal propio de la app para confirmar la eliminación de rutinas o descarte de entrenamientos.
- [ ] **7. Loading states en fetch:** Añadir indicadores visuales de carga (spinners o botones deshabilitados temporalmente) al hacer clic en "Entrenar" o guardar sesiones.
- [ ] **8. Tour de bienvenida:** Programar un onboarding visual interactivo (tooltips/flechas) que enseñe al usuario cómo usar la app por primera vez.

## 🟢 Prioridad Baja (Pulido y Escalabilidad)
- [ ] **9. Gráfico de progreso:** Integrar Chart.js para mostrar líneas de progreso de duración o volumen por semana en la pestaña de historial.
- [ ] **10. Aviso visual de límite de rutinas:** Deshabilitar el botón "+ Nueva Rutina" y mostrar un tooltip explicativo cuando se alcanza el límite de 4 rutinas, en lugar de un alert() genérico.
- [ ] **11. Banner de conexión:** Agregar un listener `offline` en el frontend para mostrar un aviso tipo "Sin conexión — tu progreso está guardado" si se corta internet durante un entreno.
- [ ] **12. Paginación en historial:** Implementar lazy load o paginación en la tabla de entrenamientos para evitar lentitud cuando haya más de 50 sesiones registradas.

---

> [!NOTE]
> Este archivo es temporal y será eliminado al finalizar el proyecto para su presentación final.
