"use client";

import AuthenticationComponent from "@/components/AuthenticationComponent";
import { signInWithEmail } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthenticationComponent
      title="Log in"
      submitBtnName="Sign in to account"
      successMessage="Congratulations! You are logged in"
      redirectPath="/"
      authFunction={signInWithEmail}
    />
  );
}
