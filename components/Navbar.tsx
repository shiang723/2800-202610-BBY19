'use client'
import { usePathname } from 'next/navigation';
import Link from "next/link";
import Image from 'next/image';
export default function Navbar() {



    return (
        <div>
            <div className="pb-16"></div>
            <nav className="fixed inset-x-0 bottom-0 bg-gray-200 text-black p-2 pl-10 pr-10">
                <ul className='list-none flex justify-between'>
                    <Link href="/" className="flex justify-items-center">
                        <li className='p-1'>
                            <Image src="/homeIcon.svg" alt="homeIcon" width={50} height={52} className='place-self-center h-11 w-auto' />
                        </li>
                    </Link>
                    <Link href="/chat" >
                        <li className='p-1'>
                            <Image src="/chatIcon.svg" alt="chatIcon" width={45} height={47.5} className='place-self-center h-11 w-auto' />
                        </li>
                    </Link>
                    <Link href="/profile"><li className='p-1'>
                        <Image src="/bookmark.svg" alt="profileIcon" width={27} height={40} className='place-self-center h-11 w-auto' />
                    </li></Link>
                    <Link href="/notification" className='flex justify-items-center'><li className='p-1'>
                        <Image src="/bell.svg" alt="bellIcon" width={36} height={45} className='place-self-center h-11 w-auto' />
                    </li></Link>
                </ul>
            </nav>
        </div >
    );

}