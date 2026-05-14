'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signInWithEmail } from "@/actions/auth"

export default function LoginPage() {
  return (
    <AuthenticationComponent
      title="Log in Vancooler account"
      submitBtnName="Sign in"
      successMessage="Congratulations! You are logged in"
      authFunction={signInWithEmail}
    />
  )
}