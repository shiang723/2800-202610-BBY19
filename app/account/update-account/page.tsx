"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signInWithGoogleAccount } from "@/actions/auth";
import Image from "next/image";
import { updatePassword } from "@/actions/auth";

/* password must contain 1 number (0-9)
password must contain 1 uppercase letters
password must contain 1 lowercase letters
password must contain 1 non-alpha numeric number
password is 8-16 characters with no space
*/
const passwordRegex =
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

export default function AuthenticationComponent() {
  const [newPassword, setNewPassword] = useState<string>("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>("");
  const router = useRouter();

  // Delete error messages if password or email is empty
  useEffect(() => {
    if (!newPassword) {
      setPasswordErrorMsg("");
    }
  }, [newPassword]);

  // Function handles password change
  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;

    if (!passwordRegex.test(password)) {
      if (!passwordErrorMsg) {
        setPasswordErrorMsg("Invalid Password");
      }
    } else {
      setPasswordErrorMsg("");
    }

    setNewPassword(password);
  }

  // Function hanldes submitting user crendentials
  async function handleSubmit(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();

    if (!newPassword) {
      alert("Please provide password");
      return;
    }

    try {
      await updatePassword(newPassword);
      alert("You password has been changed!");

      router.push("/");
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setNewPassword("");
      setPasswordErrorMsg("");
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

        <form method="POST" className="flex flex-col gap-4 mb-4">
          <div>
            <label
              htmlFor="password"
              className="text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              value={newPassword}
              onChange={(e) => handlePasswordChange(e)}
              id="password"
              type="password"
              name="password"
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-blue-500 sm:text-sm/6 mt-1"
            />
            <p className="text-red-500 h-[12px] text-xs mt-1">
              {passwordErrorMsg}
            </p>
          </div>

          <button
            onClick={(e) => { handleSubmit(e) }}
            className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 dark:text-white"
          >
            Set new password
          </button>
        </form>
      </div>
    </div>
  );
}
