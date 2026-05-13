// lib/yelpLoader.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import maplibregl from "maplibre-gl";

export async function loadYelpData(
  latitude: number,
  longitude: number,
  map: maplibregl.Map,
) {
  try {
    const response = await fetch(
      `/api/locations?source=yelp&location=${latitude},${longitude}&type=cafe`,
    );
    const data = await response.json();

    if (data.success && data.data.length) {
      console.log(` Loaded ${data.data.length} cafes from Yelp API`);

      const cafeIcon = await map.loadImage("/cafe.png");

      //  make sure the image is loading
      if (!cafeIcon || !cafeIcon.data) {
        console.error("Failed to load cafe icon");
        return false;
      }

      // check if the image is exist and make sure not dupliated added
      if (!map.hasImage("cafe-icon")) {
        map.addImage("cafe-icon", cafeIcon.data);
      }

      // conver to GeoJSON
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: data.data.map((b: any) => ({
          type: "Feature",
          properties: {
            name: b.name,
            rating: b.rating,
            price: b.price,
            address: b.location?.address1,
            type: b.categories?.[0]?.title || "Cafe",
            yelpId: b.id,
          },
          geometry: {
            type: "Point",
            coordinates: [b.coordinates.longitude, b.coordinates.latitude],
          },
        })),
      };

      // delete origial file if there is one
      if (map.getSource("yelp-places")) {
        map.removeLayer("yelp-places");
        map.removeSource("yelp-places");
      }

      map.addSource("yelp-places", {
        type: "geojson",
        data: geojson,
      });

      // use symbol to the yelp palce without icon
      map.addLayer({
        id: "yelp-places",
        type: "symbol",
        source: "yelp-places",
        minzoom: 13,
        layout: {
          "icon-image": "cafe-icon",
          "icon-size": 0.05,
        },
      });

      // click pop up page
      map.on("click", "yelp-places", (e: any) => {
        if (!e.features || !e.features[0]) return;
        const props = e.features[0].properties;
        const coords = (e.features[0].geometry as any).coordinates;

        const html = `
          <div class="p-3 max-w-xs">
            <p class="font-bold text-base">${props.name}</p>
            <p class="text-sm text-gray-600">${props.type}</p>
            ${props.rating ? `<p class="text-sm mt-1">⭐ ${props.rating} / 5</p>` : ""}
            ${props.price ? `<p class="text-sm">💰 ${props.price}</p>` : ""}
            <p class="text-sm text-gray-500 mt-1">📍 ${props.address || "Address not available"}</p>
            <button disabled class="w-full mt-3 bg-blue-00 text-white font-medium py-2 px-4 rounded-lg cursor-not-allowed">
              Save to Collection (Coming Soon)
              </button>
          </div>
        `;

        new maplibregl.Popup().setLngLat(coords).setHTML(html).addTo(map);
      });

      map.on("mouseenter", "yelp-places", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "yelp-places", () => {
        map.getCanvas().style.cursor = "";
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Yelp fetch failed:", error);
    return false;
  }
}
