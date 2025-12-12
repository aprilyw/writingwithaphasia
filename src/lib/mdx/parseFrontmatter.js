const fs = require('fs');
const yaml = require('js-yaml');
const { StoryFrontmatterSchema } = require('./schema');

function rawFrontmatterAndContent(raw) {
  const match = /^---\n([\s\S]*?)\n---/m.exec(raw);
  if (!match) return { frontmatter: {}, content: raw };
  let data = {};
  try { data = yaml.load(match[1]) || {}; } catch { data = {}; }
  const content = raw.slice(match[0].length).trimStart();
  return { frontmatter: data, content };
}

function parseFrontmatterFromFile(fullPath, { coerceId = true } = {}) {
  if (!fs.existsSync(fullPath)) return { frontmatter: {}, content: '' };
  const raw = fs.readFileSync(fullPath, 'utf8');
  const { frontmatter, content } = rawFrontmatterAndContent(raw);
  if (coerceId && !frontmatter.id) {
    const base = fullPath.split(/[/\\]/).pop();
    if (base) frontmatter.id = base.replace(/\.mdx?$/, '');
  }
  // Validate but don't throw; return errors for caller if needed
  const validated = StoryFrontmatterSchema.safeParse(frontmatter);
  return {
    frontmatter: validated.success ? validated.data : frontmatter,
    content,
    errors: validated.success ? null : validated.error.flatten()
  };
}

module.exports = { parseFrontmatterFromFile, rawFrontmatterAndContent };
