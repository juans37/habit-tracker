# Level Up — contexto del proyecto

## Qué es esto

**Level Up** (antes "Rutina" / "Habit & time-block tracker") es una webapp personal de
seguimiento de **hábitos** (antes llamados "bloques anclados"): una secuencia ordenada de
actividades (no horarios rígidos) que se van marcando como completadas a lo largo del día,
cada una con una meta semanal. Ejemplo de rutina real del usuario: enfoque profundo, trabajo
(mañana), gym, trabajo (tarde), estudio/proyecto personal, cierre del día. Los hábitos son
editables porque la rutina cambia con el tiempo.

**Idioma — English first**: toda la UI, el código (identificadores, comentarios), las rutas
(`/today`, `/habits`, `/stats`) y el esquema de la DB están en inglés. Las rutas viejas en
español (`/hoy`, `/bloques`, `/estadisticas`) redirigen a las nuevas vía `next.config.ts`
para no romper la PWA ya instalada. Este archivo de contexto sigue en español.

**Uso**: personal, un solo usuario por ahora, pero el modelo de datos debe soportar múltiples
usuarios desde el día 1 (auth real, no un usuario hardcodeado) para poder abrir la app a más
gente en el futuro sin migrar el esquema.

**Filosofía de producto — muy importante**: esto NO debe sentirse como una app de
productividad genérica sobrecargada de features. No es una lista de tareas. La prioridad es
velocidad de uso (se abre varias veces al día) y mantener la lógica de "secuencia ordenada de
hábitos", no horarios ni prioridades ni proyectos anidados. Ante la duda entre agregar una
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
habits       (id, user_id, name, order_index, is_active, times_per_week, created_at)
completions  (id, habit_id, date, completed_at)
```

Notas de diseño:
- `is_active` en vez de borrar hábitos de verdad (soft delete): si el usuario reordena o
  "elimina" un hábito, el historial y las estadísticas no deben romperse.
- `times_per_week` (1–7, default 7 = todos los días): meta semanal de cada hábito, ej. "Gym"
  3 veces por semana.
- Migraciones: `0001_init.sql` (esquema original, `blocks`), `0002_veces_por_semana.sql`
  (frecuencia semanal), `0003_rename_to_habits.sql` (renombra `blocks`→`habits`,
  `block_id`→`habit_id`, `veces_por_semana`→`times_per_week`, más constraints/índices/
  políticas RLS). Se corren a mano en el SQL Editor de Supabase (no hay CLI instalada), y
  siempre antes del push que despliega el código que las necesita.
- Streaks y % de cumplimiento se calculan a partir de `completions`, no se guardan
  precalculados, para que nunca queden desincronizados si se editan hábitos después.

## Alcance del MVP

1. **Today** (`/today`): hábitos del día en orden (`order_index`), tap para marcar/desmarcar
   completado. El siguiente hábito pendiente (el primero no completado en el orden) se marca
   visualmente con un **punto lateral discreto** junto al nombre (no un fondo/borde llamativo
   — se evaluaron 3 opciones de resaltado y el usuario eligió la más sutil, que no compite
   visualmente con los hábitos ya completados).
   **Días anteriores**: con las flechas ‹ › o tocando un día del grid se puede ver y editar
   cualquier día pasado (hasta `HISTORY_WEEKS` = 53 semanas atrás, nunca días futuros), para
   registrar hábitos olvidados o días previos a crear la cuenta. Registrar un día anterior
   al `created_at` de un hábito mueve su `created_at` a ese día, para que cuente en racha y
   estadísticas. Toda la vista se calcula en el navegador con el historial cargado, y "hoy"
   es el día local del navegador (el servidor está en UTC).
2. **Racha (semanal)**: contador de semanas consecutivas (lunes a domingo) cumplidas. Una
   semana se cumple si se alcanza un umbral de las metas semanales: Σ min(hechos, meta) /
   Σ meta por hábito, así que pasarse en un hábito no compensa otro. **Default: 70%**
   (`WEEK_GOAL_THRESHOLD` en `src/lib/streaks.ts`). La semana en curso suma si ya llegó al
   umbral, pero no corta la racha mientras no termina. Si un hábito se crea a mitad de
   semana, su meta de esa semana se prorratea. Antes la racha era diaria; se cambió a
   semanal al introducir los hábitos de N veces por semana.
3. **Grid "This week"**: cuadritos de color por día de lunes a domingo (concepto ya
   validado en un prototipo previo del usuario). Es solo visual; la racha es semanal.
   En Today, los hábitos de N veces por semana muestran "x/N this week", y una vez cumplida
   la meta semanal pasan al final de la lista, bajo "Weekly goal met", atenuados (se pueden seguir marcando).
4. **Habits** (`/habits`): crear (con veces por semana), editar nombre/frecuencia, reordenar
   (drag and drop), "eliminar" (soft delete vía `is_active`).
5. **Stats** (`/stats`): heatmap de 5 semanas, % de cumplimiento por hábito (para
   identificar qué hábito se resiste más; se calcula solo sobre semanas cerradas, y un
   hábito sin semanas cerradas muestra "x/N this week" en vez de %), racha actual y mejor racha histórica.
6. **Auth básica** vía Supabase (email/password o magic link) desde el día 1, aunque el único
   usuario real sea el propio desarrollador.

## Explícitamente fuera del MVP (v2 o después)

- Notificaciones push reales (se evaluó Push API + Service Worker pero es poco confiable en
  iOS Safari sin instalar la PWA; se descartó a favor del resaltado visual del punto lateral
  como "recordatorio" suficiente para el patrón de uso de abrir la app varias veces al día).
- Exportar datos, temas/personalización visual, roles/permisos multi-usuario avanzados,
  métricas más finas (correlaciones entre hábitos, promedios móviles).

## Decisiones de diseño visual ya validadas (wireframes)

- Today: lista vertical de hábitos, completados con check + tachado, siguiente pendiente
  con punto lateral de acento, grid de 7 días abajo.
- Stats: métricas rápidas arriba (racha actual, mejor racha, % cumplimiento
  general) en cards, heatmap, barras de % de cumplimiento por hábito.
- Habits: lista con drag handle para reordenar, ícono de lápiz para renombrar,
  ícono de tacho para soft-delete (el hábito eliminado se muestra atenuado/tachado, no
  desaparece, para no confundir con borrado real).

## Estado actual del desarrollo

**MVP completo y en producción, más una v1.1 (hábitos semanales + rename a Level Up) lista
para desplegar.** El flujo completo (auth → crear hábitos → marcar cumplimiento → ver
estadísticas) funciona de punta a punta contra datos reales:

- **Esquema + Supabase**: proyecto `rhlwwtpuhscsjqbswymo`. Migraciones `0001`, `0002` y
  `0003` corridas (las dos últimas el 2026-09-29) — el esquema ya usa `habits`/`habit_id`/
  `times_per_week`.
- **Auth**: email/password, magic link y OAuth Google/GitHub, todo confirmado funcionando en
  producción (requiere que el dominio de Vercel esté en Redirect URLs de Supabase Auth). El
  callback sigue en `/auth/callback`, así que el rename no requirió cambios en Supabase.
- **Deploy**: en Vercel, `https://habit-tracker-sandy-five.vercel.app`, auto-deploy en cada
  push a `main` (repo `juans37/habit-tracker`; el repo y el proyecto de Vercel conservan el
  nombre viejo, solo cambió el nombre visible de la app). Dominio propio todavía no
  conectado — deliberadamente diferido, ver sección Stack.
