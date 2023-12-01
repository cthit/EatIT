import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'turquoise': {
          DEFAULT: '#0ae5f5',
          '100': '#e7fdfe',
          '200': '#c7f5f5',
          '300': '#a7ebeb',
          '400': '#0ae5f5',
          '500': '#09cdda',
          '600': '#08b7c4',
          '700': '#1298a1',
          '800': '#0e7f7f',
          '900': '#0c6b6b'
        },
        card: "#d6eef0"
      }
    }
  },
  plugins: [],
}
export default config
