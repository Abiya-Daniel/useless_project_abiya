/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        malayalam: ['Anek Malayalam', 'sans-serif'],
      },
      colors: {
        kerala: {
          gold: '#FFB800',
          green: '#10B981',
          emerald: '#059669',
          red: '#EF4444',
          dark: '#0D1117',
          card: '#161B22',
          border: '#30363D',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'door-glow': 'doorGlow 2s infinite alternate',
        'scanline': 'scanline 2s linear infinite',
      },
      keyframes: {
        doorGlow: {
          '0%': { boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' },
          '100%': { boxShadow: '0 0 35px rgba(239, 68, 68, 0.8)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        }
      }
    },
  },
  plugins: [],
}
