"use client";

export type HeatmapMode = "weather" | "uv" | "none";

interface WeatherToggleBtnsProps {
  mode: HeatmapMode;
  onModeChange: (mode: HeatmapMode) => void;
  weatherData?: { temp: number; uv: number } | null;
}

// WeatherUvBtns.tsx
export default function WeatherToggleBtns({
  mode,
  onModeChange,
}: WeatherToggleBtnsProps) {
  const toggle = (selected: "weather" | "uv") => {
    onModeChange(mode === selected ? "none" : selected);
  };

  return (
    /* flex-col on mobile to save horizontal space, flex-row on desktop */
    <div className="flex flex-col gap-2">
      <button
        onClick={() => toggle("weather")}
        className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm shadow-md 
          ${mode === "weather" 
            ? "bg-blue-500 text-white" 
            : "bg-white text-zinc-950 hover:bg-gray-200 border border-zinc-200"
          }`}
      >
        Temperature
      </button>

      <button
        onClick={() => toggle("uv")}
        className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm shadow-md
          ${mode === "uv" 
            ? "bg-blue-500 text-white" 
            : "bg-white text-zinc-950 hover:bg-gray-200 border border-zinc-200"
          }`}
      >
        UV Index
      </button>
    </div>
  );
}