"use client";

import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { UserCircle } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi Mia, I am going to David Park today. Would you like to come?",
      isMine: false,
    },
    { id: 2, text: "Sure! Can you share the location with me?", isMine: true },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages([
      ...messages,
      { id: Date.now(), text: inputText, isMine: true },
    ]);
    setInputText("");
  };

  return (
    // block for search bar and arrow
    <main className="pt-5 bg-gray-100 min-h-screen flex flex-col">
      {/* top area for arrow and search bar */}
      <div className="pt-1 pl-3 pr-3 flex items-center gap-3">
        <div className="pt-1 pl- pr-3 flex items-center gap-1">
          <Link
            href="/chat"
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors shrink-0 inline-flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
        </div>

        {/* top search bar */}
        <div className="w-full">
          <SearchBar />
        </div>
      </div>

      {/* chat message- align left and right  */}
      <div className="flex-1 mt-5 px-4 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full">
              {/* contact message: icon on left  */}
              {!msg.isMine ? (
                <div className="flex items-start gap-2 w-full">
                  <Link href="#" className="shrink-0">
                    <UserCircle size={40} className="text-gray-700" />
                  </Link>
                  <div className="bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                    <p className="text-black">{msg.text}</p>
                  </div>
                </div>
              ) : (
                // my message: icon on right
                <div className="flex items-start gap-2 w-full justify-end">
                  <div className="ml-auto bg-gray-200 px-4 py-2 rounded-xl border border-gray-300 max-w-[75%]">
                    <p className="text-black">{msg.text}</p>
                  </div>
                  <Link href="#" className="shrink-0">
                    <UserCircle size={40} className="text-gray-700" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Type message */}
      <div className="fixed bottom-0 left-0 right-0 bg-white ">
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
