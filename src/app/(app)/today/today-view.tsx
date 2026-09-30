"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import {
  type Completion,
  type HabitWithGoal,
  HISTORY_WEEKS,
  addDays,
  backdatedCreatedAt,
  buildWeekProgress,
  countByHabit,
  currentStreak,
  dailyActivity,
  lastNWeeks,
  parseISODate,
  toISODate,
  weekDays,
  weekProgress,
  weekStart,
  weeklyGoal,
} from "@/lib/streaks";
import { colorForHabit } from "@/lib/habit-colors";
import { toggleCompletion } from "./actions";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

interface Habit extends HabitWithGoal {
  name: string;
}

interface TodayViewProps {
  initialHabits: Habit[];
  initialCompletions: Completion[]; // last HISTORY_WEEKS weeks (plus a week of margin)
  serverToday: string;
  threshold: number;
}

// Completions are kept as a set of "habitId|date" keys so toggling any day is a set edit.
function completionKey(habitId: string, date: string): string {
  return `${habitId}|${date}`;
}

function toCompletions(keys: Set<string>): Completion[] {
  return [...keys].map((key) => {
    const [habit_id, date] = key.split("|");
    return { habit_id, date };
  });
}

function formatDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return parseISODate(date).toLocaleDateString("en-US", options);
}

function dayTitle(date: string, today: string): string {
  if (date === today) return "Today";
  if (date === addDays(today, -1)) return "Yesterday";
  return formatDate(date, { weekday: "long" });
}

const noSubscription = () => () => {};

