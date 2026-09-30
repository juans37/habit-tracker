import type { DayActivity } from "@/lib/streaks";

interface StreakHeatmapProps {
  // Chronological ascending, starting on a Monday, length a multiple of 7 (one column per
  // week).
  days: (DayActivity & { future: boolean })[];
}

export function StreakHeatmap({ days }: StreakHeatmapProps) {
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
      {days.map((day) => {
        const bg = day.future
          ? "transparent"
          : day.ratio === 0
            ? "rgba(255,255,255,.06)"
            : `rgba(45,212,191,${0.15 + day.ratio * 0.75})`;
        return (
          <div
            key={day.date}
            title={day.future ? day.date : `${day.date}: ${Math.round(day.ratio * 100)}%`}
            className="rounded"
            style={{ background: bg }}
          />
        );
      })}
    </div>
  );
}
