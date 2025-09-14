// pages/stories/[id].js
import path from 'path';
import StoryLayout from '../../components/stories/StoryLayout';
import Link from 'next/link';
import Head from 'next/head';
import { fonts, getFontFamilyVar } from '../../styles/fonts';
import { MDXRemote } from 'next-mdx-remote';
import { components as mdxComponents } from '../../components/mdx/MDXComponents';
import { serialize } from 'next-mdx-remote/serialize';
import { parseFrontmatterFromFile } from '../../lib/mdx/parseFrontmatter';
import remarkFrontmatterExport from '../../lib/mdx/remark-frontmatter-export.js';

// Utility: lazy FS access to avoid edge runtime conflicts
function listMdxIds() {
  const fs = require('fs');
  const MDX_STORIES_DIR = path.join(process.cwd(), 'src/content/stories');
  if (!fs.existsSync(MDX_STORIES_DIR)) return [];
  return fs.readdirSync(MDX_STORIES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

export async function getStaticPaths() {
  const mdxIds = listMdxIds();
  return { paths: mdxIds.map((id) => ({ params: { id } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const id = params.id;
  const MDX_STORIES_DIR = path.join(process.cwd(), 'src/content/stories');
  const mdxPath = path.join(MDX_STORIES_DIR, `${id}.mdx`);
  if (fs.existsSync(mdxPath)) {
    const { frontmatter, content } = parseFrontmatterFromFile(mdxPath);
    // Sanitize legacy HTML comments (<!-- -->) that MDX parser treats as invalid tag openings
    const sanitized = content.replace(/<!--([\s\S]*?)-->/g, (_m, inner) => `{/*${inner.trim()}*/}`);
    const mdxSource = await serialize(sanitized, {
      mdxOptions: {
        remarkPlugins: [remarkFrontmatterExport],
        rehypePlugins: []
      },
      scope: { frontmatter }
    });
    // Debug instrumentation: log compiled MDX size & excerpt
    if (process.env.NODE_ENV === 'production') {
      console.log('[MDX serialize]', id, 'keys:', Object.keys(mdxSource || {}), 'compiled length:', mdxSource?.compiledSource?.length);
    }
    frontmatter.id = frontmatter.id || id;
    return {
      props: {
        mode: 'mdx',
        frontmatter,
        mdxSource
      }
    };
  }
  return { notFound: true };
}

export default function Story(props) {
  const { mode } = props;
  return (
    <div className="container">
      <Head>
        <link href={fonts.googleFontsUrl} rel="stylesheet" />
      </Head>
      <nav className="nav mb-6">
        <Link href="/" className="text-primary hover:text-primaryHover">← Back to Map</Link>
      </nav>
      <StoryLayout frontmatter={props.frontmatter}>
        <MDXRemote
          {...props.mdxSource}
          scope={{ frontmatter: props.frontmatter }}
          components={mdxComponents}
        />
      </StoryLayout>
      <style jsx>{`
        .container { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem; }
      `}</style>
    </div>
  );
}