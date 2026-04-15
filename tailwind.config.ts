import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1e3a5f',
          50: '#f0f4f9',
          100: '#dae4f0',
          200: '#b8cce0',
          300: '#8aadc9',
          400: '#5a88ae',
          500: '#3a6c94',
          600: '#2c5578',
          700: '#1e3a5f',
          800: '#162c48',
          900: '#0e1e31',
        },
        green: {
          accent: '#16a34a',
        },
      },
    },
  },
  plugins: [],
}
export default config
