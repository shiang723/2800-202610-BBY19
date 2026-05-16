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
      url.searchParams.append("term", "coffee");
      url.searchParams.append(
        "categories",
        "cafes,bubbletea,donuts,tea,juicebars,smoothies",
      );
      url.searchParams.append("radius", "40000");
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true, data: [] });
}
