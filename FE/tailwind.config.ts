import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa",
          500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95"
        }
      },
      boxShadow: { soft: "0 6px 20px rgba(0,0,0,.18)", glass: "0 8px 30px rgba(0,0,0,.25)" }
    }
  },
  plugins: [],
  darkMode: "class"
}
export default config
