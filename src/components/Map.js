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
import { Style, Circle, Fill, Stroke, Icon } from 'ol/style';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';

// Tighter US bounds (continental US)
const US_EXTENT = transformExtent([-124.0, 26.0, -66.0, 49.0], 'EPSG:4326', 'EPSG:3857');

export default function MapComponent({ stories, onMarkerClick, selectedStory, zoomToStory, onZoomComplete, resetSignal }) {
  const mapRef = useRef();
  const mapInstance = useRef(null);

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
        zoom: 4.7,
        extent: US_EXTENT,
        minZoom: 3,
        maxZoom: 12,
        constrainOnlyCenter: true,
      }),
    });

    mapInstance.current = initialMap;

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
      feature.setStyle(
        new Style({
          image: new Icon({
            src: '/static/svg/location-pin-2965.svg',
            scale: 0.2,
            anchor: [0.5, 1], // Anchor at bottom center of the pin
          }),
        })
      );
      return feature;
    });
    const vectorSource = new VectorSource({ features: markers });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        image: new Icon({
          src: '/static/svg/location-pin-2965.svg',
          scale: 0.2,
          anchor: [0.5, 1], // Anchor at bottom center of the pin
        }),
      })
    });
    mapInstance.current.addLayer(vectorLayer);
  }, [stories]);

  // Zoom to story when zoomToStory changes (staggered effect)
  useEffect(() => {
    if (mapInstance.current && zoomToStory && zoomToStory.coordinates) {
      const coords = fromLonLat(zoomToStory.coordinates);
      mapInstance.current.getView().animate({
        center: coords,
        zoom: 7,
        duration: 3500,
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
    mapInstance.current.getView().setZoom(4.7);
  }, [resetSignal]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
  );
} 