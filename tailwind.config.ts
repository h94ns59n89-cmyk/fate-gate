import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          deep: '#7D5FA0',
          midnight: '#9B7FBB',
          surface: '#BBA3D5',
          border: '#D0C4E0',
          gold: '#E8C36A',
          'gold-light': '#F5E2A0',
          'gold-dark': '#C9A64A',
          'gold-glow': 'rgba(232, 195, 106, 0.15)',
        },
        stellar: {
          star: '#1F1D2B',
          nebula: '#8A8696',
          comet: '#E8C36A',
          dust: '#C4C1CE',
        },
        element: {
          wood: '#8FCFA0',
          fire: '#E0978A',
          earth: '#D4A87C',
          metal: '#C4C4CC',
          water: '#7FB0C8',
        },
        vscode: {
          bg: '#FFFFFF',
          sidebar: '#F8F8FA',
          surface: '#FFFFFF',
          hover: '#F5F0FA',
          border: 'rgba(0,0,0,0.08)',
          'border-light': 'rgba(0,0,0,0.04)',
          text: '#1F1D2B',
          'text-secondary': '#6B6778',
          'text-muted': '#8A8696',
          selection: '#E8E0F5',
          blue: '#569cd6',
          green: '#7CB87C',
          orange: '#ce9178',
          yellow: '#dcdcaa',
          pink: '#c586c0',
          red: '#E05A5A',
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
        'gradient-brand': 'linear-gradient(180deg, #FFFFFF 0%, #F8F8FA 100%)',
        'gradient-gold': 'linear-gradient(135deg, #9B7FBB 0%, #BBA3D5 50%, #7D5FA0 100%)',
        'gradient-card': 'linear-gradient(180deg, #FFFFFF 0%, #F8F8FA 100%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        modal: '0 8px 32px rgba(0,0,0,0.10)',
        glow: '0 0 20px rgba(155,127,187,0.12)',
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
