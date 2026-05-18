// app/friends/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClientForClientComponent } from "@/lib/supabase/client";
import {
  ArrowLeft,
  UserCircle,
  MessageCircle,
  MoreVertical,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
// new function for friend research and requests
import FriendRequests from "@/components/FriendRequests";
import FriendSearch from "@/components/FriendSearch";

const supabase = createClientForClientComponent();

type Friend = {
  id: number;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
  user_id: string;
};

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // relate to friend research and requests
  const [showFriendMenu, setShowFriendMenu] = useState(false);
  const [showFriendPanel, setShowFriendPanel] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const friendMenuRef = useRef<HTMLDivElement>(null);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // collect the friend who accepted friendship
      const { data: friendships, error } = await supabase
        .from("friendship")
        .select("*")
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq("status", "accepted");

      if (error) throw error;

      // collect all friend list and profile
      const friendsList: Friend[] = [];
      for (const f of friendships || []) {
        const friendUserId =
          f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1;

        const { data: profile } = await supabase
          .from("profile")
          .select("id, firstname, lastname, avatar_url, user_id")
          .eq("user_id", friendUserId)
          .single();

        if (profile) {
          friendsList.push(profile);
        }
      }

      setFriends(friendsList);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  // filter search
  const filteredFriends = friends.filter((friend) =>
    `${friend.firstname} ${friend.lastname}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // start chat
  const startChat = async (friendProfileId: number) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // collect current user's profile
    const { data: currentProfile } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!currentProfile) return;

    // search existing chatroom
    const { data: existingRooms } = await supabase
      .from("chat_member")
      .select("room_id")
      .eq("profile_id", currentProfile.id);

    let roomId = null;
    if (existingRooms && existingRooms.length > 0) {
      const roomIds = existingRooms.map((r) => r.room_id);
      const { data: sharedRoom } = await supabase
        .from("chat_member")
        .select("room_id")
        .in("room_id", roomIds)
        .eq("profile_id", friendProfileId)
        .maybeSingle();

      if (sharedRoom) {
        roomId = sharedRoom.room_id;
      }
    }

    if (!roomId) {
      // set up chatroom
      const { data: newRoom } = await supabase
        .from("room")
        .insert({ updated_at: new Date().toISOString() })
        .select()
        .single();

      if (newRoom) {
        roomId = newRoom.id;
        await supabase.from("chat_member").insert([
          { room_id: roomId, profile_id: currentProfile.id },
          { room_id: roomId, profile_id: friendProfileId },
        ]);
      }
    }

    if (roomId) {
      router.push(`/message/${roomId}`);
    }
  };

  return (
    <main className="bg-gray-100 min-h-screen pb-24">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/profile"
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Friends</h1>

          <div className="relative ml-auto" ref={friendMenuRef}>
            <button
              onClick={() => setShowFriendMenu(!showFriendMenu)}
              className="p-2 bg-blue-500 rounded-full shadow-md hover:bg-blue-600 transition-colors shrink-0"
            >
              <UserPlus size={20} className="text-white" />
            </button>

            {/* dropdown memu UI design */}
            {showFriendMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setShowFriendMenu(false);
                    // open request friend pannel
                    setShowFriendPanel(true);
                    setShowAddFriend(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <UserPlus size={16} />
                  Friend Requests
                </button>
                <button
                  onClick={() => {
                    setShowFriendMenu(false);
                    // open add friend function
                    setShowFriendPanel(true);
                    setShowAddFriend(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 border-t border-gray-100"
                >
                  <UserPlus size={16} />
                  Add Friend
                </button>
              </div>
            )}
          </div>

          {/* <Link
            href="/chat"
            className="ml-auto p-2 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600"
          >
            <UserPlus size={20} />
          </Link> */}
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Friends Count */}
        <div className="bg-white rounded-xl p-3 mb-4 shadow">
          <p className="text-gray-600">
            <span className="font-bold text-gray-800">{friends.length}</span>{" "}
            Friends
          </p>
        </div>

        {/* Friends List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading friends...</p>
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow">
            <UserCircle size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery ? "No friends found" : "No friends yet"}
            </p>
            {/* {!searchQuery && (
  <div className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-1">
    Add friends click

    <UserPlus size={40} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" />
  </div>
)} */}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="bg-white rounded-xl p-3 shadow hover:shadow-md transition-shadow flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {friend.avatar_url ? (
                      <Image
                        src={friend.avatar_url}
                        alt={friend.firstname}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <UserCircle size={32} className="text-gray-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {friend.firstname} {friend.lastname}
                    </h3>
                    <p className="text-xs text-gray-500">Friend</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => startChat(friend.id)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    <MessageCircle size={18} />
                  </button>
                  <button className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Navbar />

      {/* friend panel */}
      {showFriendPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl w-96 max-w-[90%] max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {showAddFriend ? "Add Friend" : "Friend Requests"}
              </h2>
              <button
                onClick={() => setShowFriendPanel(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {showAddFriend ? (
                <FriendSearch onClose={() => setShowFriendPanel(false)} />
              ) : (
                <FriendRequests
                  onRequestHandled={() => {
                    setShowFriendPanel(false);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
