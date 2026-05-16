"use server"

import { createClientForServerComponent } from '@/lib/supabase/server'

export async function updatePassword(newPassword: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
        return {
            message: error.message,
            isError: true
        }
    }
    return {
        message: "New password is set up!",
        isError: false
    }
}

export async function resetPassword(email: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
        return {
            message: error.message,
            isError: true
        }
    }
    return {message: "Password reset email is sent!",
            isError: false
    }
}

export async function signUpNewUser(email: string, password: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return {
            message: error.message,
            isError: true
        };
    }
    return { message: "New user account is created! Please check you email box to verify your account",
             isError: false
    };
}

export async function signInWithEmail(email: string, password: string) {
    const supabase = await createClientForServerComponent();
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return {
            message: error.message,
            isError: true
        };;
    }

    return { message: "You are logged in!",
             isError: false
    };
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
        throw new Error("Signin error" + error);
    }

    return data.url;
}

export async function signOut() {
    const supabase = await createClientForServerComponent();
    const { error } = await supabase.auth.signOut()

    if (error) {
        throw new Error("Signout error" + error);
    }
}