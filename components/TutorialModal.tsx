"use client";

import Image from "next/image";
import { useRef } from "react";

//Props for the Tutorial Modal
interface TutorialModalProps {
  id: string;
  header: string;
  icon: string;
  iconHeight?: string;
  iconWidth?: string;
  nextLocation?: string;
  message: string;
  lastLocation?: string;
  currStep?: string;
  numSteps?: string;
  first?: boolean;
  last?: boolean;
  onTutorialComplete?: () => void;
}

//Tutorial Modal used for Welcome Tutorial
export default function TutorialModal({
  id,
  header,
  icon,
  iconHeight = "40",
  iconWidth = "40",
  nextLocation = "",
  lastLocation = "",
  message,
  currStep = "1",
  numSteps = "1",
  first = false,
  last = false,
  onTutorialComplete,
}: TutorialModalProps) {
  // Create a reference for the current modal
  const currentModal = useRef<HTMLDialogElement>(null);

  // Handler for closing the tutorial (skip or done)
  function handleCloseTutorial() {
    currentModal.current?.close();
    if (onTutorialComplete) {
      onTutorialComplete();
    }
  }

  // Handler for the Next or Done button on Click action.
  function handleNext() {
    currentModal.current?.close();
    //   if (!last) {
    //     const nextModal = document.getElementById(
    //       nextLocation,
    //     ) as HTMLDialogElement | null;
    //     nextModal?.showModal();
    //   }

    // }
    if (last) {
      if (onTutorialComplete) {
        onTutorialComplete();
      }
    } else {
      // Open next modal
      const nextModal = document.getElementById(
        nextLocation,
      ) as HTMLDialogElement | null;
      nextModal?.showModal();
    }
  }

  // Handler for Skip button
  function handleSkip() {
    currentModal.current?.close();
    // When skipping, close all and notify completion
    if (onTutorialComplete) {
      onTutorialComplete();
    }
  }

  // Handler for the Back button on Click action.
  function handleBack() {
    currentModal.current?.close();
    const lastModal = document.getElementById(
      lastLocation,
    ) as HTMLDialogElement | null;
    lastModal?.showModal();
  }

  const backButtonClass = first
    ? " hidden"
    : "bg-blue-200 hover:bg-blue-300 text-black rounded-lg p-2 pl-4 pr-4";
  const nextButtonText = last ? "Done" : "Next";
  const skipButtonClass = last
    ? "hidden"
    : "flex justify-self-end bg-blue-400 text-white rounded-lg p-1 pl-4 pr-4 mb-1 hover:bg-blue-500";

  // The HTML layout and elements of the Tutorial Modal.
  return (
    <div>
      <dialog
        ref={currentModal}
        id={id}
        className="rounded-xl pt-6 p-5 fixed place-self-center max-w-90 max-h-9.9/10 flex-auto"
      >
        {!first && (
          <button onClick={handleSkip} className={skipButtonClass}>
            Skip
          </button>
        )}
        <h2 className="text-center text-xl">{header}</h2>
        <Image
          src={icon}
          alt="sun"
          width={Number(iconWidth)}
          height={Number(iconHeight)}
          className="place-self-center mt-2 mb-2"
        />
        <p className="text-center mt-2 mb-2">{message}</p>
        <p className="text-center text-sm mt-5">
          Step {currStep} of {numSteps}
        </p>
        <div className="flex flex-row justify-between">
          <button
            onClick={() => {
              handleBack();
            }}
            className={backButtonClass}
          >
            Back
          </button>
          <button
            onClick={() => {
              handleNext();
            }}
            className="bg-blue-500 hover:bg-blue-400 text-white rounded-lg p-2 pl-4 pr-4 ml-auto"
            autoFocus={true}
          >
            {nextButtonText}
          </button>
        </div>
      </dialog>
    </div>
  );
}
