#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { getActivePalette } = require('../src/design/getActivePalette');

const palette = getActivePalette();

const lines = [
  '/* AUTO-GENERATED: Do not edit directly. Run `npm run palette` to regenerate. */',
  ':root {',
  `  --palette-name: ${palette.name};`,
  `  --color-ink-strong: ${palette.inkStrong};`,
  `  --color-ink: ${palette.ink};`,
  `  --color-accent-rust: ${palette.accent};`,
  `  --color-accent-rust-hover: ${palette.accentHover || palette.accent};`,
  `  --color-accent-rust-active: ${palette.accentActive || palette.accentHover || palette.accent};`,
  `  --color-accent-warm: ${palette.highlight};`,
  `  --color-surface-bg: ${palette.surface};`,
  `  --color-surface-alt: ${palette.surfaceAlt};`,
  `  --color-surface-mist: ${palette.surfaceMist};`,
  `  --color-focus-ring: ${palette.focus || palette.accent};`,
  '}'
];

const outPath = path.join(__dirname, '..', 'src', 'styles', 'palette.generated.css');
fs.writeFileSync(outPath, lines.join('\n') + '\n');
console.log('Generated palette css:', outPath, '→', palette.name);
