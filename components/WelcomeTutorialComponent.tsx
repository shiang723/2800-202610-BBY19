'use client'
import WelcomeTutorial from "./WelcomeTutorial";
import Setting from "./Settings";
import { Children, useState } from "react";


export default function WelcomeTutorialComponent({children} : {children: Readonly<React.ReactNode>}) {
    const getInitialTutorial = () => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("tutorial_enabled");
            if (saved !== null) {
                return saved === "true";
            }
        }
        return true;
    };

    const [tutorial, setTutorial] = useState(getInitialTutorial);


    const handleUpdateTutorial = (newValue: boolean) => {
        setTutorial(newValue);
        localStorage.setItem("tutorial_enabled", newValue.toString());
    };

    return (
        <div>
            {tutorial && <WelcomeTutorial open={tutorial} />}
            <Setting tutorialOn={tutorial} setTutorialOn={handleUpdateTutorial} />
            <div>{children}</div>
        </div>
    );


}