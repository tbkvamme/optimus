import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tabular: ['var(--font-tabular)', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          canvas: '#FAFAF7',
          surface: '#FFFFFF',
          ink: '#0F172A',
          muted: '#64748B',
          border: '#E7E5E4',
          accent: '#2DD4BF',
          'accent-dark': '#0F766E',
          'accent-soft': '#CCFBF1',
          'panel-dark': '#0F172A',
          danger: '#DC2626',
        },
      },
      keyframes: {
        'shimmer-once': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'pulse-once': {
          '0%, 100%': { backgroundColor: 'rgb(204 251 241 / 0)' },
          '50%': { backgroundColor: 'rgb(204 251 241 / 0.55)' },
        },
        'ring-expand': {
          '0%': { transform: 'scale(0.4)', opacity: '0.55' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'check-draw': {
          '0%': { strokeDashoffset: '60' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'shimmer-once': 'shimmer-once 1.6s ease-out 1',
        'pulse-once': 'pulse-once 1.2s ease-out 1',
        'ring-expand': 'ring-expand 1.4s ease-out 1 forwards',
        'check-draw': 'check-draw 600ms ease-out 1 forwards',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
