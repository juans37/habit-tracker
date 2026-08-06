import { createClient } from "@/lib/supabase/server";
import {
  UMBRAL_DIA_CUMPLIDO,
  construirRatiosPorDia,
  formatearFechaISO,
  ultimosNDias,
} from "@/lib/streaks";
import { AppShell } from "@/components/app-shell";
import { HoyView } from "./hoy-view";

// Cuántos días de historial (sin contar hoy) se traen para calcular la racha en vivo
// en el cliente.
const DIAS_HISTORIAL_RACHA = 90;

export default async function HoyPage() {
  const supabase = await createClient();

  const { data: bloques } = await supabase
    .from("blocks")
    .select("id, name")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const bloquesActivos = bloques ?? [];

  const dias = ultimosNDias(DIAS_HISTORIAL_RACHA);
  const desde = dias[dias.length - 1];

  const { data: completionsRaw } = await supabase
    .from("completions")
    .select("block_id, date")
    .gte("date", desde);

  const completions = completionsRaw ?? [];

  const hoy = formatearFechaISO(new Date());
  const completadosHoyInicial = completions
    .filter((c) => c.date === hoy)
    .map((c) => c.block_id);

  const historial = construirRatiosPorDia(dias, completions, bloquesActivos.length);
  // El primer día del historial es hoy — la vista lo recalcula en vivo a partir del
  // estado local, así que solo necesita el resto para la racha.
  const historialSinHoy = historial.slice(1);

  return (
    <AppShell>
      <HoyView
        bloques={bloquesActivos}
        completadosHoyInicial={completadosHoyInicial}
        historialSinHoy={historialSinHoy}
        umbral={UMBRAL_DIA_CUMPLIDO}
      />
    </AppShell>
  );
}
