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
        background: {
          primary: "#0a0f1a",
          secondary: "#111827",
          card: "#1a2332",
        },
        accent: {
          primary: "#ff4d4d",
          secondary: "#ff8c00",
          tertiary: "#00d9ff",
          success: "#00ff88",
        },
        border: {
          DEFAULT: "#2d3748",
        },
      },
      fontFamily: {
        heading: ["Orbitron", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 217, 255, 0.1)",
        glow: "0 0 20px rgba(255, 77, 77, 0.5)",
        "glow-cyan": "0 0 20px rgba(0, 217, 255, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;