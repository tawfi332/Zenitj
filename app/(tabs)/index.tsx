import React, { useCallback } from "react";
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Flame, Clock, Settings, CheckCircle2, Circle } from "lucide-react-native";
import { useHabits } from "@/hooks/useHabits";
import { useDashboard } from "@/hooks/useDashboard";
import { computeDailyScore, computeStreak, scoreLabel } from "@/lib/score";
import { formatMinutes } from "@/lib/date";
import { ScoreRing } from "@/components/ScoreRing";
import { Card, EmptyState } from "@/components/ui";
import { colors, colorFromString } from "@/theme/colors";

export default function Dashboard() {
  const router = useRouter();
  const { habits, todayLogs, toggleHabit, reload: reloadHabits } = useHabits();
  const { recentLogs, recentTime, todayMinutes, loading, reload: reloadDash } =
    useDashboard();

  useFocusEffect(
    useCallback(() => {
      reloadHabits();
      reloadDash();
    }, [reloadHabits, reloadDash])
  );

  const score = computeDailyScore(habits, todayLogs, todayMinutes);
  const streak = computeStreak(recentLogs, recentTime);
  const doneCount = habits.filter((h) => todayLogs[h.id]?.completed).length;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              reloadHabits();
              reloadDash();
            }}
            tintColor={colors.primary}
          />
        }
      >
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-muted text-sm">{greeting}</Text>
            <Text className="text-text text-2xl font-bold">Today</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            className="w-10 h-10 rounded-full bg-surface border border-border items-center justify-center"
          >
            <Settings color={colors.muted} size={20} />
          </Pressable>
        </View>

        {/* Score */}
        <Card className="items-center py-6 mb-4">
          <ScoreRing score={score} label={scoreLabel(score)} />
          <View className="flex-row gap-6 mt-5">
            <Stat
              icon={<Flame color={colors.warning} size={18} />}
              value={`${streak}`}
              label={streak === 1 ? "day streak" : "day streak"}
            />
            <Stat
              icon={<CheckCircle2 color={colors.success} size={18} />}
              value={`${doneCount}/${habits.length}`}
              label="habits"
            />
            <Stat
              icon={<Clock color={colors.accent} size={18} />}
              value={formatMinutes(todayMinutes)}
              label="tracked"
            />
          </View>
        </Card>

        {/* Today's habits */}
        <Text className="text-text text-lg font-semibold mb-3 mt-2">
          Today&apos;s habits
        </Text>

        {habits.length === 0 ? (
          <Card>
            <EmptyState
              title="No habits yet"
              subtitle="Add habits in the Habits tab to start building your score."
            />
          </Card>
        ) : (
          <View className="gap-2.5">
            {habits.map((habit) => {
              const done = todayLogs[habit.id]?.completed;
              const c = habit.color ?? colorFromString(habit.name);
              return (
                <Pressable key={habit.id} onPress={() => toggleHabit(habit)}>
                  <Card
                    className={`flex-row items-center ${
                      done ? "opacity-70" : ""
                    }`}
                  >
                    <View
                      className="w-2.5 h-10 rounded-full mr-3"
                      style={{ backgroundColor: c }}
                    />
                    <Text
                      className={`flex-1 text-text text-base ${
                        done ? "line-through text-muted" : ""
                      }`}
                    >
                      {habit.name}
                    </Text>
                    {done ? (
                      <CheckCircle2 color={colors.success} size={26} />
                    ) : (
                      <Circle color={colors.muted} size={26} />
                    )}
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <View className="items-center">
      <View className="mb-1">{icon}</View>
      <Text className="text-text text-lg font-bold">{value}</Text>
      <Text className="text-muted text-xs">{label}</Text>
    </View>
  );
}
