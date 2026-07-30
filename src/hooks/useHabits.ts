import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Habit, HabitLog } from "@/lib/types";
import { todayKey } from "@/lib/date";
import { useUserId } from "./useSession";

// Loads the user's active habits plus a lookup of today's log per habit,
// and exposes a toggle that upserts today's completion.
export function useHabits() {
  const userId = useUserId();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<Record<string, HabitLog>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const today = todayKey();

    const [{ data: h }, { data: logs }] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("archived", false)
        .order("created_at", { ascending: true }),
      supabase.from("habit_logs").select("*").eq("date", today),
    ]);

    setHabits((h as Habit[]) ?? []);
    const map: Record<string, HabitLog> = {};
    ((logs as HabitLog[]) ?? []).forEach((l) => (map[l.habit_id] = l));
    setTodayLogs(map);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleHabit = useCallback(
    async (habit: Habit) => {
      if (!userId) return;
      const today = todayKey();
      const existing = todayLogs[habit.id];
      const nextCompleted = !existing?.completed;

      // Optimistic update.
      setTodayLogs((prev) => ({
        ...prev,
        [habit.id]: {
          id: existing?.id ?? `temp-${habit.id}`,
          user_id: userId,
          habit_id: habit.id,
          date: today,
          count: nextCompleted ? habit.target_per_day : 0,
          completed: nextCompleted,
        },
      }));

      const { data, error } = await supabase
        .from("habit_logs")
        .upsert(
          {
            user_id: userId,
            habit_id: habit.id,
            date: today,
            count: nextCompleted ? habit.target_per_day : 0,
            completed: nextCompleted,
          },
          { onConflict: "habit_id,date" }
        )
        .select()
        .single();

      if (!error && data) {
        setTodayLogs((prev) => ({ ...prev, [habit.id]: data as HabitLog }));
      } else {
        // Revert on failure.
        load();
      }
    },
    [userId, todayLogs, load]
  );

  const addHabit = useCallback(
    async (name: string, color: string) => {
      if (!userId || !name.trim()) return;
      const { error } = await supabase.from("habits").insert({
        user_id: userId,
        name: name.trim(),
        color,
        target_per_day: 1,
      });
      if (!error) load();
    },
    [userId, load]
  );

  const archiveHabit = useCallback(
    async (habit: Habit) => {
      await supabase
        .from("habits")
        .update({ archived: true })
        .eq("id", habit.id);
      load();
    },
    [load]
  );

  return {
    habits,
    todayLogs,
    loading,
    reload: load,
    toggleHabit,
    addHabit,
    archiveHabit,
  };
}
