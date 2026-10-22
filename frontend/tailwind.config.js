/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0d14',
        surface: '#0f1422',
        'surface-card': '#111728',
        'surface-elevated': '#161e33',
        border: '#1e263d',
        'border-light': '#2a3454',
        accent: {
          purple: '#8b5cf6',
          'purple-hover': '#7c3aed',
          teal: '#06b6d4',
          emerald: '#10b981',
          rose: '#f43f5e',
          amber: '#f59e0b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-teal': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
