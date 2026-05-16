'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signUpNewUser } from "@/actions/auth"

export default function SignupPage() {
  return (
    <AuthenticationComponent
      submitBtnName="Sign up"
      authFunction={signUpNewUser}
    />
  )
}