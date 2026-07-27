import Link from "next/link";

import { register } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create your account</CardTitle>

          <CardDescription>
            Start tracking your job applications with CareerHQ.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={register} className="space-y-4">
            {params.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {params.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>

              <Input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Hirusha Rukmal"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <p className="text-xs text-muted-foreground">
                Use at least 8 characters.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Create account
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="ml-1 font-medium underline underline-offset-4"
          >
            Log in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
