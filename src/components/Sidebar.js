import React, { useState, useEffect, useRef, Component } from 'react';
import ImageModal from './ImageModal';
import { getFontFamilyVar } from '../styles/fonts';
import { MDXRemote } from 'next-mdx-remote';
import { components as mdxComponents } from './mdx/MDXComponents';

class StoryContentErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error('Story MDX render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">This story could not be displayed.</p>
          <p className="mb-3">{this.state.error?.message || 'An error occurred while rendering.'}</p>
          <button
            type="button"
            onClick={() => this.setState({ error: null })}
            className="text-primary underline font-medium"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Sidebar({ selectedStory, onClose, headingRef }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storyPayload, setStoryPayload] = useState(null);
  const cacheRef = useRef(typeof window !== 'undefined' ? (window.__STORY_CACHE__ ||= new Map()) : new Map());

  useEffect(() => {
    if (!selectedStory) { setStoryPayload(null); return; }
    let cancelled = false;
    async function load() {
      const id = selectedStory.id;
      if (cacheRef.current.has(id)) { setStoryPayload(cacheRef.current.get(id)); return; }
      setLoading(true);
      try {
        const res = await fetch(`/api/story/${id}`);
        const json = await res.json();
        if (!cancelled) { setStoryPayload(json); cacheRef.current.set(id, json); }
        if (typeof document !== 'undefined') {
          const links = Array.from(document.querySelectorAll('a[href^="/?id="]'));
          const ids = links.map(l => decodeURIComponent(l.getAttribute('href').split('=')[1] || ''));
            const idx = ids.indexOf(id);
            const neighbors = [ids[idx - 1], ids[idx + 1]].filter(Boolean);
            neighbors.forEach(nId => { if (!cacheRef.current.has(nId)) { fetch(`/api/story/${nId}`).then(r => r.ok ? r.json() : null).then(d => { if (d) cacheRef.current.set(nId, d); }).catch(()=>{}); } });
        }
      } catch (e) {
        if (!cancelled) setStoryPayload({ error: true, message: 'Failed to load story.' });
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedStory]);

  useEffect(() => {
    window.openImageModal = (src, alt) => { setSelectedImage({ src, alt }); setIsModalOpen(true); };
    return () => { delete window.openImageModal; };
  }, []);

  const fontVar = getFontFamilyVar();

  if (!selectedStory) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-center" style={{ fontFamily: fontVar }}>
        <p className="text-neutral-500 italic max-w-sm">Select a location on the map to view its story.</p>
      </div>
    );
  }

  const headingText = storyPayload?.frontmatter?.title || storyPayload?.frontmatter?.name || 'Story';

  return (
    <div className="relative flex h-full flex-col" style={{ fontFamily: fontVar }} role="region" aria-label="Story content">
      <div className="flex items-start justify-end pb-2">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close story"
          className="group inline-flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition focus:outline-none focus:ring-2 focus:ring-primary hover:bg-neutral-100 hover:text-neutral-700"
        >
          <span className="text-2xl leading-none group-hover:scale-110 transition-transform">×</span>
        </button>
      </div>

      {/* Skeleton / error states */}
      {loading && (
        <div className="flex flex-col gap-5 pb-8" aria-hidden="true">
          <div className="h-9 w-2/3 rounded-md bg-neutral-200 animate-pulse" />
          <div className="h-3 w-1/3 rounded bg-neutral-200 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-full rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-3/5 rounded bg-neutral-200 animate-pulse" />
          </div>
          <div className="h-64 w-full rounded-xl bg-neutral-200 animate-pulse" />
          <div className="space-y-3">
            <div className="h-3 w-full rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-full rounded bg-neutral-200 animate-pulse" />
            <div className="h-3 w-2/5 rounded bg-neutral-200 animate-pulse" />
          </div>
        </div>
      )}
      {!loading && storyPayload?.error && (
        <div className="mb-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">{storyPayload.message || 'Error loading story.'}</div>
      )}

      {/* Legacy images block (pre-MDX) */}
      {!loading && storyPayload?.mode === 'legacy' && storyPayload.legacy?.images?.length > 0 && (
        <div className="mb-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {storyPayload.legacy.images.map((image, i) => (
              <figure key={i} className="flex flex-col m-0">
                <button
                  type="button"
                  onClick={() => { setSelectedImage(image); setIsModalOpen(true); }}
                  className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg ring-1 ring-neutral-300/60 bg-neutral-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                >
                  <img src={image.src} alt={image.alt} className="h-full w-full object-cover transition duration-300 ease-out hover:scale-[1.03]" />
                </button>
                {image.caption && (
                  <figcaption className="mt-2 text-center text-xs leading-snug text-neutral-600">{image.caption}</figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-300/70 hover:scrollbar-thumb-neutral-400/80">
        <div className="mx-auto w-full max-w-[1250px] px-6 md:px-10 lg:px-14 xl:px-20 pb-20">
          <header className="mb-10 text-center">
            {/* Actual visible heading restored for visual hierarchy */}
            <h1 ref={headingRef} tabIndex={-1} className="m-0 font-semibold tracking-tight text-3xl md:text-[2.15rem] leading-tight focus:outline-none">
              {storyPayload?.frontmatter?.title || storyPayload?.frontmatter?.name || 'Story'}
            </h1>
            {(storyPayload?.frontmatter?.location || storyPayload?.frontmatter?.date) && (
              <div className="mt-3 space-y-1 text-sm text-neutral-600">
                {storyPayload.frontmatter?.location && (
                  <p className="m-0 italic">{storyPayload.frontmatter.location}</p>
                )}
                {storyPayload.frontmatter?.date && (
                  <p className="m-0 text-xs tracking-wide uppercase text-neutral-500">{storyPayload.frontmatter.date}</p>
                )}
              </div>
            )}
            {/* Decorative separator now expected to be provided via MDX <Separator /> in content, not hardcoded here. */}
          </header>
          {/* Article: constrain typical reading width while allowing designated full-width media via Figure size props */}
          <article className="prose prose-neutral story-readable mx-auto dark:prose-invert prose-headings:font-semibold prose-h2:mt-12 prose-p:my-5 prose-img:rounded-xl prose-img:mx-auto prose-img:max-h-[520px] prose-img:shadow-sm selection:bg-primary/15">
            {!loading && storyPayload?.mode === 'legacy' && (
              <div dangerouslySetInnerHTML={{ __html: storyPayload.legacy.contentHtml }} />
            )}
            {!loading && storyPayload?.mode === 'mdx' && storyPayload.mdxSource && (
              <StoryContentErrorBoundary key={selectedStory?.id}>
                <MDXRemote {...storyPayload.mdxSource} components={mdxComponents} scope={{ frontmatter: storyPayload.frontmatter }} />
              </StoryContentErrorBoundary>
            )}
            {loading && (<p className="sr-only">Loading story content…</p>)}
          </article>
        </div>
      </div>

      <ImageModal
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedImage(null); }}
      />
    </div>
  );
}