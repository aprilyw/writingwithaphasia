/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,md,mdx}',
    './docs/**/*.{md,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['TASA Orbiter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        primary: '#217dbb',
        primaryHover: '#3498db',
        brandDark: '#3a2c2a',
        brandInk: '#2c3e50',
        accent: '#ff6b6b',
        grayMid: '#666666',
        surface: '#ffffff',
        surfaceAlt: '#f7fafc',
        surfaceMuted: '#f8f9fa'
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 12px rgba(0,0,0,0.12)',
        panel: '0 8px 24px rgba(0,0,0,0.12)',
        modal: '0 10px 30px rgba(0,0,0,0.3)'
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px'
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
};
