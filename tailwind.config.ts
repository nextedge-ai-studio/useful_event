import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        skyglass: {
          50: "#f5f9ff",
          100: "#e8f1ff",
          200: "#cfe2ff",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
        },
      },
      boxShadow: {
        "blue-soft": "0 20px 60px rgba(37, 99, 235, 0.12)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        float: "float 10s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
