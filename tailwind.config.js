/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f5f5f0",
          100: "#e8e8e0",
          200: "#d0d0c4",
          300: "#b0b0a0",
          400: "#888878",
          500: "#666658",
          600: "#4a4a3e",
          700: "#333328",
          800: "#1e1e16",
          900: "#0f0f0a",
        },
        ember: {
          50: "#fff5ed",
          100: "#ffe8d5",
          200: "#ffc9a0",
          300: "#ffa05c",
          400: "#ff7520",
          500: "#f55200",
          600: "#c93c00",
          700: "#a02c00",
          800: "#7a2200",
          900: "#4a1500",
        },
        cream: "#faf9f6",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease forwards",
        "fade-in": "fadeIn 0.4s ease forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};

