import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status === "granted") return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === "granted";
}

// Schedule a single daily reminder at the given hour/minute. Cancels any
// previously scheduled Zenitj reminders first so we never stack duplicates.
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<boolean> {
  const ok = await ensurePermissions();
  if (!ok) return false;

  await cancelReminders();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reminders", {
      name: "Reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Zenitj",
      body: "Time to check in — log your habits and where your time went today.",
    },
    trigger: { hour, minute, repeats: true, channelId: "reminders" },
  });
  return true;
}

export async function cancelReminders(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
