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
    <>
      {/* Buttons */}
      <div className="absolute top-32 right-4 md:top-28 md:right-6 z-[50] pointer-events-auto flex flex-col gap-2">
        <button
          onClick={() => toggle("weather")}
          className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm shadow-md transition-colors
            ${mode === "weather"
              ? "bg-blue-500 text-white"
              : "bg-white text-zinc-950 hover:bg-gray-200 border border-zinc-200"
            }`}
        >
          Temperature
        </button>

        <button
          onClick={() => toggle("uv")}
          className={`px-3 py-1.5 md:px-5 md:py-2 rounded-full text-xs md:text-sm shadow-md transition-colors
            ${mode === "uv"
              ? "bg-blue-500 text-white"
              : "bg-white text-zinc-950 hover:bg-gray-200 border border-zinc-200"
            }`}
        >
          UV Index
        </button>
      </div>

      {/* Legends */}
      {mode !== "none" && (
        <>
          {/* Desktop Legend (Horizontal) */}
          <div className="hidden md:block absolute bottom-20 right-6 z-[50] pointer-events-auto bg-white/90 dark:bg-zinc-900/90 p-3 rounded-lg shadow-lg backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 w-48 transition-all">
            <p className="font-bold mb-2">
              {mode === "weather" ? "Temperature (°C)" : "UV Index"}
            </p>
            <div
              className="w-full h-3 rounded"
              style={{
                background: mode === "weather"
                  ? "linear-gradient(to right, #3982e0ff 0%, #34bce9ff 20%, #fdfd82ff 40%, #fdae61 65%, #f46d43 85%, #d73027 100%)"
                  : "linear-gradient(to right, #4dac26 0%, #4dac26 20%, #f1e71f 40%, #f77f00 60%, #d62728 80%, #6a0dad 100%)"
              }}
            />
            <div className="flex justify-between mt-1 opacity-80 text-[10px] font-medium">
              <span>{mode === "weather" ? "≤ 10°" : "0"}</span>
              <span>{mode === "weather" ? "17°" : "4"}</span>
              <span>{mode === "weather" ? "≥ 25°" : "8+"}</span>
            </div>
          </div>

          {/* Mobile Legend (Vertical) */}
          <div className="md:hidden absolute bottom-24 right-4 z-[50] pointer-events-auto bg-white/90 dark:bg-zinc-900/90 p-3 rounded-lg shadow-lg backdrop-blur-md border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-800 dark:text-zinc-200 transition-all flex flex-col">
            <p className="font-bold mb-2 text-center text-[10px]">
              {mode === "weather" ? "Temp (°C)" : "UV"}
            </p>
            <div className="flex flex-row h-32 items-stretch">
              <div
                className="w-3 rounded"
                style={{
                  background: mode === "weather"
                    ? "linear-gradient(to top, #3982e0ff 0%, #34bce9ff 20%, #fdfd82ff 40%, #fdae61 65%, #f46d43 85%, #d73027 100%)"
                    : "linear-gradient(to top, #4dac26 0%, #4dac26 20%, #f1e71f 40%, #f77f00 60%, #d62728 80%, #6a0dad 100%)"
                }}
              />
              <div className="flex flex-col justify-between ml-2 opacity-80 text-[10px] font-medium py-1">
                <span>{mode === "weather" ? "≥ 25°" : "8+"}</span>
                <span>{mode === "weather" ? "17°" : "4"}</span>
                <span>{mode === "weather" ? "≤ 10°" : "0"}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}