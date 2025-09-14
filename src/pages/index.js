// pages/index.js
import { useState, useRef } from 'react';
import MapComponent from '../components/Map';
import Sidebar from '../components/Sidebar';
import { getAllStoriesData } from '../utils/markdown';
import { getAllStoriesMeta } from '../lib/mdx/getStoriesMeta';
import Head from 'next/head';
import { getFontFamilyVar } from '../styles/fonts';

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

export default function Home({ stories, mdxMeta, handleHomeClick }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
  const [resetMapSignal, setResetMapSignal] = useState(0);
  const zoomTimeout = useRef(null);

  // Handler for marker click: zoom first, then open sidebar after zoom completes
  const handleMarkerClick = (story) => {
    // Clear any existing timeout first
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    
    // If clicking the same story that's already selected, do nothing
    if (selectedStory && selectedStory.id === story.id) {
      return;
    }
    
    // For any new story selection (whether sidebar is open or not): start zoom animation
    setZoomToStory(story);
    
    // Open sidebar after zoom animation completes (much faster now - 400ms)
    zoomTimeout.current = setTimeout(() => {
      setSelectedStory(story);
    }, 400); // Reduced from 3500ms to 400ms for much faster story loading
  };

  // When sidebar closes, clear zoom and reset to original view
  const handleCloseSidebar = () => {
    setSelectedStory(null);
    setZoomToStory(null);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    // Reset map to original zoom and center
    setResetMapSignal((s) => s + 1);
  };

  // Handler for Home click
  const onHomeClick = () => {
    setSelectedStory(null);
    setZoomToStory(null);
    setResetMapSignal((s) => s + 1);
  };

  // Expose handler for _app.js
  if (typeof window !== 'undefined') {
    window.handleHomeClick = onHomeClick;
  }

  return (
    <>
  <div className="container">
        <Head>
          {/* Font now using TASA Orbiter */}
        </Head>
  <div className={`map-container ${selectedStory ? 'map-shrunk' : ''}`}>
          <MapComponent 
            stories={stories} 
            onMarkerClick={handleMarkerClick} 
            selectedStory={selectedStory}
            zoomToStory={zoomToStory}
            onZoomComplete={() => {
              // Don't clear zoomToStory here - it will be cleared when sidebar opens
            }}
            resetSignal={resetMapSignal}
          />
        </div>
  <div className={`sidebar-container ${selectedStory ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <Sidebar
            key={selectedStory?.id || 'no-story'}
            selectedStory={selectedStory && { id: selectedStory.id }}
            onClose={handleCloseSidebar}
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
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: row;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #f8f9fa;
        }
        .map-container {
          flex: 1;
          height: 100vh;
          min-width: 0;
          transition: all 0.3s ease-in-out;
          position: relative;
        }
        .map-container.map-shrunk {
          width: 320px;
          height: 420px;
          flex: none;
          margin: 20px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
          position: relative;
          z-index: 10;
        }
        .overlay-text {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          z-index: 99999;
          pointer-events: none;
        }
        .overlay-content {
          background: #ffffff;
          padding: 1rem 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          font-family: ${getFontFamilyVar()};
          font-size: 1.1rem;
          font-weight: 600;
          color: #3a2c2a;
          text-align: center;
          border: 2px solid #3a2c2a;
        }
        .sidebar-container {
          flex: 1;
          height: 100vh;
          background: #fff;
          overflow-y: auto;
          transition: all 1s cubic-bezier(0.22, 0.61, 0.36, 1);
          padding: 0;
        }
        .sidebar-expanded {
          flex: 1;
          opacity: 1;
          padding: 20px 40px;
        }
        .sidebar-collapsed {
          flex: 0;
          min-width: 0;
          max-width: 0;
          overflow: hidden;
          opacity: 0;
        }
        @media (max-width: 900px) {
          .container {
            flex-direction: column;
            background: #fff;
            height: 100vh;
            overflow-y: auto;
          }
          .map-container {
            height: 50vh;
            min-width: 0;
            max-width: 100vw;
            flex: none;
            transition: all 0.2s ease-in-out;
          }
          .map-container.map-shrunk {
            width: 100%;
            height: 200px;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            border-bottom: 1px solid #e0e0e0;
          }
          .sidebar-container {
            height: 50vh;
            min-width: 0;
            max-width: 100vw;
            flex: 1;
          }
          .sidebar-expanded {
            padding: 20px;
            height: auto;
            min-height: 50vh;
          }
          .overlay-text {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
          }
          .overlay-content {
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
          }
        }
        
        @media (max-width: 600px) {
          .map-container.map-shrunk {
            height: 180px;
          }
          .sidebar-expanded {
            padding: 15px;
          }
          .overlay-content {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
}