'use client'
import { useEffect } from "react";
import TutorialModal from "./TutorialModal";
export function WelcomeTutorial({ open }: { open: boolean }) {

    useEffect(() => {
        if (open) {
            const firstModal = document.getElementById("first-page") as HTMLDialogElement | null;
            firstModal?.showModal();
        }
    }, [open])
    return (
        <div>
            <TutorialModal
                id="first-page"
                header="Welcome to Vancooler"
                message="Thank you for signing up! Here is a short tutorial to help get you started!"
                icon="/sun.svg"
                nextLocation="second-page"
                first={true}
                currStep="1"
                numSteps="3" />
            <TutorialModal
                id="second-page"
                header="Shade Map"
                message="Thank you for signing up! Here is a short tutorial to help get you started!"
                icon="/sun.svg"
                nextLocation="last-page"
                lastLocation="first-page"
                currStep="2"
                numSteps="3" />
            <TutorialModal
                id="last-page"
                header="You're All Set"
                message="Thank you for signing up! Here is a short tutorial to help get you started!"
                icon="/sun.svg"
                lastLocation="second-page"
                last={true}
                currStep="3"
                numSteps="3" />
        </div>
    );

}
