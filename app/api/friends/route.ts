// app/api/friends/route.ts
import { NextResponse } from "next/server";
import { createClientForServerComponent } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const type = searchParams.get("type");

  const supabase = await createClientForServerComponent();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // get friend request (inprogress)
  if (type === "pending") {
    const { data: pending, error } = await supabase
      .from("friendship")
      .select("*")
      .eq("user_id_2", user.id)
      .eq("status", "pending");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const requests = [];
    for (const req of pending || []) {
      const { data: senderProfile } = await supabase
        .from("profile")
        .select("id, firstname, lastname, avatar_url")
        .eq("user_id", req.user_id_1)
        .single();

      if (senderProfile) {
        requests.push({
          id: req.id,
          firstname: senderProfile.firstname,
          lastname: senderProfile.lastname,
          avatar_url: senderProfile.avatar_url,
        });
      }
    }

    return NextResponse.json({ pending: requests });
  }

  // get friend list
  if (type === "list") {
    const { data: friendships, error } = await supabase
      .from("friendship")
      .select("*")
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
      .eq("status", "accepted");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const friends = [];
    for (const f of friendships || []) {
      const friendUserId = f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1;

      const { data: friendProfile } = await supabase
        .from("profile")
        .select("id, firstname, lastname, avatar_url")
        .eq("user_id", friendUserId)
        .single();

      if (friendProfile) {
        friends.push({
          friendship_id: f.id,
          friend_id: friendProfile.id,
          firstname: friendProfile.firstname,
          lastname: friendProfile.lastname,
          avatar_url: friendProfile.avatar_url,
        });
      }
    }

    return NextResponse.json({ friends });
  }

  // search user
  if (type === "search" && q) {
    const { data: existingFriendships } = await supabase
      .from("friendship")
      .select("user_id_1, user_id_2")
      .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

    const excludedUserIds = [user.id];
    existingFriendships?.forEach((f) => {
      excludedUserIds.push(f.user_id_1, f.user_id_2);
    });

    const { data: users, error } = await supabase
      .from("profile")
      .select("id, firstname, lastname, avatar_url, user_id")
      .ilike("firstname", `%${q}%`)
      .not("user_id", "in", `(${excludedUserIds.join(",")})`)
      .eq("is_bot", false)
      .limit(20);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, friendId } = body;

  const supabase = await createClientForServerComponent();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // send friend request
  if (action === "send") {
    const { data: friendProfile } = await supabase
      .from("profile")
      .select("user_id")
      .eq("id", friendId)
      .single();

    if (!friendProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { error } = await supabase.from("friendship").insert({
      user_id_1: user.id,
      user_id_2: friendProfile.user_id,
      status: "pending",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  // accept friend request
  if (action === "accept") {
    const { data: friendship } = await supabase
      .from("friendship")
      .select("*")
      .eq("id", friendId)
      .single();

    if (!friendship) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("friendship")
      .update({ status: "accepted", updated_at: new Date().toISOString() })
      .eq("id", friendId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // set up chatroom
    const { data: profile1 } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", friendship.user_id_1)
      .single();

    const { data: profile2 } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", friendship.user_id_2)
      .single();

    if (profile1 && profile2) {
      const { data: existingRooms } = await supabase
        .from("chat_member")
        .select("room_id")
        .eq("profile_id", profile1.id);

      let roomExists = false;
      if (existingRooms && existingRooms.length > 0) {
        const roomIds = existingRooms.map((r) => r.room_id);
        const { data: sharedRoom } = await supabase
          .from("chat_member")
          .select("room_id")
          .in("room_id", roomIds)
          .eq("profile_id", profile2.id)
          .maybeSingle();

        roomExists = !!sharedRoom;
      }

      if (!roomExists) {
        const { data: newRoom } = await supabase
          .from("room")
          .insert({ updated_at: new Date().toISOString() })
          .select()
          .single();

        if (newRoom) {
          await supabase.from("chat_member").insert([
            { room_id: newRoom.id, profile_id: profile1.id },
            { room_id: newRoom.id, profile_id: profile2.id },
          ]);
        }
      }
    }

    return NextResponse.json({ success: true });
  }

  // refuse to add friend
  if (action === "reject") {
    const { error } = await supabase
      .from("friendship")
      .delete()
      .eq("id", friendId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
