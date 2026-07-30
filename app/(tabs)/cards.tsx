import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus, Sparkles, Trash2, X } from "lucide-react-native";
import { useFutureCards } from "@/hooks/useFutureCards";
import { Card, Input, Button, EmptyState } from "@/components/ui";
import { colors, colorFromString } from "@/theme/colors";

export default function Cards() {
  const { cards, addCard, deleteCard } = useFutureCards();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await addCard(title, note);
    setSaving(false);
    setTitle("");
    setNote("");
    setModalOpen(false);
  }

  function confirmDelete(id: string, cardTitle: string) {
    Alert.alert("Remove card", `Remove "${cardTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => deleteCard(id) },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 pt-2 pb-1">
        <Text className="text-text text-2xl font-bold">Future</Text>
        <Pressable
          onPress={() => setModalOpen(true)}
          className="w-10 h-10 rounded-full bg-primary items-center justify-center"
        >
          <Plus color="#fff" size={22} />
        </Pressable>
      </View>
      <Text className="text-muted text-sm px-5 pb-3">
        Cards of who you&apos;re becoming. Review them daily.
      </Text>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4 }}>
        {cards.length === 0 ? (
          <Card className="mt-4">
            <EmptyState
              icon={<Sparkles color={colors.muted} size={28} />}
              title="Picture your future"
              subtitle="Add a card for a future version of you or a dream to keep in sight."
            />
          </Card>
        ) : (
          <View className="gap-3">
            {cards.map((card) => {
              const c = colorFromString(card.title);
              return (
                <View
                  key={card.id}
                  className="rounded-2xl p-5 overflow-hidden border border-border"
                  style={{ backgroundColor: c + "22" }}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-3">
                      <View
                        className="w-10 h-10 rounded-xl items-center justify-center mb-3"
                        style={{ backgroundColor: c }}
                      >
                        <Sparkles color="#fff" size={20} />
                      </View>
                      <Text className="text-text text-lg font-bold">
                        {card.title}
                      </Text>
                      {card.note ? (
                        <Text className="text-muted text-sm mt-1 leading-5">
                          {card.note}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => confirmDelete(card.id, card.title)}
                      hitSlop={8}
                    >
                      <Trash2 color={colors.muted} size={18} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
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
              <Text className="text-text text-xl font-bold">New future card</Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <View className="gap-3">
              <Input
                label="Title"
                placeholder="e.g. Calm, focused, healthy"
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
              <Input
                label="Note (optional)"
                placeholder="Describe this future you"
                value={note}
                onChangeText={setNote}
                multiline
              />
              <Button
                title="Add card"
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
