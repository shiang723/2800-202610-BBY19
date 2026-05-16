// AI Chatbot code adapted from BCIT COMP2537 lecture material
// Original Author: Patrick Guichon
// Original Author: BCIT
// Co-Author: Adrien Cyr
// Co-Author: ChatGPT GPT-5.5

import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClientForServerComponent } from "@/lib/supabase/server";

const openai = new OpenAI({
  baseURL: "https://models.github.ai/inference",
  apiKey: process.env.GITHUB_TOKEN,
});

const BOT_PROFILE_ID = Number(process.env.AI_BOT_PROFILE_ID);

type YelpBusiness = {
  name?: string;
  rating?: number;
  price?: string;
  location?: {
    address1?: string;
  };
  categories?: {
    title?: string;
  }[];
};

type Coordinates = {
  lat: number;
  lng: number;
};

const DEFAULT_LOCATION_QUERY = "Vancouver, BC";
const DEFAULT_COORDINATES: Coordinates = {
  lat: 49.24501114685754,
  lng: -123.11342343091847,
};

function getRecentUserLocationQuery(
  messages: { profile_id: number; message_text: string }[] | null,
) {
  if (!messages) return null;

  const recentUserMessages = messages
    .filter((message) => message.profile_id !== BOT_PROFILE_ID)
    .slice(-6)
    .reverse();

  for (const message of recentUserMessages) {
    const text = message.message_text.trim();

    const locationPatterns = [
      /\b(?:near|around|by|at|from|in)\s+(.+)/i,
      /\b(?:my location is|i am at|i'm at|im at|starting from)\s+(.+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);

      if (match?.[1]) {
        return `${match[1].trim()}, Vancouver, BC`;
      }
    }
  }

  return null;
}

async function geocodeLocation(locationQuery: string | null) {
  if (!locationQuery) return null;

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  if (!MAPTILER_KEY) {
    console.error("NEXT_PUBLIC_MAPTILER_KEY is missing");
    return null;
  }

  try {
    const url = new URL(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(locationQuery)}.json`,
    );

    url.searchParams.append("key", MAPTILER_KEY);
    url.searchParams.append("country", "ca");
    url.searchParams.append("limit", "1");
    url.searchParams.append(
      "bbox",
      "-123.28753233533254,49.17524950157297,-122.9801907901657,49.33148788422633",
    );

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error("Could not geocode user location");
      return null;
    }

    const data = await response.json();

    const center = data.features?.[0]?.center;

    if (!center || center.length < 2) {
      return null;
    }

    return {
      lng: center[0],
      lat: center[1],
    } as Coordinates;
  } catch (error) {
    console.error("Could not geocode location:", error);
    return null;
  }
}

function getDistanceKm(
  firstLat: number,
  firstLng: number,
  secondLat: number,
  secondLng: number,
) {
  const earthRadiusKm = 6371;

  const dLat = ((secondLat - firstLat) * Math.PI) / 180;
  const dLng = ((secondLng - firstLng) * Math.PI) / 180;

  const firstLatRadians = (firstLat * Math.PI) / 180;
  const secondLatRadians = (secondLat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(firstLatRadians) *
      Math.cos(secondLatRadians) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getYelpCafeContext(locationQuery: string | null) {
  const YELP_API_KEY = process.env.YELP_API_KEY;

  if (!YELP_API_KEY) {
    return "Yelp cafe data is unavailable because the Yelp API key is not configured.";
  }

  try {
    const url = new URL("https://api.yelp.com/v3/businesses/search");

    url.searchParams.append("location", locationQuery ?? DEFAULT_LOCATION_QUERY);
    url.searchParams.append("term", "coffee");
    url.searchParams.append(
      "categories",
      "cafes,bubbletea,donuts,tea,juicebars,smoothies",
    );
    url.searchParams.append("radius", "40000");
    url.searchParams.append("limit", "10");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return "Yelp cafe data is currently unavailable.";
    }

    const data = (await response.json()) as {
      businesses?: YelpBusiness[];
    };

    const businesses = data.businesses ?? [];

    if (businesses.length === 0) {
      return "No Yelp cafe locations were found near the current search area.";
    }

    return businesses
      .map((business) => {
        const name = business.name ?? "Unnamed cafe";
        const category = business.categories?.[0]?.title ?? "Cafe";
        const address = business.location?.address1 ?? "address unavailable";
        const rating = business.rating ? `${business.rating}/5` : "unknown rating";
        const price = business.price ?? "price unavailable";

        return `Name: ${name}
Category: ${category}
Address: ${address}
Rating: ${rating}
Price: ${price}`;
      })
      .join("\n\n");
  } catch (error) {
    console.error("Could not load Yelp cafe context:", error);
    return "Yelp cafe data could not be loaded right now.";
  }
}

const cityPoiDatasets = [
  {
    id: "parks",
    type: "Park",
    label: "Parks",
  },
  {
    id: "community-centres",
    type: "Community Centre",
    label: "Centres",
  },
  {
    id: "drinking-fountains",
    type: "Water Fountain",
    label: "Fountains",
    filter: (feature: GeoJSON.Feature) =>
      String(feature.properties?.name ?? "").includes("Fountain"),
  },
  {
    id: "public-washrooms",
    type: "Washroom",
    label: "Washrooms",
    filter: (feature: GeoJSON.Feature) =>
      feature.properties?.park_name !== null,
  },
];

function getPoiLine(
  dataSet: (typeof cityPoiDatasets)[number],
  feature: GeoJSON.Feature,
  distanceKm?: number,
) {
  const properties = feature.properties ?? {};
  const distanceText =
    typeof distanceKm === "number" ? `, about ${distanceKm.toFixed(1)} km away` : "";

  if (dataSet.id === "parks") {
    return `- ${properties.name}: Park, address ${properties.streetnumber ?? ""} ${properties.streetname ?? ""}, washrooms ${properties.washrooms ?? "unknown"}${distanceText}`;
  }

  if (dataSet.id === "community-centres") {
    return `- ${properties.name}: Community Centre, address ${properties.address ?? "unknown"}, washrooms available${distanceText}`;
  }

  if (dataSet.id === "drinking-fountains") {
    const rawName = String(properties.name ?? "");
    const nameIndex = rawName.indexOf("location:");
    const name = nameIndex >= 0 ? rawName.slice(nameIndex + 9).trim() : rawName;

    return `- ${name || "Water fountain"}: Water Fountain, location ${properties.location ?? "unknown"}${distanceText}`;
  }

  if (dataSet.id === "public-washrooms") {
    return `- ${properties.park_name ?? "Public washroom"}: Washroom, location ${properties.location ?? "unknown"}${distanceText}`;
  }

  return `- ${properties.name ?? "Unnamed location"}: ${dataSet.type}${distanceText}`;
}

async function getCityPoiContext(center: Coordinates | null) {
  try {
    const allPoiLines: string[] = [];

    for (const dataSet of cityPoiDatasets) {
      const url = `https://vancouver.opendatasoft.com/api/explore/v2.1/catalog/datasets/${dataSet.id}/exports/geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Could not load ${dataSet.label} data`);
        continue;
      }

      const data = (await response.json()) as GeoJSON.FeatureCollection;

      const filteredFeatures = dataSet.filter
        ? data.features.filter(dataSet.filter)
        : data.features;

      const featuresWithDistance = filteredFeatures
        .map((feature) => {
          if (!center || feature.geometry?.type !== "Point") {
            return {
              feature,
              distanceKm: undefined,
            };
          }

          const [poiLng, poiLat] = feature.geometry.coordinates;

          return {
            feature,
            distanceKm: getDistanceKm(center.lat, center.lng, poiLat, poiLng),
          };
        })
        .sort((a, b) => {
          if (a.distanceKm === undefined || b.distanceKm === undefined) {
            return 0;
          }

          return a.distanceKm - b.distanceKm;
        });

      const lines = featuresWithDistance
        .slice(0, 8)
        .map(({ feature, distanceKm }) =>
          getPoiLine(dataSet, feature, distanceKm),
        );

      if (lines.length > 0) {
        allPoiLines.push(`${dataSet.label}:\n${lines.join("\n")}`);
      }
    }

    if (allPoiLines.length === 0) {
      return "No city POI data was available.";
    }

    return allPoiLines.join("\n\n");
  } catch (error) {
    console.error("Could not load city POI context:", error);
    return "City POI data could not be loaded right now.";
  }
}

