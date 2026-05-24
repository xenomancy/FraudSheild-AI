/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#020617',        // slate-950
          card: 'rgba(15, 23, 42, 0.6)', // slate-900/60
          border: '#1e293b',    // slate-800
          text: '#f8fafc',      // slate-50
          muted: '#94a3b8'      // slate-400
        },
        fintech: {
          indigo: '#6366f1',    // indigo-500
          cyan: '#06b6d4',      // cyan-500
          purple: '#a855f7',    // purple-500
          emerald: '#10b981',   // emerald-500
          amber: '#f59e0b',     // amber-500
          rose: '#f43f5e'       // rose-500
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
