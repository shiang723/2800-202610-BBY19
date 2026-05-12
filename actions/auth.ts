"use server"

import { createClientForServerComponent } from '@/lib/supabase/server'

export async function signUpNewUser(email: string, password: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        alert(error);
        throw new Error("Signin error" + error);
    }

    return data;
}

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        alert(error);
        throw new Error("Signin error" + error);
    }

    return data;
}

export async function signOut() {
    const supabase = await createClientForServerComponent();
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.log("Signin error" + error.message)
    }
}