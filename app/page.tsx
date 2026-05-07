import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden">
      
      <SearchBar />

      <MapComponent />

    </main>
  );
}