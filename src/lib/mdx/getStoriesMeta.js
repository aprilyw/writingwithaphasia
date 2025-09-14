const fs = require('fs');
const path = require('path');
const { StoryFrontmatterSchema } = require('./schema');
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

function getAllStoriesMeta() {
  const files = listStoryFiles();
  const records = [];
  for (const file of files) {
    const fm = loadFrontmatterFromCompiled(file);
    const parseResult = StoryFrontmatterSchema.safeParse(fm);
    if (!parseResult.success) {
      // Collect error messages but continue.
      records.push({ id: fm.id || file, error: parseResult.error.flatten() });
      continue;
    }
    records.push({ ...parseResult.data });
  }
  // If date present, sort descending, else by title.
  records.sort((a, b) => {
    if (a.error || b.error) return 0;
    if (a.date && b.date) return a.date > b.date ? -1 : 1;
    return (a.title || '').localeCompare(b.title || '');
  });
  return records;
}

module.exports = { getAllStoriesMeta };
