// lib/yelpLoader.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import maplibregl from "maplibre-gl";
import { showPopup } from "@/components/MapComponent";

export async function setupYelpData(
  map: maplibregl.Map,
  savedLocationsRef: React.RefObject<GeoJSON.Feature[]>,
  setSavedLocations: React.Dispatch<React.SetStateAction<GeoJSON.Feature[]>>
) {
  try {
    const lat = 49.24501114685754;
    const lng = -123.11342343091847;
    const response = await fetch(
      `/api/locations?source=yelp&location=${lat},${lng}&type=cafe`,
    );
    const data = await response.json();

    if (data.success && data.data.length) {
      const cafeIcon = await map.loadImage("/cafe.png");

      //  make sure the image is loading
      if (!cafeIcon || !cafeIcon.data) {
        console.error("Failed to load cafe icon");
        return false;
      }

      // check if the image is exist and make sure not dupliated added
      if (!map.hasImage("cafes")) {
        map.addImage("cafes", cafeIcon.data);
      }

      // conver to GeoJSON
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.data.map((b: any, index: number) => ({
          type: "Feature",
          properties: {
            name: b.name,
            rating: b.rating,
            price: b.price,
            address: b.location?.address1,
            type:"Cafe",
            yelpId: b.id,
            id: `cafes-${index}`,
            source: "cafes",
            saved: false,
          },
          geometry: {
            type: "Point",
            coordinates: [b.coordinates.longitude, b.coordinates.latitude],
          },
        })),
      };

      // delete origial file if there is one
      if (map.getSource("cafes")) {
        map.removeLayer("cafes");
        map.removeSource("cafes");
      }

      map.addSource("cafes", {
        type: "geojson",
        data: geojson,
      });

      // use symbol to the yelp palce without icon
      map.addLayer({
        id: "cafes",
        type: "symbol",
        source: "cafes",
        minzoom: 14.35,
        layout: {
          "icon-image": "cafes",
          "icon-size": 0.05,
        },
      });

      showPopup(map, "cafes", savedLocationsRef, setSavedLocations);
      
      console.log(`Loaded ${data.data.length} cafes from Yelp`);

      return true;
    }
    return false;
  } catch (error) {
    console.error("Yelp fetch failed:", error);
    return false;
  }
}
