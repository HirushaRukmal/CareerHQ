import Link from "next/link";

import { login } from "@/app/auth/actions";
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

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>

          <CardDescription>
            Log in to continue managing your job applications.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={login} className="space-y-4">
            {params.message && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                {params.message}
              </div>
            )}

            {params.error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {params.error}
              </div>
            )}

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
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Log in
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="ml-1 font-medium underline underline-offset-4"
          >
            Create one
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
