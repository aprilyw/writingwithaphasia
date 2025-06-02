// pages/index.js
import { useState } from 'react';
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

  return (
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
          onMarkerClick={(story) => setSelectedStory(story)} 
        />
      </div>
      <div className={`sidebar-container ${selectedStory ? 'sidebar-expanded' : ''}`}>
        <Sidebar 
          selectedStory={selectedStory} 
          onClose={() => setSelectedStory(null)}
        />
      </div>

      <style jsx>{`
        .container {
          display: flex;
          height: 100vh;
          width: 100vw;
        }
        .map-container {
          flex: 2;
          height: 100%;
          transition: flex 0.3s ease-in-out;
        }
        .map-container.map-shrunk {
          flex: 1;
        }
        .sidebar-container {
          width: 400px;
          border-left: 1px solid #e1e1e1;
          height: 100%;
          overflow-y: auto;
          transition: width 0.3s ease-in-out;
        }
        .sidebar-container.sidebar-expanded {
          width: 60%;
        }
      `}</style>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
            Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}