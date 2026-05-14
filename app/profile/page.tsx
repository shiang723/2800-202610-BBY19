// app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { createClientForClientComponent } from "@/lib/supabase/client";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientForClientComponent();

  // user information
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
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
    fetchFavorites();
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
      fetchFavorites(); // refreash the list
    }
  };

  // get dispay name
  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <main className="bg-gray-100 min-h-screen pb-20">
      <div className="p-5 ml-2 mr-2">
        <button
          onClick={handleBack}
          className="bg-gray-400 rounded-2xl p-1 pl-2 pr-2 text-lg flex place-self-end-safe"
        >
          Back
        </button>

        <p className="text-3xl text-black font-bold mt-2">Profile</p>

        {/* user information - dyanamic infor from Supabase */}
        <div className="bg-white rounded-xl p-4 mt-4 shadow">
          <div className="text-black text-lg flex flex-col gap-3">
            <div className="flex flex-row gap-2">
              <span className="font-semibold min-w-[60px]">Name:</span>
              <p>{displayName}</p>
            </div>
            <div className="flex flex-row gap-2">
              <span className="font-semibold min-w-[60px]">Email:</span>
              <p>{user?.email || "Not logged in"}</p>
            </div>
            {/* Age can get age */}
            {/* <div className="flex flex-row gap-2">
              <span className="font-semibold min-w-[60px]">Age:</span>
              <p>{user?.user_metadata?.age || 'Not set'}</p>
            </div> */}
          </div>
        </div>

        {/* collect the location from api*/}
        <p className="text-2xl text-black font-semibold m-2 mt-6">
          Saved Locations
        </p>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : favorites.length === 0 ? (
          <div className="bg-gray-200 rounded-xl p-8 text-center text-gray-500">
            <p>No saved locations yet</p>
            <p className="text-sm mt-2">
              Go to map and click ❤️ to save places you like!
            </p>
          </div>
        ) : (
          favorites.map((location) => (
            <div
              key={location.id}
              className="bg-gray-300 rounded-xl border border-black text-black text-lg p-3 mb-3 flex justify-between items-center"
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
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      <Navbar />
    </main>
  );
}
