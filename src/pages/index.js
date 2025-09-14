// pages/index.js
// Home page now delegates all map + sidebar orchestration to StoryMap component
import { getAllStoriesData } from '../utils/markdown';
import { getAllStoriesMeta } from '../lib/mdx/getStoriesMeta';
import Head from 'next/head';
import StoryMap from '../components/StoryMap';

export async function getStaticProps() {
  const allStoriesData = await getAllStoriesData(); // legacy markdown data
  const mdxMeta = getAllStoriesMeta(); // new MDX metadata
  // Merge: prefer MDX meta where ids overlap
  const mdxMetaMap = new Map(mdxMeta.filter(r => !r.error).map(m => [m.id, m]));
  const merged = allStoriesData.map(s => mdxMetaMap.get(s.id) ? { ...s, ...mdxMetaMap.get(s.id) } : s);
  // Add any pure-MDX stories that do not exist in legacy markdown
  mdxMeta.forEach(m => { if (!merged.find(x => x.id === m.id)) merged.push(m); });
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