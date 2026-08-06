import type { RatioDia } from "@/lib/streaks";

const NOMBRES_DIA = ["D", "L", "M", "M", "J", "V", "S"];

interface MonthHeatmapProps {
  dias: RatioDia[]; // cronológico: día 1 del mes hasta hoy
  umbral: number;
  mes: Date;
}

export function MonthHeatmap({ dias, umbral, mes }: MonthHeatmapProps) {
  const primerDiaSemana = new Date(mes.getFullYear(), mes.getMonth(), 1).getDay();
  const relleno = Array.from({ length: primerDiaSemana });

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {NOMBRES_DIA.map((nombre, i) => (
        <span key={i} className="text-center text-xs text-gray-400">
          {nombre}
        </span>
      ))}
      {relleno.map((_, i) => (
        <div key={`relleno-${i}`} />
      ))}
      {dias.map((dia) => {
        const nivel =
          dia.ratio >= umbral ? "cumplido" : dia.ratio > 0 ? "parcial" : "vacio";
        const numeroDia = new Date(`${dia.fecha}T00:00:00`).getDate();

        return (
          <div
            key={dia.fecha}
            title={`${dia.fecha}: ${Math.round(dia.ratio * 100)}%`}
            className={`flex aspect-square items-center justify-center rounded-md text-[10px] ${
              nivel === "cumplido"
                ? "bg-black text-white"
                : nivel === "parcial"
                  ? "bg-gray-300 text-gray-600"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            {numeroDia}
          </div>
        );
      })}
    </div>
  );
}
