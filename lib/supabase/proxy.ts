import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabasePublishableKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!supabaseUrl || !supabasePublishableKey) {
        throw new Error("Supabase environment variables are missing.")
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabasePublishableKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },

                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })

                    supabaseResponse = NextResponse.next({
                        request,
                    })

                    cookiesToSet.forEach(({ name, value, options }) => {
                        supabaseResponse.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // Verify the current authentication token.
    const { data } = await supabase.auth.getClaims()
    const user = data?.claims
    const pathname = request.nextUrl.pathname

    const isProtectedRoute = pathname.startsWith("/dashboard")
    const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register")

    if (!user && isProtectedRoute) {
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = "/login"
        loginUrl.searchParams.set("message", "Please log in to continue.")

        return NextResponse.redirect(loginUrl)
    }

    if (user && isAuthRoute) {
        const dashboardUrl = request.nextUrl.clone()
        dashboardUrl.pathname = "/dashboard"
        dashboardUrl.search = ""

        return NextResponse.redirect(dashboardUrl)
    }

    return supabaseResponse
}