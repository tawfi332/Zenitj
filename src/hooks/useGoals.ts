import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Goal } from "@/lib/types";
import { useUserId } from "./useSession";

export function useGoals() {
  const userId = useUserId();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("goals")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false });
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addGoal = useCallback(
    async (title: string, description?: string) => {
      if (!userId || !title.trim()) return;
      const { error } = await supabase.from("goals").insert({
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        progress: 0,
        status: "active",
      });
      if (!error) load();
    },
    [userId, load]
  );

  const setProgress = useCallback(
    async (goal: Goal, progress: number) => {
      const clamped = Math.max(0, Math.min(100, progress));
      // Optimistic
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goal.id
            ? { ...g, progress: clamped, status: clamped >= 100 ? "done" : "active" }
            : g
        )
      );
      await supabase
        .from("goals")
        .update({
          progress: clamped,
          status: clamped >= 100 ? "done" : "active",
        })
        .eq("id", goal.id);
    },
    []
  );

  const archiveGoal = useCallback(
    async (goal: Goal) => {
      await supabase.from("goals").update({ status: "archived" }).eq("id", goal.id);
      load();
    },
    [load]
  );

  return { goals, loading, reload: load, addGoal, setProgress, archiveGoal };
}
