/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['"Segoe UI"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        'prose': '42rem',
      },
    },
  },
  plugins: [],
} 
