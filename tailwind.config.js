/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0b1220',
          800: '#0f172a',
          700: '#152238',
          600: '#1b2a46',
          500: '#243655',
        },
        mint: {
          500: '#4de3c1',
          600: '#2fc7a4',
        },
        sunrise: {
          500: '#ffb86b',
          600: '#f59f3d',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 24px 60px -30px rgba(15, 23, 42, 0.7)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(148, 163, 184, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}
