#!/usr/bin/env node
/**
 * Build-time validation script.
 * Ensures all story frontmatter passes schema validation (strict) prior to Next build.
 * Exits with non-zero code on any error, failing the build early.
 */
const { getAllStoriesMeta } = require('../src/lib/mdx/getStoriesMeta');

function main() {
  try {
    const meta = getAllStoriesMeta({ strict: true });
    // Additionally enforce heroAlt when hero present & published (hard fail at build vs lint warn).
    const errors = [];
    meta.forEach(m => {
      if (!m.error && m.hero && m.status !== 'draft' && !m.heroAlt) {
        errors.push(`Story ${m.id} has hero but missing heroAlt (accessibility requirement).`);
      }
    });
    if (errors.length) {
      console.error('Content validation errors (accessibility):');
      errors.forEach(e => console.error(' -', e));
      process.exit(1);
    }
    console.log(`Validated ${meta.filter(m=>!m.error).length} stories (strict).`);
  } catch (err) {
    console.error('Frontmatter validation failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) main();
