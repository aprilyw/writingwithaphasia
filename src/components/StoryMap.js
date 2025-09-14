import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import MapComponent from './Map';
import Sidebar from './Sidebar';
import { getFontFamilyVar } from '../styles/fonts';

/**
 * StoryMap orchestrates:
 * - Map markers & zoom
 * - Shallow routing (/stories/[id])
 * - Sidebar panel open/close + focus management
 * - Responsive layout sizing (basic shrink behavior; animation layer can be added later)
 */
export default function StoryMap({ stories, mdxMeta }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
  const [resetMapSignal, setResetMapSignal] = useState(0);
  const zoomTimeout = useRef(null);
  const lastFocusedMarkerRef = useRef(null);
  const panelHeadingRef = useRef(null);
  const router = useRouter();

  // Initialize from query string
  useEffect(() => {
    if (router.isReady && router.query.id) {
      const story = stories.find(s => s.id === router.query.id);
      if (story) {
        setZoomToStory(story);
        zoomTimeout.current = setTimeout(() => setSelectedStory(story), 300);
      }
    }
  }, [router.isReady, router.query.id, stories]);

  const handleMarkerClick = (story, evt) => {
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    if (selectedStory && selectedStory.id === story.id) return; // no-op if same
    setZoomToStory(story);
    if (evt && evt.currentTarget) lastFocusedMarkerRef.current = evt.currentTarget;
    zoomTimeout.current = setTimeout(() => {
      setSelectedStory(story);
      // Navigate by adding id query param on the same page so map component stays mounted
      router.push({ pathname: '/', query: { id: story.id } }, undefined, { shallow: true });
    }, 400);
  };

  const handleCloseSidebar = () => {
    setSelectedStory(null);
    setZoomToStory(null);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    setResetMapSignal(s => s + 1);
  // Remove id query param to restore full map view
  const { id, ...rest } = router.query;
  router.push({ pathname: '/', query: { ...rest } }, undefined, { shallow: true });
    if (lastFocusedMarkerRef.current) {
      setTimeout(() => {
        try { lastFocusedMarkerRef.current.focus(); } catch {}
      }, 50);
    }
  };

  useEffect(() => {
    if (selectedStory && panelHeadingRef.current) {
      panelHeadingRef.current.focus();
    }
  }, [selectedStory]);

  // Escape key closes panel
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && selectedStory) {
        e.preventDefault();
        handleCloseSidebar();
      }
      // Navigation shortcuts only when panel open
      if (!selectedStory) return;
      const publishedStories = stories.filter(s => {
        const isDraft = (s.status && s.status.toLowerCase() === 'draft') || s.draft === true;
        return !isDraft; // skip drafts in keyboard cycle (consistent with index default)
      });
      if (publishedStories.length === 0) return;
      const currentIndex = publishedStories.findIndex(s => s.id === selectedStory.id);
      if (currentIndex === -1) return;
      const prev = () => publishedStories[(currentIndex - 1 + publishedStories.length) % publishedStories.length];
      const next = () => publishedStories[(currentIndex + 1) % publishedStories.length];
      let target = null;
      if (e.key === '[' || e.key === 'ArrowLeft') { target = prev(); }
      else if (e.key === ']' || e.key === 'ArrowRight') { target = next(); }
      if (target && target.id !== selectedStory.id) {
        e.preventDefault();
        setZoomToStory(target);
        if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
        zoomTimeout.current = setTimeout(() => {
          setSelectedStory(target);
          router.push({ pathname: '/', query: { id: target.id } }, undefined, { shallow: true });
        }, 320);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedStory]);

  const mapClasses = selectedStory
    ? 'w-[320px] h-[420px] flex-none m-5 rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0.14,0.3,1.2)] origin-bottom-left'
    : 'flex-1 h-screen min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0.14,0.3,1.2)] origin-center';

  const sidebarClasses = selectedStory
    ? 'flex-1 opacity-100 px-10 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]'
    : 'flex-0 min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]';

  return (
    <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-neutral-100">
      <div className={mapClasses} aria-expanded={!!selectedStory} aria-controls="story-panel">
        <MapComponent
          stories={stories}
          onMarkerClick={handleMarkerClick}
          selectedStory={selectedStory}
          zoomToStory={zoomToStory}
          onZoomComplete={() => {}}
          resetSignal={resetMapSignal}
        />
      </div>
      <div
        id="story-panel"
        className={`bg-white h-screen overflow-y-auto ${sidebarClasses}`}
        role="region"
        aria-label="Story content"
      >
        <Sidebar
          key={selectedStory?.id || 'no-story'}
          selectedStory={selectedStory && { id: selectedStory.id }}
          onClose={handleCloseSidebar}
          headingRef={panelHeadingRef}
        />
      </div>
      {!selectedStory && (
        <div className="fixed bottom-8 left-8 z-[99999] pointer-events-none max-w-md pr-4 sm:max-w-lg">
          <div
            className="space-y-4 bg-white px-6 py-4 rounded-lg shadow-xl border-2 border-[#3a2c2a] text-center font-semibold text-[#3a2c2a] text-[1.1rem] pointer-events-auto"
            style={{ fontFamily: getFontFamilyVar() }}
          >
            <div>Click a red pin to view a published story</div>
            <div className="text-[11px] text-neutral-600 mt-2">Keyboard: [ / ] or ← / → to switch stories • Esc to close</div>
            <div className="text-left">
              <strong className="block mb-1">Story Index</strong>
              <ul className="list-disc pl-5 max-h-64 overflow-auto text-sm">
                {stories.map((s) => {
                  const isDraft = (s.status && s.status.toLowerCase() === 'draft') || s.draft === true;
                  // Hide drafts unless ?draft=1 supplied
                  if (isDraft && typeof window !== 'undefined') {
                    const params = new URLSearchParams(window.location.search);
                    if (params.get('draft') !== '1') return null;
                  } else if (isDraft) {
                    // On server render hide drafts
                    return null;
                  }
                  return (
                    <li key={s.id}>
                      <a
                        href={`/?id=${encodeURIComponent(s.id)}`}
                        className={
                          'hover:text-primaryHover ' +
                          (isDraft ? 'text-neutral-500 line-through italic opacity-70 pointer-events-none cursor-default' : 'text-primary')
                        }
                        aria-disabled={isDraft ? 'true' : undefined}
                        tabIndex={isDraft ? -1 : undefined}
                        title={isDraft ? 'Draft story (not yet published)' : undefined}
                      >
                        {s.title || s.name || s.id}
                        {isDraft && <span className="ml-2 text-[10px] uppercase tracking-wide bg-neutral-300 text-neutral-700 px-1.5 py-0.5 rounded">Draft</span>}
                        {s.error && ' (⚠ meta error)'}
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 text-[11px] text-neutral-600 leading-snug border-t pt-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background:'#496586' }} />
                  <span>Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background:'#6B7280' }} />
                  <span>Draft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
