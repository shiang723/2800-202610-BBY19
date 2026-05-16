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
  Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const supabase = createClientForClientComponent();

type SupabaseUser = {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    age?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type FavoriteLocation = {
  id: string;
  place_id: string;
  place_name: string;
  place_address?: string;
  place_rating?: number;
};

export default function Profile() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
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

  const handleRemoveFavorite = async (placeId: string, placeName: string) => {
    if (!confirm(`Remove "${placeName}" from your favorites?`)) return;

    const response = await fetch(`/api/favorites?place_id=${placeId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (data.success) {
      fetchFavorites(); // refreash the list
    }
  };

  // get dispay name
  const displayName = user
    ? user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
    : "User";

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

        {/* <button
          onClick={handleBack}
          className="bg-gray-400 rounded-2xl p-1 pl-2 pr-2 text-lg flex place-self-end-safe"
        >
          Back
        </button> */}

        {/* user information - dyanamic infor from Supabase */}
        <div className="bg-white rounded-xl p-6 text-center mb-4 shadow">
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-200 "></div>
          <h2 className="mt-3 text-xl font-bold text-gray-800">
            {displayName}
          </h2>
          {/* Age can get age */}
          <div className="flex justify-center items-center gap-1 mt-1 text-gray-500 text-sm">
            <span className="text-gray-500 text-m">Age:</span>
            <p>{user?.user_metadata?.age || "Not set"}</p>
          </div>
        </div>

        {/* collect the location from api*/}
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
              ></button>
            </div>
          ))
        )}

        {/* user information - dyanamic infor from Supabase */}
        <div className="bg-white rounded-xl p-4 mt-4 shadow text-gray-700 ">
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
                {typeof user?.user_metadata?.aboutMe === "string" &&
                user.user_metadata.aboutMe.trim()
                  ? user.user_metadata.aboutMe
                  : "Write something about you"}
              </p>
            </div>

            {/* Settings */}
            <div className="flex items-center pb-3 border-b border-gray-200 transition-colors hover:bg-blue-100 rounded-md">
              <button
                onClick={handleSignOut}
                className="font-semibold min-w-[60px]"
              >
                <Settings size={24} className="mr-3" />
              </button>
              <p>Account Settings</p>
            </div>

            {/* help */}
            <div className="flex items-center transition-colors hover:bg-blue-100 rounded-md">
              <span className="font-semibold min-w-[60px]">
                <HelpCircle size={24} className="mr-3" />
              </span>
              <p>Tutorial</p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-xl overflow-hidden shadow">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-red-500 transition-colors hover:bg-blue-100 rounded-md"
          >
            <LogOut size={18} className="mr-3" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* collect the location from api*/}
        {/* <p className="text-lg font-semibold text-gray-800 m-2 mt-6">
          Saved Locations
        </p> */}

        {/* {loading ? (
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
              ></button>
            </div>
          ))
        )} */}
      </div>
      <Navbar />
    </main>
  );
}
