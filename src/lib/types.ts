// Shared row types mirroring the Supabase schema (supabase/migrations/0001_init.sql).

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  target_per_day: number;
  archived: boolean;
  created_at: string;
};

export type HabitLog = {
  id: string;
  user_id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  count: number;
  completed: boolean;
};

export type TimeEntry = {
  id: string;
  user_id: string;
  category: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  duration_minutes: number;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number; // 0-100
  status: "active" | "done" | "archived";
  created_at: string;
};

export type FutureCard = {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
};
