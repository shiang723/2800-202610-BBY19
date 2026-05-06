import Image from "next/image";
export default function TutorialModal({ header, icon, nextLocation, lastLocation, message, first, last }: {
    header: string,
    icon: string,
    nextLocation: string,
    message: string,
    lastLocation: string,
    first: string,
    last: string
}) {

    const backButtonClass = "bg-gray-200 hover:bg-gray-300 text-black rounded-lg p-2 pl-4 pr-4 mt-5" + ((first === "true") ? " hidden" : "");
    const nextButtonText = (last === "true") ? "Done" : "Next";

    return (
        <div>
            <dialog id="welcome-tutorial" className="rounded-lg p-7 fixed place-self-center max-w-100 max-h-200 flex-auto">
                <button command="close" commandfor="welcome-tutorial" className="bg-gray-400 text-white rounded-lg p-1 pl-4 pr-4 flex justify-self-end mb-5 hover:bg-gray-500">Skip</button>
                <h2 className="text-center text-xl">{header}</h2>
                <Image src={icon} alt="sun" width={40}
                    height={40} className="place-self-center m-2" />
                <p className="text-center m-2" >{message}</p>
                <div className="flex flex-row justify-end gap-x-20">
                    <button command="show-modal" commandfor={lastLocation} className={backButtonClass}>Back</button>
                    <button command="show-modal" commandfor={nextLocation} className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg p-2 pl-4 pr-4 mt-5">{nextButtonText}</button>
                </div>
            </dialog >
        </div >
    );
}