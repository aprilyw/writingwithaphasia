const { getActivePalette } = require('./src/design/getActivePalette');
const active = getActivePalette();

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
        // Legacy references kept for transitional compatibility (could deprecate)
        brandInk: active.ink || active.inkStrong,
        brandDark: active.ink || active.inkStrong,
        grayMid: '#666666',
        surfaceMuted: '#e8e8e8',
        // Semantic palette tokens
        ink: active.inkStrong,
        inkBody: active.ink,
        accent: active.accent,
        accentHover: active.accentHover || active.accent,
        accentActive: active.accentActive || active.accentHover || active.accent,
        highlight: active.highlight,
        surface: active.surface,
        surfaceAlt: active.surfaceAlt,
        mist: active.surfaceMist,
        focus: active.focus || active.accent
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
