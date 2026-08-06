"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function crearBloque(name: string) {
  const nombre = name.trim();
  if (!nombre) return;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data: ultimo } = await supabase
    .from("blocks")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const siguienteOrden = (ultimo?.order_index ?? -1) + 1;

  const { error } = await supabase
    .from("blocks")
    .insert({ name: nombre, order_index: siguienteOrden, user_id: user.id });
  if (error) throw error;

  revalidatePath("/bloques");
  revalidatePath("/hoy");
}

export async function renombrarBloque(blockId: string, name: string) {
  const nombre = name.trim();
  if (!nombre) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .update({ name: nombre })
    .eq("id", blockId);
  if (error) throw error;

  revalidatePath("/bloques");
  revalidatePath("/hoy");
}

export async function eliminarBloque(blockId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blocks")
    .update({ is_active: false })
    .eq("id", blockId);
  if (error) throw error;

  revalidatePath("/bloques");
  revalidatePath("/hoy");
}

export async function reordenarBloques(orderedIds: string[]) {
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("blocks").update({ order_index: index }).eq("id", id),
    ),
  );

  revalidatePath("/bloques");
  revalidatePath("/hoy");
}
