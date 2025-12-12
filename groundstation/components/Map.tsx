'use client'
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

const SatelliteMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js';
    script.async = true;
    
    script.onload = () => {
      initializeMap();
    };
    
    document.body.appendChild(script);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Get user's current location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });

          // Initialize map
          const L = (window as any).L;
          const map = L.map(mapRef.current).setView([latitude, longitude], 15);

          // Add satellite tile layer (ESRI World Imagery)
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
          }).addTo(map);

          // Add labels overlay
          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            attribution: '',
            maxZoom: 19
          }).addTo(map);

          // Custom icon for current location
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: 30px; height: 30px; background: #3b82f6; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          // Add marker for current location
          const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
          marker.bindPopup(`<b>Your Location</b><br>Lat: ${latitude.toFixed(6)}<br>Lng: ${longitude.toFixed(6)}`);

          mapInstanceRef.current = map;
          markerRef.current = marker;
          setLoading(false);
        },
        (err) => {
          setError('Unable to retrieve your location. Please enable location services.');
          setLoading(false);
          console.error(err);

          // Fallback: Show default location
          const L = (window as any).L;
          const map = L.map(mapRef.current).setView([22.2587, 84.8642], 13);

          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri',
            maxZoom: 19
          }).addTo(map);

          L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
          }).addTo(map);

          mapInstanceRef.current = map;
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const centerOnLocation = () => {
    if (mapInstanceRef.current && location) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15);
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="w-full h-screen relative bg-gray-900">
      <div ref={mapRef} className="w-full h-full" />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-[1000]">
          <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-gray-700 font-medium">Loading satellite map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {location && !loading && (
        <div className="absolute top-4 right-4 z-[1000] space-y-2">
          <button
            onClick={centerOnLocation}
            className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-lg flex items-center transition-colors"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Center on Location
          </button>
          <div className="bg-white rounded-lg p-3 shadow-lg text-sm">
            <div className="font-semibold text-gray-700 mb-1">Your Coordinates</div>
            <div className="text-gray-600 text-xs">
              <div>Lat: {location.lat.toFixed(6)}</div>
              <div>Lng: {location.lng.toFixed(6)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatelliteMap;