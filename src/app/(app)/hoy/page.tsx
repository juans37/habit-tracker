import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  UMBRAL_DIA_CUMPLIDO,
  calcularRacha,
  construirRatiosPorDia,
  formatearFechaISO,
  ultimosNDias,
} from "@/lib/streaks";
import { BlockRow } from "./block-row";
import { WeekGrid } from "./week-grid";

// Cuántos días de historial se traen para calcular la racha actual. No hace falta
// guardar el ratio precalculado: con este rango alcanza y se recalcula siempre en vivo.
const DIAS_HISTORIAL_RACHA = 90;

export default async function HoyPage() {
  const supabase = await createClient();

  const { data: bloques } = await supabase
    .from("blocks")
    .select("id, name, order_index")
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
  const bloquesCompletadosHoy = new Set(
    completions.filter((c) => c.date === hoy).map((c) => c.block_id),
  );

  const historial = construirRatiosPorDia(dias, completions, bloquesActivos.length);
  const racha = calcularRacha(historial, UMBRAL_DIA_CUMPLIDO);
  const ultimaSemana = historial.slice(0, 7);

  const indiceSiguientePendiente = bloquesActivos.findIndex(
    (b) => !bloquesCompletadosHoy.has(b.id),
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Hoy</h1>
        <div className="flex items-baseline gap-3">
          <p className="text-sm text-gray-500">
            Racha:{" "}
            <span className="font-medium text-gray-900">{racha}</span>{" "}
            {racha === 1 ? "día" : "días"}
          </p>
          <nav className="flex gap-3 text-sm text-gray-500">
            <Link href="/bloques" className="hover:text-gray-900">
              Bloques
            </Link>
            <Link href="/estadisticas" className="hover:text-gray-900">
              Stats
            </Link>
          </nav>
        </div>
      </header>

      {bloquesActivos.length === 0 ? (
        <p className="text-sm text-gray-500">
          Todavía no tenés bloques activos.{" "}
          <Link href="/bloques" className="underline hover:text-gray-900">
            Creá el primero
          </Link>
          .
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {bloquesActivos.map((bloque, i) => (
            <BlockRow
              key={bloque.id}
              blockId={bloque.id}
              name={bloque.name}
              completadoInicial={bloquesCompletadosHoy.has(bloque.id)}
              esSiguientePendiente={i === indiceSiguientePendiente}
            />
          ))}
        </div>
      )}

      <WeekGrid dias={ultimaSemana} umbral={UMBRAL_DIA_CUMPLIDO} />
    </main>
  );
}
