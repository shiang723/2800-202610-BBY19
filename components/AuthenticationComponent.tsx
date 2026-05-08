"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/*
  The email couldn't start or finish with a dot
  The email shouldn't contain spaces into the string
  The email shouldn't contain special chars (<:, *,ecc)
  The email could contain dots in the middle of mail address before the @
  The email could contain a double doman ( '.de.org' or similar rarity)
  */
const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/i;

/* password must contain 1 number (0-9)
  password must contain 1 uppercase letters
  password must contain 1 lowercase letters
  password must contain 1 non-alpha numeric number
  password is 8-16 characters with no space
  */
const passwordRegex =
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

interface AuthenticationComponentProps {
  title: string;
  submitBtnName: string;
  authFunction: (email: string, password: string) => Promise<unknown>;
  successMessage: string;
  redirectPath: string;
}

export default function AuthenticationComponent({
  title,
  submitBtnName,
  successMessage,
  redirectPath,
  authFunction,
}: AuthenticationComponentProps) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailErrorMsg, setEmailErrorMsg] = useState<string>("");
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    document.title = title;
  }, [title]);

  // Delete error messages if password or email is empty

  useEffect(() => {
    if (!password) {
      // you can synchronously set the error message to empty string, but it will cause a warning in the console because the state update is not batched. To avoid this warning, we can use setTimeout to asynchronously update the state.
      // setPasswordErrorMsg("");
      setTimeout(() => setPasswordErrorMsg(""), 0);
    }

    if (!email) {
      // setEmailErrorMsg("");
      setTimeout(() => setEmailErrorMsg(""), 0);
    }
  }, [password, email]);

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

    setPassword(password);
  }

  // Function hanldes submitting user crendentials
  async function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();

    if (!email) {
      alert("Please provide email!");
      return;
    }

    if (!password) {
      alert("Please provide password");
      return;
    }

    if (emailErrorMsg || passwordErrorMsg) {
      alert("Please input valid email and password");
      return;
    }

    try {
      await authFunction(email, password);
      alert(successMessage);
      router.push(redirectPath);
    } catch (err) {
      //typescript can not use any. We can use unknown and then assert it to Error type to get the message property. If the error does not have a message property, we can use a default error message.
      const errorMessage = (err as Error)?.message || "Login failed";
      console.log(errorMessage);
    } finally {
      //log out user and clear input fields and error messages
      setEmail("");
      setPassword("");
      setEmailErrorMsg("");
      setPasswordErrorMsg("");
    }
  }

  return (
    <div className="px-6 py-12 lg:px-8">
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
        <form method="POST" className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="email"
              className="text text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              Email address
            </label>
            <input
              value={email}
              onChange={(e) => handleEmailChange(e)}
              id="email"
              type="email"
              name="email"
              required
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-blue-500 sm:text-sm/6 mt-1"
            />
            <p className="text-red-500 h-[12px] text-xs mt-1">
              {emailErrorMsg}
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm/6 font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              value={password}
              onChange={(e) => handlePasswordChange(e)}
              id="password"
              type="password"
              name="password"
              required
              className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-blue-500 sm:text-sm/6 mt-1"
            />
            <p className="text-red-500 h-[12px] text-xs mt-1">
              {passwordErrorMsg}
            </p>
          </div>

          <button
            onClick={(e) => {
              handleSubmit(e);
            }}
            type="submit"
            className="flex w-full justify-center rounded-md bg-blue-500 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500"
          >
            {submitBtnName}
          </button>
        </form>
      </div>
    </div>
  );
}
