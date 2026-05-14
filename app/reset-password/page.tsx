"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resetPassword } from "@/actions/auth";

/*
The email couldn't start or finish with a dot
The email shouldn't contain spaces into the string
The email shouldn't contain special chars (<:, *,ecc)
The email could contain dots in the middle of mail address before the @
The email could contain a double doman ( '.de.org' or similar rarity)
*/
const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/i;

export default function AuthenticationComponent() {
  const [email, setEmail] = useState<string>("");
  const [emailErrorMsg, setEmailErrorMsg] = useState<string>("");
  const router = useRouter();

  // Delete error messages if email is empty
  useEffect(() => {
    if (!email) {
      setEmailErrorMsg("");
    }
  }, [email]);

  // Function handles email change
  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;

    if (!emailRegex.test(email)) {
      if (!emailErrorMsg) {
        setEmailErrorMsg("Invalid Email");
      }
    } else {
      setEmailErrorMsg("");
    }

    setEmail(email);
  }

  // Function handles reseting the password
  async function handleResetPassword(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    
    if (!email) {
      alert("Please provide email to reset your password!");
      return;
    }

    try {
      await resetPassword(email);
      alert("Please check your email for the password reset link");
      router.push("login");
    } catch (err: any) {
      console.log(err.message);
    } finally {
        setEmail("");
        setEmailErrorMsg("");
    }
  }

  return (
    <div className="px-6 py-12 lg:px-8 min-h-screen dark:bg-[#283857] flex items-top justify-center ">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {/* add logo here*/}
        <div className="flex items-center gap-4 mb-10">
          <Image
            src="/VancoolerLogo.png"
            alt="Logo"
            width={250}
            height={100}
            className="object-contain dark:hidden"
          />
          <Image
            src="/VancoolerLogoDark.png"
            alt="Logo"
            width={250}
            height={100}
            className="object-contain hidden dark:block"
          />
        </div>

        <h2>Please provide your email so we can send the password reset link to it</h2>

        <form method="POST" className="flex flex-col gap-4 mb-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              Email
            </label>
            <input
              value={email}
              onChange={(e) => handleEmailChange(e)}
              id="email"
              type="email"
              name="email"
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-blue-500 sm:text-sm/6 mt-1"
            />
            <p className="text-red-500 h-[12px] text-xs mt-1">
              {emailErrorMsg}
            </p>
          </div>

          <button
            onClick={(e) => {handleResetPassword(e)}}
            className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 dark:text-white"
          >
            Send password reset link
          </button>
        </form>
      </div>
    </div>
  );
}
