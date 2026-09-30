// Rotating palette for each habit's round avatar. The index is the habit's position in
// the ordered list of active habits — it isn't stored per habit, so the color can shift
// when habits are reordered (fine for now).
const HABIT_COLORS = [
  "#2DD4BF",
  "#60A5FA",
  "#FB923C",
  "#A78BFA",
  "#F472B6",
  "#FBBF24",
];

export function colorForHabit(index: number): string {
  return HABIT_COLORS[index % HABIT_COLORS.length];
}
