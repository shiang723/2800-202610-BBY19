import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";
import { signOut } from "@/actions/auth";
import SignoutBtn from "./SignoutBtn";
import Navbar from "./Navbar";
import NavigationButton from "./NavigationButton";
import SettingMenu from "./SettingMenu";

export default function HomeContainer({ userEmail }: { userEmail?: string }) {
    return (
        <main>
            <MapComponent />
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
            <SettingMenu/>
            <NavigationButton/>
            <div>
                <p>
                    Status:{" "}
                    {userEmail
                        ? "User is authenticated. User email: " + userEmail
                        : "User is not authenticated."}
                </p>
                <SignoutBtn userEmail={userEmail}/>
            </div>
            <Navbar />
        </main >
    );
}
