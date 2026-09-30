"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeTimesPerWeek } from "@/lib/frequency";

export async function createHabit(name: string, timesPerWeek: number) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: last } = await supabase
    .from("habits")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.order_index ?? -1) + 1;

  const { error } = await supabase.from("habits").insert({
    name: trimmed,
    order_index: nextOrder,
    user_id: user.id,
    times_per_week: normalizeTimesPerWeek(timesPerWeek),
  });
  if (error) throw error;

  revalidatePath("/habits");
  revalidatePath("/today");
}

export async function updateHabit(habitId: string, name: string, timesPerWeek: number) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ name: trimmed, times_per_week: normalizeTimesPerWeek(timesPerWeek) })
    .eq("id", habitId);
  if (error) throw error;

  revalidatePath("/habits");
  revalidatePath("/today");
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("habits")
    .update({ is_active: false })
    .eq("id", habitId);
  if (error) throw error;

  revalidatePath("/habits");
  revalidatePath("/today");
}

export async function reorderHabits(orderedIds: string[]) {
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("habits").update({ order_index: index }).eq("id", id),
    ),
  );

  revalidatePath("/habits");
  revalidatePath("/today");
}
