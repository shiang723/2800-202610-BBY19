"use client";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import Image from "next/image";
import { UserCircle, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            {/* SearchBar + sign out sign */}
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
                {" "}
                {/* A category */}
                <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                  A
                </div>
                <Link
                  href="/profile-friend"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src="/anna.jpg"
                      alt="Anna"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-sm">Anna White</span>
                </Link>
                <Link
                  href="/profile-friend"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src="/andy.jpg"
                      alt="andy"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-sm">Andy Flint</span>
                </Link>
                <div className="bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500">
                  B
                </div>
                <Link
                  href="/profile-friend"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src="/bob.jpg"
                      alt="bob"
                      width={28}
                      height={28}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <span className="ml-2 text-gray-800 text-sm">Bob Alfred</span>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-5 bg-gray-200 rounded-xl overflow-hidden transition-colors duration-200">
            <ul className="text-black">
              <Link
                href="/message"
                className="flex items-center w-full px-5 py-3"
              >
                <li className="flex pb-5">
                  <UserCircle
                    size={40}
                    className="mt-5 text-gray-700 shrink-0 mr-2"
                  />
                  <div className="hover:bg-gray-100 bg-gray-200 px-4 py-2 rounded-xl w-full mt-5">
                    <p className="font-bold text-gray-700">Jenny</p>
                    <p className="text-gray-600 text-sm mt-1">
                      We should go to this park!
                    </p>
                  </div>
                </li>
                <span className="ml-auto px-4 text-xs text-gray-500 shrink-0">
                  7:30
                </span>
              </Link>
              <Link href="/" className="flex items-center w-full px-5 py-3">
                <li className="flex pb-5">
                  <UserCircle
                    size={40}
                    className="mt-5 text-gray-700 shrink-0 mr-2"
                  />

                  <div className="hover:bg-gray-100 bg-gray-200 px-4 py-2 rounded-xl w-full mt-5">
                    <p className="font-bold text-gray-700">Tommy</p>
                    <p className="text-gray-600 text-sm mt-1">
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
