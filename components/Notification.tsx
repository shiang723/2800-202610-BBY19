'use client'
import Image from "next/image"
import { useRef, useState, useEffect } from "react";

/**
 * Creating different props using type
 * Adapted from Gemini 3 fast model
 * https://gemini.google.com/app
 */
type BaseNotificationProps = {
    locationUser?: { longitude: number; latitude: number };
};

type SunscreenNotification = BaseNotificationProps & {
    type: "sunscreen";
    timeOfNotif: Date;
};

type HydrationNotification = BaseNotificationProps & {
    type: "hydration";
    timeOfNotif?: Date;
};

type UVNotification = BaseNotificationProps & {
    type: "uv";
    uvIndex: number; // Mandatory only when type is "uv"
    timeOfNotif?: Date;
};

type NotificationProps = SunscreenNotification | HydrationNotification | UVNotification;
/** End of adapted code */

const lowMessage = "Wear UV protection sunglasses to help protect your eyes. Cover up your skin and use sunscreen if you are outside for more than one hour during bright, snowy days.";
const moderateMessage = "Take precautions, such as covering up and using sunscreen, if you will be outside. Stay in shade near midday when the sun is the strongest."
const highMessage = "Protection against sunburn is needed, reduce time in the sun between 11 am and 4 pm. Cover up, wear a hat and sunglasses, and use sunscreen."
const veryHighMessage = "Extra care required. Unprotected skin burns quickly. Use sunscreen, seek shade, cover up, and wear protective clothing like a hat and sunglasses. Avoid the sun between 11 am and 4 pm."
const extremeMessage = "Take all precautions. Unprotected skin can burn in minutes. Avoid sun between 11 am and 4 pm. Bright surfaces can reflext and increase UV exposure. Use sunscreen, seek shade, cover up, and wear protective clothing like a hat and sunglasses."

const uvMap = new Map();
uvMap.set(0, lowMessage);
uvMap.set(1, lowMessage);
uvMap.set(2, lowMessage);
uvMap.set(3, moderateMessage);
uvMap.set(4, moderateMessage);
uvMap.set(5, moderateMessage);
uvMap.set(6, highMessage);
uvMap.set(7, highMessage);
uvMap.set(8, veryHighMessage);
uvMap.set(9, veryHighMessage)
uvMap.set(10, veryHighMessage)

export default function Notification(props: NotificationProps) {
    const { type } = props
    const [open, setOpen] = useState(true);

    const currentModal = useRef<HTMLDialogElement>(null);

    /**Fix backdrop not showing up behind modal bug.
     * Adapted code from Gemini 3 fast
     * https://gemini.google.com/app 
     */

    useEffect(() => {
        const dialog = currentModal.current;
        if (!dialog) return;

        if (open) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [open]);
    //End of adapted code.

    if (!open) return null;

    if (props.timeOfNotif) {
        const now = new Date();
        const sameTime =
            now.getFullYear() === props.timeOfNotif.getFullYear() &&
            now.getMonth() === props.timeOfNotif.getMonth() &&
            now.getDate() === props.timeOfNotif.getDate() &&
            now.getHours() === props.timeOfNotif.getHours() &&
            now.getMinutes() === props.timeOfNotif.getMinutes();
        if (!sameTime) return null;
    }

    const uvMessage = (type == "uv" && props.uvIndex) ? ((props.uvIndex ?? 0 > 10) ? extremeMessage : uvMap.get(props.uvIndex)) : null

    return (
        <div id="notification-container">
            <dialog ref={currentModal} id="notification" className="rounded-xl p-5 fixed place-self-center max-w-90 max-h-9.9/10 flex-auto">
                {/* How to render different html based on type prop. Adapted from Gemini 3 fast model: https://gemini.google.com/app    */}
                {type === "sunscreen" && (
                    <>
                        <Image src="./sunscreen.svg" alt="sunscreen" width={45}
                            height={45} className="place-self-center mt-2 mb-2" />
                        <h2 className="text-center text-xl">Time to reapply sunscreen</h2>
                        <p className="text-center m-2" >It has been 2 hours. It is time to
                            reapply your sunscreen.</p>
                    </>
                )}
                {type === "hydration" && (
                    <>
                        <Image src="./sun.svg" alt="sun" width={45}
                            height={45} className="place-self-center mt-2 mb-2" />
                        <h2 className="text-center text-xl">Hydration Reminder</h2>
                        <p className="text-center m-2" >The temperature is higher than 33 degrees. We suggest drinking water, juice, or an electrolyte drink.</p>
                        <div className="flex">
                            <button className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl grow p-1 pr-2 pl-2 mb-2 grow">View nearby water stations</button>
                        </div>
                        <div className="flex">
                            <button className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl grow p-1 pr-2 pl-2 mb-2 grow">View nearby cafes</button>
                        </div>
                        <div className="flex">
                            <button className="bg-gray-500 hover:bg-gray-600 text-white rounded-xl grow p-1 pr-2 pl-2 mb-2 grow">View nearby grocery stores</button>
                        </div>
                    </>
                )}
                {type === "uv" && (
                    <>
                        <h2 className="text-center text-xl">UV index right now is {String(props.uvIndex)}</h2>
                        <p className="text-center m-2" >{uvMessage}</p>

                        <div className="flex flex-row justify-center gap-5 mb-2">
                            <div className="text-center">
                                <Image src="./sunglasses.svg" alt="sunglasses" width={80}
                                    height={45} className="mt-2 mb-2" />
                                <p>Sunglasses</p>
                            </div>
                            <div className="text-center">
                                <Image src="./hat.svg" alt="hat" width={80}
                                    height={45} className="mt-2 mb-2" />
                                <p>Hat</p>
                            </div>
                        </div>
                    </>
                )}
                {/** End of adapted code. */}
                <div className="flex">
                    <button type="button" onClick={() => setOpen(false)} className="bg-gray-700 hover:bg-gray-800 text-white rounded-lg grow p-1">Exit</button>
                </div>
            </dialog >
        </div >

    );

}

