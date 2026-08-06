interface StatCardProps {
  label: string;
  value: string;
  suffix?: string;
}

export function StatCard({ label, value, suffix }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-100 p-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-lg font-semibold text-gray-900">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-normal text-gray-500">{suffix}</span>
        )}
      </span>
    </div>
  );
}
