import { redirect } from "next/navigation";

import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims) {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "CareerHQ user";

  return (
    <main className="min-h-screen bg-muted/40 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Signed in as {email}
            </p>

            <h1 className="text-3xl font-bold">CareerHQ Dashboard</h1>
          </div>

          <form action={logout}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total applications</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Interviews</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Offers</CardDescription>
              <CardTitle className="text-3xl">0</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your account is working</CardTitle>

            <CardDescription>
              The next step will add the application database and CRUD
              functionality.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">
              You are authenticated and this dashboard is protected.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
