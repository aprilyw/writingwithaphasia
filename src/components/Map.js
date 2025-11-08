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
  const clusterPopupRef = useRef(null);
  const [clusterPopup, setClusterPopup] = useState(null); // { stories: [], position: { x, y } }

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
        zoom: 4.2,
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

    // Handle click events - simplified for clicking stories and zoom
    initialMap.on('click', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const features = feature.get('features');
        if (features && features.length > 1) {
          // Cluster with multiple stories - zoom in to separate them
          const coords = features.map(f => f.getGeometry().getCoordinates());
          const tightExtent = boundingExtent(coords);
          const view = initialMap.getView();
          const currentZoom = view.getZoom();
          view.fit(tightExtent, {
            duration: 420,
            padding: [80, 80, 80, 80],
            maxZoom: Math.min(currentZoom + 4, 11)
          });
        } else if (features && features.length === 1) {
          // Single feature in cluster - open the story
          const story = features[0].get('story');
          const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
          const isUnderConstruction = !story.title || !story.name ||
            story.contentHtml?.includes('This page is under construction') ||
            story.contentHtml?.includes('This story is coming soon');
          if (!isUnderConstruction && !(isDraft && !draftMode)) {
            onMarkerClick(story);
          }
        } else {
          // Direct feature (not from cluster) - open the story
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

    // Change cursor + show hover card for single stories OR cluster popup for multiple stories
    initialMap.on('pointermove', (event) => {
      const feature = initialMap.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      
      if (feature) {
        const features = feature.get('features');
        
        // Check if this is a cluster with multiple stories
        if (features && features.length > 1) {
          // Multiple stories - show cluster popup
          mapRef.current.style.cursor = 'pointer';
          
          // Hide single story hover card
          if (hoverCardRef.current) hoverCardRef.current.style.display = 'none';
          
          // Clear any pending hide timeout
          if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          
          // Filter to only published stories (unless in draft mode)
          const allStories = features.map(f => f.get('story'));
          const clusterStories = allStories
            .filter(story => {
              if (draftMode) return true; // Show all in draft mode
              const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
              const isUnderConstruction = !story.title || !story.name ||
                story.contentHtml?.includes('This page is under construction') ||
                story.contentHtml?.includes('This story is coming soon');
              return !isDraft && !isUnderConstruction; // Only published stories
            })
            .sort((a, b) => {
              // Sort alphabetically by name
              return (a.name || a.title || '').localeCompare(b.name || b.title || '');
            });
          
          // Only show popup if there are published stories to display
          if (clusterStories.length > 0) {
            setClusterPopup({
              stories: clusterStories,
              position: { x: event.pixel[0], y: event.pixel[1] }
            });
          } else {
            // No published stories - hide popup
            setClusterPopup(null);
          }
          return;
        }
        
        // Single story - show regular hover card
        let story = null;
        if (features && features.length === 1) story = features[0].get('story');
        else if (!features && feature.get('story')) story = feature.get('story');
        
        if (story) {
          // Hide cluster popup when hovering single story
          setClusterPopup(null);
          
          if (!hoverCardRef.current) return; // not mounted yet
          
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
        }
      } else {
        // No feature - hide everything
        mapRef.current.style.cursor = '';
        hoverDataRef.current.story = null;
        
        // Hide single story card
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = setTimeout(() => {
          if (hoverCardRef.current) hoverCardRef.current.style.display = 'none';
        }, 80);
        
        // Hide cluster popup with slight delay
        setTimeout(() => setClusterPopup(null), 100);
      }
    });
    initialMap.on('pointerout', () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (hoverCardRef.current) hoverCardRef.current.style.display = 'none';
      // Don't auto-hide cluster popup on pointerout - let user interact with it
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
            zoom: 4.2,
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
    
    // Add new markers using original coordinates
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
    
    // Create clustered source with larger distance for better grouping at low zoom
    const clusterSource = new Cluster({
      distance: 35, // Reduced from 50 to prevent over-clustering nearby stories
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
          // Published story pin (gold)
          return new Style({
            image: new Icon({
              src: 'data:image/svg+xml;base64,' + btoa(`\n                <svg height="200px" width="200px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">\n                  <path style="fill:#F7CD6A;stroke:#ffffff;stroke-width:3;" d="M87.084,192c-0.456-5.272-0.688-10.6-0.688-16C86.404,78.8,162.34,0,256.004,0s169.6,78.8,169.6,176\n                  c0,5.392-0.232,10.728-0.688,16h0.688c0,96.184-169.6,320-169.6,320s-169.6-223.288-169.6-320H87.084z M256.004,224\n                  c36.392,1.024,66.744-27.608,67.84-64c-1.096-36.392-31.448-65.024-67.84-64c-36.392-1.024-66.744,27.608-67.84,64\n                  C189.26,196.392,219.612,225.024,256.004,224z"/>\n                </svg>\n              `),
              scale: 0.2,
              anchor: [0.5, 1],
            }),
          });
        } else {
          // Multiple features - show as cluster with count
          // Analyze cluster composition for better visual hierarchy
          const clusterInfo = features.map(f => f.get('story'));
          const publishedCount = clusterInfo.filter(story => {
            const isUnderConstruction = !story.title || !story.name ||
              story.contentHtml?.includes('This page is under construction') ||
              story.contentHtml?.includes('This story is coming soon');
            const isDraft = (story.status && story.status.toLowerCase() === 'draft') || story.draft === true;
            return !isUnderConstruction && !isDraft;
          }).length;
          const draftCount = size - publishedCount;
          
          // Determine color based on cluster composition - simplified design
          let fillColor, strokeColor, strokeWidth;
          if (publishedCount === 0) {
            // All drafts/unpublished
            fillColor = '#6B7280'; // gray
            strokeColor = '#ffffff';
            strokeWidth = 2;
          } else if (draftCount === 0) {
            // All published
            fillColor = '#F7CD6A'; // gold
            strokeColor = '#ffffff';
            strokeWidth = 2;
          } else {
            // Mixed cluster - use gradient effect with subtle double stroke
            fillColor = '#F7CD6A'; // gold base (indicates published content present)
            strokeColor = '#ffffff';
            strokeWidth = 2;
          }

          return new Style({
            image: new Circle({
              radius: Math.min(Math.max(size * 2 + 14, 18), 32), // Dynamic size based on count
              fill: new Fill({ color: fillColor }),
              stroke: new Stroke({ color: strokeColor, width: strokeWidth }),
            }),
            text: new Text({
              text: size.toString(),
              fill: new Fill({ color: '#ffffff' }),
              font: 'bold 13px system-ui, -apple-system, sans-serif',
              stroke: new Stroke({ color: 'rgba(0,0,0,0.3)', width: 3 }),
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
    mapInstance.current.getView().setZoom(4.2);
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
      
      {/* Cluster popup - shows list of stories when hovering over a cluster */}
      {clusterPopup && (
        <div
          ref={clusterPopupRef}
          onMouseEnter={() => {
            // Keep popup open when mouse enters
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => {
            // Close popup when mouse leaves
            setClusterPopup(null);
          }}
          style={{
            position: 'absolute',
            left: `${clusterPopup.position.x}px`,
            top: `${clusterPopup.position.y}px`,
            transform: 'translate(-50%, calc(-100% - 20px))',
            zIndex: 2000,
            pointerEvents: 'auto', // Enable mouse interaction
          }}
          className="bg-white rounded-lg shadow-2xl border-2 border-neutral-300 overflow-hidden min-w-[280px] max-w-[340px]"
        >
          <div className="bg-neutral-50 px-4 py-2.5 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">
              {clusterPopup.stories[0]?.location || 'Stories at this location'}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setClusterPopup(null);
              }}
              className="text-neutral-500 hover:text-neutral-700 p-1 -mr-1 rounded hover:bg-neutral-200 transition-colors"
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {clusterPopup.stories.map((story, idx) => {
              return (
                <button
                  key={story.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setClusterPopup(null);
                    onMarkerClick(story);
                  }}
                  className="w-full text-left px-4 py-3 border-b border-neutral-100 last:border-b-0 transition-colors hover:bg-amber-50 cursor-pointer active:bg-amber-100"
                >
                  <div className="flex items-center gap-3">
                    {story.hero && story.hero.startsWith('/') && (
                      <div className="flex-shrink-0 w-14 h-14 rounded overflow-hidden bg-neutral-200 ring-1 ring-neutral-300">
                        <img 
                          src={story.hero} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-neutral-900 mb-1">
                        {story.title || story.name || story.id}
                      </div>
                      {story.excerpt && (
                        <p className="text-xs text-neutral-600 line-clamp-2 leading-snug">
                          {story.excerpt.replace(/<[^>]*>/g, '').slice(0, 120)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
} 