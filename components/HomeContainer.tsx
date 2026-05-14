"use client";
import { useState} from "react";

import MapComponent from "@/components/MapComponent";
import SearchBar from "@/components/SearchBar";
import SignoutBtn from "./SignoutBtn";
import Navbar from "./Navbar";
import NavigationButton from "./NavigationButton";
import SettingMenu from "./SettingMenu";
import MapFilterBtn from "./MapFilterBtn";

export default function HomeContainer({ userEmail }: { userEmail?: string }) {
    const [activeFilter, setActiveFilter] = useState<string[]>([]);

    return (
        <main>
            <MapComponent activeFilter={activeFilter}/>
            <div className="absolute top-0 left-0 right-0 z-10 p-4 flex flex-col gap-3">
                <SearchBar />
                <div className="flex gap-2">
                    {["Parks", "Centres", "Fountains", "Washrooms", "Cafes"].map((label) => (
                        <MapFilterBtn 
                            key={label} 
                            label={label} 
                            isActive = {activeFilter.includes(label)}
                            // From Copilot. Grabs the current (previous) active filters and adds or removes the clicked filter from the list. 
                            onClick = {() => {
                                setActiveFilter( (prev) => {
                                    if (prev.includes(label)) {
                                        return prev.filter((f) => f !== label);
                                    } else {
                                        return [...prev, label];
                                    }
                                });
                            }}
                        />
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
