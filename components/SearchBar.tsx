"use client";
import ProfileIcon from "./ProfileIcon";
import Link from "next/link";

export default function SearchBar() {
  return (
    <div className="flex items-center bg-white rounded-full shadow-md px-3 py-2 gap-3">
      <ProfileIcon size={32} className="text-gray-700 shrink-0" />
      <div id="geocoderContainer"></div>
    </div>
  );
}
