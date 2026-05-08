import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";
import SignoutBtn from "./SignoutBtn";
import Navbar from "./Navbar";
import NavigationButton from "./NavigationButton";
import SettingMenu from "./SettingMenu";
import MapFilterBtn from "./MapFilterBtn";

export default function HomeContainer({ userEmail }: { userEmail?: string }) {
    return (
        <main>
            <MapComponent />
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-3">
                <SearchBar />
                <div className="flex gap-2">
                    {["Parks", "Water", "Shade"].map((label) => (
                        <MapFilterBtn label={label}/>
                    ))}
                </div>
            </div>
            <SettingMenu/>
            <NavigationButton/>
            <SignoutBtn userEmail={userEmail}/>
            <Navbar />
        </main >
    );
}
