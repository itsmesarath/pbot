/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'chart-bg': '#1e222d',
        'chart-grid': '#2a2e39',
        'up-candle': '#26a69a',
        'down-candle': '#ef5350',
      }
    },
  },
  plugins: [],
}
