module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './static/md/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'primary': ['TASA Orbiter', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#333',
            a: {
              color: '#217dbb',
              '&:hover': {
                color: '#3498db',
              },
            },
            'h1, h2, h3, h4, h5, h6': {
              color: '#1f2937',
            },
            img: {
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'th, td': {
              border: '1px solid #d1d5db',
              padding: '0.75rem 1rem',
            },
            th: {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
