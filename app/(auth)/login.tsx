import React, { useState } from "react";
import { View, Text, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { Sparkles } from "lucide-react-native";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { Button, Input, Title, Subtle } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!hasSupabaseConfig) {
      Alert.alert(
        "Supabase not configured",
        "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart."
      );
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) Alert.alert("Could not sign in", error.message);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-primary/20 items-center justify-center mb-4">
            <Sparkles color={colors.primary} size={32} />
          </View>
          <Title className="text-3xl">Zenitj</Title>
          <Subtle className="mt-1">Own your day. Track what matters.</Subtle>
        </View>

        <View className="gap-3">
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            secureTextEntry
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
          />
          <Button
            title="Sign in"
            onPress={signIn}
            loading={loading}
            className="mt-2"
          />
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted">No account yet? </Text>
          <Link href="/(auth)/signup" className="text-primary font-semibold">
            Create one
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
