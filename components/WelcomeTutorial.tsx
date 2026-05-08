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
                numSteps="5" />
            <TutorialModal
                id="second-page"
                header="Turn Tutorials Off"
                message="To turn off these tutorials, navigate to the Settings menu and toggle off tutorials."
                icon="/tutorialMenu.png"
                iconHeight="250"
                iconWidth="260"
                nextLocation="third-page"
                lastLocation="first-page"
                currStep="2"
                numSteps="5" />
            <TutorialModal
                id="third-page"
                header="Shade Map"
                message="Here is our Home page. It shows a shade map of Vancouver."
                icon="/HomeMap.png"
                iconHeight="250"
                iconWidth="260"
                nextLocation="fourth-page"
                lastLocation="second-page"
                currStep="3"
                numSteps="5" />
            <TutorialModal
                id="fourth-page"
                header="Shade Map Near Me"
                message="Press the bottom right `Go to my location` button to show the shade map of you current location."
                icon="/tutorialpg2.png"
                iconHeight="250"
                iconWidth="260"
                nextLocation="last-page"
                lastLocation="third-page"
                currStep="4"
                numSteps="5" />
            <TutorialModal
                id="last-page"
                header="You're All Set"
                message="That is the end of the tutorial. Click the Done button to continue to the app."
                icon="/sun.svg"
                lastLocation="fourth-page"
                last={true}
                currStep="5"
                numSteps="5" />
        </div>
    );

}
