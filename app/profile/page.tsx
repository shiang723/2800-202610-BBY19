// app/profile/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { createClientForClientComponent } from "@/lib/supabase/client";
import {
  ArrowLeft,
  LogOut,
  KeyRoundIcon,
  User,
  HelpCircle,
  Mail,
  Users,
  Edit2,
  Camera,
  Loader2,
  Bookmark,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import WelcomeTutorial from "@/components/WelcomeTutorial";

const supabase = createClientForClientComponent();

type SupabaseUser = {
  id: string;
  email: string | null;
  user_metadata?: {
    full_name?: string;
    age?: number;
    aboutMe?: string;
    avatar_url?: string;
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
  const [profileId, setProfileId] = useState<number | null>(null);
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendsCount, setFriendsCount] = useState(0);
  const [editingBio, setEditingBio] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [bioText, setBioText] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleOpenTutorial = async () => {
    setTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setTutorialOpen(false);
    console.log(tutorialOpen);
  };

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
        setBioText(user.user_metadata?.aboutMe || "");

        const { data: profile } = await supabase
          .from("profile")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          setProfileId(profile.id);
        }
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // collect friend number
  const fetchFriendsCount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { count, error } = await supabase
        .from("friendship")
        .select("*", { count: "exact", head: true })
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .eq("status", "accepted");

      if (!error) {
        setFriendsCount(count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch friends count:", error);
    }
  };

  // collect collection/ like list
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
    fetchFriendsCount();
    fetchFavorites();
  }, [profileId]);

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

  const updateBio = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { aboutMe: bioText },
    });

    if (!error) {
      setEditingBio(false);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              user_metadata: { ...prev.user_metadata, aboutMe: bioText },
            }
          : null,
      );
    }
  };

  // upload image
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setUploadingAvatar(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setUser((prev) =>
        prev
          ? {
              ...prev,
              user_metadata: { ...prev.user_metadata, avatar_url: publicUrl },
            }
          : null,
      );

      alert("Avatar updated successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const displayName = user
    ? user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
    : "User";

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <main className="bg-gray-100 min-h-screen pb-24">
      <div className="p-5 ml-2 mr-2">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">My Profile</h1>
        </div>

        {/* user information card */}
        <div className="bg-white rounded-xl p-6 text-center mb-4 shadow">
          {/* head photo */}
          <div className="relative inline-block">
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User size={40} className="text-gray-400" />
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 shadow-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={uploadAvatar}
              className="hidden"
            />
          </div>

          <h2 className="mt-3 text-xl font-bold text-gray-800">
            {displayName}
          </h2>

          <div className="flex justify-center items-center gap-1 mt-1 text-gray-500 text-sm">
            <span className="text-gray-500 text-m">Age:</span>
            <p>{user?.user_metadata?.age || "Not set"}</p>
          </div>

          {/* Bio location */}
          <div className="mt-3 px-4">
            {!editingBio ? (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-gray-600 text-sm">
                  {user?.user_metadata?.aboutMe || "About Me"}
                </p>
                <button
                  onClick={() => setEditingBio(true)}
                  className="mt-2 text-blue-500 text-xs hover:text-blue-700 flex items-center justify-center gap-1 w-full"
                >
                  <Edit2 size={12} />
                  Edit bio
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  placeholder="Write something about yourself..."
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={updateBio}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingBio(false);
                      setBioText(user?.user_metadata?.aboutMe || "");
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* friend numbers */}
          <Link
            href="/friends"
            className="mt-4 pt-3 border-t border-gray-100 block hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Users size={18} className="text-blue-500" />
              <span className="text-sm">
                <span className="font-bold text-gray-800">{friendsCount}</span>{" "}
                Friends
              </span>
            </div>
          </Link>
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
            <p className="text-sm mt-2 w-full flex items-center justify-center gap-1">
              Go to map and click
              <Bookmark size={18} className="inline" />
              to save places you like!
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
                x
              </button>
            </div>
          ))
        )}

        {/* user information - dyanamic infor from Supabase */}
        <div className="bg-white rounded-xl p-4 mt-4 shadow text-gray-700">
          <div className="space-y-3">
            <div className="flex items-center transition-colors hover:bg-blue-100 rounded-md pt-1 pb-1">
              <span className="font-semibold min-w-[60px]">
                <Mail size={24} className="mr-3" />
              </span>
              <p>{user?.email || "Not logged in"}</p>
            </div>

            <div className="border-b border-gray-200"></div>

            <div className="flex items-center transition-colors hover:bg-blue-100 rounded-md pt-1 pb-1">
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

            <div className="border-b border-gray-200"></div>

            <div className="flex items-center transition-colors hover:bg-blue-100 rounded-md pt-1 pb-1">
              <Link href="/reset-password" className="flex items-center flex-1">
                <span className="font-semibold min-w-[60px]">
                  <KeyRoundIcon size={24} className="mr-3" />
                </span>
                <p>Reset password</p>
              </Link>
            </div>
            <div className="border-b border-gray-200"></div>

            <div className="flex items-center transition-colors hover:bg-blue-100 rounded-md pt-1 pb-1">
              <button
                onClick={handleOpenTutorial}
                className="flex items-center gap-6"
              >
                <HelpCircle size={24} className="mr-3" />
                <p>Tutorial</p>
              </button>
            </div>
          </div>
        </div>
        <WelcomeTutorial open={tutorialOpen} onClose={handleCloseTutorial} />

        {/* Sign Out */}
        <div className="mt-4 bg-white rounded-xl overflow-hidden shadow">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-red-500 transition-colors hover:bg-blue-100 rounded-md"
          >
            <LogOut size={18} className="mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
      <Navbar />
    </main>
  );
}
