import { createClientForClientComponent } from '@/lib/supabase/client'

const supabase = await createClientForClientComponent();

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

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    })

    if(error) {
    console.log("Signin error" + error.message)
    return;
    }

    return data;
}