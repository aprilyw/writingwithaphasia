// pages/index.js
// Home page now delegates all map + sidebar orchestration to StoryMap component
import { getAllStoriesData } from '../utils/markdown';
import { getAllStoriesMeta } from '../lib/mdx/getStoriesMeta';
import Head from 'next/head';
import StoryMap from '../components/StoryMap';

export async function getStaticProps() {
  const allStoriesData = await getAllStoriesData(); // legacy markdown data
  let mdxMeta;
  try {
    mdxMeta = getAllStoriesMeta({ strict: process.env.NODE_ENV === 'production' });
  } catch (e) {
    // Surface build-time failure with clear message
    console.error('[build] MDX frontmatter validation error:\n', e.message);
    throw e; // Let Next.js fail the build
  }
  // Merge: prefer MDX meta where ids overlap; then dedupe explicitly
  const mdxMetaValid = mdxMeta.filter(r => !r.error);
  const mdxMetaMap = new Map(mdxMetaValid.map(m => [m.id, m]));
  const mergedInitial = allStoriesData.map(s => mdxMetaMap.get(s.id) ? { ...s, ...mdxMetaMap.get(s.id) } : s);
  mdxMetaValid.forEach(m => { if (!mergedInitial.find(x => x.id === m.id)) mergedInitial.push(m); });
  // Dedupe by id (last in wins -> ensures MDX overrides legacy)
  const dedupMap = new Map();
  mergedInitial.forEach(item => { dedupMap.set(item.id, item); });
  let merged = Array.from(dedupMap.values());
  // Stable sort: published first (date desc if available), drafts last
  merged = merged.sort((a,b)=>{
    const ad = (a.status === 'draft');
    const bd = (b.status === 'draft');
    if (ad !== bd) return ad ? 1 : -1;
    if (a.date && b.date) return a.date > b.date ? -1 : 1;
    return (a.title || a.name || a.id).localeCompare(b.title || b.name || b.id);
  });
  return {
    props: {
      stories: merged,
      mdxMeta
    }
  };
}

export default function Home({ stories, mdxMeta }) {
  return (
    <>
      <Head>{/* Additional head content can be added here */}</Head>
      <StoryMap stories={stories} mdxMeta={mdxMeta} />
    </>
  );
}