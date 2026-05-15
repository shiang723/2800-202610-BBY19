"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ShadeMap from "mapbox-gl-shadow-simulator";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";
import { loadYelpData } from "@/lib/yelpLoader";
import TimeShiftBtns from "./TimeShiftBtns";
import WeatherUvBtns, { HeatmapMode } from "./WeatherUvBtns";

const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const dataTables = [
  { id: "parks", icon: "park", type: "Park", label: "Parks" },
  {
    id: "community-centres",
    icon: "community",
    type: "Community Centre",
    label: "Centres",
  },
  {
    id: "drinking-fountains",
    icon: "fountain",
    minZoom: 14.35,
    type: "Water Fountain",
    label: "Fountains",
    filter: (feature: GeoJSON.Feature) =>
      feature.properties?.name.includes("Fountain"),
  },
  {
    id: "public-washrooms",
    icon: "washroom",
    iconSize: 0.06,
    minZoom: 14.35,
    type: "Washroom",
    label: "Washrooms",
    filter: (feature: GeoJSON.Feature) =>
      feature.properties?.park_name !== null,
  },
  { id: "cafes", label: "Cafes", minZoom: 14.35 },
];

const bbox: [number, number, number, number] = [
  -123.28753233533254, 49.17524950157297, -122.9801907901657, 49.33148788422633,
]; // Vancouver bounding box

function setupSearchbar(map: maplibregl.Map) {
  const geocoder = new GeocodingControl({
    apiKey: maptilerApiKey,
    country: "ca",
    reverseActive: false,
    limit: 5,
    reverseGeocodingLimit: 1,
    proximity: [{ type: "map-center" }],
    types: ["poi", "address"],
    bbox: bbox,
    showPlaceType: "never",
    placeholder: "Search for places in Vancouver",
  });

  document
    .getElementById("geocoderContainer")
    ?.appendChild(geocoder.onAdd(map));

  const searchBarStyle = document.createElement("style");
  searchBarStyle.innerHTML = `
        .input-group {
          flex-direction: row-reverse !important;
        }
        form {
          width: 100% !important;
          max-width: 100% !important;
        }
      `;

  const searchDropdownStyle = document.createElement("style");
  searchDropdownStyle.innerHTML = `
        .line2 {
          font-size: 10px !important;
        }
      `;

  document
    .querySelector("maptiler-geocoder")
    ?.shadowRoot?.appendChild(searchBarStyle);
  document
    .querySelector("maptiler-geocoder-feature-item")
    ?.shadowRoot?.appendChild(searchDropdownStyle);
}

function setupShadeMap(
  map: maplibregl.Map,
  shadeInstance: React.RefObject<ShadeMap | null>,
  dateInstance: React.RefObject<Date>,
) {
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

  shadeInstance.current = new ShadeMap({
    date: dateInstance.current, // display shadows for current date
    color: "#01112f", // shade color
    opacity: 0.7, // opacity of shade color
    apiKey: process.env.NEXT_PUBLIC_SHADEMAP_KEY || "", // obtain from https://shademap.app/about/
    getFeatures: async () => {
      const buildings = map.queryRenderedFeatures({ layers: ["3d-buildings"] });
      return buildings.map((building) => {
        const buildingHeight =
          building.properties.render_height || building.properties.height || 10;
        return {
          type: "Feature",
          geometry: building.geometry,
          properties: {
            height: buildingHeight,
            render_height: buildingHeight,
          },
        };
      });
    },
    // terrainSource: {
    //   tileSize: 256, // DEM tile size
    //   maxZoom: 15, // Maximum zoom of DEM tile set
    //   getSourceUrl: ({ x, y, z }) => {
    //     // return DEM tile url for given x,y,z coordinates
    //     return `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
    //   },
    //   getElevation: ({ r, g, b }) => {
    //     // return elevation in meters for a given DEM tile pixel
    //     return r * 256 + g + b / 256 - 32768;
    //   },
    // },
    debug: (msg) => {
      console.log(new Date().toISOString(), msg);
    },
  }).addTo(map);

  map.setLight({
    anchor: "map",
    color: "#fff8e7",
    intensity: 0.4,
    position: [1, 210, 30],
  });
}

