export const DEFAULT_TIMES_PER_WEEK = 7;

export function normalizeTimesPerWeek(times: number): number {
  if (!Number.isFinite(times)) return DEFAULT_TIMES_PER_WEEK;
  return Math.min(7, Math.max(1, Math.round(times)));
}

export function frequencyLabel(times: number): string {
  if (times >= 7) return "Every day";
  if (times === 1) return "Once a week";
  return `${times} times a week`;
}
