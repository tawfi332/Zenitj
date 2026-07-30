// Central color tokens, mirrored in tailwind.config.js so we can use them
// both via NativeWind `className` and directly in JS (charts, icons, SVG).
export const colors = {
  bg: "#0B1120",
  surface: "#131C31",
  surface2: "#1B2540",
  border: "#26314F",
  primary: "#6366F1",
  primaryDark: "#4F46E5",
  accent: "#22D3EE",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  muted: "#8B95B2",
  text: "#E8ECF7",
};

// A rotating palette for user-created habits / time categories.
export const palette = [
  "#6366F1",
  "#22D3EE",
  "#34D399",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#F472B6",
  "#60A5FA",
];

export function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}
