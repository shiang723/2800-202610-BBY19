"use server"

import { createClientForServerComponent } from '@/lib/supabase/server'

export async function updatePassword(newPassword: string) {
    const supabase = await createClientForServerComponent();
    await supabase.auth.updateUser({ password: 'newPassword' })
}

export async function resetPassword(email: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
        throw new Error("Signin error" + error);
    }
    return data;
}

export async function signUpNewUser(email: string, password: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: '/',
        }
    })

    if (error) {
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
        throw new Error("Signin error" + error);
    }

    return data;
}

export async function signInWithGoogleAccount() {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `http://localhost:3000/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        alert(error);
        throw new Error("Signin error" + error);
    }

    return data.url;
}

export async function signOut() {
    const supabase = await createClientForServerComponent();
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.log("Signin error" + error.message)
    }
}