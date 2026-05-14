"use client";

import AuthenticationComponent from "@/components/AuthenticationComponent";
import { signInWithEmail } from "@/actions/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthenticationComponent
      submitBtnName="Sign in"
      successMessage="Congratulations! You are logged in"
      authFunction={signInWithEmail}
    />
  );
}
