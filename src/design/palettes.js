// Central palette registry. Add new palettes here.
// Each palette key maps to semantic role tokens.
// Only include roles actually consumed in Tailwind/global CSS.

/**
 * Semantic roles:
 * inkStrong: primary heading/text color
 * ink: body text fallback
 * accent: primary actionable color (links/buttons)
 * accentHover: hover state for accent (derived if omitted)
 * accentActive: pressed/active state
 * highlight: warm or secondary accent for subtle emphasis
 * surface: base page background
 * surfaceAlt: alternate panel background
 * surfaceMist: subtle tinted background (cards/nav)
 * focus: outline / focus ring color
 * danger: (optional) error states / destructive actions
 */

const palettes = {
  current: {
    name: 'accent-gold-2025Q3',
    inkStrong: '#3C494B',
    ink: '#3c3830',
  accent: '#F7CD6A',          // new requested accent
  accentHover: '#F7CD6A',     // hover same as base (no color shift)
  accentActive: '#F7CD6A',    // active same as base (flat interaction)
    highlight: '#FE8E3D',
    surface: '#f0f0f0',
    surfaceAlt: '#ffffff',
    surfaceMist: '#D8E7EA',
    focus: '#F7CD6A'
  },
  altWarm: {
    name: 'warm-earth',
    inkStrong: '#3F3A33',
    ink: '#3a2c2a',
    accent: '#A14100',
    accentHover: '#7f3300',
    accentActive: '#632800',
    highlight: '#FFB347',
    surface: '#f5f3f0',
    surfaceAlt: '#ffffff',
    surfaceMist: '#ebe4dd',
    focus: '#A14100'
  },
  highContrast: {
    name: 'high-contrast-test',
    inkStrong: '#111111',
    ink: '#222222',
    accent: '#005BBB',
    accentHover: '#004799',
    accentActive: '#003a80',
    highlight: '#FFB700',
    surface: '#ffffff',
    surfaceAlt: '#fafafa',
    surfaceMist: '#eef6ff',
    focus: '#005BBB'
  }
};

module.exports = { palettes };
