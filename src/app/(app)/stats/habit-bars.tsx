import { colorForHabit } from "@/lib/habit-colors";
import type { HabitCompletion } from "@/lib/stats";
import { frequencyLabel } from "@/lib/frequency";

interface HabitBarsProps {
  habits: HabitCompletion[];
}

export function HabitBars({ habits }: HabitBarsProps) {
  if (habits.length === 0) {
    return <p className="text-sm text-ink-soft">No active habits yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
      {habits.map((habit, i) => {
        const percent = Math.round(habit.ratio * 100);
        const color = colorForHabit(i);
        return (
          <div key={habit.habitId} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-semibold text-ink">
                {habit.name}
                <span className="ml-1.5 font-normal text-ink-faint">
                  · {frequencyLabel(habit.timesPerWeek)}
                </span>
              </span>
              <span className="shrink-0 font-bold text-ink-soft">
                {habit.thisWeek
                  ? `${habit.thisWeek.done}/${habit.thisWeek.goal} this week`
                  : `${percent}%`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-md bg-[rgba(255,255,255,.06)]">
              <div
                className="h-full rounded-md"
                style={{ width: `${Math.min(100, percent)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
