/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0A0C10",
          secondary: "#111520",
          card: "#151A28",
          "card-hover": "#1A2035",
          input: "#0D1018",
        },
        border: {
          DEFAULT: "#1E2640",
          bright: "#2A3558",
        },
        gold: {
          DEFAULT: "#C5A44E",
          dim: "#8B7635",
          bright: "#E8C84A",
        },
        accent: "#4A90D9",
        civ: {
          red: "#D94A4A",
          green: "#4AD97A",
        },
      },
      fontFamily: {
        display: ["Cinzel", "serif"],
        body: ["Barlow", "sans-serif"],
        condensed: ["Barlow Condensed", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