export async function POST(req: Request) {
  const { roomId } = await req.json();

  if (!roomId) {
    return NextResponse.json({ error: "roomId is required" }, { status: 400 });
  }

  const supabase = await createClientForServerComponent();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data: membership, error: membershipError } = await supabase
    .from("chat_member")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("profile_id", profile.id)
    .single();

  if (membershipError || !membership) {
    return NextResponse.json(
      { error: "Not a member of this room" },
      { status: 403 },
    );
  }

  const { data: botMembership } = await supabase
    .from("chat_member")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("profile_id", BOT_PROFILE_ID)
    .single();

  if (!botMembership) {
    return NextResponse.json(
      { error: "This room does not contain the bot" },
      { status: 400 },
    );
  }

  const { data: messages, error: messagesError } = await supabase
    .from("message")
    .select("profile_id, message_text, created_at")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true })
    .limit(20);

  if (messagesError) {
    return NextResponse.json(
      { error: "Could not load messages" },
      { status: 500 },
    );
  }

    const locationQuery = getRecentUserLocationQuery(messages ?? []);
    const locationCoordinates = await geocodeLocation(locationQuery);

    const yelpCafeContext = await getYelpCafeContext(locationQuery);
    const cityPoiContext = await getCityPoiContext(
    locationCoordinates ?? DEFAULT_COORDINATES,
    );

  const openAiMessages = [
    {
      role: "developer" as const,
      content: `
        You are an AI assistant built into a location-based shade map app, designed to inform users on available shade during hot summer days in Vancouver, as well as advise them on health risks and recommendations to stay safe.

        App features:
        - The Chat page shows existing direct message rooms.
        - The Message page lets users send messages in a room.
        - The Profile page shows user information.
        - Users can save favorite locations.
        - The map/search feature helps users discover locations.
        - In the map, users can view exactly where shade is based on digital renderings.
        - In the map, shade is rendered based on the current time of day and sun position. Users may modify the time in the app to simulate shade at different times in the day.
        - In the map, users may also filter by: Parks, Centres, Fountains, Washrooms and Cafes to pinpoint popular locations to meet.

        User-provided location context:
        ${
            locationQuery ??
            "The user has not provided a specific starting location yet. If they ask for nearby recommendations, ask for a neighbourhood, landmark, address, or intersection first."
        }

        City POI data sorted by calculated distance from the user-provided area, or the default Vancouver map area if no location was provided:
        ${cityPoiContext}

        Yelp cafe data near the user's provided area, or the default Vancouver map area if no location was provided. Use this only when cafes, coffee, food/drinks, indoor seating, or cooling down indoors are relevant:
        ${yelpCafeContext}

        Location guidance:
        - If the user asks about parks, centres, fountains, or washrooms, prioritize the city POI data.
        - If the user asks about cafes, coffee, food/drinks, indoor seating, or cooling down indoors, use the Yelp cafe data when relevant.
        - Do not default to cafes unless the user's request makes cafes relevant.
        - For shade, prioritize parks, shaded paths, community centres, fountains, and washrooms before cafes.
        - For hot weather, suggest shaded areas, water fountains, washrooms, community centres, indoor cooling options, and routes with seating.
        - For accessibility, suggest flatter paths, nearby parking, community centres, and shorter routes.
        - Do not treat POI data as exact shade data. Use the app's shade map for exact shade, and use POIs to suggest useful nearby amenities.
        - Do not treat Yelp cafe data as shade data. It only gives cafe names, categories, addresses, ratings, and prices.
        - Never claim that a place has shade, plenty of shade, tree coverage, or shaded areas unless that information is explicitly provided in the context.
        - If discussing shade at a location, say the user should check the shade layer in the app for exact shade at the selected time.
        - Do not recommend far-away landmarks unless the user asks for broader Vancouver suggestions.
        - When the user provides a location, prioritize POIs listed closest to that location.
        - Do not invent distances. Only mention a distance if it appears in the provided City POI context.
        - If the POI data near the user is limited, say so and suggest using the map filters instead of guessing.
        - If the user asks for shade and washrooms, prioritize city POIs with washroom-related information before cafes.
        - Do not recommend cafes for shade/washroom requests unless there are no better city POI matches, or unless the user asks for indoor cooling, coffee, food, or drinks.
        - If you mention cafes as a fallback, describe them as indoor cooling options, not shade options.
        - Do not say a park has shade, tree coverage, shaded paths, or potential shaded areas unless that is explicitly provided in the context.
        - For parks and outdoor POIs, say: "Use the shade map to check shade coverage at your selected time."
        - If the user asks for washrooms, prefer POIs where washrooms are listed in the provided context.
        - Do not imply a washroom exists unless the provided context says so.

        Location handling:
        - If the user asks for recommendations but has not provided a starting location, ask for a general area first.
        - The user can provide a neighbourhood, address, landmark, intersection, or current map area.
        - Do not claim to know the user's exact location unless they provide it.
        - If the user gives a location, use it as the assumed search area for the rest of the conversation unless they change it.
        - If exact POI data is not available for that location, give general guidance and explain how to use the map filters.
        
        Your job is to help users:
        - Navigate the app
        - Understand features like chat, profiles, saved locations, maps, and search
        - Recommend locations based on user preferences
        - Suggest places with shade, walkability, seating, accessibility, or quieter areas
        - Help users plan meetups or walks with friends

        Important behavior:
        - Be concise and friendly.
        - Do not use markdown formatting such as bolding, headings, tables, or links.
        - Your messages are displayed as regular chat bubbles, so keep formatting simple.
        - Prefer short paragraphs over long blocks of text.
        - If you recommend multiple places, limit the list to 3 options unless the user asks for more.
        - Use this format for recommendations:

        Here are a few options:
        1. Place name
        Short reason based only on provided context
        Useful amenity or app action

        2. Place name
        Short reason based only on provided context
        Useful amenity or app action

        3. Place name
        Short reason based only on provided context
        Useful amenity or app action

        - Do not put several recommendations on one line.
        - Avoid long comma-separated lists.
        - If the user asks about app navigation, explain the steps clearly.
        - If the user asks for location recommendations, use available app/map/location context if provided.
        - If asked about shade, explain that the app's shade map should be used for exact shade and suggest relevant POI filters such as Parks, Centres, Fountains, and Washrooms.
        - If exact live map data is unavailable, say so and give general guidance instead of pretending.
        - Do not claim you can see the user's exact location unless it is provided.
        - Do not invent specific park conditions unless they are in the provided context.
            `,
    },
    ...(messages ?? []).map((message) => ({
      role:
        message.profile_id === BOT_PROFILE_ID
          ? ("assistant" as const)
          : ("user" as const),
      content: message.message_text,
    })),
  ];

  const response = await openai.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: openAiMessages,
    temperature: 0.7,
  });

  const reply =
    response.choices[0]?.message?.content ??
    "Sorry, I could not generate a response.";

  const { data: insertedMessage, error: insertError } = await supabase
    .from("message")
    .insert({
      room_id: roomId,
      profile_id: BOT_PROFILE_ID,
      message_text: reply,
    })
    .select("id, room_id, profile_id, message_text, created_at")
    .single();

  if (insertError) {
    return NextResponse.json(
      { error: "Could not save bot response" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: insertedMessage });
}