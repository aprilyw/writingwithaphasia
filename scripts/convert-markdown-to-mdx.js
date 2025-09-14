#!/usr/bin/env node
/**
 * Bulk conversion script: legacy markdown in static/md/*.md -> MDX in src/content/stories/*.mdx
 * - Extract existing gray-matter frontmatter (if any) and normalize to MDX schema.
 * - Derive coordinates if present, else leave placeholder and mark draft.
 * - Wrap legacy inline images (optionally) left as-is; author can later replace with <Figure> / <ImageGrid>.
 * - Adds TODO comments for manual enhancement where heuristic uncertain.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const LEGACY_DIR = path.join(process.cwd(), 'static/md');
const OUTPUT_DIR = path.join(process.cwd(), 'src/content/stories');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
}

function convertFile(file) {
  const id = file.replace(/\.md$/, '');
  const fullPath = path.join(LEGACY_DIR, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(raw);

  // Normalize frontmatter
  const fm = {};
  fm.id = id;
  fm.title = data.title || data.name || `${id.charAt(0).toUpperCase()}${id.slice(1)}'s Story`;
  if (data.name) fm.name = data.name; else if (data.title) fm.name = data.title;
  if (data.location) fm.location = data.location;
  if (data.date) fm.date = data.date;
  if (data.coordinates) fm.coordinates = data.coordinates; // expect [lon, lat]
  if (data.tags) fm.tags = Array.isArray(data.tags) ? data.tags : [data.tags];
  if (data.hero) fm.hero = data.hero; // may be normalized later
  // Status: mark draft if missing coordinates or hero
  fm.status = (!fm.coordinates || !fm.hero) ? 'draft' : 'published';
  // Basic excerpt heuristic: first non-empty line under 180 chars
  const firstPara = content.split(/\n+/).find(l => l.trim().length > 40) || '';
  if (firstPara) fm.excerpt = firstPara.trim().slice(0, 180);

  let body = content.trim();

  // Replace legacy asterisk separators with <Separator /> MDX component
  body = body.replace(/\n\*\s+\*\s+\*\s+\*\s+\*\n/g, '\n\n<Separator />\n\n');

  // Simple note to author if coordinates missing
  if (!fm.coordinates) {
    body = `\n<!-- TODO: Add coordinates: [lon, lat] to enable map marker -->\n\n` + body;
  }
  if (!fm.hero) {
    body = `\n<!-- TODO: Add hero image path (relative or /static/img/...) -->\n\n` + body;
  }

  const mdx = `---\n${Object.entries(fm).map(([k,v]) => `${k}: ${JSON.stringify(v)}`).join('\n')}\n---\n\n` + body + '\n';

  const outPath = path.join(OUTPUT_DIR, `${id}.mdx`);
  if (fs.existsSync(outPath)) {
    return { id, skipped: true, reason: 'already exists' };
  }
  fs.writeFileSync(outPath, mdx, 'utf8');
  return { id, skipped: false };
}

function run() {
  const files = fs.readdirSync(LEGACY_DIR).filter(f => f.endsWith('.md'));
  const results = files.map(convertFile);
  const summary = {
    written: results.filter(r => !r.skipped).length,
    skipped: results.filter(r => r.skipped).length,
    total: results.length
  };
  console.log('[convert] Summary:', summary);
  const skippedList = results.filter(r => r.skipped);
  if (skippedList.length) {
    console.log('[convert] Skipped existing:', skippedList.map(s => s.id).join(', '));
  }
}

if (require.main === module) run();
