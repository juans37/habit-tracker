"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { colorForHabit } from "@/lib/habit-colors";
import { frequencyLabel } from "@/lib/frequency";
import { deleteHabit, updateHabit } from "./actions";
import { FrequencyPicker } from "./frequency-picker";

interface HabitItemProps {
  habitId: string;
  name: string;
  timesPerWeek: number;
  index: number;
}

export function HabitItem({ habitId, name, timesPerWeek, index }: HabitItemProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [times, setTimes] = useState(timesPerWeek);
  const [isPending, startTransition] = useTransition();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: habitId });

  const color = colorForHabit(index);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  function saveChanges() {
    const trimmed = value.trim();
    if (!trimmed || (trimmed === name && times === timesPerWeek)) {
      cancelEdit();
      return;
    }
    startTransition(async () => {
      await updateHabit(habitId, trimmed, times);
      setEditing(false);
    });
  }

  function cancelEdit() {
    setValue(name);
    setTimes(timesPerWeek);
    setEditing(false);
  }

  function handleDelete() {
    if (
      !window.confirm(`Delete "${name}"? It disappears from Today, but its history is kept.`)
    ) {
      return;
    }
    startTransition(async () => {
      await deleteHabit(habitId);
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-3.5"
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none pr-0.5 text-[16px] leading-none tracking-[2px] text-ink-faint active:cursor-grabbing"
          aria-label="Reorder"
        >
          ⠿
        </button>
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold"
          style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        {editing ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveChanges();
              if (e.key === "Escape") cancelEdit();
            }}
            placeholder="Name"
            className="flex-1 min-w-0 rounded-lg border border-border-strong bg-surface px-2.5 py-2 text-sm text-ink outline-none"
          />
        ) : (
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[14.5px] font-bold text-ink">{name}</span>
            <span className="text-[12px] text-ink-faint">{frequencyLabel(timesPerWeek)}</span>
          </div>
        )}
      </div>

      {editing && <FrequencyPicker value={times} onChange={setTimes} disabled={isPending} />}

      <div className="flex gap-2">
        {editing ? (
          <>
            <button
              type="button"
              onClick={saveChanges}
              disabled={isPending}
              className="flex-1 rounded-lg bg-success py-2 text-[13px] font-bold text-surface disabled:opacity-60"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={isPending}
              className="flex-1 rounded-lg bg-surface py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-60"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setEditing(true)}
              disabled={isPending}
              className="flex-1 rounded-lg bg-surface py-2 text-[13px] font-semibold text-ink-soft disabled:opacity-60"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 rounded-lg bg-[rgba(244,63,94,.1)] py-2 text-[13px] font-semibold text-danger disabled:opacity-60"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
