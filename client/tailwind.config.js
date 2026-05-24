/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:       '#F4F4F5',
        surface:  '#ffffff',
        surface2: '#FAFAFA',
        border:   '#E4E4E7',
        fore:     '#09090B',
        muted:    '#71717A',
        subtle:   '#A1A1AA',
        accent: { DEFAULT: '#F97316', hover: '#EA6C0A', light: '#FFF7ED' },
        green:  '#16A34A',
        yellow: '#CA8A04',
        red:    '#DC2626',
      },
      fontFamily: {
        sans: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '10px', '2xl': '14px' },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05)',
        'card-md': '0 4px 12px rgba(0,0,0,0.08)',
        'card-lg': '0 8px 24px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};
