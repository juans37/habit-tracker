interface StatCardProps {
  label: string;
  value: string;
  color?: string;
}

export function StatCard({ label, value, color = "#F2F1EC" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-border bg-card p-3.5">
      <span className="font-display text-[26px] font-bold" style={{ color }}>
        {value}
      </span>
      <span className="text-[11.5px] font-semibold text-ink-faint">{label}</span>
    </div>
  );
}
