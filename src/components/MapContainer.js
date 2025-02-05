// components/MapContainer.js
import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import { Style, Icon } from 'ol/style';
import Overlay from 'ol/Overlay';
import StoryCard from '../components/StoryCard';

// function HoverCard({ story }) {
//   return (
//     <div className="absolute z-10 bg-white rounded-lg shadow-lg p-3 w-64 -translate-x-1/2 -translate-y-full mb-2">
//       <div className="text-sm">
//         <h3 className="font-bold text-gray-900">{story.name}</h3>
//         <p className="mt-1 text-gray-600">{story.preview}</p>
//       </div>
//       <div className="absolute -bottom-2 left-1/2 w-4 h-4 bg-white transform -translate-x-1/2 rotate-45"></div>
//     </div>
//   );
// }

function MapComponent({ stories, onMarkerClick }) {
  const mapRef = useRef();
  const mapInstance = useRef(null);
  const overlayRef = useRef();
  const hoverCardRef = useRef();
  const rootRef = useRef(null);

  useEffect(() => {
    // Create root for React rendering
    if (!rootRef.current && hoverCardRef.current) {
      rootRef.current = createRoot(hoverCardRef.current);
    }

    if (!mapInstance.current) {
      const vectorSource = new VectorSource();
      
      const overlay = new Overlay({
        element: hoverCardRef.current,
        positioning: 'bottom-center',
        offset: [0, -20],
        stopEvent: false
      });
      overlayRef.current = overlay;
      
      stories.forEach(story => {
        const feature = new Feature({
          geometry: new Point(fromLonLat(story.coordinates)),
          story: story
        });

        feature.setStyle(new Style({
          image: new Icon({
            src: 'data:image/svg+xml,' + encodeURIComponent(`
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#3B82F6" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
              </svg>
            `),
            scale: 1.5,
            anchor: [0.5, 1]
          })
        }));

        vectorSource.addFeature(feature);
      });

      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM({
              attributions: ['© OpenStreetMap']
            })
          }),
          new VectorLayer({
            source: vectorSource
          })
        ],
        view: new View({
          center: fromLonLat([-98.5795, 39.8283]),
          zoom: 4
        }),
        overlays: [overlay]
      });

      map.on('click', (event) => {
        const feature = map.forEachFeatureAtPixel(event.pixel, feature => feature);
        if (feature) {
          const story = feature.get('story');
          if (story) {
            onMarkerClick(story);
          }
        }
      });

      let currentFeature = null;

      map.on('pointermove', (event) => {
        const pixel = map.getEventPixel(event.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';

        const feature = map.forEachFeatureAtPixel(pixel, feature => feature);
        
        if (feature) {
          if (feature !== currentFeature) {
            currentFeature = feature;
            const story = feature.get('story');
            if (story) {
              const coordinates = feature.getGeometry().getCoordinates();
              overlay.setPosition(coordinates);
              if (rootRef.current) {
                rootRef.current.render(<StoryCard story={story} />);
                hoverCardRef.current.style.display = 'block';
              }
            }
          }
        } else {
          currentFeature = null;
          hoverCardRef.current.style.display = 'none';
        }
      });

      mapInstance.current = map;
    }

    return () => {
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.setTarget(null);
        mapInstance.current = null;
      }
    };
  }, [stories, onMarkerClick]);

  return (
    <>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      <div ref={hoverCardRef} className="ol-overlay" style={{ display: 'none' }} />
    </>
  );
}

export default function MapContainer({ stories, onMarkerClick }) {
  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapComponent stories={stories} onMarkerClick={onMarkerClick} />
    </div>
  );
}