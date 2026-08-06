import { colorForBlock } from "@/lib/block-colors";
import type { CumplimientoBloque } from "@/lib/estadisticas";

interface BlockBarsProps {
  bloques: CumplimientoBloque[];
}

export function BlockBars({ bloques }: BlockBarsProps) {
  if (bloques.length === 0) {
    return <p className="text-sm text-ink-soft">No hay bloques activos todavía.</p>;
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
      {bloques.map((bloque, i) => {
        const porcentaje = Math.round(bloque.ratio * 100);
        const color = colorForBlock(i);
        return (
          <div key={bloque.blockId} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span className="font-semibold text-ink">{bloque.name}</span>
              <span className="font-bold text-ink-soft">{porcentaje}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-md bg-[rgba(255,255,255,.06)]">
              <div
                className="h-full rounded-md"
                style={{ width: `${Math.min(100, porcentaje)}%`, background: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
