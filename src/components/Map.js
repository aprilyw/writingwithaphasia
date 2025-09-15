import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { fromLonLat, transformExtent } from 'ol/proj';
import { boundingExtent } from 'ol/extent';
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

export default function MapComponent({ stories, onMarkerClick, selectedStory, zoomToStory, onZoomComplete, resetSignal, wheelZoomActive = true, resizeSignal = 0 }) {
  const mapRef = useRef();
  const mapInstance = useRef(null);
  const clusterSourceRef = useRef(null);
  const hoverCardRef = useRef(null);
  const hoverDataRef = useRef({ story: null, pixel: null });
  const [draftMode, setDraftMode] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const wheelHandlerRef = useRef(null);
  const keydownHandlerRef = useRef(null);
  const initialFitPerformedRef = useRef(false);

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
        })
      ],
      view: new View({
        center: fromLonLat([-98.5795, 39.8283]),
        zoom: 2.8,
        extent: GLOBAL_EXTENT,
        minZoom: 1,
        maxZoom: 15,
        constrainOnlyCenter: false,
        zoomFactor: 2, // slightly gentler wheel increments
        zoomDuration: 260, // smoother wheel animation
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
          // Cluster: compute tight extent of contained stories & zoom in (never outward)
          const coords = features.map(f => f.getGeometry().getCoordinates());
          const tightExtent = boundingExtent(coords);
          const view = initialMap.getView();
          const currentResolution = view.getResolution();
          // Fit with padding; cap resulting zoom so we don't jump too close on large clusters
          view.fit(tightExtent, {
            duration: 420,
            padding: [60, 60, 60, 60],
            maxZoom: Math.min(view.getZoom() + 4, 11)
          });
        } else if (features && features.length === 1) {
          // Single feature in cluster - handle as normal
          const story = features[0].get('story');
          const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
          const isUnderConstruction = !story.title || !story.name ||
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          if (!isUnderConstruction && !(isDraft && !draftMode)) {
            onMarkerClick(story);
          }
        } else {
          // Direct feature (not from cluster) - handle as normal
            const story = feature.get('story');
            const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
            const isUnderConstruction = !story.title || !story.name ||
              story.contentHtml?.includes('This page is under construction') ||
              story.contentHtml?.includes('This story is coming soon');
            if (!isUnderConstruction && !(isDraft && !draftMode)) {
              onMarkerClick(story);
            }
        }
      }
    });

    // Gate wheel zoom if disabled (prevent accidental page scroll capture)
    if (!wheelZoomActive) {
      const wheelHandler = (e) => {
        // If map container gone (during navigation), allow event to bubble normally
        if (!mapRef.current) return;
        if (!wheelZoomActive && !e.ctrlKey) {
          e.stopPropagation();
        }
      };
      wheelHandlerRef.current = wheelHandler;
      mapRef.current.addEventListener('wheel', wheelHandler, { passive: true, capture: true });
    }

    // Add double-click zoom for faster navigation (still allowed even when wheel zoom gated)
    initialMap.on('dblclick', (event) => {
      const view = initialMap.getView();
      const zoom = view.getZoom();
      view.animate({
        zoom: zoom + 2,
        center: event.coordinate,
        duration: 380,
        easing: easeOut
      });
    });

    // Change cursor + collect hover data (draft aware); we render card via React for richer content
    initialMap.on('pointermove', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      let story = null;
      if (feature) {
        const features = feature.get('features');
        if (features && features.length === 1) story = features[0].get('story');
        else if (!features && feature.get('story')) story = feature.get('story');
      }
      if (!hoverCardRef.current) return; // not mounted yet
      if (story) {
        const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
        const isUnderConstruction = !story.title || !story.name ||
          story.contentHtml?.includes('This page is under construction') ||
          story.contentHtml?.includes('This story is coming soon');
        const suppressClick = isUnderConstruction || (isDraft && !draftMode);
        mapRef.current.style.cursor = suppressClick ? 'not-allowed' : 'pointer';
        hoverDataRef.current.story = story;
        hoverDataRef.current.pixel = event.pixel;
        // Position & populate (React fallback if we later switch to state)
        const [x, y] = event.pixel;
        const cardEl = hoverCardRef.current;
        cardEl.style.display = 'block';
        cardEl.style.left = `${x + 14}px`;
        cardEl.style.top = `${y + 14}px`;
        // Basic sanitization: escape angle brackets in excerpt (strip HTML tags for preview)
        const excerpt = (story.excerpt || story.subtitle || '')
          .replace(/<[^>]*>/g, '')
          .slice(0, 140);
        const hero = story.hero && story.hero.startsWith('/') ? story.hero : null;
        cardEl.innerHTML = `
          <div class="w-72 max-w-sm bg-white/95 backdrop-blur border border-neutral-300 shadow-xl rounded-xl p-4 pointer-events-none ${isDraft ? 'opacity-70' : ''}">
            <div class="flex gap-4">
              ${hero ? `<div class='flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-neutral-200 ring-1 ring-neutral-300'><img src='${hero}' alt='' class='object-cover w-full h-full'/></div>` : ''}
              <div class="min-w-0">
                <div class="font-semibold text-[14px] leading-snug text-neutral-900 mb-1 line-clamp-2 tracking-tight">${(story.title || story.name || story.id)}</div>
                ${excerpt ? `<div class='text-[12px] leading-snug text-neutral-600 line-clamp-4'>${excerpt}</div>` : ''}
              </div>
            </div>
          </div>`;
      } else {
        mapRef.current.style.cursor = '';
        hoverDataRef.current.story = null;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        // Delay hide slightly to reduce flicker between tightly spaced markers
        hoverTimeoutRef.current = setTimeout(() => {
          if (hoverCardRef.current) hoverCardRef.current.style.display = 'none';
        }, 80);
      }
    });
    initialMap.on('pointerout', () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (hoverCardRef.current) hoverCardRef.current.style.display = 'none';
    });

    // Add keyboard shortcuts for faster navigation
    const keydownHandler = (event) => {
      if (!mapRef.current) return; // page navigated away
      if (!mapRef.current.contains(document.activeElement)) return;
      const view = initialMap.getView();
      const zoom = view.getZoom();
      switch(event.key) {
        case '+':
        case '=':
          event.preventDefault();
          view.animate({ zoom: zoom + 1, duration: 320, easing: easeOut });
          break;
        case '-':
        case '_':
          event.preventDefault();
            view.animate({ zoom: zoom - 1, duration: 320, easing: easeOut });
          break;
        case '0':
          event.preventDefault();
          view.animate({
            center: fromLonLat([-98.5795, 39.8283]),
            zoom: 2.8,
            duration: 450,
            easing: easeOut
          });
          break;
      }
    };
    keydownHandlerRef.current = keydownHandler;
    document.addEventListener('keydown', keydownHandler);

    return () => {
      try { initialMap.setTarget(undefined); } catch {}
      if (wheelHandlerRef.current && mapRef.current) {
        try { mapRef.current.removeEventListener('wheel', wheelHandlerRef.current, { capture: true }); } catch {}
      }
      if (keydownHandlerRef.current) {
        document.removeEventListener('keydown', keydownHandlerRef.current);
      }
      mapInstance.current = null; // allow fresh mount on route return
    };
  }, []);

  // Trigger map size recalculation when container layout changes (e.g., expand/collapse or sidebar open)
  useEffect(() => {
    if (!mapInstance.current) return;
    // Delay to allow CSS transitions to settle for smoother re-render of tiles
    const id = setTimeout(() => {
      try { mapInstance.current.updateSize(); } catch {}
    }, 300);
    return () => clearTimeout(id);
  }, [resizeSignal]);

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
    const markers = stories
      .filter(story => Array.isArray(story.coordinates) && story.coordinates.length === 2 && story.coordinates.every(n => typeof n === 'number'))
      .map(story => {
        try {
          const feature = new Feature({
            geometry: new Point(fromLonLat(story.coordinates)),
            story: story,
          });
          return feature;
        } catch (e) {
          // Silently skip invalid coordinate
          return null;
        }
      })
      .filter(Boolean);
    
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
        
        if (size === 0) {
          return null; // nothing to render
        }
        if (size === 1) {
          // Single feature - show as regular pin or gray pin for under construction / draft
          const story = features[0].get('story');
          const isUnderConstruction = !story.title || !story.name ||
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;

          if (isUnderConstruction || isDraft) {
            // Gray pin for draft or under construction
            return new Style({
              image: new Icon({
                src: 'data:image/svg+xml;base64,' + btoa(`
                  <svg height="200px" width="200px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                    <path style="fill:#6B7280;stroke:#ffffff;stroke-width:3;" d="M87.084,192c-0.456-5.272-0.688-10.6-0.688-16C86.404,78.8,162.34,0,256.004,0s169.6,78.8,169.6,176
                    c0,5.392-0.232,10.728-0.688,16h0.688c0,96.184-169.6,320-169.6,320s-169.6-223.288-169.6-320H87.084z M256.004,224
                    c36.392,1.024,66.744-27.608,67.84-64c-1.096-36.392-31.448-65.024-67.84-64c-36.392-1.024-66.744,27.608-67.84,64
                    C189.26,196.392,219.612,225.024,256.004,224z"/>
                  </svg>
                `),
                scale: 0.2,
                anchor: [0.5, 1],
              }),
            });
          }
          // Published story pin (blue)
          return new Style({
            image: new Icon({
              src: 'data:image/svg+xml;base64,' + btoa(`\n                <svg height="200px" width="200px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n                  <path style="fill:#F7CD6A;stroke:#ffffff;stroke-width:3;" d="M87.084,192c-0.456-5.272-0.688-10.6-0.688-16C86.404,78.8,162.34,0,256.004,0s169.6,78.8,169.6,176\n                  c0,5.392-0.232,10.728-0.688,16h0.688c0,96.184-169.6,320-169.6,320s-169.6-223.288-169.6-320H87.084z M256.004,224\n                  c36.392,1.024,66.744-27.608,67.84-64c-1.096-36.392-31.448-65.024-67.84-64c-36.392-1.024-66.744,27.608-67.84,64\n                  C189.26,196.392,219.612,225.024,256.004,224z"/>\n                </svg>\n              `),
              scale: 0.2,
              anchor: [0.5, 1],
            }),
          });
        } else {
          // Multiple features - show as cluster with count
          // Check if all stories in cluster are under construction or draft
          const clusterInfo = features.map(f => f.get('story'));
          const allNonPublished = clusterInfo.every(story => {
            const isUnderConstruction = !story.title || !story.name ||
              story.contentHtml?.includes('This page is under construction') ||
              story.contentHtml?.includes('This story is coming soon');
            const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
            return isUnderConstruction || isDraft;
          });
          const anyDraft = clusterInfo.some(story => (story.status && story.status.toLowerCase() === 'draft') || story.draft === true);
          const anyUnderConstruction = clusterInfo.some(story => !story.title || !story.name || story.contentHtml?.includes('This page is under construction') || story.contentHtml?.includes('This story is coming soon'));
          let fillColor = '#F7CD6A'; // default published cluster color (brand accent - gold)
          if (allNonPublished) fillColor = '#6B7280'; // all draft/under-construction
          else if (anyDraft || anyUnderConstruction) fillColor = '#FE8E3D'; // mixed cluster (sunrise highlight)

          return new Style({
            image: new Circle({
              radius: Math.min(size * 3 + 10, 25),
              fill: new Fill({ color: fillColor }),
              stroke: new Stroke({ color: '#ffffff', width: 2 }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({ color: '#ffffff' }),
              font: 'bold 14px Arial',
            }),
          });
        }
      },
    });
    
    mapInstance.current.addLayer(clusterLayer);
  }, [stories]);

  // Zoom to story when zoomToStory changes (smoothed)
  useEffect(() => {
    if (mapInstance.current && zoomToStory && zoomToStory.coordinates) {
      const coords = fromLonLat(zoomToStory.coordinates);
      mapInstance.current.getView().animate({
        center: coords,
        zoom: 7,
        duration: 420,
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

  // One-time initial fit to show all markers (even if default zoom changed) after markers present
  useEffect(() => {
    if (!mapInstance.current) return;
    if (initialFitPerformedRef.current) return;
    if (!stories || stories.length === 0) return;
    const coords = stories.filter(s => Array.isArray(s.coordinates) && s.coordinates.length === 2).map(s => fromLonLat(s.coordinates));
    if (coords.length < 2) { // single marker: just center on it
      if (coords.length === 1) {
        mapInstance.current.getView().animate({ center: coords[0], zoom: 4.5, duration: 400, easing: easeOut });
      }
      initialFitPerformedRef.current = true;
      return;
    }
    const ext = boundingExtent(coords);
    const view = mapInstance.current.getView();
    view.fit(ext, { padding: [80, 80, 80, 80], duration: 600, maxZoom: 7.5, easing: easeOut });
    initialFitPerformedRef.current = true;
  }, [stories]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Hover preview card (DOM-managed for performance; content set directly) */}
      <div
        ref={hoverCardRef}
        role="presentation"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
            left: 0,
          transform: 'translate3d(0,0,0)',
          zIndex: 1000,
          display: 'none',
        }}
      />
    </div>
  );
} 