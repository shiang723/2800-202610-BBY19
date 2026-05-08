"use client"

export default function MapFilterBtn({label} : {label:string}) {
    return (
        <button
            key={label}
            className="px-4 py-1.5 bg-white rounded-full text-sm font-medium shadow-md text-zinc-950 hover:bg-gray-200"
        >
            {label}
        </button>
    )
}