- **PWA / instalación en celular**: manifest (`display: standalone`), íconos generados
  (favicon, apple-touch-icon, 192/512/maskable) y meta tags de `viewport-fit=cover`/
  `theme-color`/`apple-mobile-web-app-*`. Confirmado por el usuario: instala en el celular y
  abre sin barra de navegador, como una app nativa. No incluye service worker ni soporte
  offline. En iOS el ícono ya instalado sigue diciendo "Rutina" hasta reinstalarlo.

### Pendiente / próximos pasos posibles

- Stats todavía calcula "hoy" con la fecha del servidor (UTC); Today ya usa el día local del
  navegador. Pasar Stats al mismo esquema si molesta (se nota de noche en UTC-5).
- No hay framework de tests: la lógica de `src/lib/streaks.ts` y `src/lib/stats.ts` se
  verificó con scripts de aserciones ad hoc. Agregar Vitest con esos casos si crece.
- Conectar dominio propio (`habitos.juanseworkspace.work`) — no prioritario.
- Backup periódico de la DB (Supabase Free no hace backups automáticos).
- Pantalla de configuración para el umbral de racha (hoy es una constante fija al 70%).

## Registro de sesiones

**2026-09-29** — v1.1:
- Hábitos con frecuencia semanal (`times_per_week`, 1–7) en vez de "todos los días".
- Racha pasada de diaria a **semanal** (70% de las metas semanales, cada hábito suma hasta
  su meta); hábitos con meta cumplida bajan atenuados al final de Today.
- Stats: heatmap alineado a semanas, hitos en semanas, % por hábito solo sobre semanas
  cerradas (antes daba 100% a un hábito 3×/semana hecho una vez el mismo día que se creó).
- Today: navegar y editar días anteriores (flechas ‹ › / tocar el grid), con backdating de
  `created_at` al registrar días previos a crear el hábito; cálculo en el navegador con día
  local (arregla el bug de zona horaria en Today).
- Todo a inglés: "bloques" → "habits", rutas `/today` `/habits` `/stats` (con redirects
  desde las viejas), código y esquema DB (migración `0003`). App renombrada a **Level Up**.
- Estado al cierre: migraciones corridas pero el código todavía sin commit/push — hasta el
  push, producción (código viejo, que consulta `blocks`) está rota.
