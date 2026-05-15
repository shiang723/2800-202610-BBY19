"use client"
import { Navigation } from "lucide-react"

export default function NavigationButton() {
    return (
        <div className="absolute bottom-24 right-4 z-10">
            <button
                onClick={() => window.dispatchEvent(new CustomEvent("trigger-navigation"))}
                className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200"
            >
                <Navigation size={20} className="text-zinc-950" />
            </button>
        </div>
    )
}