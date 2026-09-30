import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/app-shell";
import { HabitManager } from "./habit-manager";
import { NewHabitForm } from "./new-habit-form";

export default async function HabitsPage() {
  const supabase = await createClient();

  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, times_per_week, is_active")
    .order("order_index", { ascending: true });

  const active = (habits ?? []).filter((h) => h.is_active);
  const inactive = (habits ?? []).filter((h) => !h.is_active);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <header>
          <h1 className="font-display text-2xl font-bold text-ink">Habits</h1>
          <p className="mt-0.5 text-[13px] text-ink-faint">
            Your daily order, and how many times a week each habit repeats
          </p>
        </header>

        <HabitManager initialHabits={active} />

        <NewHabitForm />

        {inactive.length > 0 && (
          <div className="flex flex-col gap-1">
            <h2 className="px-1 text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
              Deleted
            </h2>
            {inactive.map((habit) => (
              <div key={habit.id} className="px-1 py-2 text-[14.5px] text-ink-faint line-through">
                {habit.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
