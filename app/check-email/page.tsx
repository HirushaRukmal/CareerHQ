import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>

          <CardDescription>
            We sent you a confirmation link. Open it to activate your CareerHQ
            account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline" })}
          >
            Return to login
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
