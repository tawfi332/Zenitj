import React, { useState } from "react";
import { View, Text, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import { Button, Input, Title, Subtle } from "@/components/ui";
import { colors } from "@/theme/colors";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!hasSupabaseConfig) {
      Alert.alert(
        "Supabase not configured",
        "Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env, then restart."
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Use at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Could not sign up", error.message);
      return;
    }
    if (!data.session) {
      Alert.alert(
        "Check your inbox",
        "We sent a confirmation link. Confirm your email, then sign in."
      );
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <View className="items-center mb-10">
          <View className="w-16 h-16 rounded-2xl bg-accent/20 items-center justify-center mb-4">
            <UserPlus color={colors.accent} size={32} />
          </View>
          <Title className="text-3xl">Create account</Title>
          <Subtle className="mt-1">Start tracking your days with Zenitj.</Subtle>
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
            placeholder="At least 6 characters"
            value={password}
            onChangeText={setPassword}
          />
          <Button
            title="Sign up"
            onPress={signUp}
            loading={loading}
            className="mt-2"
          />
        </View>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted">Already have an account? </Text>
          <Link href="/(auth)/login" className="text-primary font-semibold">
            Sign in
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
