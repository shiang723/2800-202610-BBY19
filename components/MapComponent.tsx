"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import SunCalc from "suncalc";
import * as turf from "@turf/turf";

const SHADOW_SOURCE = "building-shadows";
const SHADOW_LAYER = "building-shadow-layer";

function getSunOffset(date: Date, lat: number, lng: number) {
  const { altitude, azimuth } = SunCalc.getPosition(date, lat, lng);
  if (altitude < 0.05) return null;

  const SHADOW_SCALE = 1.8;
  const shadowLen = Math.min(1 / Math.tan(altitude), 50) * SHADOW_SCALE;

  const dEastMeters = Math.sin(azimuth) * shadowLen;
  const dNorthMeters = Math.cos(azimuth) * shadowLen;

  const mPerDegLat = 111_320;
  const mPerDegLng = 111_320 * Math.cos((lat * Math.PI) / 180);

  return {
    dLng: dEastMeters / mPerDegLng,
    dLat: dNorthMeters / mPerDegLat,
  };
}

function buildShadowGeoJSON(
  map: maplibregl.Map,
  offset: { dLng: number; dLat: number },
): GeoJSON.FeatureCollection {
  const features = map.queryRenderedFeatures(undefined, {
    layers: ["3d-buildings"],
  });

  const shadows: GeoJSON.Feature[] = [];

  for (const f of features) {
    const height = (f.properties?.render_height as number) ?? 10;
    const geom = f.geometry;
    if (geom.type !== "Polygon") continue;

    const dLng = offset.dLng * height;
    const dLat = offset.dLat * height;

    try {
      const footprint = turf.polygon(geom.coordinates);
      const projected = turf.polygon(
        geom.coordinates.map((ring) =>
          ring.map(([lng, lat]) => [lng + dLng, lat + dLat]),
        ),
      );
      const shadow = turf.union(turf.featureCollection([footprint, projected]));
      if (shadow) shadows.push(shadow as GeoJSON.Feature);
    } catch {}
  }
  return { type: "FeatureCollection", features: shadows };
}

export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    const testDate = new Date();
    testDate.setHours(8, 0, 0, 0);

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`, //3D style nowww
      center: [-123.1207, 49.2827], // Vancouver Coordinates
      zoom: 15,
      pitch: 45,
    });

    const map = mapInstance.current;

    const refreshShadows = () => {
      const { lat, lng } = map.getCenter();
      const offset = getSunOffset(testDate, lat, lng);
      if (!offset) return;

      const src = map.getSource(SHADOW_SOURCE) as
        | maplibregl.GeoJSONSource
        | undefined;
      src?.setData(buildShadowGeoJSON(map, offset));
    };

    map.on("load", () => {
      const sources = map.getStyle().sources;
      const buildingSource = "maptiler_planet_v4";
      const styleLayers = map.getStyle().layers;
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

      map.addSource(SHADOW_SOURCE, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: SHADOW_LAYER,
        type: "fill-extrusion",
        source: SHADOW_SOURCE,
        paint: {
          "fill-extrusion-color": "#1a1a2e",
          "fill-extrusion-height": 0.5,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.55,
        },
      });

      map.setLight({
        anchor: "map",
        color: "#fff8e7",
        intensity: 0.4,
        position: [1, 210, 30],
      });

      map.on("idle", refreshShadows);
      map.on("moveend", refreshShadows);
      refreshShadows();
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
