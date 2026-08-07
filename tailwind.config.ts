import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './data/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#071426',
        aqua: '#12b8bd',
        aquaDark: '#08969b',
        paper: '#fbfbfa',
        shell: '#0a1018',
        line: '#d8dde2',
        accentRed: '#e53743'
      },
      boxShadow: {
        panel: '0 30px 80px rgba(0,0,0,.28)',
        marker: '0 0 0 5px rgba(18,184,189,.12)'
      },
      keyframes: {
        markerPulse: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(18,184,189,.30)' },
          '50%': { transform: 'scale(1.08)', boxShadow: '0 0 0 10px rgba(18,184,189,0)' }
        }
      },
      animation: {
        markerPulse: 'markerPulse 2.1s ease-in-out infinite'
      }
    },
  },
  plugins: [],
};

export default config;
