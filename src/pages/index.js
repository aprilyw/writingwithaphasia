// pages/index.js
import { useState } from 'react';
import dynamic from 'next/dynamic';
import StoryCard from '../components/StoryCard';
import { stories } from '../data/stories';

// Dynamic import of MapContainer to avoid SSR issues
const MapContainer = dynamic(
  () => import('../components/MapContainer'),
  { 
    ssr: false,
    loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Loading map...</div>
  }
);

export default function HomePage() {
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Writing With Aphasia</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[600px]">
          <MapContainer 
            stories={stories} 
            onMarkerClick={(story) => setSelectedStory(story)}
          />
        </div>
        <div className="md:col-span-1">
          {selectedStory ? (
            <StoryCard story={selectedStory} />
          ) : (
            <div className="p-4 bg-gray-100 rounded-lg">
              <p>Select a marker on the map to view someone's story.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}