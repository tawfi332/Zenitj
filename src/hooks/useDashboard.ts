import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { HabitLog, TimeEntry } from "@/lib/types";
import { addDays, todayKey } from "@/lib/date";
import { useUserId } from "./useSession";

// Pulls the last ~40 days of habit logs + time entries so we can compute the
// current streak, and today's tracked minutes for the daily score.
export function useDashboard() {
  const userId = useUserId();
  const [recentLogs, setRecentLogs] = useState<HabitLog[]>([]);
  const [recentTime, setRecentTime] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const since = addDays(todayKey(), -40);

    const [{ data: logs }, { data: time }] = await Promise.all([
      supabase.from("habit_logs").select("*").gte("date", since),
      supabase.from("time_entries").select("*").gte("date", since),
    ]);

    setRecentLogs((logs as HabitLog[]) ?? []);
    setRecentTime((time as TimeEntry[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const todayMinutes = recentTime
    .filter((t) => t.date === todayKey())
    .reduce((sum, t) => sum + t.duration_minutes, 0);

  return { recentLogs, recentTime, todayMinutes, loading, reload: load };
}
