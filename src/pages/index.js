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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-800 mb-4">
            Interactive Story Map
          </h1>
          <p className="max-w-2xl text-neutral-700 text-sm sm:text-base mb-6 leading-relaxed">
            Explore published stories by location. Click a gold pin to open a story panel. Use the expand button for a larger view.
          </p>
          <div className="rounded-2xl bg-neutral-100/70 ring-1 ring-neutral-300 shadow-inner p-2">
            <StoryMap stories={stories} mdxMeta={mdxMeta} embedded />
          </div>
        </section>
      </main>
    </>
  );
}