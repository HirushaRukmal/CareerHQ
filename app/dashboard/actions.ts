"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const optionalText = (maximumLength: number) =>
    z.preprocess(
        (value) => {
            if (typeof value !== "string") {
                return value
            }

            const trimmedValue = value.trim()

            return trimmedValue === "" ? undefined : trimmedValue
        },
        z.string().max(maximumLength).optional()
    )

const optionalUrl = z.preprocess(
    (value) => {
        if (typeof value !== "string") {
            return value
        }

        const trimmedValue = value.trim()

        return trimmedValue === "" ? undefined : trimmedValue
    },
    z
        .string()
        .url("Enter a complete URL beginning with http:// or https://.")
        .max(500)
        .optional()
)

const optionalDate = z.preprocess(
    (value) => {
        if (typeof value !== "string") {
            return value
        }

        const trimmedValue = value.trim()

        return trimmedValue === "" ? undefined : trimmedValue
    },
    z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
        .optional()
)

const applicationSchema = z.object({
    companyName: z
        .string()
        .trim()
        .min(1, "Company name is required.")
        .max(120, "Company name is too long."),

    jobTitle: z
        .string()
        .trim()
        .min(1, "Job title is required.")
        .max(150, "Job title is too long."),

    status: z.enum([
        "saved",
        "applied",
        "interview",
        "offer",
        "rejected",
    ]),

    location: optionalText(120),
    employmentType: optionalText(80),
    jobUrl: optionalUrl,
    appliedAt: optionalDate,
    followUpAt: optionalDate,
    notes: optionalText(3000),
})

async function getAuthenticatedClient() {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.getClaims()
    const userId = data?.claims?.sub

    if (error || typeof userId !== "string") {
        redirect("/login?error=Please log in to continue.")
    }

    return {
        supabase,
        userId,
    }
}

export async function createApplication(formData: FormData) {
    const result = applicationSchema.safeParse({
        companyName: formData.get("companyName"),
        jobTitle: formData.get("jobTitle"),
        status: formData.get("status"),
        location: formData.get("location"),
        employmentType: formData.get("employmentType"),
        jobUrl: formData.get("jobUrl"),
        appliedAt: formData.get("appliedAt"),
        followUpAt: formData.get("followUpAt"),
        notes: formData.get("notes"),
    })

    if (!result.success) {
        const message =
            result.error.issues[0]?.message ??
            "Check the application information."

        redirect(`/dashboard?error=${encodeURIComponent(message)}`)
    }

    const { supabase, userId } =
        await getAuthenticatedClient()

    const { error } = await supabase
        .from("applications")
        .insert({
            user_id: userId,
            company_name: result.data.companyName,
            job_title: result.data.jobTitle,
            status: result.data.status,
            location: result.data.location ?? null,
            employment_type:
                result.data.employmentType ?? null,
            job_url: result.data.jobUrl ?? null,
            applied_at: result.data.appliedAt ?? null,
            follow_up_at: result.data.followUpAt ?? null,
            notes: result.data.notes ?? null,
        })

    if (error) {
        console.error("Create application error:", error)

        redirect(
            `/dashboard?error=${encodeURIComponent(
                "The application could not be created."
            )}`
        )
    }

    revalidatePath("/dashboard")

    redirect(
        "/dashboard?message=Application added successfully."
    )
}

export async function deleteApplication(
    formData: FormData
) {
    const applicationId = z
        .string()
        .uuid()
        .safeParse(formData.get("applicationId"))

    if (!applicationId.success) {
        redirect("/dashboard?error=Invalid application.")
    }

    const { supabase, userId } =
        await getAuthenticatedClient()

    const { error } = await supabase
        .from("applications")
        .delete()
        .eq("id", applicationId.data)
        .eq("user_id", userId)

    if (error) {
        console.error("Delete application error:", error)

        redirect(
            `/dashboard?error=${encodeURIComponent(
                "The application could not be deleted."
            )}`
        )
    }

    revalidatePath("/dashboard")

    redirect(
        "/dashboard?message=Application deleted."
    )
}