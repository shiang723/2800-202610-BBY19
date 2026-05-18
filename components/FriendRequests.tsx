// components/FriendRequests.tsx
"use client";

import { useState, useEffect } from "react";
import { Check, X, UserPlus, UserCircle } from "lucide-react";
import { createClientForClientComponent } from "@/lib/supabase/client";
import Image from "next/image";

const supabase = createClientForClientComponent();

type PendingRequest = {
  id: number;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
};

export default function FriendRequests({
  onRequestHandled,
}: {
  onRequestHandled?: () => void;
}) {
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriendRequests = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("friendship")
        .select(
          `
          id,
          sender_profile!sender_id (id, firstname, lastname, avatar_url)
        `,
        )
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (error) throw error;

      const formatted =
        data?.map((item) => ({
          id: item.id,
          firstname: item.sender_profile.firstname,
          lastname: item.sender_profile.lastname,
          avatar_url: item.sender_profile.avatar_url,
        })) || [];

      setRequests(formatted);
    } catch (err) {
      console.error("Load requests failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriendRequests();
  }, []);

  const handleRequest = async (
    requestId: number,
    action: "accept" | "reject",
  ) => {
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, friendId: requestId }),
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        if (action === "accept") {
          window.dispatchEvent(new Event("friendAccepted"));
        }
        onRequestHandled?.();
      }
    } catch (error) {
      console.error(`${action} failed:`, error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">Loading requests...</div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No pending friend requests</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-2">
        {requests.map((req) => (
          <div
            key={req.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {req.avatar_url ? (
                <Image
                  src={req.avatar_url}
                  alt={req.firstname}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <UserCircle size={40} className="text-gray-400" />
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {req.firstname} {req.lastname}
                </p>
                <p className="text-xs text-gray-500">Wants to be friends</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleRequest(req.id, "accept")}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                title="Accept"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleRequest(req.id, "reject")}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Reject"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
