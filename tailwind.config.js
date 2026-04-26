/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      colors: {
        'boticare-primary': '#0D0D0D',
        'boticare-green': '#D3F4E5',
        'boticare-green-dark': '#1E855A',
        'boticare-yellow': '#FBF2D4',
        'boticare-yellow-dark': '#B58D21',
        'boticare-red': '#FADDE1',
        'boticare-red-dark': '#A93248',
        'boticare-blue': '#DDEBFF',
        'boticare-blue-dark': '#3B82F6',
        'boticare-gray': '#F7F7F7',
        'boticare-gray-medium': '#E5E7EB',
        'boticare-gray-dark': '#6B7280',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}
