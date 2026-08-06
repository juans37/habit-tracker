import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  UMBRAL_DIA_CUMPLIDO,
  calcularMejorRacha,
  calcularRacha,
  construirRatiosPorDia,
  ultimosNDias,
} from "@/lib/streaks";
import {
  calcularCumplimientoGeneral,
  calcularCumplimientoPorBloque,
} from "@/lib/estadisticas";
import { StatCard } from "./stat-card";
import { MonthHeatmap } from "./month-heatmap";
import { BlockBars } from "./block-bars";

export default async function EstadisticasPage() {
  const supabase = await createClient();

  const { data: bloques } = await supabase
    .from("blocks")
    .select("id, name, created_at")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const bloquesActivos = bloques ?? [];
  const hoy = new Date();

  // Racha, mejor racha y cumplimiento general recorren TODO el historial, desde que se
  // creó el bloque más antiguo (a diferencia de Vista Hoy, que solo mira los últimos 90
  // días — acá "mejor racha histórica" pide el historial completo).
  const creacionMasAntigua = bloquesActivos.reduce<Date | null>((min, b) => {
    const fecha = new Date(b.created_at);
    return !min || fecha < min ? fecha : min;
  }, null);

  const diasTotales = creacionMasAntigua
    ? Math.floor((hoy.getTime() - creacionMasAntigua.getTime()) / 86_400_000) + 1
    : 1;

  const dias = ultimosNDias(diasTotales, hoy);
  const desde = dias[dias.length - 1];

  const { data: completionsRaw } = await supabase
    .from("completions")
    .select("block_id, date")
    .gte("date", desde);

  const completions = completionsRaw ?? [];

  const historial = construirRatiosPorDia(dias, completions, bloquesActivos.length);
  const rachaActual = calcularRacha(historial, UMBRAL_DIA_CUMPLIDO);
  const mejorRacha = calcularMejorRacha(historial, UMBRAL_DIA_CUMPLIDO);
  const cumplimientoGeneral = calcularCumplimientoGeneral(historial);

  const cumplimientoPorBloque = calcularCumplimientoPorBloque(
    bloquesActivos,
    completions,
    hoy,
  );

  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const diasDesdeInicioMes =
    Math.floor((hoy.getTime() - primerDiaMes.getTime()) / 86_400_000) + 1;
  const diasMes = [...ultimosNDias(diasDesdeInicioMes, hoy)].reverse();
  const ratiosMes = construirRatiosPorDia(diasMes, completions, bloquesActivos.length);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-8 p-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Estadísticas</h1>
        <nav className="flex gap-3 text-sm text-gray-500">
          <Link href="/hoy" className="hover:text-gray-900">
            Hoy
          </Link>
          <Link href="/bloques" className="hover:text-gray-900">
            Bloques
          </Link>
        </nav>
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
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              label="Racha actual"
              value={`${rachaActual}`}
              suffix={rachaActual === 1 ? "día" : "días"}
            />
            <StatCard
              label="Mejor racha"
              value={`${mejorRacha}`}
              suffix={mejorRacha === 1 ? "día" : "días"}
            />
            <StatCard
              label="Cumplimiento"
              value={`${Math.round(cumplimientoGeneral * 100)}%`}
            />
          </div>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-gray-500">Este mes</h2>
            <MonthHeatmap dias={ratiosMes} umbral={UMBRAL_DIA_CUMPLIDO} mes={hoy} />
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-gray-500">Cumplimiento por bloque</h2>
            <BlockBars bloques={cumplimientoPorBloque} />
          </section>
        </>
      )}
    </main>
  );
}
