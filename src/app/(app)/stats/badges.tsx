// Milestones, in streak weeks.
const MILESTONES = [
  { weeks: 2, label: "2 weeks" },
  { weeks: 4, label: "Month" },
  { weeks: 12, label: "Quarter" },
  { weeks: 26, label: "Half year" },
];

interface BadgesProps {
  bestStreak: number;
}

export function Badges({ bestStreak }: BadgesProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
        Milestones
      </div>
      <div className="flex gap-2.5">
        {MILESTONES.map((milestone) => {
          const unlocked = bestStreak >= milestone.weeks;
          return (
            <div key={milestone.weeks} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full font-display text-[15px] font-bold"
                style={{
                  background: unlocked ? "linear-gradient(135deg,#FF8A3D,#FFB84D)" : "transparent",
                  color: unlocked ? "#0A0B0D" : "#3A3D42",
                  border: unlocked ? "2px solid transparent" : "2px solid rgba(255,255,255,.1)",
                  boxShadow: unlocked ? "0 0 20px rgba(255,138,61,.4)" : "none",
                }}
              >
                {milestone.weeks}
              </div>
              <span className="text-center text-[10.5px] font-semibold text-ink-faint">
                {milestone.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
