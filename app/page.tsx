import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";
import { Settings, Navigation } from "lucide-react";
import { createClientForServerComponent } from "@/lib/supabase/server";
import { signOut } from "@/actions/auth";
import { WelcomeTutorial } from "@/components/WelcomeTutorial";
import Navbar from "@/components/Navbar";

export default async function Home() {
  const supabase = await createClientForServerComponent();
  const data = await supabase.auth.getUser();
  const user = data.data.user;

  return (
    <main>
      <MapComponent />
      <WelcomeTutorial open={true} />

      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-3">
        <SearchBar />
        <div className="flex gap-2">
          {["Parks", "Water", "Shade"].map((label) => (
            <button
              key={label}
              className="px-4 py-1.5 bg-white rounded-full text-sm font-medium shadow-md text-zinc-950 hover:bg-gray-200"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-24 left-4 z-10">
        <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200">
          <Settings size={20} className="text-zinc-950" />
        </button>
      </div>
      <div className="absolute bottom-24 right-4 z-10">
        <button className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200">
          <Navigation size={20} className="text-zinc-950" />
        </button>
      </div>

      <div>
        <p>
          Status:{" "}
          {user
            ? "User is authenticated. User email: " + user.email
            : "User is not authenticated."}
        </p>
        <button
          onClick={signOut}
          className={
            user
              ? "p-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              : "hidden"
          }
        >
          Logout
        </button>
      </div>
      <Navbar />
    </main>
  );
}
