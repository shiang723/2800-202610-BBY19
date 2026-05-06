'use client'

import { useState } from 'react'
import { signUpNewUser } from '@/actions/auth'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit() {

    try {
      await signUpNewUser(email, password)
      alert("Congratulation. You can login now!")
    } catch (err: any) {
      console.log(err.message);
    }
  }

  return (
    <form className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        type="button"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
      >
        Sign up
      </button>
    </form>
  )
}