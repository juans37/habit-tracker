import type { CumplimientoBloque } from "@/lib/estadisticas";

interface BlockBarsProps {
  bloques: CumplimientoBloque[];
}

export function BlockBars({ bloques }: BlockBarsProps) {
  if (bloques.length === 0) {
    return <p className="text-sm text-gray-500">No hay bloques activos todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {bloques.map((bloque) => {
        const porcentaje = Math.round(bloque.ratio * 100);
        return (
          <div key={bloque.blockId} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-gray-900">{bloque.name}</span>
              <span className="text-gray-500">{porcentaje}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100">
              <div
                className="h-1.5 rounded-full bg-black"
                style={{ width: `${Math.min(100, porcentaje)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
