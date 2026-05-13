"use client";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import Image from "next/image";
import { UserCircle } from "lucide-react";
import { useState } from "react";

export default function Chat() {
  // add dropdown menu
  const [open, setOpen] = useState(false);

  return (
    //search bar and intial people
    <main className="bg-gray-100 min-h-screen">
      <div>
        <div className="pt-5 pl-3 pr-3 relative">
          <div onClick={() => setOpen(true)}>
            <SearchBar />
            <div />

            {open && (
              <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                {/* A category */}
                <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                  A
                </div>
                <Link
                  href="/message"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {/* 28px size icon */}
                  <div className="w-3 h-3 rounded-full overflow-hidden">
                    <Image
                      src="/anna.jpg"
                      alt="Anna"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-s">Anna White</span>
                </Link>

                <Link
                  href="/message"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {/* 28px size icon */}
                  <div className="w-3 h-3 rounded-full overflow-hidden">
                    <Image
                      src="/andy.jpg"
                      alt="andy"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-s">Andy Flint</span>
                </Link>

                {/* B category */}
                <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                  B
                </div>

                <Link
                  href="/message"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {/* 28px size icon */}
                  <div className="w-3 h-3 rounded-full overflow-hidden">
                    <Image
                      src="/bob.jpg"
                      alt="bob"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-s">Bob Alfred</span>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-5 bg-blue-200 hover:bg-white rounded-xl overflow-hidden transition-colors duration-200">
            <ul className="ml-5 text-black">
              <Link
                href="/message"
                className="flex items-center w-full px-5 py-3"
              >
                <li className="flex pb-5">
                  <UserCircle
                    size={40}
                    className="mt-5 text-gray-700 shrink-0 mr-2"
                  />
                  <div className="bg-gray-200 px-4 py-2 rounded-xl border max-w-[75%] mt-5">
                    <p>Jenny</p>
                    <p>We should go to this park!</p>
                  </div>
                </li>
                <span className="ml-auto px-4 text-xs text-gray-500 shrink-0">
                  7:30
                </span>
              </Link>
              <Link
                href="/" //example to main page to test if this is sapareted from first chat.
                className="flex items-center w-full px-5 py-3"
              >
                <li className="flex pb-5">
                  <UserCircle
                    size={40}
                    className="text-gray-700 shrink-0 mr-2"
                  />
                  <div className="bg-gray-200 px-4 py-2 rounded-xl border max-w-[75%] mt-5">
                    <p>Tommy</p>
                    <p>
                      Want to go on walk here? The rose garden is in bloom now.
                    </p>
                  </div>
                </li>
                <span className="ml-auto px-4 text-xs text-gray-500 shrink-0">
                  14:30
                </span>
              </Link>
            </ul>
          </div>
        </div>
      </div>
      <Navbar />
    </main>
  );
}