async function setupCityData(map: maplibregl.Map) {
  // Loop through the data tables and add a layer of points for each dataset
  for (const dataSet of dataTables) {
    // Skips the cafe dataset since it's layer is already handled by yelpLoader function
    if (dataSet.id === "cafes") continue;

    const url = `https://vancouver.opendatasoft.com/api/explore/v2.1/catalog/datasets/${dataSet.id}/exports/geojson`;
    const data = (await fetch(url).then((res) =>
      res.json(),
    )) as GeoJSON.FeatureCollection;
    const dataFiltered = {
      ...data,
      features: dataSet.filter
        ? data.features.filter(dataSet.filter)
        : data.features,
    };



    if (dataSet.icon) {
      const image = await map.loadImage("/" + dataSet.icon + ".png");
      map.addImage(dataSet.id, image.data);
    }

    map.addSource(dataSet.id, {
      type: "geojson",
      data: dataFiltered,
    });
    map.addLayer({
      id: dataSet.id,
      source: dataSet.id,
      type: "symbol",
      minzoom: dataSet.minZoom || 11.75,
      layout: {
        "icon-image": dataSet.id,
        "icon-size": dataSet.iconSize || 0.05,
      },
    });

    // Adapted from MapLibre popup example: https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup-on-click/

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", dataSet.id, (e) => {
      if (!e.features || !e.features[0]) return;

      const location = e.features[0];
      const coordinates = (
        location.geometry as GeoJSON.Point
      ).coordinates.slice();
      const properties = location.properties;

      let html = ``;

      if (dataSet.id === "parks") {
        html += `
              <p class="text-sm font-bold">${properties.name}</p>
              <p class="text-xs">${dataSet.type}</p>
              <p class="text-xs"><b>Washrooms: </b>${properties.washrooms}</p>
              <p>
                <a href="https://www.google.ca/maps?f=d&daddr=${properties.name},Vancouver,BC,Canada&z=1"
                  class="text-xs text-blue-500" target="_blank">${properties.streetnumber} ${properties.streetname}</a>
              </p>
              <p>
                <a href="https://covapp.vancouver.ca/parkfinder/parkdetail.aspx?inparkid=${properties.parkid}"
                  class="text-xs text-blue-500" target="_blank">More info</a>
              </p>
            `;
      } else if (dataSet.id === "community-centres") {
        html += `
              <p class="text-sm font-bold">${properties.name}</p>
              <p class="text-xs">${dataSet.type}</p>
              <p class="text-xs"><b>Washrooms: </b>Y</p>
              <p>
                <a href="https://www.google.ca/maps?f=d&daddr=${properties.name},Vancouver,BC,Canada&z=1"
                  class="text-xs text-blue-500" target="_blank">${properties.address}</a>
              </p>
              <p><a href="${properties.urllink}" class="text-xs text-blue-500" target="_blank">More info</a></p>
            `;
      } else if (dataSet.id === "drinking-fountains") {
        const nameFilter = properties.name.indexOf("location:");
        const name = properties.name.slice(nameFilter + 9).trim();
        html += `
                <p class="text-sm font-bold">${name}</p>
                <p class="text-xs">${dataSet.type}</p>
                <p class="text-xs"><b>Location: </b>${properties.location}</p>
              `;
      } else if (dataSet.id === "public-washrooms") {
        html += `
                <p class="text-sm font-bold">${properties.park_name}</p>
                <p class="text-xs">${dataSet.type}</p>
                <p class="text-xs"><b>Location: </b>${properties.location}</p>
              `;
      }

      new maplibregl.Popup()
        .setLngLat(coordinates as [number, number])
        .setHTML(html)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on("mouseenter", dataSet.id, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    // Change it back to a pointer when it leaves.
    map.on("mouseleave", dataSet.id, () => {
      map.getCanvas().style.cursor = "";
    });
  }
}

export default function MapComponent({
  activeFilter,
}: {
  activeFilter: string[];
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const shadeInstance = useRef<ShadeMap | null>(null);
  const dateInstance = useRef<Date>(new Date());

  const [displayTime, setDisplayTime] = useState("");
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>("none");
  const [weatherData, setWeatherData] = useState<{ temp: number; uv: number } | null>(null);

  const changeTime = (hours: number) => {
    if (!shadeInstance.current) return;

    const tempDate = new Date(dateInstance.current);
    if (Math.abs(hours) === 0.5) {
      tempDate.setMinutes(tempDate.getMinutes() + (hours > 0 ? 30 : -30));
    } else {
      tempDate.setHours(tempDate.getHours() + hours);
    }

    dateInstance.current = tempDate;
    shadeInstance.current.setDate(tempDate);

    setDisplayTime(tempDate.toLocaleTimeString());
  };

  // Adapted from chatgpt
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date(dateInstance.current);

      newDate.setSeconds(newDate.getSeconds() + 1);

      dateInstance.current = newDate;
      shadeInstance.current?.setDate(newDate);

      setDisplayTime(newDate.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const fetchWeather = async () => {
    const key = process.env.NEXT_PUBLIC_OPENWEATHER_KEY;
    // Vancouver coordinates
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=49.2827&lon=-123.1207&units=metric&appid=${key}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      setWeatherData({ temp: data.current.temp, uv: data.current.uvi });
      console.log("Weather data loaded successfully");
    } catch (e) {
      console.error("Weather Fetch Error:", e);
    }
  };
  fetchWeather();
}, []);

  useEffect(() => {
    let mapMounted = true;

    if (mapInstance.current || !mapContainer.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${maptilerApiKey}`, //3D style nowww
      center: [-123.1207, 49.2827], // Vancouver Coordinates
      zoom: 15,
      pitch: 45,
    });

    const map = mapInstance.current;

    map.on("load", () => {
      if (!mapMounted) return;

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

      // temperary use vancovuer location
      // const latitude = 49.2827;
      // const longitude = -123.1207;

      // const el = document.createElement("div");
      // el.className =
      //   "w-4 h-4 bg-blue-500 border-2 border-white rounded-full shadow-lg";
      // new maplibregl.Marker({ element: el })
      //   .setLngLat([longitude, latitude])
      //   .addTo(map);

      // map.flyTo({ center: [longitude, latitude], zoom: 15 });

      setDisplayTime(dateInstance.current.toLocaleTimeString());

      setupSearchbar(map);
      setupShadeMap(map, shadeInstance, dateInstance);
      setupCityData(map);
      loadYelpData(map);
    });

    return () => {
      mapMounted = false;

      try {
        if (shadeInstance.current) {
          shadeInstance.current.remove();
          shadeInstance.current = null;
        }
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      } catch (e) {
        // Force null even if removal threw
        shadeInstance.current = null;
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !map.isStyleLoaded()) return;

    for (const dataSet of dataTables) {
      const selected =
        activeFilter?.length === 0 || activeFilter?.includes(dataSet.label);
      if (map.getLayer(dataSet.id)) {
        map.setLayoutProperty(
          dataSet.id,
          "visibility",
          selected ? "visible" : "none",
        );
        if (activeFilter.includes(dataSet.label)) {
          map.setLayerZoomRange(dataSet.id, 11.75, 24);
        } else {
          map.setLayerZoomRange(dataSet.id, dataSet.minZoom || 11.75, 24);
        }
      }
    }
  }, [activeFilter]);

  return (
    <div className="relative">
      <div
        ref={mapContainer}
        className="h-[calc(100dvh-65px)] w-full bg-zinc-200 dark:bg-zinc-800"
      />
      <TimeShiftBtns displayTime={displayTime} changeTime={changeTime} />

      <div className="absolute top-32 right-4 md:top-28 md:right-6 z-[50] pointer-events-auto">
    <WeatherUvBtns 
      mode={heatmapMode} 
      onModeChange={setHeatmapMode} 
    />
  </div>
    </div>
  );
}
