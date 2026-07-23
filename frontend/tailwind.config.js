/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        // Override slate with 100% neutral monochrome grays (no blue tint)
        slate: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        success: {
          DEFAULT: '#10b981',
          light:   '#d1fae5',
          dark:    '#065f46',
        },
        danger: {
          DEFAULT: '#ef4444',
          light:   '#fee2e2',
          dark:    '#7f1d1d',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light:   '#fef3c7',
          dark:    '#78350f',
        },
        surface: {
          DEFAULT: '#000000', // Pitch Black OLED
          card:    '#0d0d0d', // Deep Black Container
          border:  '#222222', // Neutral Dark Border
          hover:   '#181818', // Neutral Dark Hover
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'brand-gradient':   'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
        'dark-gradient':    'linear-gradient(180deg, #000000 0%, #0d0d0d 100%)',
        'card-gradient':    'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        'income-gradient':  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'expense-gradient': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'savings-gradient': 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
        'balance-gradient': 'linear-gradient(135deg, #262626 0%, #0d0d0d 100%)',
      },
      animation: {
        'float':         'float 6s ease-in-out infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-up':   'slideInUp 0.4s ease-out',
        'fade-in':       'fadeIn 0.3s ease-out',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':     'spin 8s linear infinite',
        'shimmer':       'shimmer 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-20px)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(16,185,129,0.2)' },
          to:   { boxShadow: '0 0 40px rgba(16,185,129,0.5)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow':         '0 0 30px rgba(16,185,129,0.25)',
        'glow-success': '0 0 30px rgba(16,185,129,0.3)',
        'glow-danger':  '0 0 30px rgba(239,68,68,0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.8)',
        'card-hover':   '0 8px 32px rgba(0,0,0,0.95)',
        'inner-glow':   'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
