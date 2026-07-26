/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    // Asegurarnos de incluir data.js donde se declaran las clases dinámicas
    './src/lib/**/*.{js,jsx,ts,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd1ff',
          300: '#90b1ff',
          400: '#5e85ff',
          500: '#3a5bff',
          600: '#243df0',
          700: '#1c2dc4',
          800: '#1b289a',
          900: '#1d2878',
        },
        accent: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        ink: {
          900: '#0b1020',
          800: '#111733',
          700: '#1c2347',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 60px -20px rgba(58,91,255,0.45)',
      },
      backgroundImage: {
        'grid-pattern':
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
    },
  },
  safelist: [
    // Colores de gradiente usados dinámicamente desde data.js
    // (TestCatalog — iconos de las 7 pruebas psicométricas)
    'bg-gradient-to-br',
    'from-emerald-400', 'to-emerald-600',
    'from-blue-400',    'to-blue-600',
    'from-violet-400',  'to-violet-600',
    'from-amber-400',   'to-orange-500',
    'from-rose-400',    'to-pink-600',
    'from-cyan-400',    'to-cyan-600',
    'from-indigo-400',  'to-indigo-600',
  ],
  plugins: [],
};