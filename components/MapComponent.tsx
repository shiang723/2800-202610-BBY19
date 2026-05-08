"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ShadeMap from "mapbox-gl-shadow-simulator";
import { GeocodingControl } from "@maptiler/geocoding-control/maplibregl";

import parks from "@/data/parks.json";
import communityCentres from "@/data/community-centres.json";

const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY

// Fill in when we have the data downloaded and imported like above
const dataTables = [
  { data: parks, color: '#38a269', id: 'parks', icon: '/park.png', type: 'Park' },
  { data: communityCentres, color: '#ff0000', id: 'community-centres', icon: '/team.png', type: 'Community Centre' },
  // { data: waterFountain, color: '#0E87CC', id: 'water-fountains' },
]

const bbox: [number, number, number, number] = [-123.30131804763337, 49.00677789167195, -122.41360896119741, 49.56344307724677]; // Vancouver bounding box

// function markerClick() {
//   console.log("Marker clicked!");
// }


export default function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const shadeInstance = useRef<ShadeMap | null>(null);
  const dateInstance = useRef<Date>(new Date());

  const [displayTime, setDisplayTime] = useState("");

  const changeTime = (hours: number) => {
    if (!shadeInstance.current) return;

    const tempDate = new Date(dateInstance.current);
    tempDate.setHours(tempDate.getHours() + hours);
    dateInstance.current = tempDate;
    shadeInstance.current.setDate(tempDate);

    setDisplayTime(tempDate.toLocaleTimeString());
  }

  // Adapted from chatgpt
  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = new Date(dateInstance.current);

      newDate.setSeconds(newDate.getSeconds() + 1);

      dateInstance.current = newDate;
      shadeInstance.current?.setDate(newDate);

      setDisplayTime(
        newDate.toLocaleTimeString()
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (mapInstance.current || !mapContainer.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v4/style.json?key=${maptilerApiKey}`, //3D style nowww
      center: [-123.1207, 49.2827], // Vancouver Coordinates
      zoom: 15,
      pitch: 45,
    });

    const map = mapInstance.current;

    map.on("load", async () => {

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

      document.getElementById("geocoderContainer")?.appendChild(geocoder.onAdd(map));

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

      document.querySelector("maptiler-geocoder")?.shadowRoot?.appendChild(searchBarStyle);
      document.querySelector("maptiler-geocoder-feature-item")?.shadowRoot?.appendChild(searchDropdownStyle);


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

      shadeInstance.current = new ShadeMap({
        date: dateInstance.current, // display shadows for current date
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
          getElevation: ({ r, g, b }) => {
            // return elevation in meters for a given DEM tile pixel
            return r * 256 + g + b / 256 - 32768;
          },
        },
        debug: (msg) => {
          console.log(new Date().toISOString(), msg);
        },
      }).addTo(map);

      setDisplayTime(dateInstance.current.toLocaleTimeString());

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




      // Loop through the data tables and add a layer of points for each dataset
      for (const dataSet of dataTables) {

        const image = await map.loadImage(dataSet.icon);

        map.addImage(dataSet.id, image.data);




        map.addSource(dataSet.id, {
          'type': "geojson",
          'data': dataSet.data as GeoJSON.FeatureCollection,
        });
        map.addLayer({
          'id': dataSet.id,
          'source': dataSet.id,
          'type': 'symbol',
          'layout': {
            'icon-image': dataSet.id,
            'icon-size': 0.05,
          }
        });

        // Adapted from MapLibre popup example: https://maplibre.org/maplibre-gl-js/docs/examples/display-a-popup-on-click/

        // When a click event occurs on a feature in the places layer, open a popup at the
        // location of the feature, with description HTML from its properties.
        map.on('click', dataSet.id, (e) => {
          if (!e.features || !e.features[0]) return;

          const location = e.features[0];
          const coordinates = (location.geometry as GeoJSON.Point).coordinates.slice();
          const properties = location.properties;

          let html = `
            <p class="text-sm font-bold">${properties.name}</p>
            <p class="text-xs">${dataSet.type}</p>
          `;

          if (dataSet.id === 'parks') {
            html += `
              <p class="text-xs">Washrooms: <b>${properties.washrooms}</b></p>
              <p>
                <a href="https://www.google.ca/maps?f=d&daddr=${properties.name},Vancouver,BC,Canada&z=1"
                  class="text-xs text-blue-500" target="_blank">${properties.streetnumber} ${properties.streetname}</a>
              </p>
              <p>
                <a href="https://covapp.vancouver.ca/parkfinder/parkdetail.aspx?inparkid=${properties.parkid}"
                  class="text-xs text-blue-500" target="_blank">More info</a>
              </p>
            `;
          } else if (dataSet.id === 'community-centres') {
            html += `
              <p class="text-xs">Washrooms: <b>Y</b></p>
              <p>
                <a href="https://www.google.ca/maps?f=d&daddr=${properties.name},Vancouver,BC,Canada&z=1"
                  class="text-xs text-blue-500" target="_blank">${properties.address}</a>
              </p>
              <p><a href="${properties.urllink}" class="text-xs text-blue-500" target="_blank">More info</a></p>
            `;
          }

          new maplibregl.Popup()
            .setLngLat(coordinates as [number, number])
            .setHTML(html)
            .addTo(map);
        });

        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', dataSet.id, () => {
          map.getCanvas().style.cursor = 'pointer';
        });

        // Change it back to a pointer when it leaves.
        map.on('mouseleave', dataSet.id, () => {
          map.getCanvas().style.cursor = '';
        });


        // --Marker logic, leaving for later use
        // for (const location of dataSet.data.features) {
        //   let lng = location.geometry.coordinates[0];
        //   let lat = location.geometry.coordinates[1];
        //   let marker = new maplibregl.Marker({
        //     color: dataSet.color,
        //     className: dataSet.className,
        //     scale: 0.75,
        //   })
        //     .setLngLat([lng, lat])
        //     .addTo(map);

        //   marker.on("click", markerClick);
        // }


      }



    });

    return () => {
      // --Tried to fix the bug with the shade map not being removed, still needs work -alex
      shadeInstance.current?.remove?.();
      shadeInstance.current = null;

      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div>
      <div
        ref={mapContainer}
        className="h-[calc(100dvh-65px)] w-full bg-zinc-200 dark:bg-zinc-800"
      />
      <div className="fixed bottom-25 left-0 right-0 flex justify-center bg-opacity-50 rounded">
        <div className="flex justify-center">
          <button onClick={() => changeTime(-1)} className="mx-1 px-3 py-1 bg-white text-black rounded">-1h</button>
          <div className="mx-1 px-2 py-1 bg-white text-black rounded">{displayTime}</div>
          <button onClick={() => changeTime(1)} className="mx-1 px-3 py-1 bg-white text-black rounded">+1h</button>
        </div>
      </div>

    </div>




  );
}
