/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space': {
          950: '#05070f',
          900: '#0a0e27',
          800: '#12183d',
          700: '#1c2458',
        },
        'nebula': {
          purple: '#6366f1',
          cyan: '#22d3ee',
          pink: '#ec4899',
          amber: '#f59e0b',
          emerald: '#10b981',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
