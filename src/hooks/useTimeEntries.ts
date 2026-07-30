import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { TimeEntry } from "@/lib/types";
import { todayKey } from "@/lib/date";
import { useUserId } from "./useSession";

// Suggested categories for quick time logging.
export const TIME_CATEGORIES = [
  "Work",
  "Study",
  "Exercise",
  "Rest",
  "Social",
  "Chores",
  "Scrolling",
  "Other",
];

export function useTimeEntries(date: string = todayKey()) {
  const userId = useUserId();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("time_entries")
      .select("*")
      .eq("date", date)
      .order("created_at", { ascending: false });
    setEntries((data as TimeEntry[]) ?? []);
    setLoading(false);
  }, [userId, date]);

  useEffect(() => {
    load();
  }, [load]);

  const addEntry = useCallback(
    async (category: string, minutes: number, description?: string) => {
      if (!userId || minutes <= 0) return;
      const { error } = await supabase.from("time_entries").insert({
        user_id: userId,
        category,
        description: description?.trim() || null,
        date,
        duration_minutes: Math.round(minutes),
      });
      if (!error) load();
    },
    [userId, date, load]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      await supabase.from("time_entries").delete().eq("id", id);
      load();
    },
    [load]
  );

  const totalMinutes = entries.reduce((s, e) => s + e.duration_minutes, 0);

  // Minutes grouped by category, largest first — "where your time goes".
  const byCategory = Object.entries(
    entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.duration_minutes;
      return acc;
    }, {})
  )
    .map(([category, minutes]) => ({ category, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    entries,
    loading,
    totalMinutes,
    byCategory,
    reload: load,
    addEntry,
    deleteEntry,
  };
}
