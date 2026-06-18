/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#faf7f0',
        ink: '#0e1410',
        'bc-green': '#0d6b3a',
        'bc-green-dark': '#0a5530',
        'bc-red': '#c41e2a',
        'bc-red-dark': '#8d141e',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
