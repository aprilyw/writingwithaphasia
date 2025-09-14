// API route: /api/story/[id]
// Returns unified story payload for sidebar consumption (legacy markdown or MDX serialized)
import path from 'path';
import fs from 'fs';
import { serialize } from 'next-mdx-remote/serialize';
import yaml from 'js-yaml';
import { getStoryData } from '../../../utils/markdown';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const MDX_DIR = path.join(process.cwd(), 'src/content/stories');
    const mdxPath = path.join(MDX_DIR, `${id}.mdx`);
    if (fs.existsSync(mdxPath)) {
      const raw = fs.readFileSync(mdxPath, 'utf8');
      const fm = /^---\n([\s\S]*?)\n---/m.exec(raw);
      let frontmatter = {};
      let content = raw;
      if (fm) {
        frontmatter = yaml.load(fm[1]) || {};
        content = raw.slice(fm[0].length).trimStart();
      }
      const mdxSource = await serialize(content, { mdxOptions: { remarkPlugins: [], rehypePlugins: [] } });
      return res.status(200).json({ mode: 'mdx', id, frontmatter: { id, ...frontmatter }, mdxSource });
    }
    // Legacy fallback
    const legacy = await getStoryData(id);
    return res.status(200).json({ mode: 'legacy', id, legacy });
  } catch (err) {
    console.error('Story API error', err);
    return res.status(500).json({ error: 'Failed to load story' });
  }
}
