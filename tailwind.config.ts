import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        jetbrains: ["var(--font-jetbrains)", "monospace"],
      },
      colors: {
        "cyber-bg":      "#050505",
        "cyber-surface": "#0d0d12",
        "cyber-card":    "rgba(255,255,255,0.04)",
        "neon-cyan":     "#00F2FF",
        "neon-purple":   "#7000FF",
        "neon-pink":     "#FF2D78",
      },
      boxShadow: {
        "neon-cyan":     "0 0 15px rgba(0,242,255,0.35), 0 0 40px rgba(0,242,255,0.15)",
        "neon-purple":   "0 0 15px rgba(112,0,255,0.35), 0 0 40px rgba(112,0,255,0.15)",
        "neon-cyan-sm":  "0 0 8px rgba(0,242,255,0.4)",
        "neon-purple-sm":"0 0 8px rgba(112,0,255,0.4)",
        "glass":         "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
        "glass-lg":      "0 20px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      backgroundImage: {
        "cyber-grid":       "linear-gradient(rgba(0,242,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,242,255,0.03) 1px, transparent 1px)",
        "neon-gradient":    "linear-gradient(135deg, #00F2FF, #7000FF)",
        "neon-gradient-r":  "linear-gradient(135deg, #7000FF, #00F2FF)",
        "message-gradient": "linear-gradient(135deg, rgba(0,242,255,0.85), rgba(112,0,255,0.85))",
      },
      backgroundSize: {
        "cyber-grid": "40px 40px",
      },
      keyframes: {
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-neon": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.4" },
        },
        "glow-cyan": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(0,242,255,0.3)" },
          "50%":      { boxShadow: "0 0 25px rgba(0,242,255,0.7), 0 0 50px rgba(0,242,255,0.3)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        "fade-up": {
          from: { transform: "translateY(8px)", opacity: "0" },
          to:   { transform: "translateY(0)",   opacity: "1" },
        },
      },
      animation: {
        "spin-slow":       "spin-slow 4s linear infinite",
        "pulse-neon":      "pulse-neon 2.5s ease-in-out infinite",
        "glow-cyan":       "glow-cyan 2s ease-in-out infinite",
        "slide-in-right":  "slide-in-right 0.3s ease-out",
        "fade-up":         "fade-up 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
