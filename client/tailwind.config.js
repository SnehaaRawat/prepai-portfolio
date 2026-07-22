/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0F1214",
          900: "#14171A",
          800: "#1D2124",
          700: "#2A2F33",
        },
        accent: {
          DEFAULT: "#4C7FFF",
          soft: "#8FACFF",
        },
        signal: {
          DEFAULT: "#F2B84B",
          soft: "#F7D18C",
        },
        paper: "#F6F5F1",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
