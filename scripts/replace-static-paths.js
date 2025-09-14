#!/usr/bin/env node
/**
 * replace-static-paths.js
 * Rewrites MDX story files replacing /static/img/<id>/ with /stories/<id>/.
 * Performs id check to ensure path consistency.
 * Usage: node scripts/replace-static-paths.js [--dry]
 */
const fs = require('fs');
const path = require('path');
const DRY = process.argv.includes('--dry');
const STORIES_DIR = path.join(process.cwd(), 'src', 'content', 'stories');

function listMdx() {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.mdx'));
}

function processFile(file) {
  const full = path.join(STORIES_DIR, file);
  let raw = fs.readFileSync(full, 'utf8');
  const id = file.replace(/\.mdx$/, '');
  const pattern = new RegExp(`/static/img/${id}/`, 'g');
  if (!pattern.test(raw)) return { file, changed: false };
  const updated = raw.replace(pattern, `/stories/${id}/`);
  if (!DRY) fs.writeFileSync(full, updated, 'utf8');
  return { file, changed: true };
}

function main() {
  const results = listMdx().map(processFile);
  const changed = results.filter(r => r.changed).length;
  console.log(`Processed ${results.length} files. Updated ${changed}.`);
  results.filter(r => r.changed).forEach(r => console.log('Updated', r.file));
  if (DRY) console.log('Dry run only. Re-run without --dry to apply.');
}

if (require.main === module) main();
