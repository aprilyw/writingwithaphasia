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
export default function StoryMap({ stories, mdxMeta, embedded = false }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
  const [resetMapSignal, setResetMapSignal] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [resizeSignal, setResizeSignal] = useState(0);
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

  // Bump resize signal on layout-affecting state changes (embedded mode)
  useEffect(() => {
    if (embedded) setResizeSignal(s => s + 1);
  }, [expanded, selectedStory, embedded]);

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

  let mapClasses;
  if (embedded) {
    // Embedded mode: constrained height container with optional expansion & sidebar overlay style
    const base = 'relative w-full transition-all duration-500 ease-[cubic-bezier(0.4,0.14,0.3,1.2)]';
    const height = expanded ? 'h-[70vh]' : 'h-[420px]';
    mapClasses = `${base} ${height}`;
  } else {
    mapClasses = selectedStory
      ? 'w-[320px] h-[420px] flex-none m-5 rounded-2xl shadow-2xl overflow-hidden relative z-10 transition-all duration-500 ease-[cubic-bezier(0.4,0.14,0.3,1.2)] origin-bottom-left'
      : 'flex-1 h-screen min-w-0 transition-all duration-500 ease-[cubic-bezier(0.4,0.14,0.3,1.2)] origin-center';
  }

  const sidebarClasses = selectedStory
    ? (embedded
        ? 'absolute top-0 right-0 w-full md:w-[50%] h-full z-20 bg-white/95 backdrop-blur border-l border-neutral-200 shadow-xl opacity-100 px-6 py-5 overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)]'
        : 'flex-1 opacity-100 px-10 py-5 transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]')
    : (embedded
        ? 'pointer-events-none opacity-0 absolute top-0 right-0 w-full md:w-[50%] h-full overflow-hidden transition-all duration-300'
        : 'flex-0 min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)]');

  // Instruction / index panel reused (embedded: positioned below map rather than fixed)
  const InstructionPanel = !selectedStory && (
    <div className={embedded ? 'mt-4' : 'fixed bottom-8 left-8 z-[99999] pointer-events-none max-w-md pr-4 sm:max-w-lg'}>
      <div
        className={`space-y-4 bg-white px-6 py-4 rounded-lg shadow-xl border-2 border-[#3a2c2a] text-center font-semibold text-[#3a2c2a] text-[1.05rem] ${embedded ? '' : 'pointer-events-auto'} `}
        style={{ fontFamily: getFontFamilyVar() }}
      >
        <div>Click a gold pin to view a published story</div>
        <div className="text-[11px] text-neutral-600 mt-2">Keyboard: [ / ] or ← / → to switch stories • Esc to close</div>
        <div className="text-left">
          <strong className="block mb-1">Story Index</strong>
          <ul className="list-disc pl-5 max-h-64 overflow-auto text-sm">
            {stories.map((s) => {
              const isDraft = (s.status && s.status.toLowerCase() === 'draft') || s.draft === true;
              if (isDraft && typeof window !== 'undefined') {
                const params = new URLSearchParams(window.location.search);
                if (params.get('draft') !== '1') return null;
              } else if (isDraft) {
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
              <span className="inline-block w-3 h-3 rounded-full" style={{ background:'#F7CD6A' }} />
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
  );

  if (embedded) {
    // Embedded layout v2: large map by default; when a story is selected the map shrinks and sidebar appears alongside
    const embeddedContainerClasses = selectedStory
      ? 'w-full flex flex-col md:flex-row gap-6'
      : 'w-full';

    const largeMapClasses = 'relative rounded-xl overflow-hidden bg-white ring-1 ring-neutral-300 shadow-lg transition-all duration-500';
    const shrunkMapClasses = 'relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-neutral-300 bg-white transition-all duration-500 flex-none';

    const mapWrapperClasses = selectedStory
      ? expanded
        ? `${shrunkMapClasses} w-full md:w-[520px] h-[420px] md:h-[640px]` // expanded while story open
        : `${shrunkMapClasses} w-full md:w=[360px] h-[380px] md:h-[560px]` // shrunk state default
      : `${largeMapClasses} ${expanded ? 'h-[70vh]' : 'h-[60vh]'} w-full`; // default large state

    return (
      <div className={embeddedContainerClasses}>
        <div className={mapWrapperClasses} aria-expanded={!selectedStory} aria-controls={selectedStory ? 'story-panel' : undefined}>
          <MapComponent
            stories={stories}
            onMarkerClick={handleMarkerClick}
            selectedStory={selectedStory}
            zoomToStory={zoomToStory}
            onZoomComplete={() => {}}
            resetSignal={resetMapSignal}
            wheelZoomActive={false}
            resizeSignal={resizeSignal}
          />
          {/* Controls (only show expand toggle when not in shrunk/story mode) */}
          <div className="absolute top-3 left-3 flex gap-2 z-30">
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/90 backdrop-blur border border-neutral-300 shadow hover:border-neutral-400 hover:bg-white transition"
            >
              {expanded ? 'Reduce Map' : 'Expand Map'}
            </button>
            {!selectedStory && (
              <div className="hidden md:inline-block text-[11px] text-neutral-600 bg-white/80 backdrop-blur px-2 py-1 rounded border border-neutral-300 shadow-sm">Scroll / drag to explore</div>
            )}
            {selectedStory && (
              <button
                type="button"
                onClick={handleCloseSidebar}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/90 backdrop-blur border border-neutral-300 shadow hover:border-neutral-400 hover:bg-white transition"
              >Close Story</button>
            )}
          </div>
        </div>
        {selectedStory && (
          <div
            id="story-panel"
            className={`flex-1 w-full md:w-auto md:min-w-0 bg-white rounded-xl ring-1 ring-neutral-300 shadow-lg px-6 py-5 overflow-y-auto max-h-[80vh] md:max-h-[70vh] transition-all ${expanded ? 'md:max-w-[640px]' : ''}`}
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
        )}
        {!selectedStory && InstructionPanel}
      </div>
    );
  }

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
          wheelZoomActive={true}
          resizeSignal={resizeSignal}
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
      {InstructionPanel}
    </div>
  );
}
