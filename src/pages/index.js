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

export default function Home({ stories }) {
  const [selectedStory, setSelectedStory] = useState(null);
  const [zoomToStory, setZoomToStory] = useState(null);
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

  return (
    <>
      <nav className="navbar">
        <div className="navbar-content">
          <span className="navbar-title">Writing With Aphasia</span>
          <div className="navbar-links">
            <a href="/about">About</a>
            <a href="/resources">Resources</a>
          </div>
        </div>
      </nav>
      <div className="container">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
        </Head>
        <div className={`map-container ${selectedStory ? 'map-shrunk' : ''}`}>
          <MapComponent 
            stories={stories} 
            onMarkerClick={handleMarkerClick} 
            selectedStory={selectedStory}
            zoomToStory={zoomToStory}
            onZoomComplete={() => setZoomToStory(null)}
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
        .navbar {
          width: 100vw;
          background: linear-gradient(90deg, #3498db 60%, #6dd5fa 100%);
          color: #fff;
          padding: 1.2rem 0 1.2rem 0;
          box-shadow: 0 4px 16px rgba(52,152,219,0.10);
          border-radius: 0 0 18px 18px;
          position: relative;
          z-index: 10;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .navbar-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
        }
        .navbar-title {
          font-size: 2.1rem;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .navbar-links {
          display: flex;
          gap: 1.5rem;
        }
        .navbar-links a {
          color: #fff;
          background: rgba(255,255,255,0.10);
          border-radius: 8px;
          padding: 0.55rem 1.3rem;
          text-decoration: none;
          font-size: 1.15rem;
          font-weight: 500;
          box-shadow: 0 2px 8px rgba(52,152,219,0.08);
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          border: 1px solid rgba(255,255,255,0.18);
        }
        .navbar-links a:hover {
          background: #fff;
          color: #3498db;
          box-shadow: 0 4px 16px rgba(52,152,219,0.18);
        }
        @media (max-width: 600px) {
          .navbar-content {
            flex-direction: column;
            align-items: flex-start;
            padding: 0 1rem;
          }
          .navbar-title {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
          }
          .navbar-links {
            gap: 0.7rem;
          }
          .navbar-links a {
            margin-left: 0;
            font-size: 1rem;
            padding: 0.45rem 1rem;
          }
        }
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
          flex: 0.8;
          height: 100vh;
          min-width: 350px;
          max-width: 1200px;
          background: #fff;
          overflow-y: auto;
          transition: width 1s cubic-bezier(0.22, 0.61, 0.36, 1);
        }
        .map-shrunk {
          flex: 0.5;
        }
        .sidebar-expanded {
          flex: 3.5;
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