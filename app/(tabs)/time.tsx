import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Trash2 } from "lucide-react-native";
import { useTimeEntries, TIME_CATEGORIES } from "@/hooks/useTimeEntries";
import { Card, Input, Button, EmptyState } from "@/components/ui";
import { formatMinutes } from "@/lib/date";
import { colors, colorFromString } from "@/theme/colors";

const QUICK_MINUTES = [15, 30, 45, 60, 90, 120];

export default function TimeScreen() {
  const { entries, totalMinutes, byCategory, addEntry, deleteEntry } =
    useTimeEntries();
  const [category, setCategory] = useState(TIME_CATEGORIES[0]);
  const [minutes, setMinutes] = useState(30);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function log() {
    setSaving(true);
    await addEntry(category, minutes, note);
    setSaving(false);
    setNote("");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="px-5 pt-2 pb-3">
        <Text className="text-text text-2xl font-bold">Time</Text>
        <Text className="text-muted text-sm">
          Log where your time goes to see what to change.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {/* Where time goes */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text font-semibold">Where time went today</Text>
            <Text className="text-accent font-bold">
              {formatMinutes(totalMinutes)}
            </Text>
          </View>
          {byCategory.length === 0 ? (
            <Text className="text-muted text-sm">Nothing logged yet.</Text>
          ) : (
            <View className="gap-2.5">
              {byCategory.map(({ category: cat, minutes: m }) => {
                const pct = totalMinutes > 0 ? (m / totalMinutes) * 100 : 0;
                const c = colorFromString(cat);
                return (
                  <View key={cat}>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-text text-sm">{cat}</Text>
                      <Text className="text-muted text-sm">
                        {formatMinutes(m)}
                      </Text>
                    </View>
                    <View className="h-2 rounded-full bg-surface2 overflow-hidden">
                      <View
                        className="h-2 rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: c }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Quick log */}
        <Card className="mb-4">
          <Text className="text-text font-semibold mb-3">Log time</Text>

          <Text className="text-muted text-sm mb-2">Category</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {TIME_CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                className={`px-3 py-2 rounded-full border ${
                  category === c
                    ? "bg-primary border-primary"
                    : "bg-surface2 border-border"
                }`}
              >
                <Text
                  className={category === c ? "text-white" : "text-muted"}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-muted text-sm mb-2">
            Duration — {formatMinutes(minutes)}
          </Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {QUICK_MINUTES.map((m) => (
              <Pressable
                key={m}
                onPress={() => setMinutes(m)}
                className={`px-3 py-2 rounded-full border ${
                  minutes === m
                    ? "bg-accent border-accent"
                    : "bg-surface2 border-border"
                }`}
              >
                <Text className={minutes === m ? "text-bg font-semibold" : "text-muted"}>
                  {formatMinutes(m)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            placeholder="Note (optional)"
            value={note}
            onChangeText={setNote}
            className="mb-3"
          />
          <Button title="Add entry" onPress={log} loading={saving} />
        </Card>

        {/* Entries list */}
        <Text className="text-text text-lg font-semibold mb-3">
          Today&apos;s entries
        </Text>
        {entries.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Clock color={colors.muted} size={28} />}
              title="No entries yet"
              subtitle="Log your first block of time above."
            />
          </Card>
        ) : (
          <View className="gap-2.5">
            {entries.map((e) => (
              <Card key={e.id} className="flex-row items-center">
                <View
                  className="w-2.5 h-9 rounded-full mr-3"
                  style={{ backgroundColor: colorFromString(e.category) }}
                />
                <View className="flex-1">
                  <Text className="text-text">{e.category}</Text>
                  {e.description ? (
                    <Text className="text-muted text-xs">{e.description}</Text>
                  ) : null}
                </View>
                <Text className="text-muted mr-3">
                  {formatMinutes(e.duration_minutes)}
                </Text>
                <Pressable onPress={() => deleteEntry(e.id)} hitSlop={8}>
                  <Trash2 color={colors.muted} size={18} />
                </Pressable>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
