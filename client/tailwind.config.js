/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lumora: {
          violet: '#7444FF',
          coral: '#FF6B67',
          lime: '#C7F464',
          mint: '#25CBB8',
          navy: '#14152D',
          lavender: '#F0EBFF',
          cream: '#FFF9F1',
          white: '#FFFFFF',
          dark: '#0B0C1E',
          card: '#1B1D3A',
          border: '#E8E3FA',
        },
        brand: {
          primary: '#7444FF',
          accent: '#FF6B67',
          highlight: '#C7F464',
          success: '#25CBB8',
          dark: '#14152D',
          light: '#F0EBFF',
          background: '#FFF9F1',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glow-violet': '0 0 35px -5px rgba(116, 68, 255, 0.45)',
        'glow-coral': '0 0 30px -5px rgba(255, 107, 103, 0.45)',
        'glow-mint': '0 0 30px -5px rgba(37, 203, 184, 0.45)',
        'card-hover': '0 20px 35px -10px rgba(20, 21, 45, 0.12)',
        'float': '0 15px 30px -5px rgba(116, 68, 255, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'float-slow': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
