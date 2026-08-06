import type { RatioDia } from "@/lib/streaks";

interface StreakHeatmapProps {
  dias: RatioDia[]; // cronológico ascendente (más antiguo primero), largo fijo
}

export function StreakHeatmap({ dias }: StreakHeatmapProps) {
  return (
    <div
      className="grid gap-[5px] rounded-[14px] border border-border bg-card p-3.5"
      style={{
        gridTemplateColumns: "repeat(5, 1fr)",
        gridTemplateRows: "repeat(7, 1fr)",
        gridAutoFlow: "column",
        aspectRatio: "5 / 3.2",
      }}
    >
      {dias.map((dia) => {
        const bg =
          dia.ratio === 0
            ? "rgba(255,255,255,.06)"
            : `rgba(45,212,191,${0.15 + dia.ratio * 0.75})`;
        return (
          <div
            key={dia.fecha}
            title={`${dia.fecha}: ${Math.round(dia.ratio * 100)}%`}
            className="rounded"
            style={{ background: bg }}
          />
        );
      })}
    </div>
  );
}
