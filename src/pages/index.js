// pages/index.js
// Home page now delegates all map + sidebar orchestration to StoryMap component
// MDX-only content pipeline: legacy static/md *.md files removed from story aggregation.
import { getAllStoriesMeta } from '../lib/mdx/getStoriesMeta';
import Head from 'next/head';
import StoryMap from '../components/StoryMap';

export async function getStaticProps() {
  // Load only MDX frontmatter; full MDX rendering handled client-side / via components.
  let mdxMeta;
  try {
    mdxMeta = getAllStoriesMeta({ strict: process.env.NODE_ENV === 'production' });
  } catch (e) {
    console.error('[build] MDX frontmatter validation error:\n', e.message);
    throw e;
  }
  const records = mdxMeta.filter(r => !r.error);
  const stories = records.sort((a,b)=>{
    const ad = (a.status === 'draft');
    const bd = (b.status === 'draft');
    if (ad !== bd) return ad ? 1 : -1;
    if (a.date && b.date) return a.date > b.date ? -1 : 1;
    return (a.title || a.name || a.id).localeCompare(b.title || b.name || b.id);
  });
  return { props: { stories, mdxMeta } };
}

export default function Home({ stories, mdxMeta }) {
  return (
    <>
      <Head>{/* Additional head content can be added here */}</Head>
      <StoryMap stories={stories} mdxMeta={mdxMeta} />
    </>
  );
}