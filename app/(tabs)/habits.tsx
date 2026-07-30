import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, CheckCircle2, Circle, Trash2, X } from "lucide-react-native";
import { useHabits } from "@/hooks/useHabits";
import { Button, Card, Input, EmptyState } from "@/components/ui";
import { colors, palette, colorFromString } from "@/theme/colors";

export default function Habits() {
  const { habits, todayLogs, toggleHabit, addHabit, archiveHabit } = useHabits();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(palette[0]);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    await addHabit(name, color);
    setSaving(false);
    setName("");
    setColor(palette[0]);
    setModalOpen(false);
  }

  function confirmArchive(id: string, habitName: string) {
    Alert.alert("Remove habit", `Stop tracking "${habitName}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const habit = habits.find((h) => h.id === id);
          if (habit) archiveHabit(habit);
        },
      },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Text className="text-text text-2xl font-bold">Habits</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Plus color="#fff" size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {habits.length === 0 ? (
          <Card className="mt-4">
            <EmptyState
              title="Build your first habit"
              subtitle="Tap + to add something you want to do every day."
            />
          </Card>
        ) : (
          <View className="gap-2.5">
            {habits.map((habit) => {
              const done = todayLogs[habit.id]?.completed;
              const c = habit.color ?? colorFromString(habit.name);
              return (
                <Card key={habit.id} className="flex-row items-center">
                  <Pressable
                    onPress={() => toggleHabit(habit)}
                    className="flex-row items-center flex-1"
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
                  </Pressable>
                  <Pressable
                    onPress={() => confirmArchive(habit.id, habit.name)}
                    className="pl-3"
                    hitSlop={8}
                  >
                    <Trash2 color={colors.muted} size={18} />
                  </Pressable>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add-habit modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text text-xl font-bold">New habit</Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>

            <Input
              label="Name"
              placeholder="e.g. Read 20 minutes"
              value={name}
              onChangeText={setName}
              autoFocus
            />

            <Text className="text-muted text-sm mb-2 mt-4 ml-1">Color</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {palette.map((p) => (
                <Pressable
                  key={p}
                  onPress={() => setColor(p)}
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: p,
                    borderWidth: color === p ? 3 : 0,
                    borderColor: "#fff",
                  }}
                />
              ))}
            </View>

            <Button title="Add habit" onPress={save} loading={saving} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
