/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        neon: {
          emerald: "#10B981",
          amber: "#F59E0B",
          rose: "#F43F5E",
          violet: "#8B5CF6",
        },
        obsidian: "#0A0D14",
        panel: "#111622",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(15, 23, 42, 0.12)",
      },
    },
  },
  plugins: [],
};
