/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary light blue — Belgian-inspired clean palette
        blue: {
          50:  '#EEF7FD',
          100: '#D4ECF9',
          200: '#A9D9F3',
          300: '#7EC5EC',
          400: '#53B2E6',
          500: '#279FDF',
          600: '#0095DA', // main brand
          700: '#0076AE',
          800: '#005882',
          900: '#003A56',
        },
        // Near-black for text and strong UI
        ink: {
          DEFAULT: '#111827',
          light:   '#374151',
          muted:   '#6B7280',
          subtle:  '#9CA3AF',
        },
        // Page / card surfaces
        surface: {
          DEFAULT: '#FFFFFF',
          page:    '#F2F7FB', // very light blue-white page bg
          raised:  '#FFFFFF',
          sunken:  '#E8F3FA',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
