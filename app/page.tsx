import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    /* We use 'relative' so the SearchBar can float 'absolute' on top of the map */
    <main className="relative h-screen w-full overflow-hidden">
      
      {/* Task: Create the search bar component (image_bcdf75.png) */}
      <SearchBar />

      {/* Task: Implement MapLibre map API (image_bcdf75.png) */}
      {/* Task: Implement shadow simulator (image_bcdf51.png) */}
      <MapComponent />

      {/* Basic UI Overlay for project info */}
      <div className="absolute bottom-6 left-6 z-10 bg-white/80 p-4 rounded-xl shadow-lg backdrop-blur-md dark:bg-black/80">
        <h1 className="text-xl font-bold">Vancouver Shadow Simulator</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">BBY-19 Project - Dev Branch</p>
      </div>

    </main>
  );
}