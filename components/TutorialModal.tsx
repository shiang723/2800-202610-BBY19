'use client'

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
}: TutorialModalProps) {

    // Create a reference for the current modal
    const currentModal = useRef<HTMLDialogElement>(null);

    // Handler for the Next or Done button on Click action.
    function handleNext() {
        currentModal.current?.close();
        if (!last) {
            const nextModal = document.getElementById(nextLocation) as HTMLDialogElement | null;
            nextModal?.showModal();
        }

    }

    // Handler for the Back button on Click action.
    function handleBack() {
        currentModal.current?.close();
        const lastModal = document.getElementById(lastLocation) as HTMLDialogElement | null;
        lastModal?.showModal();
    }

    // Tailiwind className attribute values for the buttons.
    const backButtonClass = (first) ? " hidden" : "bg-gray-200 hover:bg-gray-300 text-black rounded-lg p-2 pl-4 pr-4 mt-5";
    const nextButtonText = (last) ? "Done" : "Next";
    const skipButtonClass = (last) ? "hidden" : "flex justify-self-end bg-gray-400 text-white rounded-lg p-1 pl-4 pr-4 mb-5 hover:bg-gray-500";

    // The HTML layout and elements of the Tutorial Modal.
    return (
        <div>
            <dialog ref={currentModal} id={id} className="rounded-lg p-7 fixed place-self-center max-w-100 max-h-200 flex-auto">
                <button onClick={() => { currentModal.current?.close() }} className={skipButtonClass}>Skip</button>
                <h2 className="text-center text-xl">{header}</h2>
                <Image src={icon} alt="sun" width={Number(iconWidth)}
                    height={Number(iconHeight)} className="place-self-center m-2" />
                <p className="text-center m-2" >{message}</p>
                <p className="text-center text-sm mt-5">Step {currStep} of {numSteps}</p>
                <div className="flex flex-row justify-end gap-x-50">
                    <button onClick={() => { handleBack() }} className={backButtonClass}>Back</button>
                    <button onClick={() => { handleNext() }} className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg p-2 pl-4 pr-4 mt-5" autoFocus={true}>{nextButtonText}</button>
                </div>
            </dialog >
        </div >
    );
}