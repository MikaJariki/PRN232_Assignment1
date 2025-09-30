import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // UmaMusume-inspired pastel brand palette (pink-violet-cyan)
        brand: {
          50: "#fff0f6",
          100: "#ffe1ef",
          200: "#ffc7e2",
          300: "#f7a1d2",
          400: "#e178c6",
          500: "#c855b5",
          600: "#a644a0",
          700: "#86358b",
          800: "#6b2b73",
          900: "#4e1f55"
        }
      },
      boxShadow: { soft: "0 6px 20px rgba(0,0,0,.18)", glass: "0 8px 30px rgba(0,0,0,.25)" }
    }
  },
  plugins: [],
  darkMode: "class"
}
export default config
