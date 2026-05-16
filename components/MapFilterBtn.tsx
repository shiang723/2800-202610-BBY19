"use client"

export default function MapFilterBtn({ label, onClick, isActive }: 
    { label: string; onClick: () => void; isActive: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-md 
            ${isActive ? "bg-blue-500 text-white" : "bg-white text-zinc-950 hover:bg-gray-200"}`}
        >
            {label}
        </button>
    )
}