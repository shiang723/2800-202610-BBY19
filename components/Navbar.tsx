"use client";
// import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
// import Image from "next/image";
import {
  Menu,
  House,
  Bookmark,
  Bell,
  MessageCircleCheckIcon,
} from "lucide-react";

export default function Navbar() {

  function handleMenuOpen() {
    const menuDialog = document.getElementById(
      "Navbar",
    ) as HTMLDialogElement | null;
    menuDialog?.showModal();
  }

  function handleMenuClose() {
    const menuDialog = document.getElementById(
      "Navbar",
    ) as HTMLDialogElement | null;
    menuDialog?.close();
  }

  useEffect(() => {
    const menuDialog = document.getElementById(
      "Navbar",
    ) as HTMLDialogElement | null;
    if (!menuDialog) return;

    const handleClickOutside = (event: MouseEvent) => {
      const rect = menuDialog.getBoundingClientRect();
      const inDialog =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;

      if (!inDialog) {
        menuDialog.close();
      }
    };

    menuDialog.addEventListener("click", handleClickOutside);
    return () => menuDialog.removeEventListener("click", handleClickOutside);
  }, []);

  const menuItems = [
    { href: "/", label: "Home", Icon: House },
    { href: "/chat", label: "Chat", Icon: MessageCircleCheckIcon },
    { href: "/profile", label: "Profile", Icon: Bookmark },
    { href: "/notification", label: "Notification", Icon: Bell },
  ];

  return (
    <>
      {/* burger menu button */}
      <div className="absolute bottom-15 left-4 z-10">
        <button
          onClick={handleMenuOpen}
          className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-200"
        >
          <Menu size={20} className="text-zinc-950" />
        </button>
      </div>
      <dialog
        id="Navbar"
        className="rounded-lg shadow-xl"
        style={{
          position: "fixed",
          bottom: "80px",
          left: "16px",
          margin: 0,
          top: "auto",
          right: "auto",
        }}
      >
        <ul className="list-none w-48 py-2">
          {menuItems.map(({ href, label, Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={handleMenuClose}
              >
                <Icon size={20} className="text-gray-700" />
                <span className="text-sm text-gray-700">{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );

  // return (
  //     <div>
  //         <div className="pb-16 "></div>
  //         <nav className="fixed inset-x-0 bottom-0 bg-gray-200 text-black p-2 pl-10 pr-10">
  //             <ul className='list-none flex justify-between'>
  //                 <Link href="/" className="flex justify-items-center">
  //                     <li className='p-1'>
  //                         <Image src="/homeIcon.svg" alt="homeIcon" width={50} height={52} className='place-self-center h-11 w-auto' />
  //                     </li>
  //                 </Link>
  //                 <Link href="/chat" >
  //                     <li className='p-1'>
  //                         <Image src="/chatIcon.svg" alt="chatIcon" width={45} height={47.5} className='place-self-center h-11 w-auto' />
  //                     </li>
  //                 </Link>
  //                 <Link href="/profile"><li className='p-1'>
  //                     <Image src="/bookmark.svg" alt="profileIcon" width={27} height={40} className='place-self-center h-11 w-auto' />
  //                 </li></Link>
  //                 <Link href="/notification" className='flex justify-items-center'><li className='p-1'>
  //                     <Image src="/bell.svg" alt="bellIcon" width={36} height={45} className='place-self-center h-11 w-auto' />
  //                 </li></Link>
  //             </ul>
  //         </nav>
  //     </div >
  // );
}
