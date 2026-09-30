// A week (Monday to Sunday) counts as met when this share of the weekly goals of all
// active habits is reached.
export const WEEK_GOAL_THRESHOLD = 0.7;

// How far back Today loads history: the streak is computed over these weeks, and past days
// can be viewed and edited back to the start of the oldest one.
export const HISTORY_WEEKS = 53;

export interface HabitWithGoal {
  id: string;
  times_per_week: number; // 1..7
  created_at: string;
}

export interface Completion {
  habit_id: string;
  date: string; // YYYY-MM-DD
}

export interface WeekProgress {
  start: string; // Monday, YYYY-MM-DD
  done: number; // Σ min(habit completions in the week, habit goal)
  goal: number; // Σ weekly goal of the habits
  ratio: number; // done / goal, 0..1
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  ratio: number; // 0..1, completions that day over what an average day expects
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

export function addDays(date: string, n: number): string {
  const d = parseISODate(date);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

function daysBetween(from: string, to: string): number {
  return Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / MS_PER_DAY);
}

// `created_at` for a habit moved back to start on `date`. Noon UTC lands on the same
// calendar day in practically every timezone, so it reads as created on `date` wherever
// the browser is.
export function backdatedCreatedAt(date: string): string {
  return `${date}T12:00:00Z`;
}

// Monday of the week containing `date`.
export function weekStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toISODate(d);
}

// The 7 days (Monday to Sunday) of the week starting on `start`.
export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// Mondays of the last `n` weeks, starting with the current one and going back.
export function lastNWeeks(n: number, today: Date = new Date()): string[] {
  const current = weekStart(today);
  return Array.from({ length: n }, (_, i) => addDays(current, -7 * i));
}

// A habit's goal for a given week. If the habit was created mid-week, the goal is prorated
// by the days it existed (rounding up), and if it didn't exist yet it is 0 — so adding a
// habit on a Thursday doesn't break that week's streak.
export function weeklyGoal(habit: HabitWithGoal, start: string): number {
  const created = toISODate(new Date(habit.created_at));
  const end = addDays(start, 6);
  if (created > end) return 0;
  if (created <= start) return habit.times_per_week;
  const activeDays = daysBetween(created, end) + 1;
  return Math.ceil((habit.times_per_week * activeDays) / 7);
}

// How many times each habit was completed within the week starting on `start`.
export function countByHabit(start: string, completions: Completion[]): Map<string, number> {
  const end = addDays(start, 6);
  const counts = new Map<string, number>();
  for (const c of completions) {
    if (c.date >= start && c.date <= end) {
      counts.set(c.habit_id, (counts.get(c.habit_id) ?? 0) + 1);
    }
  }
  return counts;
}

// Each habit contributes up to its goal: going to the gym 5 times with a goal of 3 counts
// as 3, so overdoing one habit doesn't make up for skipping another.
export function weekProgress(
  start: string,
  habits: HabitWithGoal[],
  completions: Completion[],
): WeekProgress {
  const counts = countByHabit(start, completions);
  let done = 0;
  let goal = 0;
  for (const habit of habits) {
    const habitGoal = weeklyGoal(habit, start);
    goal += habitGoal;
    done += Math.min(counts.get(habit.id) ?? 0, habitGoal);
  }
  return { start, done, goal, ratio: goal ? done / goal : 0 };
}

// Only the currently active habits are used: the schema doesn't store when a habit was
// deactivated, so deleted habits stop counting for past weeks too.
export function buildWeekProgress(
  weeks: string[],
  habits: HabitWithGoal[],
  completions: Completion[],
): WeekProgress[] {
  return weeks.map((start) => weekProgress(start, habits, completions));
}

// `weeks` must be ordered newest to oldest (current week first). The current week counts
// if it already reached the threshold, but doesn't break the streak if it hasn't yet:
// it's still in progress.
export function currentStreak(
  weeks: WeekProgress[],
  threshold: number = WEEK_GOAL_THRESHOLD,
): number {
  const [current, ...past] = weeks;
  if (!current) return 0;
  let streak = current.ratio >= threshold ? 1 : 0;
  for (const week of past) {
    if (week.ratio >= threshold) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

// Best streak ever: the longest run of consecutive weeks that reached the threshold
// anywhere in the history.
export function bestStreak(
  weeks: WeekProgress[],
  threshold: number = WEEK_GOAL_THRESHOLD,
): number {
  let best = 0;
  let run = 0;
  for (const week of weeks) {
    if (week.ratio >= threshold) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }
  return best;
}

// Intensity of each day for the per-day charts (week grid, heatmap): how many habits were
// completed over what an average day expects (Σ times_per_week / 7). Visual only — the
// streak is decided per week.
export function dailyActivity(
  dates: string[],
  habits: HabitWithGoal[],
  completions: Completion[],
): DayActivity[] {
  const activeIds = new Set(habits.map((h) => h.id));
  const doneByDate = new Map<string, number>();
  for (const c of completions) {
    if (!activeIds.has(c.habit_id)) continue;
    doneByDate.set(c.date, (doneByDate.get(c.date) ?? 0) + 1);
  }

  return dates.map((date) => {
    const expected =
      habits
        .filter((h) => toISODate(new Date(h.created_at)) <= date)
        .reduce((acc, h) => acc + h.times_per_week, 0) / 7;
    const done = doneByDate.get(date) ?? 0;
    return { date, ratio: expected ? Math.min(1, done / expected) : 0 };
  });
}
