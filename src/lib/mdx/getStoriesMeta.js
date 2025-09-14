const fs = require('fs');
const path = require('path');
const { StoryFrontmatterSchema } = require('./schema');

const STORIES_DIR = path.join(process.cwd(), 'src/content/stories');

function listStoryFiles() {
  if (!fs.existsSync(STORIES_DIR)) return [];
  return fs.readdirSync(STORIES_DIR).filter((f) => f.endsWith('.mdx'));
}

// Dynamic import of compiled MDX page module to access exported frontmatter.
function loadFrontmatterFromCompiled(fileBase) {
  // At build time, Next compiles pages under /src/pages. These content MDX files are not yet pages.
  // For now we will do a simple static parse by reading the file and extracting the YAML since they aren't compiled as pages.
  const fullPath = path.join(STORIES_DIR, fileBase);
  const raw = fs.readFileSync(fullPath, 'utf8');
  const match = /^---\n([\s\S]*?)\n---/m.exec(raw);
  let yamlData = {};
  if (match) {
    // Lightweight YAML parse without full dependency (js-yaml already installed)
    const yaml = require('js-yaml');
    yamlData = yaml.load(match[1]) || {};
  }
  yamlData.id = yamlData.id || fileBase.replace(/\.mdx$/, '');
  return yamlData;
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
