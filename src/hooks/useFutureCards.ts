import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FutureCard } from "@/lib/types";
import { useUserId } from "./useSession";

export function useFutureCards() {
  const userId = useUserId();
  const [cards, setCards] = useState<FutureCard[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from("future_cards")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setCards((data as FutureCard[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const addCard = useCallback(
    async (title: string, note?: string) => {
      if (!userId || !title.trim()) return;
      const { error } = await supabase.from("future_cards").insert({
        user_id: userId,
        title: title.trim(),
        note: note?.trim() || null,
        sort_order: cards.length,
      });
      if (!error) load();
    },
    [userId, cards.length, load]
  );

  const deleteCard = useCallback(
    async (id: string) => {
      await supabase.from("future_cards").delete().eq("id", id);
      load();
    },
    [load]
  );

  return { cards, loading, reload: load, addCard, deleteCard };
}
