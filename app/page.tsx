import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";
import { Settings, Navigation } from "lucide-react";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      <MapComponent />

      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-3">
        <SearchBar />
        <div className="flex gap-2">
          {["Parks", "Water", "Shade"].map((label) => (
            <button
              key={label}
              className="px-4 py-1.5 bg-white rounded-full text-sm font-medium shadow-md hover:bg-gray-100 transition"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 z-10">
        <button className="w-11 h-11 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition">
          <Settings size={20} className="text-white" />
        </button>
      </div>
      <div className="absolute bottom-24 right-4 z-10">
        <button className="w-11 h-11 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition">
          <Navigation size={20} className="text-white" />
        </button>
      </div>
    </main>
  );
}
