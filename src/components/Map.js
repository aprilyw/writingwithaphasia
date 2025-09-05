import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transformExtent } from 'ol/proj';
import { easeOut } from 'ol/easing';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle, Fill, Stroke, Icon, Text } from 'ol/style';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import Cluster from 'ol/source/Cluster';
import Zoom from 'ol/control/Zoom';
import ZoomSlider from 'ol/control/ZoomSlider';

// Global extent - allow panning worldwide
const GLOBAL_EXTENT = transformExtent([-180.0, -85.0, 180.0, 85.0], 'EPSG:4326', 'EPSG:3857');

export default function MapComponent({ stories, onMarkerClick, selectedStory, zoomToStory, onZoomComplete, resetSignal }) {
  const mapRef = useRef();
  const mapInstance = useRef(null);
  const clusterSourceRef = useRef(null);

  // Only create the map once
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initialMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
            attributions: [
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
              '© <a href="https://carto.com/attributions">CARTO</a>'
            ]
          })
        }),
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
        zoom: 2.8, // Zoomed out to show full US, Canada, and Mexico
        extent: GLOBAL_EXTENT,
        minZoom: 1,
        maxZoom: 15, // Increased max zoom for better detail
        constrainOnlyCenter: false,
        zoomFactor: 3, // Much faster zoom with mouse wheel
        zoomDuration: 150, // Faster zoom animations
      }),
      controls: [
        // Add zoom controls for easier navigation
        new Zoom({
          className: 'custom-zoom-controls',
          zoomInTipLabel: 'Zoom In',
          zoomOutTipLabel: 'Zoom Out',
          delta: 2, // Zoom by 2 levels at a time for faster navigation
        }),
        new ZoomSlider({
          className: 'custom-zoom-slider',
        }),
      ],
    });

    mapInstance.current = initialMap;

    // Handle click events
    initialMap.on('click', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const features = feature.get('features');
        if (features && features.length > 1) {
          // This is a cluster - zoom in to expand it
          const extent = clusterSourceRef.current.getExtent();
          initialMap.getView().fit(extent, {
            duration: 150, // Ultra fast cluster expansion
            padding: [50, 50, 50, 50],
            maxZoom: 10,
          });
        } else if (features && features.length === 1) {
          // Single feature in cluster - handle as normal
          const story = features[0].get('story');
          const isUnderConstruction = !story.title || !story.name || 
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          
          if (!isUnderConstruction) {
            onMarkerClick(story);
          }
        } else {
          // Direct feature (not from cluster) - handle as normal
          const story = feature.get('story');
          const isUnderConstruction = !story.title || !story.name || 
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          
          if (!isUnderConstruction) {
            onMarkerClick(story);
          }
        }
      }
    });

    // Add double-click zoom for faster navigation
    initialMap.on('dblclick', (event) => {
      const view = initialMap.getView();
      const zoom = view.getZoom();
      view.animate({
        zoom: zoom + 2, // Zoom in by 2 levels on double-click
        center: event.coordinate,
        duration: 200, // Very fast double-click zoom
        easing: easeOut
      });
    });

    // Change cursor on hover
    initialMap.on('pointermove', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const features = feature.get('features');
        let story = null;
        
        if (features && features.length === 1) {
          story = features[0].get('story');
        } else if (!features) {
          story = feature.get('story');
        }
        
        if (story) {
          const isUnderConstruction = !story.title || !story.name || 
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          
          mapRef.current.style.cursor = isUnderConstruction ? 'not-allowed' : 'pointer';
        } else {
          mapRef.current.style.cursor = 'pointer';
        }
      } else {
        mapRef.current.style.cursor = '';
      }
    });

    // Add keyboard shortcuts for faster navigation
    document.addEventListener('keydown', (event) => {
      if (!mapRef.current.contains(document.activeElement)) return;
      
      const view = initialMap.getView();
      const zoom = view.getZoom();
      
      switch(event.key) {
        case '+':
        case '=':
          event.preventDefault();
          view.animate({
            zoom: zoom + 2,
            duration: 150
          });
          break;
        case '-':
        case '_':
          event.preventDefault();
          view.animate({
            zoom: zoom - 2,
            duration: 150
          });
          break;
        case '0':
          event.preventDefault();
          // Reset to initial view
          view.animate({
            center: fromLonLat([-98.5795, 39.8283]),
            zoom: 2.8,
            duration: 300
          });
          break;
      }
    });

    return () => initialMap.setTarget(undefined);
  }, []);

  // Update markers when stories change
  useEffect(() => {
    if (!mapInstance.current) return;
    // Remove all vector layers first
    mapInstance.current.getLayers().getArray().forEach(layer => {
      if (layer instanceof VectorLayer) {
        mapInstance.current.removeLayer(layer);
      }
    });
    
    // Add new markers
    const markers = stories.map(story => {
      const feature = new Feature({
        geometry: new Point(fromLonLat(story.coordinates)),
        story: story,
      });
      return feature;
    });
    
    const vectorSource = new VectorSource({ features: markers });
    
    // Create clustered source
    const clusterSource = new Cluster({
      distance: 5, // Distance in pixels within which features will be clustered
      source: vectorSource,
    });
    
    // Store cluster source reference for click handler
    clusterSourceRef.current = clusterSource;
    
    // Create clustered layer with custom styling
    const clusterLayer = new VectorLayer({
      source: clusterSource,
      style: (feature) => {
        const features = feature.get('features');
        const size = features.length;
        
        if (size === 1) {
          // Single feature - show as regular pin or gray pin for under construction
          const story = features[0].get('story');
          const isUnderConstruction = !story.title || !story.name || 
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          
          if (isUnderConstruction) {
            // Gray pin shape for under construction stories - using a custom drawn pin
            return new Style({
              image: new Icon({
                src: 'data:image/svg+xml;base64,' + btoa(`
                  <svg height="200px" width="200px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path style="fill:#9CA3AF;stroke:#ffffff;stroke-width:3;" d="M87.084,192c-0.456-5.272-0.688-10.6-0.688-16C86.404,78.8,162.34,0,256.004,0s169.6,78.8,169.6,176
                    c0,5.392-0.232,10.728-0.688,16h0.688c0,96.184-169.6,320-169.6,320s-169.6-223.288-169.6-320H87.084z M256.004,224
                    c36.392,1.024,66.744-27.608,67.84-64c-1.096-36.392-31.448-65.024-67.84-64c-36.392-1.024-66.744,27.608-67.84,64
                    C189.26,196.392,219.612,225.024,256.004,224z"/>
                  </svg>
                `),
                scale: 0.2,
                anchor: [0.5, 1],
              }),
            });
          } else {
            // Regular red pin for completed stories
            return new Style({
              image: new Icon({
                src: '/static/svg/location-pin-2965.svg',
                scale: 0.2,
                anchor: [0.5, 1], // Anchor at bottom center of the pin
              }),
            });
          }
        } else {
          // Multiple features - show as cluster with count
          // Check if all stories in cluster are under construction
          const allStoriesUnderConstruction = features.every(feature => {
            const story = feature.get('story');
            return !story.title || !story.name || 
              story.contentHtml?.includes('This page is under construction') ||
              story.contentHtml?.includes('This story is coming soon');
          });
          
          return new Style({
            image: new Circle({
              radius: Math.min(size * 3 + 10, 25), // Scale radius with count, max 25
              fill: new Fill({
                color: allStoriesUnderConstruction ? '#9CA3AF' : '#ff6b6b',
              }),
              stroke: new Stroke({
                color: '#ffffff',
                width: 2,
              }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({
                color: '#ffffff',
              }),
              font: 'bold 14px Arial',
            }),
          });
        }
      },
    });
    
    mapInstance.current.addLayer(clusterLayer);
  }, [stories]);

  // Zoom to story when zoomToStory changes (ultra fast now)
  useEffect(() => {
    if (mapInstance.current && zoomToStory && zoomToStory.coordinates) {
      const coords = fromLonLat(zoomToStory.coordinates);
      mapInstance.current.getView().animate({
        center: coords,
        zoom: 7,
        duration: 200, // Ultra fast - reduced to 200ms
        easing: easeOut
      }, () => {
        if (onZoomComplete) onZoomComplete();
      });
    }
  }, [zoomToStory, onZoomComplete]);

  // Reset map view when resetSignal changes
  useEffect(() => {
    if (!mapInstance.current) return;
    // Reset to initial center and zoom
    mapInstance.current.getView().setCenter(fromLonLat([-98.5795, 39.8283]));
    mapInstance.current.getView().setZoom(2.8);
  }, [resetSignal]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
} 