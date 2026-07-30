import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewProps,
} from "react-native";
import { colors } from "@/theme/colors";

// ---- Card ------------------------------------------------------------------
export function Card({
  className = "",
  ...props
}: ViewProps & { className?: string }) {
  return (
    <View
      className={`bg-surface border border-border rounded-2xl p-4 ${className}`}
      {...props}
    />
  );
}

// ---- Button ----------------------------------------------------------------
type ButtonProps = PressableProps & {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  className?: string;
};

export function Button({
  title,
  variant = "primary",
  loading,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "rounded-xl px-4 py-3 items-center justify-center flex-row active:opacity-80";
  const variants: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-surface2 border border-border",
    ghost: "bg-transparent",
    danger: "bg-danger/20 border border-danger",
  };
  const textColor: Record<string, string> = {
    primary: "text-white",
    secondary: "text-text",
    ghost: "text-primary",
    danger: "text-danger",
  };
  const isDisabled = disabled || loading;
  return (
    <Pressable
      className={`${base} ${variants[variant]} ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : colors.primary} />
      ) : (
        <Text className={`font-semibold text-base ${textColor[variant]}`}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

// ---- Input -----------------------------------------------------------------
export function Input({
  label,
  className = "",
  ...props
}: TextInputProps & { label?: string; className?: string }) {
  return (
    <View className="w-full">
      {label ? (
        <Text className="text-muted text-sm mb-1.5 ml-1">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.muted}
        className={`bg-surface2 border border-border rounded-xl px-4 py-3 text-text text-base ${className}`}
        {...props}
      />
    </View>
  );
}

// ---- Typography ------------------------------------------------------------
export function Title({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-text text-2xl font-bold ${className}`}>
      {children}
    </Text>
  );
}

export function Subtle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <Text className={`text-muted text-sm ${className}`}>{children}</Text>;
}

// ---- Empty state -----------------------------------------------------------
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="items-center justify-center py-12 px-6">
      {icon ? <View className="mb-3 opacity-70">{icon}</View> : null}
      <Text className="text-text text-lg font-semibold text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-muted text-sm text-center mt-1">{subtitle}</Text>
      ) : null}
    </View>
  );
}
