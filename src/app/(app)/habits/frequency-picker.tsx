"use client";

import { frequencyLabel } from "@/lib/frequency";

interface FrequencyPickerProps {
  value: number;
  onChange: (times: number) => void;
  disabled?: boolean;
}

export function FrequencyPicker({ value, onChange, disabled }: FrequencyPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7].map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              disabled={disabled}
              aria-pressed={active}
              className="h-8 flex-1 rounded-lg border text-[13px] font-bold transition-colors disabled:opacity-60"
              style={{
                background: active ? "rgba(255,138,61,.14)" : "transparent",
                borderColor: active ? "rgba(255,138,61,.5)" : "rgba(255,255,255,.12)",
                color: active ? "#FF8A3D" : "#8D9096",
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <span className="text-[12px] text-ink-faint">{frequencyLabel(value)}</span>
    </div>
  );
}
