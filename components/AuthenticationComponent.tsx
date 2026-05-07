'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;

interface AuthenticationComponentProps {
    title: string,
    submitBtnName: string,
    authFunction: (email: string, password: string) => Promise<any>,
    successMessage: string,
    redirectPath: string
}

export default function AuthenticationComponent({title, submitBtnName, successMessage, redirectPath, authFunction}:AuthenticationComponentProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [emailErrorMsg, setEmailErrorMsg] = useState<string>('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string>('')
  const router = useRouter()

  // Delete error messages if password or email is empty
  useEffect(()=>{
    if(!password) {
      setPasswordErrorMsg("");
    }

    if(!email) {
      setEmailErrorMsg("");
    }
  },[password,email])

  // Function handles email change
  function handleEmailChange(e:React.ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;

    if(!emailRegex.test(email)) {
      if(!emailErrorMsg) {
        setEmailErrorMsg("Invalid Email");
      }
    } else {
      setEmailErrorMsg("");
    }

    setEmail(email);
  }

  // Function handles password change
  function handlePasswordChange(e:React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;

    if(!passwordRegex.test(password)) {
      if(!passwordErrorMsg) {
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

    if(!email) {
      alert("Please provide email!");
      return;
    }

    if(!password) {
      alert("Please provide password");
      return;
    }

    if(emailErrorMsg || passwordErrorMsg) {
      alert("Please input valid email and password")
      return;
    }

    try {
      await authFunction(email, password)
      alert(successMessage)
      router.push(redirectPath)
    } catch (err: any) {
      console.log(err.message);
    } finally {
      setEmail("");
      setPassword("");
      setEmailErrorMsg("");
      setPasswordErrorMsg("");
    }
  }

  return (
    <div className="px-6 py-12 lg:px-8">
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <p className='text-center font-bold text-xl mb-10'>{title}</p>
        <form method="POST" className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="text text-sm/6 font-medium text-gray-900">Email address</label>
            <input value={email} onChange={e => handleEmailChange(e)} id="email" type="email" name="email" required className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p className='text-red-500 h-[12px] text-xs'>{emailErrorMsg}</p>
          </div>

          <div>
            <label htmlFor="password" className="text-sm/6 font-medium text-gray-900">Password</label>
            <input value={password} onChange={e => handlePasswordChange(e)} id="password" type="password" name="password" required className="w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6" />
            <p className='text-red-500 h-[12px] text-xs'>{passwordErrorMsg}</p>
          </div>

          <button onClick={(e) => {handleSubmit(e)}} type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500">{submitBtnName}</button>
        </form>
      </div>
    </div>
  )
}