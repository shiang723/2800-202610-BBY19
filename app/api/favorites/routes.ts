// app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { createClientForServerComponent } from "@/lib/supabase/server";

// GET - get collection list
export async function GET() {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: favorites, error } = await supabase
    .from("user_favorites")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, favorites });
}

// POST - add collection
export async function POST(request: Request) {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    place_id,
    place_name,
    place_type,
    place_address,
    place_lat,
    place_lng,
    place_rating,
  } = body;

  // check if the file has been saved
  const { data: existing } = await supabase
    .from("user_favorites")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("place_id", place_id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already favorited" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("user_favorites")
    .insert({
      user_id: session.user.id,
      place_id,
      place_name,
      place_type: place_type || "yelp",
      place_address,
      place_lat,
      place_lng,
      place_rating,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, favorite: data });
}

// DELETE - collectio
export async function DELETE(request: Request) {
  const supabase = await createClientForServerComponent();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const place_id = searchParams.get("place_id");

  if (!place_id) {
    return NextResponse.json({ error: "place_id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", session.user.id)
    .eq("place_id", place_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
