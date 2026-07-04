import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1115",
        surface: "#171A21",
        surface2: "#1E2229",
        border: "#2A2F39",
        foreground: "#E7E5E0",
        muted: "#8B909C",
        amber: {
          DEFAULT: "#F5A623",
          dim: "#8A5F1E",
        },
        good: "#6FCF97",
        critical: "#EB5757",
      },
      fontFamily: {
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
