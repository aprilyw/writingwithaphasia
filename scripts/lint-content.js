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
const { parseFrontmatterFromFile } = require('../src/lib/mdx/parseFrontmatter');
const STORIES_DIR = path.join(process.cwd(), 'src/content/stories');
const PUBLIC_STORIES_DIR = path.join(process.cwd(), 'public', 'stories');
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

// Frontmatter now parsed via central helper (avoid divergence)
function extractFrontmatterFromFile(fullPath) {
  const { frontmatter } = parseFrontmatterFromFile(fullPath, { coerceId: true });
  return frontmatter || {};
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

function detectLegacyStaticRefs(raw) {
  // Capture any literal /static/img/... occurrences (not limited to img tags)
  const legacyPattern = /\/static\/img\/[A-Za-z0-9_-]+\//g;
  const matches = new Set();
  let m;
  while ((m = legacyPattern.exec(raw))) {
    matches.add(m[0]);
  }
  return Array.from(matches);
}

function main() {
  const args = process.argv.slice(2);
  // Support --max-warn <n> or --max-warn=n
  let maxWarn = null;
  args.forEach((a, idx) => {
    if (a.startsWith('--max-warn=')) {
      const v = parseInt(a.split('=')[1], 10); if (!isNaN(v)) maxWarn = v;
    } else if (a === '--max-warn') {
      const next = args[idx + 1];
      if (next && !next.startsWith('--')) { const v = parseInt(next, 10); if (!isNaN(v)) maxWarn = v; }
    }
  });

  const files = listMdxFiles();
  let errorCount = 0;
  let warnCount = 0;
  const report = [];
  // Track per-story referenced image basenames for unused detection
  const referencedImagesByStory = new Map();

  for (const file of files) {
    const full = path.join(STORIES_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const fm = extractFrontmatterFromFile(full);
    fm.id = fm.id || file.replace(/\.mdx$/, '');
    const parsed = StoryFrontmatterSchema.safeParse(fm);
    if (!parsed.success) {
      errorCount++;
      report.push({ file, severity: 'error', type: 'frontmatter', issues: parsed.error.issues.map(i => i.message) });
    }

    // Soft warnings (do not increment errorCount)
    if (!fm.coordinates) {
      report.push({ file, severity: 'warn', type: 'missing-coordinates', message: 'No coordinates set (map pin disabled).' });
      warnCount++;
    }
    if (!fm.hero) {
      const isDraft = fm.status === 'draft';
      if (isDraft) {
        report.push({ file, severity: 'info', type: 'missing-hero', message: 'Draft without hero (allowed).' });
      } else {
        report.push({ file, severity: 'warn', type: 'missing-hero', message: 'No hero image set.' });
        warnCount++;
      }
    } else {
      // Hero present; require heroAlt unless draft
      if (fm.status !== 'draft' && !fm.heroAlt) {
        report.push({ file, severity: 'warn', type: 'missing-hero-alt', message: 'Hero image missing alt text (heroAlt).' });
        warnCount++;
      } else if (fm.heroAlt && fm.heroAlt.length < 5) {
        report.push({ file, severity: 'info', type: 'short-hero-alt', message: 'heroAlt is very short; consider more descriptive alt text.'});
      }
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
      // Track referenced image basename when path is /stories/<id>/...
      const storyPrefix = `/stories/${fm.id}/`;
      if (img.startsWith(storyPrefix)) {
        const base = path.basename(img);
        if (!referencedImagesByStory.has(fm.id)) referencedImagesByStory.set(fm.id, new Set());
        referencedImagesByStory.get(fm.id).add(base);
      }
    });

    // Legacy /static/img path usage (enforce migration to /stories/<id>/)
    const legacyRefs = detectLegacyStaticRefs(raw);
    legacyRefs.forEach(ref => {
      report.push({ file, severity: 'warn', type: 'legacy-static-path', legacyPrefix: ref, suggestion: ref.replace('/static/img/', '/stories/') });
      warnCount++;
    });

    // Raw <img> tag detection (enforce Figure usage)
    if (/<img\s/i.test(raw)) {
      // Ignore if it appears to be inside code blocks (simple heuristic not implemented here).
      report.push({ file, severity: 'error', type: 'raw-img-tag', message: 'Raw <img> tag detected; use <Figure> or <StoryImage>.' });
      errorCount++;
    }
  }

  // Unused image detection (warning): list images in /public/stories/<id>/ not referenced
  if (fs.existsSync(PUBLIC_STORIES_DIR)) {
    const storyDirs = fs.readdirSync(PUBLIC_STORIES_DIR).filter(d => fs.statSync(path.join(PUBLIC_STORIES_DIR, d)).isDirectory());
    storyDirs.forEach(storyId => {
      const dir = path.join(PUBLIC_STORIES_DIR, storyId);
      const filesInDir = fs.readdirSync(dir).filter(f => !f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile());
      const referenced = referencedImagesByStory.get(storyId) || new Set();
      filesInDir.forEach(imgFile => {
        if (!referenced.has(imgFile)) {
          report.push({ file: `${storyId}.mdx`, severity: 'warn', type: 'unused-image', path: `/stories/${storyId}/${imgFile}` });
          warnCount++;
        }
      });
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

  console.log(`Checked ${files.length} MDX files. Errors: ${errorCount} Warnings: ${warnCount}${maxWarn !== null ? ` (max-warn=${maxWarn})` : ''}`);
  if (maxWarn !== null && warnCount > maxWarn && errorCount === 0) {
    console.error(`Exceeded maximum warnings threshold (${warnCount} > ${maxWarn}).`);
    errorCount = 1; // promote to non-zero exit to gate merge
  }
  process.exit(errorCount > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}
