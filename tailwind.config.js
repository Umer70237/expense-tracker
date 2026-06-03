/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        bg: '#050508',
        surface: '#0c0c14',
        card: '#12121c',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'scale-in': 'scaleIn 0.25s ease-out',
        'bar-grow': 'barGrow 0.8s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { transform: 'translateY(24px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.94)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
        barGrow: { from: { transform: 'scaleY(0)' }, to: { transform: 'scaleY(1)' } },
      },
    },
  },
  plugins: [],
}