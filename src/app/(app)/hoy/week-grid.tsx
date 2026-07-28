import type { RatioDia } from "@/lib/streaks";

const NOMBRES_DIA = ["D", "L", "M", "M", "J", "V", "S"];

interface WeekGridProps {
  dias: RatioDia[]; // ordenados de hoy hacia atrás
  umbral: number;
}

export function WeekGrid({ dias, umbral }: WeekGridProps) {
  const cronologico = [...dias].reverse();

  return (
    <div className="flex justify-between gap-2">
      {cronologico.map((dia) => {
        const nombreDia = NOMBRES_DIA[new Date(`${dia.fecha}T00:00:00`).getDay()];
        const nivel =
          dia.ratio >= umbral ? "cumplido" : dia.ratio > 0 ? "parcial" : "vacio";

        return (
          <div key={dia.fecha} className="flex flex-col items-center gap-1.5">
            <div
              title={`${dia.fecha}: ${Math.round(dia.ratio * 100)}%`}
              className={`h-8 w-8 rounded-md ${
                nivel === "cumplido"
                  ? "bg-black"
                  : nivel === "parcial"
                    ? "bg-gray-300"
                    : "bg-gray-100"
              }`}
            />
            <span className="text-xs text-gray-400">{nombreDia}</span>
          </div>
        );
      })}
    </div>
  );
}
