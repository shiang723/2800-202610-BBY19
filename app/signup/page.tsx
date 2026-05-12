'use client'
import AuthenticationComponent from "@/components/AuthenticationComponent"
import { signUpNewUser } from "@/actions/auth"
import { createClientForClientComponent } from "@/lib/supabase/client";

export default function SignupPage() {
  return (
    <AuthenticationComponent
      title="Create Vancooler account"
      submitBtnName="Sign up"
      successMessage="Congratulations! Your account is created"
      redirectPath="/login"
      authFunction={signUpNewUser}
    />
  )
}