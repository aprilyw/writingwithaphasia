// pages/index.js
import { useState, useRef } from 'react';
import MapComponent from '../components/Map';
import Sidebar from '../components/Sidebar';
import { getAllStoriesData } from '../utils/markdown';
import Head from 'next/head';

export async function getStaticProps() {
  const allStoriesData = await getAllStoriesData();
  return {
    props: {
      stories: allStoriesData
    }
  };
}

export default function Home({ stories, handleHomeClick }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
  const [resetMapSignal, setResetMapSignal] = useState(0);
  const zoomTimeout = useRef(null);

  // Handler for marker click: open sidebar, then zoom after transition
  const handleMarkerClick = (story) => {
    setSelectedStory(story);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
    zoomTimeout.current = setTimeout(() => {
      setZoomToStory(story);
    }, 1000); // match sidebar transition duration
  };

  // When sidebar closes, clear zoom
  const handleCloseSidebar = () => {
    setSelectedStory(null);
    setZoomToStory(null);
    if (zoomTimeout.current) clearTimeout(zoomTimeout.current);
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
          {/* Removed Inter font import - now using Source Sans Pro and Merriweather */}
        </Head>
        <div className={`map-container ${selectedStory ? 'map-shrunk' : ''}`}>
          <MapComponent 
            stories={stories} 
            onMarkerClick={handleMarkerClick} 
            selectedStory={selectedStory}
            zoomToStory={zoomToStory}
            onZoomComplete={() => setZoomToStory(null)}
            resetSignal={resetMapSignal}
          />
        </div>
        <div className={`sidebar-container ${selectedStory ? 'sidebar-expanded' : ''}`}>
          <Sidebar 
            selectedStory={selectedStory} 
            onClose={handleCloseSidebar}
          />
        </div>
      </div>
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: row;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .map-container {
          flex: 2.2;
          height: 100vh;
          min-width: 0;
          transition: width 0.3s;
        }
        .sidebar-container {
          flex: 1.2;
          height: 100vh;
          min-width: 450px;
          max-width: 1400px;
          background: #fff;
          overflow-y: auto;
          transition: width 1s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .map-shrunk {
          flex: 0.4;
        }
        .sidebar-expanded {
          flex: 4.5;
        }
        @media (max-width: 900px) {
          .container {
            flex-direction: column;
          }
          .map-container, .sidebar-container {
            height: 50vh;
            min-width: 0;
            max-width: 100vw;
          }
        }
      `}</style>
    </>
  );
}