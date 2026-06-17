import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#0B0E14',
          midnight: '#111827',
          surface: '#1a1f2e',
          border: '#2a3040',
          gold: '#D4A853',
          'gold-light': '#F0D78C',
          'gold-dark': '#B8923E',
          'gold-glow': 'rgba(212, 168, 83, 0.15)',
        },
        stellar: {
          star: '#FFFFFF',
          nebula: '#7C8DB5',
          comet: '#E8C97A',
          dust: '#374151',
        },
        element: {
          wood: '#4CAF50',
          fire: '#FF5722',
          earth: '#FFC107',
          metal: '#E5E7EB',
          water: '#2196F3',
        },
        vscode: {
          bg: '#0B0E14',
          sidebar: '#111827',
          surface: '#1a1f2e',
          hover: '#1e2433',
          border: '#2a3040',
          'border-light': '#374151',
          text: '#d4d4d4',
          'text-secondary': '#858585',
          'text-muted': '#6a6a6a',
          selection: '#264f78',
          blue: '#569cd6',
          green: '#6a9955',
          orange: '#ce9178',
          yellow: '#dcdcaa',
          pink: '#c586c0',
          red: '#f44747',
        },
      },
      fontFamily: {
        sans: [
          'Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont',
          'PingFang SC', 'Noto Sans SC', 'system-ui', 'sans-serif',
        ],
        serif: ['var(--font-serif)', 'Noto Serif SC', 'STSong', 'SimSun', 'serif'],
        mono: [
          'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code',
          'Consolas', 'monospace',
        ],
      },
      borderRadius: {
        card: '10px',
        input: '8px',
        button: '8px',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(180deg, #0B0E14 0%, #111827 100%)',
        'gradient-gold': 'linear-gradient(135deg, #D4A853 0%, #F0D78C 50%, #B8923E 100%)',
        'gradient-card': 'linear-gradient(180deg, #111827 0%, #1a1f2e 100%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.3)',
        modal: '0 8px 32px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(212, 168, 83, 0.15)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'twinkle': 'twinkle 4s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
