#!/usr/bin/env node
/**
 * Content Lint Script
 * - Validates MDX story frontmatter with Zod schema
 * - Ensures required fields present (title, coordinates, etc.)
 * - Verifies referenced local image paths exist (basic check for hero + Figure/ImageGrid src attributes)
 * - Reports a summary and non-zero exit code on errors
 */

const fs = require('fs');
const path = require('path');
const { StoryFrontmatterSchema } = require('../src/lib/mdx/schema');
const STORIES_DIR = path.join(process.cwd(), 'src/content/stories');
const IMG_ROOTS = [
  path.join(process.cwd(), 'static'),
  path.join(process.cwd(), 'public')
];

function listMdxFiles() {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.mdx'));
}

function fileExists(relPath) {
  if (!relPath) return false;
  if (/^https?:\/\//.test(relPath)) return true; // remote URL, skip
  // Normalize any leading slash; handle legacy /static/img/... and new /stories/<id>/...
  let cleaned = relPath.trim();
  // Allow root-relative references like /static/img/... or /stories/...
  if (cleaned.startsWith('/')) cleaned = cleaned.slice(1);
  // If path already starts with 'static/' or 'public/' we test directly underneath root
  const candidates = [];
  if (cleaned.startsWith('static/')) {
    candidates.push(path.join(process.cwd(), cleaned));
  } else if (cleaned.startsWith('public/')) {
    candidates.push(path.join(process.cwd(), cleaned));
  } else {
    // Try under each root directory
    IMG_ROOTS.forEach(root => candidates.push(path.join(root, cleaned)));
  }
  return candidates.some(p => fs.existsSync(p));
}

function extractFrontmatter(raw) {
  const match = /^---\n([\s\S]*?)\n---/m.exec(raw);
  if (!match) return {};
  const yaml = require('js-yaml');
  try { return yaml.load(match[1]) || {}; } catch { return {}; }
}

function extractImageLikeRefs(raw) {
  const figureRegex = /<Figure[^>]*src={(?:"|')([^"']+)(?:"|')}/g; // <Figure src="..."
  const imgRegex = /<img[^>]*src={(?:"|')([^"']+)(?:"|')}/g;
  const simpleFigureRegex = /<Figure[^>]*src="([^"]+)"/g;
  const simpleImgRegex = /<img[^>]*src="([^"]+)"/g;
  const results = new Set();
  [figureRegex, imgRegex, simpleFigureRegex, simpleImgRegex].forEach(r => {
    let m; while((m = r.exec(raw))) results.add(m[1]);
  });
  return Array.from(results);
}

function main() {
  const files = listMdxFiles();
  let errorCount = 0;
  const report = [];

  for (const file of files) {
    const full = path.join(STORIES_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const fm = extractFrontmatter(raw);
    fm.id = fm.id || file.replace(/\.mdx$/, '');
    const parsed = StoryFrontmatterSchema.safeParse(fm);
    if (!parsed.success) {
      errorCount++;
      report.push({ file, severity: 'error', type: 'frontmatter', issues: parsed.error.issues.map(i => i.message) });
    }

    // Soft warnings (do not increment errorCount)
    if (!fm.coordinates) {
      report.push({ file, severity: 'warn', type: 'missing-coordinates', message: 'No coordinates set (map pin disabled).' });
    }
    if (!fm.hero) {
      report.push({ file, severity: 'warn', type: 'missing-hero', message: 'No hero image set.' });
    }
    if (fm.status === 'draft') {
      report.push({ file, severity: 'info', type: 'draft-status', message: 'Story marked as draft.' });
    }

    const hero = fm.hero;
    if (hero && !fileExists(hero)) {
      errorCount++;
      report.push({ file, severity: 'error', type: 'missing-hero-file', path: hero });
    }

    const imageRefs = extractImageLikeRefs(raw);
    imageRefs.forEach(img => {
      if (!fileExists(img)) {
        errorCount++;
        report.push({ file, severity: 'error', type: 'missing-image-ref', path: img });
      }
    });
  }

  if (report.length) {
    console.log('Content Lint Report:');
    report.forEach(r => {
      const tag = r.severity ? r.severity.toUpperCase() : 'INFO';
      console.log(`[${tag}]`, r);
    });
  } else {
    console.log('Content Lint: No issues found.');
  }

  console.log(`Checked ${files.length} MDX files. Errors: ${errorCount}`);
  process.exit(errorCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}
