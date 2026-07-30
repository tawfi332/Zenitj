import { Habit, HabitLog, TimeEntry } from "./types";

// The daily score (0-100) blends two signals:
//   - habit completion: how many of today's habits are done
//   - intentionality:   whether the user logged how they spent their time
//
// This keeps the score meaningful even on a day with few habits, and rewards
// the core behaviour the app is about: noticing where your time goes.

const HABIT_WEIGHT = 0.8;
const TIME_WEIGHT = 0.2;
// Logging ~4 hours of tracked time counts as "fully intentional" for the day.
const TIME_TARGET_MINUTES = 240;

export function computeDailyScore(
  habits: Habit[],
  logsByHabitId: Record<string, HabitLog | undefined>,
  timeMinutes: number
): number {
  const active = habits.filter((h) => !h.archived);

  let habitRatio = 0;
  if (active.length > 0) {
    const done = active.filter((h) => logsByHabitId[h.id]?.completed).length;
    habitRatio = done / active.length;
  } else {
    // No habits yet — don't punish the user; lean entirely on time logging.
    habitRatio = timeMinutes > 0 ? 1 : 0;
  }

  const timeRatio = Math.min(1, timeMinutes / TIME_TARGET_MINUTES);

  const raw =
    active.length > 0
      ? habitRatio * HABIT_WEIGHT + timeRatio * TIME_WEIGHT
      : timeRatio;

  return Math.round(raw * 100);
}

// Streak = number of consecutive days with at least one completed habit OR
// any logged time. Today not yet being active does not break the streak (the
// day isn't over); we start counting from today if active, otherwise yesterday.
export function computeStreak(
  logs: HabitLog[],
  timeEntries: TimeEntry[]
): number {
  const activeDays = new Set<string>();
  logs.forEach((l) => {
    if (l.completed) activeDays.add(l.date);
  });
  timeEntries.forEach((t) => {
    if (t.duration_minutes > 0) activeDays.add(t.date);
  });

  const cursor = new Date();
  const key = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // If today isn't active yet, start the walk from yesterday.
  if (!activeDays.has(key(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (activeDays.has(key(cursor)) && streak <= 366) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 60) return "On track";
  if (score >= 35) return "Getting there";
  if (score > 0) return "Slow day";
  return "Let's start";
}
