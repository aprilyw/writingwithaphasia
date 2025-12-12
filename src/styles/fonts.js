// Centralized font configuration
export const fonts = {
  primary: 'TASA Orbiter, sans-serif',
  
  // CSS variable reference for use in styled-jsx
  primaryVar: 'var(--font-family-primary)',
  
  // Google Fonts URL
  googleFontsUrl: 'https://fonts.googleapis.com/css2?family=TASA+Orbiter:wght@400;600;700&display=swap'
};

// Utility function to get font family for inline styles
export const getFontFamily = () => fonts.primary;

// Utility function to get CSS variable reference
export const getFontFamilyVar = () => fonts.primaryVar;
