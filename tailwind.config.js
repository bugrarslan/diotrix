/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./context/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f3ff",
          500: "#8b5cf6",
          600: "#7c3aed",
          900: "#4c1d95",
        },
        light: {
          background: "#f8fafc",
          surface: "#ffffff",
          card: "#eef2ff",
          border: "rgba(15, 23, 42, 0.12)",
          text: {
            primary: "#0f172a",
            secondary: "#334155",
            muted: "#64748b",
          },
        },
        dark: {
          background: "#05050a",
          surface: "#101124",
          card: "#16172d",
          border: "rgba(148, 163, 184, 0.22)",
          text: {
            primary: "#f8fafc",
            secondary: "#cbd5f5",
            muted: "#94a3b8",
          },
        },
      },
    },
  },
  plugins: [],
};
