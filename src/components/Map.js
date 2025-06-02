import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transformExtent } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import XYZ from 'ol/source/XYZ';

// US bounds in [west, south, east, north] format
const US_EXTENT = transformExtent([-125.0, 24.396308, -66.93457, 49.384358], 'EPSG:4326', 'EPSG:3857');

export default function MapComponent({ stories, onMarkerClick }) {
  const mapRef = useRef();
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map
    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        // Base map layer with US-specific styling
        new TileLayer({
          source: new XYZ({
            url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png',
            attributions: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
          })
        }),
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]), // Center of USA
        zoom: 4,
        extent: US_EXTENT, // Restrict pan to US bounds
        minZoom: 3, // Prevent zooming out too far
        maxZoom: 12, // Reasonable max zoom level
        constrainOnlyCenter: true, // Allow slight overflow for better UX
      }),
    });

    // Create markers for stories
    const markers = stories.map(story => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(story.coordinates)),
        story: story,
      });

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({ color: '#3498db' }),
            stroke: new Stroke({ 
              color: '#fff',
              width: 2
            }),
          }),
        })
      );

      return feature;
    });

    // Add markers to map
    const vectorSource = new VectorSource({
      features: markers,
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#3498db' }),
          stroke: new Stroke({ 
            color: '#fff',
            width: 2
          }),
        }),
      })
    });

    initialMap.addLayer(vectorLayer);

    // Handle click events
    initialMap.on('click', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const story = feature.get('story');
        onMarkerClick(story);
      }
    });

    // Change cursor on hover
    initialMap.on('pointermove', (event) => {
      const hit = initialMap.hasFeatureAtPixel(event.pixel);
      mapRef.current.style.cursor = hit ? 'pointer' : '';
    });

    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, [stories, onMarkerClick]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
} 