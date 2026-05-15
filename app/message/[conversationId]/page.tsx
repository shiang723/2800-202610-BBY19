"use client";

import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { UserCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, use } from "react";
import { createClientForClientComponent } from "@/lib/supabase/client";

type Message = {
  id: number;
  message_text: string;
  created_at: string;
  profile_id: number;
};

type MessagePageProps = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default function MessagePage({ params }: MessagePageProps) {
  const supabase = createClientForClientComponent();

  const { conversationId } = use(params);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [conversationId]);

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

    const { error } = await supabase
      .from("message")
      .insert({
        room_id: conversationId,
        profile_id: currentProfileId,
        message_text: messageText,
      })
      .select("id, message_text, created_at, profile_id")
      .single();

    if (error) {
      console.error("Could not send message:", error);
      setInputText(messageText);
      return;
    }
  };

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
                    <div className="flex items-start gap-2 w-full">
                      <Link href="#" className="shrink-0">
                        <UserCircle size={40} className="text-gray-700" />
                      </Link>

                      <div className="bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                        <p className="text-black">{msg.message_text}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 w-full justify-end">
                      <div className="ml-auto bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                        <p className="text-black">{msg.message_text}</p>
                      </div>

                      <Link href="#" className="shrink-0">
                        <UserCircle size={40} className="text-gray-700" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })
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