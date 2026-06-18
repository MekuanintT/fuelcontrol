/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: '#030303',
        surface: '#09090b',
        'surface-elevated': '#18181b',
        accent: {
          glow: 'rgba(139, 92, 246, 0.15)',
          DEFAULT: '#8b5cf6',
        }
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '28px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
