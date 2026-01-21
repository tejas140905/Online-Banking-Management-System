/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        secondary: "#1E293B",
        accent: "#38BDF8",
        success: "#22C55E",
        danger: "#EF4444",
        muted: "#94A3B8",
        surface: "#0B1224",
      },
    },
  },
  plugins: [],
};
