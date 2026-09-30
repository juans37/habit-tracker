"use client";

import { useRef, useState, useTransition } from "react";
import { DEFAULT_TIMES_PER_WEEK } from "@/lib/frequency";
import { createHabit } from "./actions";
import { FrequencyPicker } from "./frequency-picker";

export function NewHabitForm() {
  const [value, setValue] = useState("");
  const [times, setTimes] = useState(DEFAULT_TIMES_PER_WEEK);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = value.trim();
    if (!name) return;

    setValue("");
    setTimes(DEFAULT_TIMES_PER_WEEK);
    startTransition(async () => {
      await createHabit(name, times);
      inputRef.current?.focus();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-dashed border-border-strong bg-card p-4"
    >
      <div className="text-[13px] font-bold text-ink-soft">New habit</div>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Habit name"
        disabled={isPending}
        className="rounded-lg border border-border-strong bg-surface px-2.5 py-2.5 text-sm text-ink outline-none disabled:opacity-60"
      />
      <div className="mt-1 text-[12px] font-semibold text-ink-soft">Times per week</div>
      <FrequencyPicker value={times} onChange={setTimes} disabled={isPending} />
      <button
        type="submit"
        disabled={isPending || !value.trim()}
        className="mt-1 rounded-lg bg-accent py-2.5 text-sm font-bold text-surface disabled:opacity-40"
      >
        Add habit
      </button>
    </form>
  );
}
