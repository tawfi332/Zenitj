import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, LogOut, Bell, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/hooks/useSession";
import { Card, Button } from "@/components/ui";
import { scheduleDailyReminder, cancelReminders } from "@/lib/notifications";
import { colors } from "@/theme/colors";

const REMINDER_KEY = "zenitj.reminder";
const REMINDER_TIMES = [
  { label: "Morning", hour: 8, minute: 0 },
  { label: "Midday", hour: 13, minute: 0 },
  { label: "Evening", hour: 20, minute: 0 },
];

export default function Settings() {
  const router = useRouter();
  const { session } = useSession();
  const [enabled, setEnabled] = useState(false);
  const [timeIdx, setTimeIdx] = useState(2);

  useEffect(() => {
    AsyncStorage.getItem(REMINDER_KEY).then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw) as { enabled: boolean; timeIdx: number };
        setEnabled(saved.enabled);
        setTimeIdx(saved.timeIdx ?? 2);
      } catch {
        // ignore malformed stored value
      }
    });
  }, []);

  async function persist(nextEnabled: boolean, nextIdx: number) {
    setEnabled(nextEnabled);
    setTimeIdx(nextIdx);
    await AsyncStorage.setItem(
      REMINDER_KEY,
      JSON.stringify({ enabled: nextEnabled, timeIdx: nextIdx })
    );

    if (nextEnabled) {
      const t = REMINDER_TIMES[nextIdx];
      const ok = await scheduleDailyReminder(t.hour, t.minute);
      if (!ok) {
        setEnabled(false);
        await AsyncStorage.setItem(
          REMINDER_KEY,
          JSON.stringify({ enabled: false, timeIdx: nextIdx })
        );
        Alert.alert(
          "Notifications off",
          "Enable notifications for Zenitj in your phone settings to get reminders."
        );
      }
    } else {
      await cancelReminders();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={["top"]}>
      <View className="flex-row items-center px-4 pt-2 pb-4">
        <Pressable onPress={() => router.back()} hitSlop={8} className="pr-2">
          <ChevronLeft color={colors.text} size={26} />
        </Pressable>
        <Text className="text-text text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 0 }}>
        {/* Account */}
        <Card className="mb-4 flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center mr-3">
            <Mail color={colors.primary} size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-muted text-xs">Signed in as</Text>
            <Text className="text-text text-base">
              {session?.user.email ?? "—"}
            </Text>
          </View>
        </Card>

        {/* Reminders */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <Bell color={colors.accent} size={20} />
              <View className="ml-3">
                <Text className="text-text text-base font-semibold">
                  Daily reminder
                </Text>
                <Text className="text-muted text-xs">
                  A nudge to log your day
                </Text>
              </View>
            </View>
            <Switch
              value={enabled}
              onValueChange={(v) => persist(v, timeIdx)}
              trackColor={{ true: colors.primary, false: colors.surface2 }}
              thumbColor="#fff"
            />
          </View>

          {enabled ? (
            <View className="flex-row gap-2 mt-4">
              {REMINDER_TIMES.map((t, i) => (
                <Pressable
                  key={t.label}
                  onPress={() => persist(true, i)}
                  className={`flex-1 py-2 rounded-xl border items-center ${
                    timeIdx === i
                      ? "bg-primary border-primary"
                      : "bg-surface2 border-border"
                  }`}
                >
                  <Text
                    className={timeIdx === i ? "text-white" : "text-muted"}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </Card>

        <Button
          title="Sign out"
          variant="danger"
          onPress={signOut}
          className="mt-2"
        />

        <View className="items-center mt-8 flex-row justify-center">
          <LogOut color={colors.muted} size={12} />
          <Text className="text-muted text-xs ml-1">Zenitj v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
