// pages/index.js
// Home page now delegates all map + sidebar orchestration to StoryMap component
// MDX-only content pipeline: legacy static/md *.md files removed from story aggregation.
import { getAllStoriesMeta } from '../lib/mdx/getStoriesMeta';
import Head from 'next/head';
import StoryMap from '../components/StoryMap';
import StoryCard from '../components/StoryCard';
import { useRef } from 'react';

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
  // Deterministic date formatting (server side) so hydration matches client.
  const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' });
  const storiesWithDisplayDate = stories.map(s => {
    if (s.date) {
      try {
        const d = new Date(s.date + 'T00:00:00Z');
        if (!isNaN(d.getTime())) {
          return { ...s, displayDate: DATE_FORMATTER.format(d) };
        }
      } catch {}
    }
    return s;
  });
  return { props: { stories: storiesWithDisplayDate, mdxMeta } };
}

export default function Home({ stories, mdxMeta }) {
  const storyMapRef = useRef(null);
  const openIndex = (e) => { e.preventDefault(); storyMapRef.current?.openLegend(); };
  return (
    <>
      <Head>{/* Additional head content can be added here */}</Head>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        <section aria-labelledby="map-heading">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-800 mb-4">
            Interactive Story Map
          </h1>
          <p className="max-w-2xl text-neutral-700 text-sm sm:text-base mb-6 leading-relaxed">
            Explore published stories by location. Click a gold pin to open a story panel.{' '}
            <button
              onClick={openIndex}
              className="underline decoration-dotted underline-offset-4 font-medium text-primary hover:text-primaryHover focus:outline-none focus:ring-2 focus:ring-primary/40 rounded px-0.5"
            >See full list of stories</button>.
          </p>
          <div className="rounded-2xl bg-neutral-100/70 ring-1 ring-neutral-300 shadow-inner p-2">
            <StoryMap ref={storyMapRef} stories={stories} mdxMeta={mdxMeta} embedded />
          </div>
        </section>

        <section aria-labelledby="stories-heading" className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 id="stories-heading" className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-800">
              Stories
            </h2>
            <p className="text-[12px] text-neutral-500">Newest first</p>
          </div>
          <ul className="space-y-5 sm:space-y-6">
            {stories.filter(s => (s.status || 'published') === 'published').map(s => (
              <StoryCard key={s.id || s.title} story={s} />
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}