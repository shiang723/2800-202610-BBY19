// app/api/locations/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const type = searchParams.get("type");

  console.log("API called:", { source, lat, lng });

  if (source === "yelp" && lat && lng) {
    const YELP_API_KEY = process.env.YELP_API_KEY;

    if (!YELP_API_KEY) {
      console.error("YELP_API_KEY 缺失");
      return NextResponse.json(
        { success: false, error: "Missing API key" },
        { status: 500 },
      );
    }

    try {
      const url = new URL("https://api.yelp.com/v3/businesses/search");
      url.searchParams.append("latitude", lat); // latitude
      url.searchParams.append("longitude", lng); // longtitude
      url.searchParams.append("term", "cafe"); // search cafe
      url.searchParams.append("radius", "5000"); // search 5km
      url.searchParams.append("limit", "50"); // max 50 shop

      console.log("request Yelp:", url.toString());

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
        },
      });

      const data = await response.json();
      console.log("return numbers of cafe :", data.businesses?.length || 0);

      return NextResponse.json({
        success: true,
        data: data.businesses || [],
      });
    } catch (err) {
      console.error("Yelp error:", err);
      return NextResponse.json(
        { success: false, error: "Fetch failed" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
