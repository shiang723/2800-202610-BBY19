import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { UserCircle } from "lucide-react";

export default function Chat() {

    return (
        <main className="bg-gray-100 min-h-screen">
            <div >
                <div className="pt-5 pl-3 pr-3">
                    <SearchBar />
                </div>
                <div className="mt-5">
                    <ul className="ml-5 text-black">
                        <Link href="/chat"><li className="flex pb-5">
                            <UserCircle size={40} className="text-gray-700 shrink-0 mr-2" />
                            <div className="flex flex-col" >
                                <p>Jenny</p>
                                <p>We should go to this park!</p>
                            </div></li>
                        </Link>
                        <Link href="/chat">
                            <li className="flex pb-5">
                                <UserCircle size={40} className="text-gray-700 shrink-0 mr-2" />
                                <div className="flex flex-col" >
                                    <p>Tommy</p>
                                    <p>Want to go on walk here?</p>
                                </div>
                            </li>
                        </Link>
                    </ul>

                </div>
            </div>
            <Navbar />
        </main >);
}
