// components/FriendPanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Users, X, UserPlus } from "lucide-react";
import FriendRequests from "./FriendRequests";
import FriendSearch from "./FriendSearch";

export default function FriendPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // check incoming friend request
  const checkPendingRequests = async () => {
    try {
      const res = await fetch("/api/friends?type=pending");
      const data = await res.json();
      setHasPendingRequests(data.pending?.length > 0);
    } catch (error) {
      console.error("Check pending failed:", error);
    }
  };

  // click outside area to cloase
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // listen friend accepted event
  useEffect(() => {
    const handleFriendAccepted = () => {
      checkPendingRequests();
    };

    window.addEventListener("friendAccepted", handleFriendAccepted);
    return () =>
      window.removeEventListener("friendAccepted", handleFriendAccepted);
  }, []);

useEffect(() => {
  const load = async () => {
    if (isOpen) await checkPendingRequests()
  }
  load()
}, [isOpen])

  return (
    <div ref={panelRef} className="relative">
      {/* button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="relative p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
      >
        <Users size={20} className="text-gray-500" />
        {hasPendingRequests && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* pop up board */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden"
        >
          <div className="flex border-b border-gray-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddFriend(false);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                !showAddFriend
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Requests
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAddFriend(true);
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                showAddFriend
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Add Friend
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-3 py-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4">
            {!showAddFriend ? (
              <FriendRequests
                onRequestHandled={() => {
                  checkPendingRequests();
                }}
              />
            ) : (
              <FriendSearch
                onClose={() => setIsOpen(false)}
                onFriendAdded={() => {
                  setIsOpen(false);
                  setShowAddFriend(false);
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
