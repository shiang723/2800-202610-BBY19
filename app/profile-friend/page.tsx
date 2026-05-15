// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClientForClientComponent } from "@/lib/supabase/client";
import {
  ArrowLeft,
  LogOut,
  Settings,
  User,
  HelpCircle,
  MessageCircle,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClientForClientComponent();

type SupabaseUserFriend = {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    age?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export default function Profile() {
  const [user, setUser] = useState<SupabaseUserFriend | null>(null);
  type FavoriteLocation = {
    id: string;
    place_id: string;
    place_name: string;
    place_address?: string;
    place_rating?: number;
  };

  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleOpenTutorial = () => {
    const modal = document.getElementById("tutorialmodel") as HTMLDialogElement;
    modal?.showModal();
  };

  const handleMessage = () => {
    router.push("/message");
  };

  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);

  // user information
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser({
          email: user.email ?? null,
          ...user,
        });
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // collection list
  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/favorites");
      const data = await response.json();
      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchFavorites();
    };
    fetchData();
  }, []);

  const handleBack = () => {
    window.history.back();
  };

  const handleRemoveFavorite = async (placeId: string, placeName: string) => {
    if (!confirm(`Remove "${placeName}" from your favorites?`)) return;

    const response = await fetch(`/api/favorites?place_id=${placeId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.success) {
      fetchFavorites();
    }
  };

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <main className="bg-gray-100 min-h-screen pb-24">
      <div className="p-5 ml-2 mr-2">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
        </div>

        {/* user information */}
        <div className="bg-white rounded-xl p-6 text-center mb-4 shadow">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-200"></div>
          <h2 className="mt-3 text-xl font-bold text-gray-800">
            {displayName}
          </h2>
          <div className="flex justify-center items-center gap-1 mt-1 text-gray-500 text-sm">
            <span className="text-gray-500 text-m">Age:</span>
            <p>{user?.user_metadata?.age || "Not set"}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="flex-6 bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors">
              Follow
            </button>
            {/* <button className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors">
              Message
            </button> */}

            <button
              onClick={handleMessage}
              className="bg-gray-200 items-center text-gray-700 font-semibold py-2 px-4 rounded-full hover:bg-gray-300 transition-colors"
            >
              <MessageCircle size={24} className="mr-3" />
            </button>
          </div>
        </div>

        {/* Saved Locations */}
        <p className="text-lg font-semibold text-gray-800 m-2 mt-6">
          Saved Locations
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-200 rounded-xl p-8 text-center text-gray-500 shadow">
            <p>No saved locations yet</p>
            <p className="text-sm mt-2">
              Go to map and click ❤️ to save places you like!
            </p>
          </div>
        ) : (
          favorites.map((location) => (
            <div
              key={location.id}
              className="bg-gray-300 rounded-xl border border-black text-black text-lg p-3 mb-3 flex justify-between items-center shadow"
            >
              <div className="flex-1">
                <p className="font-semibold">{location.place_name}</p>
                <p className="text-sm text-gray-700">
                  {location.place_address || "Address not available"}
                </p>
                {location.place_rating && (
                  <p className="text-sm">⭐ {location.place_rating} / 5</p>
                )}
              </div>
              <button
                onClick={() =>
                  handleRemoveFavorite(location.place_id, location.place_name)
                }
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              >
                ×
              </button>
            </div>
          ))
        )}

        {/* user details */}
        <div className="bg-white rounded-xl p-4 mt-4 shadow text-gray-700">
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center pb-3 border-b border-gray-200 transition-colors hover:bg-blue-100 rounded-md">
              <span className="font-semibold min-w-[60px]">
                <Mail size={24} className="mr-3" />
              </span>
              <p>{user?.email || "Not logged in"}</p>
            </div>

            {/* profile */}
            <div className="flex items-center pb-3 border-b border-gray-200 transition-colors hover:bg-blue-100 rounded-md">
              <span className="font-semibold min-w-[60px]">
                <User size={24} className="mr-3" />
              </span>
              <p className="flex-1">
                {user?.user_metadata?.aboutMe as string || "Write something about you"}
              </p>
            </div>

            {/* Settings */}
            <div className="flex items-center pb-3 border-b border-gray-200 transition-colors hover:bg-blue-100 rounded-md">
              <Link href="/settings" className="flex items-center flex-1">
                <span className="font-semibold min-w-[60px]">
                  <Settings size={24} className="mr-3" />
                </span>
                <p>Account Settings</p>
              </Link>
            </div>

            {/* help */}
            <div className="flex items-center border-gray-200 transition-colors hover:bg-blue-100 rounded-md">
              <button
                onClick={handleOpenTutorial}
                className=" flex items-center gap-6"
              >
                <HelpCircle size={24} className="mr-3" />
                <p>Tutorial</p>
              </button>
            </div>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-4 bg-white rounded-xl overflow-hidden shadow">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-red-500 transition-colors hover:bg-blue-100 rounded-md"
          >
            <LogOut size={18} className="mr-3" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Saved Locations */}
        {/* <p className="text-lg font-semibold text-gray-800 m-2 mt-6">
          Saved Locations
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-200 rounded-xl p-8 text-center text-gray-500 shadow">
            <p>No saved locations yet</p>
            <p className="text-sm mt-2">
              Go to map and click ❤️ to save places you like!
            </p>
          </div>
        ) : (
          favorites.map((location) => (
            <div
              key={location.id}
              className="bg-gray-300 rounded-xl border border-black text-black text-lg p-3 mb-3 flex justify-between items-center shadow"
            >
              <div className="flex-1">
                <p className="font-semibold">{location.place_name}</p>
                <p className="text-sm text-gray-700">
                  {location.place_address || "Address not available"}
                </p>
                {location.place_rating && (
                  <p className="text-sm">⭐ {location.place_rating} / 5</p>
                )}
              </div>
              <button
                onClick={() =>
                  handleRemoveFavorite(location.place_id, location.place_name)
                }
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm transition-colors"
              >
                ×
              </button>
            </div>
          ))
        )} */}
      </div>
      <Navbar />
    </main>
  );
}
