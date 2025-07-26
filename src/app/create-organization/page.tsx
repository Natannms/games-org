import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

export default function CreateOrganizationPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">OrgPlay</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Create Your Organization</CardTitle>
            <CardDescription>Give your new gaming community a name.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input id="org-name" placeholder="The Gaming Guild" required />
              </div>
              <Button type="submit" className="w-full" asChild>
                <Link href="/dashboard">Create Organization</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
