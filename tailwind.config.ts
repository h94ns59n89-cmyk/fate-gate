import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1e1e1e',
          gold: '#D4A853',
          'gold-light': '#E8C97A',
          'gold-dark': '#B8923E',
        },
        element: {
          wood: '#4CAF50',
          fire: '#FF5722',
          earth: '#FFC107',
          metal: '#F5F5F5',
          water: '#2196F3',
        },
        vscode: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          surface: '#2d2d2d',
          hover: '#2a2d2e',
          border: '#3c3c3c',
          'border-light': '#474747',
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
        mono: [
          'JetBrains Mono', 'Fira Code', 'SF Mono', 'Cascadia Code',
          'Consolas', 'monospace',
        ],
      },
      borderRadius: {
        card: '6px',
        input: '4px',
        button: '4px',
      },
      backgroundImage: {
        'gradient-brand': 'none',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.3)',
        modal: '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [typography],
};

export default config;
