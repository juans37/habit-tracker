import { createClient } from "@/lib/supabase/server";
import { HISTORY_WEEKS, WEEK_GOAL_THRESHOLD, lastNWeeks, toISODate } from "@/lib/streaks";
import { AppShell } from "@/components/app-shell";
import { TodayView } from "./today-view";

export default async function TodayPage() {
  const supabase = await createClient();

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, times_per_week, created_at")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  // One extra week of margin: the browser's local "today" can fall in a different week
  // than the server's (UTC) on Sunday night / Monday morning.
  const now = new Date();
  const weeks = lastNWeeks(HISTORY_WEEKS + 1, now);

  const { data: completions } = await supabase
    .from("completions")
    .select("habit_id, date")
    .gte("date", weeks[weeks.length - 1]);

  // Streak, weekly progress and the selected day are all computed in the browser from this
  // data, so moving between days is instant and "today" is the user's local day.
  return (
    <AppShell>
      <TodayView
        initialHabits={habits ?? []}
        initialCompletions={completions ?? []}
        serverToday={toISODate(now)}
        threshold={WEEK_GOAL_THRESHOLD}
      />
    </AppShell>
  );
}
