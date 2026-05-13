'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signInWithEmail } from "@/actions/auth"

export default function LoginPage() {
  return (
    <AuthenticationComponent
      title="Log in"
      submitBtnName="Sign in to account"
      successMessage="Congratulations! You are logged in"
      redirectPath="/"
      authFunction={signInWithEmail}
    />
  )
}