export function TodayView({
  initialHabits,
  initialCompletions,
  serverToday,
  threshold,
}: TodayViewProps) {
  // The browser's local day. The server renders with its own (UTC) day, and hydration then
  // switches to the local one without a mismatch.
  const today = useSyncExternalStore(
    noSubscription,
    () => toISODate(new Date()),
    () => serverToday,
  );

  const [habits, setHabits] = useState(initialHabits);
  const [doneKeys, setDoneKeys] = useState(
    () => new Set(initialCompletions.map((c) => completionKey(c.habit_id, c.date))),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [, startTransition] = useTransition();

  const weeks = lastNWeeks(HISTORY_WEEKS, parseISODate(today));
  const earliestDate = weeks[weeks.length - 1];
  const date =
    selectedDate && selectedDate <= today && selectedDate >= earliestDate
      ? selectedDate
      : today;
  const isToday = date === today;

  const completions = toCompletions(doneKeys);
  const streak = currentStreak(buildWeekProgress(weeks, habits, completions), threshold);

  const selectedWeekStart = weekStart(parseISODate(date));
  const isCurrentWeek = selectedWeekStart === weeks[0];
  const weekLabel = isCurrentWeek
    ? "This week"
    : `Week of ${formatDate(selectedWeekStart, { month: "short", day: "numeric" })}`;
  const progress = weekProgress(selectedWeekStart, habits, completions);
  const week = dailyActivity(weekDays(selectedWeekStart), habits, completions);

  // A few-times-a-week habit that already met its goal earlier that week moves to the
  // bottom, dimmed: it can still be checked off, but it no longer competes to be "Next".
  const countsBefore = countByHabit(
    selectedWeekStart,
    completions.filter((c) => c.date !== date),
  );
  const items = habits.map((habit, i) => {
    const goal = weeklyGoal(habit, selectedWeekStart);
    const before = countsBefore.get(habit.id) ?? 0;
    return {
      habit,
      color: colorForHabit(i),
      goal,
      before,
      goalMet: habit.times_per_week < 7 && goal > 0 && before >= goal,
    };
  });
  const pending = items.filter((item) => !item.goalMet);
  const met = items.filter((item) => item.goalMet);

  const isDone = (habitId: string) => doneKeys.has(completionKey(habitId, date));
  const total = pending.length;
  const doneCount = pending.filter((item) => isDone(item.habit.id)).length;
  // "Next" is a nudge for the day in progress, so it only shows on today.
  const nextPendingId = isToday
    ? pending.find((item) => !isDone(item.habit.id))?.habit.id
    : undefined;
  const progressDeg = Math.round(progress.ratio * 360);

  function goToDate(target: string) {
    setSelectedDate(target === today ? null : target);
  }

  function handleToggle(habitId: string) {
    const key = completionKey(habitId, date);
    const wasCompleted = doneKeys.has(key);
    const nextKeys = new Set(doneKeys);
    if (wasCompleted) nextKeys.delete(key);
    else nextKeys.add(key);

    // Mirrors the server: logging a day before the habit existed moves its start back.
    const nextHabits = wasCompleted
      ? habits
      : habits.map((h) =>
          h.id === habitId && date < toISODate(new Date(h.created_at))
            ? { ...h, created_at: backdatedCreatedAt(date) }
            : h,
        );

    const ratioAfter = weekProgress(
      selectedWeekStart,
      nextHabits,
      toCompletions(nextKeys),
    ).ratio;
    if (progress.ratio < threshold && ratioAfter >= threshold) {
      setCelebrating(true);
      setTimeout(() => setCelebrating(false), 2000);
    }

    setDoneKeys(nextKeys);
    setHabits(nextHabits);
    startTransition(async () => {
      try {
        await toggleCompletion(habitId, date, wasCompleted);
      } catch {
        setDoneKeys(doneKeys);
        setHabits(habits);
      }
    });
  }

  function renderHabit({ habit, color, goal, before, goalMet }: (typeof items)[number]) {
    const done = isDone(habit.id);
    const isNext = habit.id === nextPendingId;
    const showWeekCount = habit.times_per_week < 7 && goal > 0;
    return (
      <button
        key={habit.id}
        type="button"
        onClick={() => handleToggle(habit.id)}
        className="flex items-center gap-3 rounded-[14px] border p-[12px_14px] text-left transition-transform"
        style={{
          background: isNext ? "#171A1E" : "#13151A",
          borderColor: isNext ? "rgba(255,138,61,.35)" : "rgba(255,255,255,.06)",
          opacity: goalMet ? 0.55 : 1,
        }}
      >
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-sm font-bold"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color,
          }}
        >
          {habit.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span
            className="truncate text-[14.5px] font-bold"
            style={{
              color: done ? "#5B5E64" : "#F2F1EC",
              textDecoration: done ? "line-through" : "none",
            }}
          >
            {habit.name}
          </span>
          {showWeekCount && (
            <span className="text-[11.5px] font-semibold text-ink-faint">
              {before + (done ? 1 : 0)}/{goal} {isCurrentWeek ? "this week" : "that week"}
            </span>
          )}
        </div>
        {isNext && (
          <span className="shrink-0 rounded-full bg-[rgba(255,138,61,.12)] px-2 py-1 text-[11px] font-bold whitespace-nowrap text-accent">
            Next
          </span>
        )}
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{
            background: done ? "#2DD4BF" : "transparent",
            border: `2px solid ${done ? "#2DD4BF" : "rgba(255,255,255,.15)"}`,
          }}
        >
          {done && <span className="text-sm font-extrabold text-surface">✓</span>}
        </div>
      </button>
    );
  }

  const title = dayTitle(date, today);
  const dateLabel = formatDate(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...(date.slice(0, 4) !== today.slice(0, 4) && { year: "numeric" }),
  });
  const arrowClass =
    "flex h-8 w-8 items-center justify-center rounded-full border border-border text-lg leading-none text-ink-soft disabled:opacity-25";

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-col gap-2.5">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold tracking-wide text-ink-faint">
              {dateLabel}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToDate(addDays(date, -1))}
                disabled={date <= earliestDate}
                className={arrowClass}
                aria-label="Previous day"
              >
                ‹
              </button>
              <div className="truncate font-display text-2xl font-bold text-ink">{title}</div>
              <button
                type="button"
                onClick={() => goToDate(addDays(date, 1))}
                disabled={isToday}
                className={arrowClass}
                aria-label="Next day"
              >
                ›
              </button>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs font-semibold text-ink-faint">Done</div>
            <div className="font-display text-lg font-bold text-ink">
              {doneCount}/{total}
            </div>
          </div>
        </div>
        {!isToday && (
          <div className="flex items-center justify-between rounded-[12px] border border-[rgba(255,138,61,.25)] bg-[rgba(255,138,61,.08)] px-3.5 py-2.5 text-[12.5px]">
            <span className="font-semibold text-ink-soft">Editing a past day</span>
            <button
              type="button"
              onClick={() => goToDate(today)}
              className="font-bold text-accent"
            >
              Back to today
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-[18px] rounded-[20px] border border-border bg-card p-[22px]">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(#FF8A3D ${progressDeg}deg, rgba(255,255,255,.08) ${progressDeg}deg)`,
          }}
        >
          <div className="flex h-[72px] w-[72px] flex-col items-center justify-center rounded-full bg-card">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              style={{ animation: "rt-flicker 2.4s ease-in-out infinite" }}
            >
              <path
                d="M12 2c-1.2 4-6 5.2-6 11a6 6 0 0012 0c0-2.1-1-3.3-2.1-4.3.4 2-1 3-2 2 .6-2-1-4.4-1.9-8.7z"
                fill="#FF8A3D"
              />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-[40px] leading-none font-bold text-ink">
              {streak}
            </span>
            <span className="text-sm font-semibold text-ink-soft">week streak</span>
          </div>
          <div className="mt-1 text-[12.5px] text-ink-faint">
            {weekLabel} {progress.done}/{progress.goal} · {Math.round(threshold * 100)}%+
            keeps the streak
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
          {weekLabel}
        </div>
        <div className="flex gap-2">
          {week.map((day, i) => {
            const isSelected = day.date === date;
            const isFuture = day.date > today;
            const dotColor =
              day.ratio >= threshold ? "#2DD4BF" : day.ratio > 0 ? "#FF8A3D" : null;
            return (
              <button
                key={day.date}
                type="button"
                onClick={() => goToDate(day.date)}
                disabled={isFuture || day.date < earliestDate}
                aria-label={formatDate(day.date, { weekday: "long", month: "long", day: "numeric" })}
                aria-pressed={isSelected}
                className="flex flex-1 flex-col items-center gap-1.5 disabled:cursor-default"
                style={{
                  color: isSelected ? "#F2F1EC" : day.date === today ? "#FF8A3D" : "#5B5E64",
                  opacity: isFuture ? 0.45 : 1,
                }}
              >
                <span className="text-[11px] font-bold opacity-75">{DAY_LETTERS[i]}</span>
                <div
                  className="h-[26px] w-[26px] rounded-full"
                  style={{
                    background: dotColor ?? "transparent",
                    border: `2px solid ${dotColor ?? "rgba(255,255,255,.12)"}`,
                    boxShadow: isSelected ? "0 0 0 2px rgba(255,255,255,.35)" : "none",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="text-[12.5px] font-bold tracking-[.04em] text-ink-faint uppercase">
          {title}&apos;s habits
        </div>
        {habits.length === 0 ? (
          <p className="text-sm text-ink-soft">
            No active habits yet. Create your first one in Habits.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map(renderHabit)}
            {met.length > 0 && (
              <div className="mt-2 px-1 text-[12px] font-bold tracking-[.04em] text-ink-faint uppercase">
                Weekly goal met
              </div>
            )}
            {met.map(renderHabit)}
          </div>
        )}
      </div>

      {celebrating && (
        <div
          onClick={() => setCelebrating(false)}
          className="fixed inset-0 z-20 flex items-center justify-center backdrop-blur-[2px]"
          style={{ background: "rgba(5,6,7,.72)" }}
        >
          <div
            className="flex flex-col items-center gap-2.5 rounded-[20px] border px-8 py-7"
            style={{
              animation: "rt-pop .35s cubic-bezier(.2,.8,.3,1)",
              background: "#13151A",
              borderColor: "rgba(255,138,61,.35)",
              boxShadow: "0 0 60px rgba(255,138,61,.25)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24">
              <path
                d="M12 2c-1.2 4-6 5.2-6 11a6 6 0 0012 0c0-2.1-1-3.3-2.1-4.3.4 2-1 3-2 2 .6-2-1-4.4-1.9-8.7z"
                fill="#FF8A3D"
              />
            </svg>
            <div className="font-display text-xl font-bold text-ink">Week complete</div>
            <div className="text-[13px] text-ink-soft">
              Streak: {streak} {streak === 1 ? "week" : "weeks"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
