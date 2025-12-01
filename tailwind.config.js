/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors'

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom palette for 2025 minimalist aesthetic
        background: '#0f0f11', // Very dark grey/black
        surface: '#18181b', // Slightly lighter
        primary: colors.blue, // Use full blue palette as primary
        secondary: colors.slate, // Use full slate palette
        accent: colors.violet, // Use full violet palette
        text: '#f8fafc', // White-ish
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
