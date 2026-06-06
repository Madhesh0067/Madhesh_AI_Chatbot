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
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          500: '#8b5cf6', // Violet 500
          600: '#7c3aed', // Violet 600
          700: '#6d28d9', // Violet 700
          800: '#5b21b6', // Violet 800
          900: '#4c1d95', // Violet 900
          glow: '#a78bfa',
        },
        slateDark: {
          900: '#0b0f19', // Deep space dark background
          800: '#161f30', // Panel/Sidebar dark background
          700: '#222f47', // Border/Hover dark state
          600: '#334460',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 15px rgba(139, 92, 246, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
        md: '12px',
      }
    },
  },
  plugins: [],
}
