import { redirect } from "next/navigation";

import { logout } from "@/app/auth/actions";
import { createApplication, deleteApplication } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";

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
};

type DashboardPageProps = {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
};

const statusLabels: Record<ApplicationStatus, string> = {
  saved: "Saved",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  const claims = claimsData?.claims;

  if (claimsError || !claims || typeof claims.sub !== "string") {
    redirect("/login");
  }

  const userId = claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  const { data: applicationRows, error: applicationsError } = await supabase
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
        created_at
      `,
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (applicationsError) {
    console.error("Load applications error:", applicationsError);
  }

  const applications = (applicationRows ?? []) as JobApplication[];

  const interviewCount = applications.filter(
    (application) => application.status === "interview",
  ).length;

  const offerCount = applications.filter(
    (application) => application.status === "offer",
  ).length;

  const displayName =
    profile?.full_name?.trim() ||
    (typeof claims.email === "string" ? claims.email : "CareerHQ user");

  return (
    <main className="min-h-screen bg-muted/40 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Welcome back, {displayName}
            </p>

            <h1 className="text-3xl font-bold">CareerHQ Dashboard</h1>
          </div>

          <form action={logout}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </header>

        {params.message && (
          <div className="mb-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {params.message}
          </div>
        )}

        {params.error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total applications</CardDescription>

              <CardTitle className="text-3xl">{applications.length}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Interviews</CardDescription>

              <CardTitle className="text-3xl">{interviewCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Offers</CardDescription>

              <CardTitle className="text-3xl">{offerCount}</CardTitle>
            </CardHeader>
          </Card>
        </section>

        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Add a job application</CardTitle>

              <CardDescription>
                Record a new role and track its progress.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={createApplication} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company name</Label>

                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="MYOB"
                      maxLength={120}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job title</Label>

                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      placeholder="Graduate Software Engineer"
                      maxLength={150}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>

                    <select
                      id="status"
                      name="status"
                      defaultValue="saved"
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
                      placeholder="Melbourne, VIC"
                      maxLength={120}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employmentType">Employment type</Label>

                    <Input
                      id="employmentType"
                      name="employmentType"
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
                      placeholder="https://..."
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appliedAt">Application date</Label>

                    <Input id="appliedAt" name="appliedAt" type="date" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="followUpAt">Follow-up date</Label>

                    <Input id="followUpAt" name="followUpAt" type="date" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>

                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    maxLength={3000}
                    placeholder="Recruiter details, interview notes or important requirements..."
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>

                <Button type="submit">Add application</Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Your applications</h2>

            <p className="text-sm text-muted-foreground">
              {applications.length === 0
                ? "No applications have been added."
                : `${applications.length} application${
                    applications.length === 1 ? "" : "s"
                  } recorded.`}
            </p>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="font-medium">Add your first job application</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  It will appear here after you submit the form above.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle>{application.job_title}</CardTitle>

                        <CardDescription className="mt-1">
                          {application.company_name}
                          {application.location
                            ? ` • ${application.location}`
                            : ""}
                        </CardDescription>
                      </div>

                      <Badge variant="secondary">
                        {statusLabels[application.status]}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid gap-4 text-sm md:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Employment type</p>

                        <p className="font-medium">
                          {application.employment_type ?? "Not set"}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Applied</p>

                        <p className="font-medium">
                          {formatDate(application.applied_at)}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Follow-up</p>

                        <p className="font-medium">
                          {formatDate(application.follow_up_at)}
                        </p>
                      </div>
                    </div>

                    {application.notes && (
                      <div className="mt-4 rounded-md border bg-muted/30 p-3 text-sm">
                        {application.notes}
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Link
                        href={`/dashboard/applications/${application.id}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        View / edit
                      </Link>
                      {application.job_url && (
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                        >
                          View job advertisement
                        </a>
                      )}

                      <form action={deleteApplication}>
                        <input
                          type="hidden"
                          name="applicationId"
                          value={application.id}
                        />

                        <Button type="submit" variant="outline" size="sm">
                          Delete
                        </Button>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
