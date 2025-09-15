const fs = require('fs');
const path = require('path');
const { StoryFrontmatterSchema } = require('./schema');
const { normalizeDateString } = require('./normalizeDateString');
const { parseFrontmatterFromFile } = require('./parseFrontmatter');

const STORIES_DIR = path.join(process.cwd(), 'src/content/stories');

function listStoryFiles() {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.mdx'));
}

// Dynamic import of compiled MDX page module to access exported frontmatter.
function loadFrontmatterFromCompiled(fileBase) {
  const fullPath = path.join(STORIES_DIR, fileBase);
  const { frontmatter } = parseFrontmatterFromFile(fullPath);
  return frontmatter;
}

function getAllStoriesMeta(options = {}) {
  const { strict = false } = options;
  const files = listStoryFiles();
  const records = [];
  const errors = [];
  for (const file of files) {
    const fm = loadFrontmatterFromCompiled(file);
    const parseResult = StoryFrontmatterSchema.safeParse(fm);
    if (!parseResult.success) {
      // Collect error messages but continue.
      const err = { id: fm.id || file.replace(/\.mdx$/, ''), error: parseResult.error.flatten() };
      records.push(err);
      errors.push(err);
      continue;
    }
    const meta = { ...parseResult.data };
    if (meta.date) {
      const normalized = normalizeDateString(meta.date);
      if (normalized) {
        if (normalized !== meta.date) meta.dateOriginal = meta.date; // preserve original for potential audits
        meta.date = normalized; // canonical ISO date string
      } else {
        meta.dateOriginal = meta.date;
        delete meta.date; // remove unusable date
      }
    }
    records.push(meta);
  }
  // If date present, sort descending, else by title.
  records.sort((a, b) => {
    if (a.error || b.error) return 0;
    if (a.date && b.date) return a.date > b.date ? -1 : 1; // ISO strings compare lexicographically
    return (a.title || '').localeCompare(b.title || '');
  });
  if (strict && errors.length) {
    const summary = errors.map(e => `${e.id}: ${Object.values(e.error.fieldErrors).flat().join('; ')}`).join('\n');
    throw new Error(`Frontmatter validation failed for ${errors.length} file(s):\n${summary}`);
  }
  return records;
}

module.exports = { getAllStoriesMeta };
