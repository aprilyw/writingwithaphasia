const { palettes } = require('./palettes');

function getActivePalette() {
  const key = process.env.PALETTE || process.env.NEXT_PUBLIC_PALETTE || 'current';
  return palettes[key] || palettes.current;
}

module.exports = { getActivePalette };
