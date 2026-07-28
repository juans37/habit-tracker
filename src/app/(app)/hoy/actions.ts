"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { formatearFechaISO } from "@/lib/streaks";

export async function toggleCompletado(blockId: string, estabaCompletado: boolean) {
  const supabase = await createClient();
  const hoy = formatearFechaISO(new Date());

  if (estabaCompletado) {
    const { error } = await supabase
      .from("completions")
      .delete()
      .eq("block_id", blockId)
      .eq("date", hoy);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("completions")
      .insert({ block_id: blockId, date: hoy });
    if (error) throw error;
  }

  revalidatePath("/hoy");
}
