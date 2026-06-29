import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Playful, trustworthy palette — bright but not garish.
        brand: {
          purple: "#6C4AB6",
          violet: "#8D72E1",
          pink: "#FF5DA2",
          yellow: "#FFD23F",
          sky: "#34C6F4",
          green: "#3DD68C",
          ink: "#1F1147",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        playful: "0 18px 40px -12px rgba(108, 74, 182, 0.45)",
      },
      keyframes: {
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
