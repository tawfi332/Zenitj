import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Target, Minus, Check, Trash2, X } from "lucide-react-native";
import { useGoals } from "@/hooks/useGoals";
import { Card, Input, Button, EmptyState } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function Goals() {
  const { goals, addGoal, setProgress, archiveGoal } = useGoals();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await addGoal(title, desc);
    setSaving(false);
    setTitle("");
    setDesc("");
    setModalOpen(false);
  }

  function confirmArchive(id: string) {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return;
    Alert.alert("Remove goal", `Remove "${goal.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => archiveGoal(goal) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <Text className="text-text text-2xl font-bold">Goals</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Plus color="#fff" size={22} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {goals.length === 0 ? (
          <Card className="mt-4">
            <EmptyState
              icon={<Target color={colors.muted} size={28} />}
              title="Set a goal"
              subtitle="Add a longer-term goal and nudge its progress over time."
            />
          </Card>
        ) : (
          <View className="gap-3">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-text text-base font-semibold">
                      {goal.title}
                    </Text>
                    {goal.description ? (
                      <Text className="text-muted text-sm mt-0.5">
                        {goal.description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable onPress={() => confirmArchive(goal.id)} hitSlop={8}>
                    <Trash2 color={colors.muted} size={18} />
                  </Pressable>
                </View>

                {/* Progress bar */}
                <View className="mt-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-muted text-xs">
                      {goal.status === "done" ? "Completed" : "Progress"}
                    </Text>
                    <Text className="text-text text-xs font-semibold">
                      {goal.progress}%
                    </Text>
                  </View>
                  <View className="h-2.5 rounded-full bg-surface2 overflow-hidden">
                    <View
                      className="h-2.5 rounded-full"
                      style={{
                        width: `${goal.progress}%`,
                        backgroundColor:
                          goal.status === "done" ? colors.success : colors.primary,
                      }}
                    />
                  </View>
                </View>

                <View className="flex-row gap-2 mt-3">
                  <StepButton
                    icon={<Minus color={colors.text} size={16} />}
                    onPress={() => setProgress(goal, goal.progress - 10)}
                  />
                  <StepButton
                    icon={<Plus color={colors.text} size={16} />}
                    onPress={() => setProgress(goal, goal.progress + 10)}
                  />
                  <Pressable
                    onPress={() => setProgress(goal, 100)}
                    className="flex-1 flex-row items-center justify-center bg-success/20 border border-success rounded-xl py-2"
                  >
                    <Check color={colors.success} size={16} />
                    <Text className="text-success font-semibold ml-1">Done</Text>
                  </Pressable>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-surface rounded-t-3xl p-6 border-t border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text text-xl font-bold">New goal</Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <View className="gap-3">
              <Input
                label="Title"
                placeholder="e.g. Run a 10k"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
              <Input
                label="Description (optional)"
                placeholder="Why does this matter?"
                value={desc}
                onChangeText={setDesc}
              />
              <Button
                title="Add goal"
                onPress={save}
                loading={saving}
                className="mt-1"
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StepButton({
  icon,
  onPress,
}: {
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="w-11 h-10 items-center justify-center bg-surface2 border border-border rounded-xl"
    >
      {icon}
    </Pressable>
  );
}
