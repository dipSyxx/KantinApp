/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          green: "#1B7A3D",
          "green-light": "#2D9E53",
          "green-dark": "#145C2E",
        },
        vote: {
          good: "#43A047",
          ok: "#FFB300",
          bad: "#E53935",
        },
      },
    },
  },
  plugins: [],
};
