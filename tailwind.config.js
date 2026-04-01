/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#16a34a',
          dark: '#15803d',
          light: '#dcfce7',
          accent: '#22c55e',
        },
        risk: {
          safe: '#40916C',
          low: '#95D5B2',
          moderate: '#F4A261',
          high: '#E76F51',
          critical: '#D62828',
        },
        bg: {
          primary: '#FFFFFF',
          secondary: '#F8FAF9',
          dark: '#0D1B16',
          darkCard: '#162B22',
        },
        text: {
          primary: '#1A1A2E',
          secondary: '#6C757D',
          light: '#E8F5E9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
      borderRadius: {
        card: '12px',
        pill: '24px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
