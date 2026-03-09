/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/renderer/**/*.{ts,tsx}',
    './src/renderer/index.html',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#0d0f12',
          surface: '#161920',
          elevated: '#1e2128',
          overlay: '#252830',
        },
        border: {
          DEFAULT: '#2a2d35',
          muted: '#1f2229',
          strong: '#373b45',
        },
        accent: {
          DEFAULT: '#7c6af7',
          hover: '#9b8dfb',
          muted: '#7c6af720',
          strong: '#5a48e0',
        },
        text: {
          primary: '#f1f3f8',
          secondary: '#8b92a5',
          muted: '#4b5263',
          inverse: '#0d0f12',
        },
        success: {
          DEFAULT: '#4ade80',
          muted: '#4ade8020',
        },
        warning: {
          DEFAULT: '#fb923c',
          muted: '#fb923c20',
        },
        error: {
          DEFAULT: '#f87171',
          muted: '#f8717120',
        },
        info: {
          DEFAULT: '#60a5fa',
          muted: '#60a5fa20',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', '14px'],
        xs: ['11px', '16px'],
        sm: ['12px', '18px'],
        base: ['13px', '20px'],
        md: ['14px', '20px'],
        lg: ['15px', '22px'],
        xl: ['17px', '24px'],
        '2xl': ['20px', '28px'],
        '3xl': ['24px', '32px'],
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '48px',
        'title-bar': '36px',
        'tab-bar': '40px',
        'status-bar': '24px',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'slide-in-left': 'slideInLeft 150ms ease-out',
        'slide-in-up': 'slideInUp 150ms ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
