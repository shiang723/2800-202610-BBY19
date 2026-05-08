import Navbar from "@/components/Navbar";

export default function Profile() {
    return (
        <main className="bg-gray-100 min-h-screen">
            <div className="p-5 ml-2 mr-2">
                <button className="bg-gray-400 rounded-2xl p-1 pl-2 pr-2 text-lg flex place-self-end-safe">Back</button>
                <p className="text-3xl text-black font-bold">Profile</p>
                <div className="text-black text-lg flex flex-col">
                    <div className="flex flex-row gap-2">Name:<p id="name">Tom</p></div>
                    <div className="flex flex-row gap-2">Email:<p id="email">tom@mail.com</p></div>
                    <div className="flex flex-row gap-2">Age:<p id="name">30</p></div>
                </div>
                <p className="text-2xl text-black font-semibold m-2">Saved Location</p>
                <div>
                    <div className="h-20 bg-gray-300 rounded-xl border-black border-1 text-black text-lg p-2 mb-5">
                        Community Center
                    </div>
                    <div className="h-20 bg-gray-300 rounded-xl border-black border-1 text-black text-lg p-2 mb-5">
                        Water Park
                    </div>
                </div>
            </div>
            <Navbar />
        </main>);
}