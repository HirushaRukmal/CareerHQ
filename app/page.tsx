import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Badge className="mb-2 w-fit">Phase 1</Badge>

          <CardTitle className="text-3xl">ApplyFlow</CardTitle>

          <CardDescription className="text-base">
            Track job applications, interviews, follow-ups and résumé versions
            in one place.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border bg-background p-4">
            <p className="font-medium">Your SaaS foundation is ready.</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Authentication and application tracking will be added next.
            </p>
          </div>
        </CardContent>

        <CardFooter className="gap-3">
          <Button>Get started</Button>
          <Button variant="outline">View roadmap</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
