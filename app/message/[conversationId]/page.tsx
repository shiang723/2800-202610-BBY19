"use client";

import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, use, useMemo } from "react";
import { createClientForClientComponent } from "@/lib/supabase/client";

type Message = {
  id: number;
  message_text: string;
  created_at: string;
  profile_id: number;
};

type SenderProfile = {
  firstname: string;
  lastname: string;
  avatar_url: string | null;
};

type MessagePageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

const BOT_PROFILE_ID = Number(process.env.NEXT_PUBLIC_AI_BOT_PROFILE_ID);

export default function MessagePage({ params }: MessagePageProps) {
  const supabase = useMemo(() => createClientForClientComponent(), []);

  const { conversationId } = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [isBotRoom, setIsBotRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [botThinking, setBotThinking] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState<
    Record<number, SenderProfile>
  >({});

  useEffect(() => {
    async function loadMessages() {
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

      setCurrentProfileId(profile.id);

      const { data: roomMembers, error: roomMembersError } = await supabase
        .from("chat_member")
        .select(`
          profile_id,
          profile (
            firstname,
            lastname,
            avatar_url
          )
        `)
        .eq("room_id", conversationId);

      if (roomMembersError) {
        console.error("Could not load room members:", roomMembersError);
      } else {
        const profileMap: Record<number, SenderProfile> = {};

        roomMembers?.forEach((member: any) => {
          if (member.profile) {
            profileMap[member.profile_id] = {
              firstname: member.profile.firstname,
              lastname: member.profile.lastname,
              avatar_url: member.profile.avatar_url,
            };
          }
        });

        setSenderProfiles(profileMap);

        const roomHasBot = roomMembers?.some(
          (member: any) => member.profile_id === BOT_PROFILE_ID
        );

        setIsBotRoom(!!roomHasBot);
      }

      const { data, error } = await supabase
        .from("message")
        .select("id, message_text, created_at, profile_id")
        .eq("room_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Could not load messages:", error);
        setLoading(false);
        return;
      }

      setMessages(data || []);
      setLoading(false);
    }

    loadMessages();
  }, [conversationId, supabase]);

  useEffect(() => {
    const channel = supabase
      .channel(`room-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `room_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;

          setMessages((currentMessages) => {
            const alreadyExists = currentMessages.some(
              (message) => message.id === newMessage.id
            );

            if (alreadyExists) {
              return currentMessages;
            }

            return [...currentMessages, newMessage];
          });

          if (newMessage.profile_id === BOT_PROFILE_ID) {
            setBotThinking(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !currentProfileId) return;

    const messageText = inputText.trim();
    setInputText("");

    const { error } = await supabase.from("message").insert({
      room_id: conversationId,
      profile_id: currentProfileId,
      message_text: messageText,
    });

    if (error) {
      console.error("Could not send message:", error);
      setInputText(messageText);
      return;
    }

    if (isBotRoom) {
      try {
        setBotThinking(true);

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: conversationId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Chatbot API error:", errorData);
          setBotThinking(false);
        }
      } catch (error) {
        console.error("Could not contact chatbot:", error);
        setBotThinking(false);
      }
    }
  };

  function isBotProfile(profileId: number) {
    return profileId === BOT_PROFILE_ID;
  }

  function renderAvatar(profileId: number) {
    const senderProfile = senderProfiles[profileId];

    if (senderProfile?.avatar_url) {
      return (
        <Image
          src={senderProfile.avatar_url}
          alt={`${senderProfile.firstname} ${senderProfile.lastname}`}
          width={40}
          height={40}
          className="rounded-full object-cover shrink-0"
        />
      );
    }

    return <UserCircle size={40} className="text-gray-700" />;
  }

  function getSenderName(profileId: number) {
    const senderProfile = senderProfiles[profileId];

    if (!senderProfile) {
      return "Unknown User";
    }

    return `${senderProfile.firstname} ${senderProfile.lastname}`;
  }

  return (
    <main className="pt-5 bg-gray-100 min-h-screen flex flex-col">
      {/* top area for arrow and search bar */}
      <div className="pt-1 pl-3 pr-3 flex items-center gap-3">
        <div className="pt-1 pr-3 flex items-center gap-1">
          <Link
            href="/chat"
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors shrink-0 inline-flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
        </div>

        <div className="w-full">
          <SearchBar />
        </div>
      </div>

      {/* chat messages */}
      <div className="flex-1 mt-5 px-4 overflow-y-auto pb-24">
        <div className="flex flex-col gap-4">
          {loading ? (
            <p className="text-gray-600">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-600">No messages yet.</p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.profile_id === currentProfileId;

              return (
                <div key={msg.id} className="w-full">
                  {!isMine ? (
                    <div className="w-full">
                      <div className="ml-12 mb-1 flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-600">
                          {getSenderName(msg.profile_id)}
                        </span>

                        {isBotProfile(msg.profile_id) && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            BOT
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-2 w-full">
                        <Link href="#" className="shrink-0">
                          {renderAvatar(msg.profile_id)}
                        </Link>

                        <div className="bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                          <p className="text-black whitespace-pre-line">
                            {msg.message_text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="mr-12 mb-1 flex items-center justify-end gap-2">
                        <span className="text-xs font-semibold text-gray-600">
                          {getSenderName(msg.profile_id)}
                        </span>

                        {isBotProfile(msg.profile_id) && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            BOT
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-2 w-full justify-end">
                        <div className="ml-auto bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                          <p className="text-black whitespace-pre-line">
                            {msg.message_text}
                          </p>
                        </div>

                        <Link href="#" className="shrink-0">
                          {renderAvatar(msg.profile_id)}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {botThinking && (
            <div className="w-full">
              <div className="ml-12 mb-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">
                  {getSenderName(BOT_PROFILE_ID)}
                </span>

                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  BOT
                </span>
              </div>

              <div className="flex items-start gap-2 w-full">
                {renderAvatar(BOT_PROFILE_ID)}

                <div className="bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                  <p className="text-gray-500">AI Assistant is typing...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* type message */}
      <div className="fixed bottom-0 left-0 right-0 bg-white">
        <form onSubmit={handleSend} className="p-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 pl-3 pr-3 py-2 border border-gray-400 w-full rounded-full"
            />

            <button
              type="submit"
              className="ml-auto text-white p-2 bg-blue-500 rounded-full hover:bg-blue-600 active:bg-blue-700"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}