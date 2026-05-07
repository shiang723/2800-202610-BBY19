'use client'
import { usePathname } from 'next/navigation';
import Link from "next/link";
export default function Navbar() {

    const currentPage = usePathname();
    const homeActive = (currentPage == "/") ? "bg-gray-700 text-white rounded-lg" : "";

    return (
        <div>
            <div className="pb-16"></div>
            <nav className="fixed inset-x-0 bottom-0 bg-gray-100 text-black p-4">
                <ul className='list-none flex justify-between'>
                    <Link href="/" className={homeActive}><li className='m-1'>Home</li></Link>
                    <Link href="/" ><li className='p-1'>Chat</li></Link>
                    <Link href="/"><li className='p-1'>Profile</li></Link>
                    <Link href="/"><li className='p-1'>Notification</li></Link>
                </ul>
            </nav>
        </div>
    );

}