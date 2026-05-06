"use server"

import { createClientForServerComponent } from '@/lib/supabase/client'

const supabase = createClientForServerComponent();

export async function signUpNewUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if(error) {
    console.log("Signup error" + error.message)
    return;
  }

  return data;
}

export async function signInWithEmail() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'valid.email@supabase.io',
    password: 'example-password',
  })

    if(error) {
    console.log("Signin error" + error.message)
    return;
  }

  return data;
}