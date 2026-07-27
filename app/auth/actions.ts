"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const loginSchema = z.object({
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(6, "Password must contain at least 6 characters."),
})

const registerSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(2, "Full name must contain at least 2 characters.")
        .max(80, "Full name is too long."),
    email: z.string().trim().email("Enter a valid email address."),
    password: z.string().min(8, "Password must contain at least 8 characters."),
})

function getFormValue(formData: FormData, key: string) {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
}

export async function login(formData: FormData) {
    const result = loginSchema.safeParse({
        email: getFormValue(formData, "email"),
        password: getFormValue(formData, "password"),
    })

    if (!result.success) {
        const errorMessage = result.error.issues[0]?.message ?? "Invalid login details."

        redirect(`/login?error=${encodeURIComponent(errorMessage)}`)
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
    })

    if (error) {
        redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath("/", "layout")
    redirect("/dashboard")
}

export async function register(formData: FormData) {
    const result = registerSchema.safeParse({
        fullName: getFormValue(formData, "fullName"),
        email: getFormValue(formData, "email"),
        password: getFormValue(formData, "password"),
    })

    if (!result.success) {
        const errorMessage =
            result.error.issues[0]?.message ?? "Invalid registration details."

        redirect(`/register?error=${encodeURIComponent(errorMessage)}`)
    }

    const supabase = await createClient()

    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

    const { data, error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
            data: {
                full_name: result.data.fullName,
            },
            emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        },
    })

    if (error) {
        redirect(`/register?error=${encodeURIComponent(error.message)}`)
    }

    revalidatePath("/", "layout")

    // Email confirmation may be disabled during local development.
    if (data.session) {
        redirect("/dashboard")
    }

    redirect("/check-email")
}

export async function logout() {
    const supabase = await createClient()

    await supabase.auth.signOut()

    revalidatePath("/", "layout")
    redirect("/login?message=You have been logged out.")
}