import { createClient } from "@/lib/supabase/server";
import {
  WEEK_GOAL_THRESHOLD,
  addDays,
  bestStreak,
  buildWeekProgress,
  currentStreak,
  dailyActivity,
  lastNWeeks,
  toISODate,
} from "@/lib/streaks";
import { completionByHabit, overallCompletion } from "@/lib/stats";
import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { StatCard } from "./stat-card";
import { Badges } from "./badges";
import { StreakHeatmap } from "./streak-heatmap";
import { HabitBars } from "./habit-bars";

const HEATMAP_WEEKS = 5;
const COMPLETION_WEEKS = 4;

export default async function StatsPage() {
  const supabase = await createClient();

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, times_per_week, created_at")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const activeHabits = habits ?? [];
  const today = new Date();

  // Current and best streak walk the WHOLE history, back to the oldest habit — unlike
  // Today, which only looks at the last 53 weeks.
  const oldestCreation = activeHabits.reduce<Date | null>((min, h) => {
    const date = new Date(h.created_at);
    return !min || date < min ? date : min;
  }, null);

  const totalWeeks = oldestCreation
    ? Math.floor((today.getTime() - oldestCreation.getTime()) / (7 * 86_400_000)) + 2
    : 1;

  const weeks = lastNWeeks(
    Math.max(totalWeeks, HEATMAP_WEEKS, COMPLETION_WEEKS + 1),
    today,
  );
  const since = weeks[weeks.length - 1];

  const { data: completionsRaw } = await supabase
    .from("completions")
    .select("habit_id, date")
    .gte("date", since);

  const completions = completionsRaw ?? [];

  const history = buildWeekProgress(weeks, activeHabits, completions);
  const streak = currentStreak(history, WEEK_GOAL_THRESHOLD);
  const best = bestStreak(history, WEEK_GOAL_THRESHOLD);
  const recentCompletion = overallCompletion(history, COMPLETION_WEEKS);

  const perHabit = completionByHabit(activeHabits, completions, today);

  // Week-aligned heatmap: each column is a Monday-to-Sunday week, the last one is the
  // current week (days that haven't happened yet are shown empty).
  const todayISO = toISODate(today);
  const heatmapStart = weeks[HEATMAP_WEEKS - 1];
  const heatmapDays = dailyActivity(
    Array.from({ length: HEATMAP_WEEKS * 7 }, (_, i) => addDays(heatmapStart, i)),
    activeHabits,
    completions,
  ).map((day) => ({ ...day, future: day.date > todayISO }));

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-ink">Stats</h1>
          <p className="mt-0.5 text-[13px] text-ink-faint">Your consistency over time</p>
        </header>

        {activeHabits.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No active habits yet. Create your first one in Habits.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Streak (wks)" value={`${streak}`} color="#FF8A3D" />
              <StatCard label="Best (wks)" value={`${best}`} color="#F2F1EC" />
              <StatCard
                label="Last 4 wks"
                value={`${Math.round(recentCompletion * 100)}%`}
                color="#2DD4BF"
              />
            </div>

            <Badges bestStreak={best} />

            <div className="flex flex-col gap-2.5">
              <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
                Consistency map · 5 weeks
              </div>
              <StreakHeatmap days={heatmapDays} />
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
                Completion by habit
              </div>
              <HabitBars habits={perHabit} />
            </div>
          </>
        )}

        <div className="mt-2 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </AppShell>
  );
}
