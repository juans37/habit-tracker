"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addDays, backdatedCreatedAt, toISODate } from "@/lib/streaks";

// `date` is the user's local calendar day (YYYY-MM-DD), sent by the browser: past days can
// be checked off too, to catch up on forgotten habits or log days before signing up.
export async function toggleCompletion(habitId: string, date: string, wasCompleted: boolean) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
  // The server runs in UTC, so allow one day of slack for users ahead of it.
  if (date > addDays(toISODate(new Date()), 1)) throw new Error("Date is in the future");

  const supabase = await createClient();

  if (wasCompleted) {
    const { error } = await supabase
      .from("completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("date", date);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("completions")
      .insert({ habit_id: habitId, date });
    if (error) throw error;

    // Logging a day before the habit existed means the user was already doing it: move
    // its start back so that day counts toward the streak and stats.
    const { data: habit } = await supabase
      .from("habits")
      .select("created_at")
      .eq("id", habitId)
      .single();
    if (habit && date < habit.created_at.slice(0, 10)) {
      const { error: updateError } = await supabase
        .from("habits")
        .update({ created_at: backdatedCreatedAt(date) })
        .eq("id", habitId);
      if (updateError) throw updateError;
    }
  }

  revalidatePath("/today");
  revalidatePath("/stats");
}
