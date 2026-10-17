import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sama: {
          navy: {
            DEFAULT: "#0B192C",
            deep: "#060E18",
            surface: "#10233A",
            card: "#0F2642",
            border: "#1E3A5F",
            muted: "#8EA8C3",
          },
          orange: {
            DEFAULT: "#FF6B00",
            hover: "#E05E00",
            dark: "#C75000",
            light: "#FF8C38",
            soft: "#FFF3E8",
            glow: "rgba(255, 107, 0, 0.25)",
          },
          amber: "#FF9F1C",
          dark: "#0F172A",
          muted: "#475569",
          border: "#E2E8F0",
          bg: "#F8FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        "glow-orange": "0 0 25px rgba(255, 107, 0, 0.35)",
        "glow-navy": "0 0 35px rgba(11, 25, 44, 0.5)",
        "card-soft": "0 10px 30px -5px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 20px 40px -10px rgba(15, 23, 42, 0.12)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float-slow": "float 6s ease-in-out infinite",
        "float-reverse": "floatReverse 7s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
