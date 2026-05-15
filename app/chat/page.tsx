"use client";

import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClientForClientComponent } from "@/lib/supabase/client";

type ChatPreview = {
  id: string;
  name: string;
  avatar_url: string | null;
  last_message: string;
  updated_at: string;
};

function formatMessageTime(timestamp: string | null) {
  if (!timestamp) return "";

  return new Date(timestamp + "Z").toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Chat() {
  const supabase = createClientForClientComponent();

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadConversations() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not logged in:", userError);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profile")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile not found:", profileError);
        setLoading(false);
        return;
      }

      const currentProfileId = profile.id;

      const { data, error } = await supabase
        .from("chat_member")
        .select(`
          room_id,
          room (
            id,
            updated_at,
            message (
              id,
              message_text,
              created_at,
              profile_id
            ),
            chat_member (
              profile_id,
              profile (
                id,
                firstname,
                lastname,
                avatar_url
              )
            )
          )
        `)
        .eq("profile_id", currentProfileId);

      if (error) {
        console.error("Could not load conversations:", error);
        setLoading(false);
        return;
      }

      const formattedChats =
        data?.map((row: any) => {
          const conversation = row.room;

          const otherMember = conversation.chat_member.find(
            (member: any) => member.profile_id !== currentProfileId
          );

          const latestMessage = conversation.message?.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];

          return {
            id: conversation.id,
            name: otherMember?.profile
              ? `${otherMember.profile.firstname} ${otherMember.profile.lastname}`
              : "Unknown User",
            avatar_url: otherMember?.profile?.avatar_url ?? null,
            last_message: latestMessage?.message_text ?? "No messages yet",
            updated_at: latestMessage?.created_at ?? conversation.updated_at,
          };
        }) ?? [];

      setChats(formattedChats);
      setLoading(false);
    }

    loadConversations();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <main className="bg-gray-100 min-h-screen">
      <div>
        <div className="pt-5 pl-3 pr-3 relative w-full">
          <div ref={dropdownRef} className="relative w-full">
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 w-full" onClick={() => setOpen(!open)}>
                <SearchBar />
              </div>

              {open && (
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors shrink-0"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              )}
            </div>

            {open && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                {loading ? (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    Loading conversations...
                  </p>
                ) : chats.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-500">
                    No conversations found.
                  </p>
                ) : (
                  chats.map((chat) => (
                    <Link
                      key={chat.id}
                      href={`/message/${chat.id}`}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center">
                        {chat.avatar_url ? (
                          <Image
                            src={chat.avatar_url}
                            alt={chat.name}
                            width={28}
                            height={28}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle size={28} className="text-gray-700" />
                        )}
                      </div>

                      <span className="ml-2 text-gray-800 text-sm">
                        {chat.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mt-5 bg-gray-200 rounded-xl overflow-hidden transition-colors duration-200">
            <ul className="text-black">
              {loading ? (
                <p className="p-5 text-gray-600">Loading conversations...</p>
              ) : chats.length === 0 ? (
                <p className="p-5 text-gray-600">No conversations yet.</p>
              ) : (
                chats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/message/${chat.id}`}
                    className="flex items-center w-full px-5 py-3"
                  >
                    <li className="flex pb-5 w-full">
                      {chat.avatar_url ? (
                        <Image
                          src={chat.avatar_url}
                          alt={chat.name}
                          width={40}
                          height={40}
                          className="mt-5 rounded-full object-cover shrink-0 mr-2"
                        />
                      ) : (
                        <UserCircle
                          size={40}
                          className="mt-5 text-gray-700 shrink-0 mr-2"
                        />
                      )}

                      <div className="hover:bg-gray-100 bg-gray-200 px-4 py-2 rounded-xl w-full mt-5">
                        <p className="font-bold text-gray-700">{chat.name}</p>
                        <p className="text-gray-600 text-sm mt-1">
                          {chat.last_message}
                        </p>
                      </div>
                    </li>

                    <span className="ml-auto px-4 text-xs text-gray-500 shrink-0">
                      {formatMessageTime(chat.updated_at)}
                    </span>
                  </Link>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <Navbar />
    </main>
  );
}