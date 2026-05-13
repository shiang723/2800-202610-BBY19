// app/api/locations/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const location = searchParams.get("location");

  // only deal with yelp request
  if (source === "yelp" && location) {
    const YELP_API_KEY = process.env.YELP_API_KEY;

    if (!YELP_API_KEY) {
      console.error("YELP_API_KEY is missing");
      return NextResponse.json(
        { success: false, error: "API key missing" },
        { status: 500 },
      );
    }

    try {
      const url = new URL("https://api.yelp.com/v3/businesses/search");
      url.searchParams.append("location", location);
      url.searchParams.append("term", "cafe");
      url.searchParams.append("radius", "5000");
      url.searchParams.append("limit", "50");

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${YELP_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return NextResponse.json({ success: true, data: data.businesses || [] });
    } catch (error) {
      console.error("Yelp error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
