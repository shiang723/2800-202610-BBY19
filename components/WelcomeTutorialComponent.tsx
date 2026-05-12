'use client'
import WelcomeTutorial from "./WelcomeTutorial";
import Setting from "./Settings";
import { useState, useEffect } from "react";


export default function WelcomeTutorialComponent({children} : {children: Readonly<React.ReactNode>}) {
      const [tutorial, setTutorial] = useState(true);
    
        useEffect(() => {
            const saved = localStorage.getItem("tutorial_enabled");
    
            if (saved !== null) {
                setTutorial(saved === "true");
            }
        }, []);
        // -- End of hydration fix
    
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