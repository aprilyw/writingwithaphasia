// API route: /api/story/[id]
// Returns MDX story payload for sidebar consumption
import path from 'path';
import fs from 'fs';
import { serialize } from 'next-mdx-remote/serialize';
import { parseFrontmatterFromFile } from '../../../../src/lib/mdx/parseFrontmatter';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const MDX_DIR = path.join(process.cwd(), 'src/content/stories');
    const mdxPath = path.join(MDX_DIR, `${id}.mdx`);
    if (fs.existsSync(mdxPath)) {
      const raw = fs.readFileSync(mdxPath, 'utf8');
      // Reuse shared parser (which already validates & coerces id)
      const { frontmatter, content } = parseFrontmatterFromFile(mdxPath);
      // Sanitize legacy HTML comments
      const sanitized = content.replace(/<!--([\s\S]*?)-->/g, (_m, inner) => `{/*${inner.trim()}*/}`);
      const mdxSource = await serialize(sanitized, { mdxOptions: { remarkPlugins: [], rehypePlugins: [] } });
      return res.status(200).json({ mode: 'mdx', id, frontmatter: { ...frontmatter, id }, mdxSource });
    }
    return res.status(404).json({ error: 'Story not found' });
  } catch (err) {
    console.error('Story API error', err);
    return res.status(500).json({ error: 'Failed to load story' });
  }
}
