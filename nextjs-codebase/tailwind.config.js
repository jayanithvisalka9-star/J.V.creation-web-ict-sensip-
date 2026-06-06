/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#08090d',
        glassBg: 'rgba(255, 255, 255, 0.03)',
        glassBorder: 'rgba(255, 255, 255, 0.08)',
        cyberCyan: '#06b6d4',
        cyberPurple: '#a855f7',
        cyberPink: '#ec4899',
        cyberGreen: '#10b981',
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        space: ['var(--font-space)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.3)',
        'glow-pink': '0 0 15px rgba(236, 72, 153, 0.3)',
      }
    },
  },
  plugins: [],
};
