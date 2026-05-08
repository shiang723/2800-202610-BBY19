'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signUpNewUser } from "@/actions/auth"

export default function SignupPage() {
  return (
    <AuthenticationComponent
      title="Create account"
      submitBtnName="Sign up"
      successMessage="Congratulations! Your account is created"
      redirectPath="/login"
      authFunction={signUpNewUser}
    />
  )
}