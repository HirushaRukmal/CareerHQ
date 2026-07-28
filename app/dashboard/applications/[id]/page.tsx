import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { deleteApplication, updateApplication } from "@/app/dashboard/actions";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ApplicationStatus =
  | "saved"
  | "applied"
  | "interview"
  | "offer"
  | "rejected";

type JobApplication = {
  id: string;
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  location: string | null;
  employment_type: string | null;
  job_url: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type ApplicationPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function ApplicationPage({
  params,
  searchParams,
}: ApplicationPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const applicationIdResult = z.string().uuid().safeParse(id);

  if (!applicationIdResult.success) {
    notFound();
  }

  const applicationId = applicationIdResult.data;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsData?.claims;

  if (claimsError || !claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const userId = claims.sub;

  const { data: applicationData, error: applicationError } = await supabase
    .from("applications")
    .select(
      `
        id,
        company_name,
        job_title,
        status,
        location,
        employment_type,
        job_url,
        applied_at,
        follow_up_at,
        notes,
        created_at,
        updated_at
      `,
    )
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle();

  if (applicationError) {
    console.error("Load application error:", applicationError);
  }

  if (!applicationData) {
    notFound();
  }

  const application = applicationData as JobApplication;

  return (
    <main className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to dashboard
          </Link>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {application.company_name}
            </p>

            <h1 className="text-3xl font-bold">{application.job_title}</h1>

            <p className="mt-2 text-xs text-muted-foreground">
              Last updated {formatDateTime(application.updated_at)}
            </p>
          </div>
        </header>

        {query.message && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {query.message}
          </div>
        )}

        {query.error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {query.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Application details</CardTitle>

            <CardDescription>
              Update the role, status, dates and notes.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={updateApplication} className="space-y-6">
              <input
                type="hidden"
                name="applicationId"
                value={application.id}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company name</Label>

                  <Input
                    id="companyName"
                    name="companyName"
                    defaultValue={application.company_name}
                    maxLength={120}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job title</Label>

                  <Input
                    id="jobTitle"
                    name="jobTitle"
                    defaultValue={application.job_title}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>

                  <select
                    id="status"
                    name="status"
                    defaultValue={application.status}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <option value="saved">Saved</option>

                    <option value="applied">Applied</option>

                    <option value="interview">Interview</option>

                    <option value="offer">Offer</option>

                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>

                  <Input
                    id="location"
                    name="location"
                    defaultValue={application.location ?? ""}
                    placeholder="Melbourne, VIC"
                    maxLength={120}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment type</Label>

                  <Input
                    id="employmentType"
                    name="employmentType"
                    defaultValue={application.employment_type ?? ""}
                    placeholder="Full-time"
                    maxLength={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobUrl">Job advertisement URL</Label>

                  <Input
                    id="jobUrl"
                    name="jobUrl"
                    type="url"
                    defaultValue={application.job_url ?? ""}
                    placeholder="https://..."
                    maxLength={500}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appliedAt">Application date</Label>

                  <Input
                    id="appliedAt"
                    name="appliedAt"
                    type="date"
                    defaultValue={application.applied_at ?? ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpAt">Follow-up date</Label>

                  <Input
                    id="followUpAt"
                    name="followUpAt"
                    type="date"
                    defaultValue={application.follow_up_at ?? ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>

                <textarea
                  id="notes"
                  name="notes"
                  rows={7}
                  maxLength={3000}
                  defaultValue={application.notes ?? ""}
                  placeholder="Recruiter details, interview notes or important requirements..."
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit">Save changes</Button>

                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "outline",
                  })}
                >
                  Cancel
                </Link>

                {application.job_url && (
                  <a
                    href={application.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({
                      variant: "outline",
                    })}
                  >
                    Open job advertisement
                  </a>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base">Delete application</CardTitle>

            <CardDescription>
              This permanently removes the application from CareerHQ.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form action={deleteApplication}>
              <input
                type="hidden"
                name="applicationId"
                value={application.id}
              />

              <Button type="submit" variant="destructive">
                Delete application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
