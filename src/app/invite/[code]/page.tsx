import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function InvitePage({ params }: { params: { code: string } }) {
  const organizationName = "The Gaming Guild"; // Placeholder

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <div className="w-full max-w-md text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">OrgPlay</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-headline">You're Invited!</CardTitle>
            <CardDescription>
              You have been invited to join the organization: <strong>{organizationName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>Create an account or log in to accept your invitation.</p>
            <Button asChild>
                <Link href="/register">Accept Invitation & Sign Up</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/login">Login to Existing Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
