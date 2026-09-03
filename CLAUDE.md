# Habit & time-block tracker — contexto del proyecto

## Qué es esto

Webapp personal de seguimiento de rutina diaria organizada en **bloques anclados**: una
secuencia ordenada de actividades (no horarios rígidos) que se van marcando como completadas
a lo largo del día. Ejemplo de rutina real del usuario: enfoque profundo, trabajo (mañana),
gym, trabajo (tarde), estudio/proyecto personal, cierre del día. Los bloques son editables
porque la rutina cambia con el tiempo.

**Uso**: personal, un solo usuario por ahora, pero el modelo de datos debe soportar múltiples
usuarios desde el día 1 (auth real, no un usuario hardcodeado) para poder abrir la app a más
gente en el futuro sin migrar el esquema.

**Filosofía de producto — muy importante**: esto NO debe sentirse como una app de
productividad genérica sobrecargada de features. No es una lista de tareas. La prioridad es
velocidad de uso (se abre varias veces al día) y mantener la lógica de "secuencia de bloques
anclados", no horarios ni prioridades ni proyectos anidados. Ante la duda entre agregar una
feature o mantenerlo simple, elegir simple.

## Stack decidido

- **Frontend + backend**: Next.js (App Router) + TypeScript, todo en un solo repo (API routes
  para el backend, no un servidor separado).
- **Base de datos + auth**: Supabase (Postgres + Supabase Auth). Se eligió managed/Supabase
  antes que un stack manual (Vite+React / Express separado) — el usuario prefirió deploy
  rápido y menos piezas que mantener.
- **Hosting**: Vercel (plan Hobby, gratis).
- **Dominio**: el usuario ya tiene `juanseworkspace.work` registrado vía Cloudflare. Se
  conectará al final del proyecto (subdominio tipo `habitos.juanseworkspace.work`), una vez
  que la app funcione en la URL default de Vercel. No es prioridad ahora.
- **Costo objetivo**: $0/mes. Vercel Hobby y Supabase Free alcanzan de sobra para este caso de
  uso (Supabase free da 500MB de DB y 50k MAU; el único riesgo es que Supabase pausa proyectos
  gratis tras 7 días de inactividad, y no hace backups automáticos — considerar un backup
  simple periódico más adelante, ej. export vía GitHub Actions).

## Modelo de datos (base, puede ajustarse en implementación)

```sql
users        (id, email, created_at)
blocks       (id, user_id, name, order_index, is_active, created_at)
completions  (id, block_id, date, completed_at)
```

Notas de diseño:
- `is_active` en vez de borrar bloques de verdad (soft delete): si el usuario reordena o
  "elimina" un bloque, el historial y las estadísticas no deben romperse.
- Streaks y % de cumplimiento se calculan a partir de `completions`, no se guardan
  precalculados, para que nunca queden desincronizados si se editan bloques después.

## Alcance del MVP

1. **Vista Hoy**: bloques del día en orden (`order_index`), tap para marcar/desmarcar
   completado. El siguiente bloque pendiente (el primero no completado en el orden) se marca
   visualmente con un **punto lateral discreto** junto al nombre (no un fondo/borde llamativo
   — se evaluaron 3 opciones de resaltado y el usuario eligió la más sutil, que no compite
   visualmente con los bloques ya completados).
2. **Racha**: contador de días consecutivos cumplidos. El criterio de "día cumplido" es
   **flexible, no 100%**: se cumple si se completó al menos un umbral configurable de los
   bloques del día. **Default: 70%**. Debe quedar como un valor fácil de ajustar (idealmente
   configurable desde la UI en el futuro, pero para el MVP puede ir como constante/config
   simple mientras se define esa pantalla).
3. **Grid de últimos 7 días**: cuadritos de color por día (concepto ya validado en un
   prototipo previo del usuario).
4. **Gestión de bloques**: crear, renombrar, reordenar (drag and drop), "eliminar" (soft
   delete vía `is_active`).
5. **Estadísticas**: heatmap mensual, % de cumplimiento por bloque (para identificar qué
   bloque se resiste más), racha actual y mejor racha histórica.
6. **Auth básica** vía Supabase (email/password o magic link) desde el día 1, aunque el único
   usuario real sea el propio desarrollador.

## Explícitamente fuera del MVP (v2 o después)

- Notificaciones push reales (se evaluó Push API + Service Worker pero es poco confiable en
  iOS Safari sin instalar la PWA; se descartó a favor del resaltado visual del punto lateral
  como "recordatorio" suficiente para el patrón de uso de abrir la app varias veces al día).
- Exportar datos, temas/personalización visual, roles/permisos multi-usuario avanzados,
  métricas más finas (correlaciones entre bloques, promedios móviles).

## Decisiones de diseño visual ya validadas (wireframes)

- Vista Hoy: lista vertical de bloques, completados con check + tachado, siguiente pendiente
  con punto lateral de acento, grid de 7 días abajo.
- Vista Estadísticas: métricas rápidas arriba (racha actual, mejor racha, % cumplimiento
  general) en cards, heatmap mensual, barras de % de cumplimiento por bloque.
- Vista Editar bloques: lista con drag handle para reordenar, ícono de lápiz para renombrar,
  ícono de tacho para soft-delete (el bloque eliminado se muestra atenuado/tachado, no
  desaparece, para no confundir con borrado real).

## Estado actual del desarrollo

**MVP completo y en producción.** Las 6 features del alcance están implementadas y el flujo
completo (auth → crear bloques → marcar cumplimiento → ver estadísticas) funciona de punta a
punta contra datos reales:

- **Esquema + Supabase**: proyecto creado (ref `rhlwwtpuhscsjqbswymo`), migración
  `supabase/migrations/0001_init.sql` corrida (`blocks`/`completions` con RLS).
- **Auth**: email/password, magic link y OAuth Google/GitHub, todo confirmado funcionando en
  producción (requiere que el dominio de Vercel esté en Redirect URLs de Supabase Auth).
- **Deploy**: en Vercel, `https://habit-tracker-sandy-five.vercel.app`, auto-deploy en cada
  push a `main` (repo `juans37/habit-tracker`). Dominio propio todavía no conectado —
  deliberadamente diferido, ver sección Stack.
- **PWA / instalación en celular**: manifest (`display: standalone`), íconos generados
  (favicon, apple-touch-icon, 192/512/maskable) y meta tags de `viewport-fit=cover`/
  `theme-color`/`apple-mobile-web-app-*`. Confirmado por el usuario: instala en el celular y
  abre sin barra de navegador, como una app nativa. No incluye service worker ni soporte
  offline — no hizo falta para lograr el modo standalone, y no está en el alcance del MVP.

### Pendiente / próximos pasos posibles

- Conectar dominio propio (`habitos.juanseworkspace.work`) — no prioritario.
- Backup periódico de la DB (Supabase Free no hace backups automáticos).
- Pantalla de configuración para el umbral de racha (hoy es una constante fija al 70%).
