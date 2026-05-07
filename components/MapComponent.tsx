"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ShadeMap from "mapbox-gl-shadow-simulator";

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const testDate = new Date();
    testDate.setHours(6, 0, 0, 0);

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`, //3D style nowww
      center: [-123.1207, 49.2827], // Vancouver Coordinates
      zoom: 15,
      pitch: 45,
    });

    const map = mapInstance.current;

    map.on("load", () => {
      const sources = map.getStyle().sources;
      const buildingSource = "maptiler_planet_v4";
      const styleLayers = map.getStyle().layers;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;

          // Blue dot marker for user location
          const el = document.createElement("div");
          el.className =
            "w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg";

          new maplibregl.Marker({ element: el })
            .setLngLat([longitude, latitude])
            .addTo(map);

          // Center map on user
          map.flyTo({ center: [longitude, latitude], zoom: 15 });
        },
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true },
      );

      new ShadeMap({
        date: testDate, // display shadows for current date
        color: "#01112f", // shade color
        opacity: 0.7, // opacity of shade color
        apiKey: process.env.NEXT_PUBLIC_SHADEMAP_KEY || "", // obtain from https://shademap.app/about/
        terrainSource: {
          tileSize: 256, // DEM tile size
          maxZoom: 15, // Maximum zoom of DEM tile set
          getSourceUrl: ({ x, y, z }) => {
            // return DEM tile url for given x,y,z coordinates
            return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
          },
          getElevation: ({ r, g, b, a }) => {
            // return elevation in meters for a given DEM tile pixel
            return r * 256 + g + b / 256 - 32768;
          },
        },
        debug: (msg) => {
          console.log(new Date().toISOString(), msg);
        },
      }).addTo(map);

      // advance shade by 1 hour
      // shadeMap.setDate(new Date(Date.now() + 1000 * 60 * 60));

      // sometime later
      // ...remove layer
      // shadeMap.remove();

      for (const layer of styleLayers) {
        if (layer.type === "symbol") {
          map.removeLayer(layer.id);
        }
      }

      if (!sources[buildingSource]) {
        console.error("Could not find a valid vector source for buildings.");
        return;
      }

      map.addLayer({
        id: "3d-buildings",
        source: buildingSource,
        "source-layer": "building",
        type: "fill-extrusion",
        minzoom: 14,
        paint: {
          "fill-extrusion-color": "#ffffff",
          "fill-extrusion-height": ["get", "render_height"],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 1.0,
        },
      });

      map.setLight({
        anchor: "map",
        color: "#fff8e7",
        intensity: 0.4,
        position: [1, 210, 30],
      });
    });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      className="h-screen w-full bg-zinc-200 dark:bg-zinc-800"
    />
  );
}
