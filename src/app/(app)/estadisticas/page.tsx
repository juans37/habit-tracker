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
import { AppShell } from "@/components/app-shell";
import { SignOutButton } from "@/components/sign-out-button";
import { StatCard } from "./stat-card";
import { Badges } from "./badges";
import { StreakHeatmap } from "./streak-heatmap";
import { BlockBars } from "./block-bars";

const DIAS_HEATMAP = 35;
const DIAS_CUMPLIMIENTO = 30;

export default async function EstadisticasPage() {
  const supabase = await createClient();

  const { data: bloques } = await supabase
    .from("blocks")
    .select("id, name, created_at")
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const bloquesActivos = bloques ?? [];
  const hoy = new Date();

  // Racha y mejor racha recorren TODO el historial, desde que se creó el bloque más
  // antiguo — a diferencia de Vista Hoy, que solo mira los últimos 90 días.
  const creacionMasAntigua = bloquesActivos.reduce<Date | null>((min, b) => {
    const fecha = new Date(b.created_at);
    return !min || fecha < min ? fecha : min;
  }, null);

  const diasTotales = creacionMasAntigua
    ? Math.floor((hoy.getTime() - creacionMasAntigua.getTime()) / 86_400_000) + 1
    : 1;

  const dias = ultimosNDias(Math.max(diasTotales, DIAS_HEATMAP), hoy);
  const desde = dias[dias.length - 1];

  const { data: completionsRaw } = await supabase
    .from("completions")
    .select("block_id, date")
    .gte("date", desde);

  const completions = completionsRaw ?? [];

  const historial = construirRatiosPorDia(dias, completions, bloquesActivos.length);
  const rachaActual = calcularRacha(historial, UMBRAL_DIA_CUMPLIDO);
  const mejorRacha = calcularMejorRacha(historial, UMBRAL_DIA_CUMPLIDO);
  const cumplimiento30d = calcularCumplimientoGeneral(
    historial.slice(0, DIAS_CUMPLIMIENTO),
  );

  const cumplimientoPorBloque = calcularCumplimientoPorBloque(
    bloquesActivos,
    completions,
    hoy,
  );

  const diasHeatmap = [...historial.slice(0, DIAS_HEATMAP)].reverse();

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-bold text-ink">Estadísticas</h1>
          <p className="mt-0.5 text-[13px] text-ink-faint">Tu constancia en el tiempo</p>
        </header>

        {bloquesActivos.length === 0 ? (
          <p className="text-sm text-ink-soft">
            Todavía no tenés bloques activos. Creá el primero en Bloques.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Racha actual" value={`${rachaActual}`} color="#FF8A3D" />
              <StatCard label="Mejor racha" value={`${mejorRacha}`} color="#F2F1EC" />
              <StatCard
                label="Cumplimiento 30d"
                value={`${Math.round(cumplimiento30d * 100)}%`}
                color="#2DD4BF"
              />
            </div>

            <Badges mejorRacha={mejorRacha} />

            <div className="flex flex-col gap-2.5">
              <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
                Mapa de constancia · 35 días
              </div>
              <StreakHeatmap dias={diasHeatmap} />
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
                Cumplimiento por bloque
              </div>
              <BlockBars bloques={cumplimientoPorBloque} />
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
