// pages/stories/[id].js
import path from 'path';
import { getAllStoryIds, getStoryData } from '../../utils/markdown';
import StoryLayout from '../../components/stories/StoryLayout';
import Link from 'next/link';
import Head from 'next/head';
import { fonts, getFontFamilyVar } from '../../styles/fonts';
import { MDXRemote } from 'next-mdx-remote';
import { components as mdxComponents } from '../../components/mdx/MDXComponents';
import { serialize } from 'next-mdx-remote/serialize';

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
  // Legacy markdown ids
  const legacy = getAllStoryIds().map((p) => p.params.id);
  // New MDX ids
  const mdxIds = listMdxIds();
  // Merge unique
  const all = Array.from(new Set([...legacy, ...mdxIds]));
  return {
    paths: all.map((id) => ({ params: { id } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const fs = require('fs');
  const id = params.id;
  const MDX_STORIES_DIR = path.join(process.cwd(), 'src/content/stories');
  const mdxPath = path.join(MDX_STORIES_DIR, `${id}.mdx`);
  if (fs.existsSync(mdxPath)) {
    const source = fs.readFileSync(mdxPath, 'utf8');
    // Extract frontmatter manually so we can pass it easily; reuse simple regex, rely on our remark plugin during webpack for real pages.
    // Here we want serialized MDX at build time for static generation.
    const matterMatch = /^---\n([\s\S]*?)\n---/m.exec(source);
    let frontmatter = {};
    let content = source;
    if (matterMatch) {
      const yaml = require('js-yaml');
      frontmatter = yaml.load(matterMatch[1]) || {};
      content = source.slice(matterMatch[0].length).trimStart();
    }
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: []
      }
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
  // Fallback to legacy markdown pipeline
  const storyData = await getStoryData(id);
  return {
    props: {
      mode: 'legacy',
      storyData
    }
  };
}

export default function Story(props) {
  const { mode } = props;
  return (
    <div className="container">
      <Head>
        <link href={fonts.googleFontsUrl} rel="stylesheet" />
      </Head>
      <nav className="nav mb-6">
        <Link href="/">
          <a className="text-primary hover:text-primaryHover">← Back to Map</a>
        </Link>
      </nav>
      {mode === 'mdx' ? (
        <StoryLayout frontmatter={props.frontmatter}>
          <MDXRemote
            {...props.mdxSource}
            scope={{ frontmatter: props.frontmatter }}
            components={mdxComponents}
          />
        </StoryLayout>
      ) : (
        <article className="legacy-story">
          <h1>{props.storyData.name || props.storyData.title}</h1>
          <div className="content" dangerouslySetInnerHTML={{ __html: props.storyData.contentHtml }} />
        </article>
      )}
      <style jsx>{`
        .container { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem; }
        .legacy-story h1 { font-family: ${getFontFamilyVar()}; font-size: 2.5rem; font-weight: 700; margin-bottom: 1.5rem; }
        .legacy-story .content :global(p) { margin: 1.25em 0; }
      `}</style>
    </div>
  );
}