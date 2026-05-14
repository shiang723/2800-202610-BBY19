'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signUpNewUser } from "@/actions/auth"

export default function SignupPage() {
  return (
    <AuthenticationComponent
      submitBtnName="Sign up"
      successMessage="Congratulations! Your account is created. Please go to your email to verify it."
      authFunction={signUpNewUser}
    />
  )
}