import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
const StoryMap = ({ stories, mdxMeta, embedded = false }, ref) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
  const [resetMapSignal, setResetMapSignal] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [resizeSignal, setResizeSignal] = useState(0);
  const [legendOpen, setLegendOpen] = useState(false);
  const zoomTimeout = useRef(null);
  const lastFocusedMarkerRef = useRef(null);
  const panelHeadingRef = useRef(null);
  const router = useRouter();

  // Expose imperative controls (for homepage blurb link etc.)
  useImperativeHandle(ref, () => ({
    openLegend: () => setLegendOpen(true),
    closeLegend: () => setLegendOpen(false),
    toggleLegend: () => setLegendOpen(o => !o)
  }), []);

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

  // Legend + story index (collapsible panel) - appears via floating button in embedded mode
  const LegendPanel = embedded && legendOpen && (
    <div
      id="legend-panel"
      className="absolute bottom-20 left-3 z-40 w-72 sm:w-80 bg-white/95 backdrop-blur rounded-xl shadow-2xl ring-1 ring-neutral-300 p-4 flex flex-col max-h-[70vh]"
      role="dialog"
      aria-label="Map legend and story index"
    >
      <div className="flex items-start justify-between mb-2">
        <h2 className="text-sm font-semibold tracking-tight text-neutral-800" style={{ fontFamily: getFontFamilyVar() }}>Legend & Index</h2>
        <button
          type="button"
          onClick={() => setLegendOpen(false)}
          className="-mr-1 -mt-1 p-1 rounded hover:bg-neutral-200/70 text-neutral-600"
          aria-label="Close legend"
        >✕</button>
      </div>
      <p className="text-[11px] text-neutral-600 leading-snug mb-3">Click a gold pin to open its story. Use [ / ] or arrow keys to cycle when a story is open.</p>
      <div className="flex items-center gap-3 text-[11px] mb-3">
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background:'#F7CD6A' }} /> <span className="text-neutral-700">Published</span></div>
        <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full" style={{ background:'#6B7280' }} /> <span className="text-neutral-700">Draft</span></div>
      </div>
      <div className="border-t pt-2 -mx-2 px-2 flex-1 overflow-auto" aria-label="Story index">
        <ul className="space-y-2 text-[13px] leading-tight">
          {stories.map((s) => {
            const isDraft = (s.status && s.status.toLowerCase() === 'draft') || s.draft === true;
            if (isDraft && typeof window !== 'undefined') {
              const params = new URLSearchParams(window.location.search);
              if (params.get('draft') !== '1') return null;
            } else if (isDraft) {
              return null;
            }
            const title = s.title || s.name || s.id;
            // Basic preview: first ~110 chars of description or summary field if present
            let preview = '';
            if (s.description) preview = s.description;
            else if (s.summary) preview = s.summary;
            if (preview.length > 140) preview = preview.slice(0, 137).trimEnd() + '…';
            return (
              <li key={s.id} className="group">
                <a
                  href={`/?id=${encodeURIComponent(s.id)}`}
                  className={'block font-medium hover:text-primaryHover ' + (isDraft ? 'text-neutral-500 line-through italic opacity-70 pointer-events-none cursor-default' : 'text-primary')}
                  aria-disabled={isDraft ? 'true' : undefined}
                  tabIndex={isDraft ? -1 : undefined}
                  title={title}
                >
                  {title}
                  {isDraft && <span className="ml-2 text-[9px] uppercase tracking-wide bg-neutral-300 text-neutral-700 px-1 py-0.5 rounded">Draft</span>}
                  {s.error && ' (⚠ meta error)'}
                </a>
                {preview && (
                  <p className="mt-0.5 text-[11px] text-neutral-600 line-clamp-3 pr-2 group-hover:text-neutral-700 transition-colors">{preview}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => setLegendOpen(false)}
          className="text-[11px] text-neutral-600 hover:text-neutral-800 underline"
        >Close</button>
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
      ? `${shrunkMapClasses} w-full md:w-[360px] h-[380px] md:h-[560px]` // shrunk state
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
            {!selectedStory && (
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/90 backdrop-blur border border-neutral-300 shadow hover:border-neutral-400 hover:bg-white transition"
              >
                {expanded ? 'Collapse' : 'Expand'} Map
              </button>
            )}
            <button
              type="button"
              onClick={() => setLegendOpen(o => !o)}
              aria-expanded={legendOpen ? 'true' : 'false'}
              aria-controls="legend-panel"
              className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/90 backdrop-blur border border-neutral-300 shadow hover:border-neutral-400 hover:bg-white transition"
            >{legendOpen ? 'Hide' : 'Show'} Index</button>
          </div>
          {selectedStory && (
            <button
              type="button"
              onClick={handleCloseSidebar}
              className="absolute top-3 left-3 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/90 backdrop-blur border border-neutral-300 shadow hover:border-neutral-400 hover:bg-white transition z-30"
            >Close Story</button>
          )}
        </div>
        {selectedStory && (
          <div
            id="story-panel"
            className="flex-1 w-full md:w-auto md:min-w-0 bg-white rounded-xl ring-1 ring-neutral-300 shadow-lg px-6 py-5 overflow-y-auto max-h-[80vh] md:max-h-[70vh] transition-all"
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
        {LegendPanel}
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
};

export default forwardRef(StoryMap);
