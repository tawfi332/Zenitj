/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette — deep indigo/night with a vivid accent
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
      },
    },
  },
  plugins: [],
};
