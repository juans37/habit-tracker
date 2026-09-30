import {
  type Completion,
  type HabitWithGoal,
  type WeekProgress,
  addDays,
  countByHabit,
  weekStart,
  weeklyGoal,
} from "./streaks";

// Overall completion: average ratio of the latest closed weeks that had a goal (not
// counting the current one, which is still in progress). If no week has closed yet, it
// uses the current one.
export function overallCompletion(
  weeks: WeekProgress[], // newest first, current week included
  count: number,
): number {
  const closed = weeks.slice(1, count + 1).filter((w) => w.goal > 0);
  const base = closed.length > 0 ? closed : weeks.slice(0, 1);
  if (base.length === 0) return 0;
  return base.reduce((acc, w) => acc + w.ratio, 0) / base.length;
}

export interface HabitCompletion {
  habitId: string;
  name: string;
  timesPerWeek: number;
  ratio: number; // 0..1
  // Present while the habit has no closed week yet: the ratio is then this week's progress
  // instead of a historical percentage.
  thisWeek?: { done: number; goal: number };
}

// Completion per habit over its closed weeks: Σ min(completions, goal) / Σ goal, week by
// week. The current week is left out until it ends — otherwise doing a 3-times-a-week
// habit early in the week would already read as 100%. A habit with no closed week yet
// shows this week's progress instead (the same "x/N this week" as Today).
export function completionByHabit(
  habits: (HabitWithGoal & { name: string })[],
  completions: Completion[],
  today: Date = new Date(),
): HabitCompletion[] {
  const currentWeek = weekStart(today);

  return habits.map((habit) => {
    const habitCompletions = completions.filter((c) => c.habit_id === habit.id);
    const base = { habitId: habit.id, name: habit.name, timesPerWeek: habit.times_per_week };

    let done = 0;
    let goal = 0;
    for (
      let week = weekStart(new Date(habit.created_at));
      week < currentWeek;
      week = addDays(week, 7)
    ) {
      const weekGoal = weeklyGoal(habit, week);
      const count = countByHabit(week, habitCompletions).get(habit.id) ?? 0;
      done += Math.min(count, weekGoal);
      goal += weekGoal;
    }

    if (goal > 0) return { ...base, ratio: done / goal };

    const thisWeekGoal = weeklyGoal(habit, currentWeek);
    const thisWeekDone = Math.min(
      countByHabit(currentWeek, habitCompletions).get(habit.id) ?? 0,
      thisWeekGoal,
    );
    return {
      ...base,
      ratio: thisWeekGoal ? thisWeekDone / thisWeekGoal : 0,
      thisWeek: { done: thisWeekDone, goal: thisWeekGoal },
    };
  });
}
