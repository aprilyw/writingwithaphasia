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
      router.push(`/stories/${story.id}` , undefined, { shallow: true });
    }, 400);
  };

  const handleCloseSidebar = () => {
    setSelectedStory(null);
    setZoomToStory(null);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    setResetMapSignal(s => s + 1);
    router.push('/', undefined, { shallow: true });
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

  return (
    <div className="story-map-container">
      <div className={`map-container ${selectedStory ? 'map-shrunk' : ''}`} aria-expanded={!!selectedStory} aria-controls="story-panel">
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
        className={`sidebar-container ${selectedStory ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
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
        <div className="overlay-text">
          <div className="overlay-content space-y-4">
            <div>Click a pin to view its story</div>
            <div className="text-left">
              <strong className="block mb-1">Story Index (Hybrid)</strong>
              <ul className="list-disc pl-5 max-h-64 overflow-auto text-sm">
                {stories.map((s) => (
                  <li key={s.id}>
                    <a href={`/stories/${s.id}`} className="text-primary hover:text-primaryHover">
                      {s.title || s.name || s.id}
                      {mdxMeta.find(m => m.id === s.id) && !s.error ? ' (MDX)' : ''}
                      {s.error && ' (⚠ meta error)'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .story-map-container { display: flex; flex-direction: row; height: 100vh; width: 100vw; overflow: hidden; background: #f8f9fa; }
        .map-container { flex: 1; height: 100vh; min-width: 0; transition: all 0.3s ease-in-out; position: relative; }
        .map-container.map-shrunk { width: 320px; height: 420px; flex: none; margin: 20px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); overflow: hidden; position: relative; z-index: 10; }
        .overlay-text { position: fixed; bottom: 2rem; left: 2rem; z-index: 99999; pointer-events: none; }
        .overlay-content { background: #ffffff; padding: 1rem 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-family: ${getFontFamilyVar()}; font-size: 1.1rem; font-weight: 600; color: #3a2c2a; text-align: center; border: 2px solid #3a2c2a; }
        .sidebar-container { flex: 1; height: 100vh; background: #fff; overflow-y: auto; transition: all 1s cubic-bezier(0.22,0.61,0.36,1); padding: 0; }
        .sidebar-expanded { flex: 1; opacity: 1; padding: 20px 40px; }
        .sidebar-collapsed { flex: 0; min-width: 0; max-width: 0; overflow: hidden; opacity: 0; }
        @media (max-width: 900px) { .story-map-container { flex-direction: column; background: #fff; height: 100vh; overflow-y: auto; } .map-container { height: 50vh; min-width: 0; max-width: 100vw; flex: none; transition: all 0.2s ease-in-out; } .map-container.map-shrunk { width: 100%; height: 200px; margin: 0; border-radius: 0; box-shadow: none; border-bottom: 1px solid #e0e0e0; } .sidebar-container { height: 50vh; min-width: 0; max-width: 100vw; flex: 1; } .sidebar-expanded { padding: 20px; height: auto; min-height: 50vh; } .overlay-text { bottom: 1rem; left: 1rem; right: 1rem; } .overlay-content { padding: 0.75rem 1.5rem; font-size: 1rem; } }
        @media (max-width: 600px) { .map-container.map-shrunk { height: 180px; } .sidebar-expanded { padding: 15px; } .overlay-content { padding: 0.5rem 1rem; font-size: 0.9rem; } }
      `}</style>
    </div>
  );
}
