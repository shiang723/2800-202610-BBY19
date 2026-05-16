"use client";
import { useRef } from "react";

export default function Setting({
  tutorialOn = true,
  setTutorialOn,
}: {
  tutorialOn: boolean;
  setTutorialOn: (val: boolean) => void;
}) {
  const settingsRef = useRef<HTMLDialogElement>(null);
  function handleClose() {
    settingsRef.current?.close();
  }

  return (
    <dialog
      ref={settingsRef}
      id="settings-menu"
      className="rounded-xl p-5 fixed place-self-center max-w-90 max-h-9.9/10"
    >
      <div className="flex flex-col gap-4 p-6">
        If box is checked tutorial will stay on. Uncheck to turn off tutorial:
        <div className="flex flex-row gap-5">
          <label>Tutorial:</label>
          <input
            type="checkbox"
            name="tutorialOn"
            checked={tutorialOn}
            onChange={(e) => setTutorialOn(e.target.checked)}
          />
        </div>
        <button
          onClick={() => {
            handleClose();
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg p-2 pl-4 pr-4 "
        >
          Exit
        </button>
      </div>
    </dialog>
  );
}
