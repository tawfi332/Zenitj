import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";

type Props = {
  score: number; // 0-100
  size?: number;
  label?: string;
};

// A circular progress ring that visualises the daily score. Color shifts from
// warning -> primary -> success as the score climbs.
export function ScoreRing({ score, size = 160, label }: Props) {
  const clamped = Math.max(0, Math.min(100, score));
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  const ringColor =
    clamped >= 75 ? colors.success : clamped >= 40 ? colors.primary : colors.warning;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surface2}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          // Start the ring at the top (12 o'clock).
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View className="absolute items-center">
        <Text className="text-text text-4xl font-extrabold">{clamped}</Text>
        {label ? (
          <Text className="text-muted text-sm mt-0.5">{label}</Text>
        ) : null}
      </View>
    </View>
  );
}
