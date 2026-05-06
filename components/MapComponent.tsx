'use client'; // Required: MapLibre only works in the browser

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Note: You will need to make sure the shadow simulator script 
// is accessible to your project to import it here.
// import { ShadowSimulator } from 'your-simulator-path';

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    // Prevent the map from initializing twice
    if (mapInstance.current || !mapContainer.current) return;

    // 1. Initialize MapLibre (Task: image_bcdf75.png)
    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`, //3D style nowww
      center: [-123.1207, 49.2827], // Vancouver Coordinates
      zoom: 13,
      pitch: 45, // Tilted view to see 3D shadows better
    });

    const map = mapInstance.current;

    // 2. Wait for map to load before adding the simulator
    map.on('load', () => {
      console.log("Map is loaded. Ready for Shadow Simulator.");

      /* 
      3. Implement Shadow Simulator (Task: image_bcdf51.png)
      This is where you would follow your example link's logic:
      
      
      const simulator = new ShadowSimulator(map, {
        date: new Date(),
        color: '#000000',
        opacity: 0.5
      });
      */
      
    });

    // Cleanup when the user leaves the page
    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div 
      ref={mapContainer} 
      className="h-full w-full bg-zinc-200 dark:bg-zinc-800" 
    />
  );
}