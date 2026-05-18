// components/FriendSearch.tsx
"use client";

import { useState } from "react";
import { UserPlus, Check, Search, X } from "lucide-react";
import Image from "next/image";
import { UserCircle } from "lucide-react";

type User = {
  id: number;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
};

export default function FriendSearch({
  onClose,
  onFriendAdded,
}: {
  onClose?: () => void;
  onFriendAdded?: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<number | null>(null);

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/friends?type=search&q=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      if (data.users) {
        setSearchResults(data.users);
      } else if (data.error) {
        console.error("Search error:", data.error);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (profileId: number) => {
    setSending(profileId);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", friendId: profileId }),
      });

      if (res.ok) {
        setSearchResults((prev) => prev.filter((u) => u.id !== profileId));
        onFriendAdded?.();
      } else {
        const error = await res.json();
        console.error("Send request failed:", error);
      }
    } catch (error) {
      console.error("Send request failed:", error);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && searchUsers()}
          placeholder="Search by name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          onClick={searchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm transition-colors"
        >
          <Search size={16} />
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Searching...</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          <p className="text-xs text-gray-500 font-semibold mb-2">
            Search Results:
          </p>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.firstname}
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserCircle size={32} className="text-gray-500" />
                )}
                <span className="text-sm">
                  {user.firstname} {user.lastname}
                </span>
              </div>
              <button
                onClick={() => sendFriendRequest(user.id)}
                disabled={sending === user.id}
                className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {sending === user.id ? (
                  <Check size={20} />
                ) : (
                  <UserPlus size={20} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && !loading && searchQuery && (
        <div className="text-center py-8">
          <UserCircle size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">No users found</p>
          <p className="text-xs text-gray-400 mt-1">Try a different name</p>
        </div>
      )}

      {!searchQuery && !loading && searchResults.length === 0 && (
        <div className="text-center py-8">
          <UserPlus size={40} className="mx-auto text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm">
            Search for users to add as friends
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Enter a name above to get started
          </p>
        </div>
      )}
    </div>
  );
}

