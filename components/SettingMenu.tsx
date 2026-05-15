"use client";
import { Settings } from "lucide-react";

export default function SettingMenu() {
  function handleSettingMenu() {
    const settingMenu = document.getElementById(
      "settings-menu",
    ) as HTMLDialogElement | null;
    settingMenu?.showModal();
  }

  return (
    <div className="absolute bottom-28 left-4 z-10">
      <button
        onClick={() => {
          handleSettingMenu();
        }}
        className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200"
      >
        <Settings size={20} className="text-zinc-950" />
      </button>
    </div>
  );
}
