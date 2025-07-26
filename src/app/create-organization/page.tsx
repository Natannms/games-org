
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orgName, setOrgName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to create an organization.");
      toast({
        title: "Error",
        description: "You must be logged in to create an organization.",
        variant: "destructive",
      });
      return;
    }

    if (!orgName.trim()) {
        setError("Organization name cannot be empty.");
        toast({
            title: "Error",
            description: "Organization name cannot be empty.",
            variant: "destructive",
        });
        return;
    }

    try {
      await addDoc(collection(db, "game_organization"), {
        name: orgName,
        ownerId: user.uid,
      });
      router.push("/dashboard");
    } catch (err) {
      const errorMessage = "Failed to create organization. Please try again.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


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
            <form onSubmit={handleCreateOrganization} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <Input 
                  id="org-name" 
                  placeholder="The Gaming Guild" 
                  required 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full">
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
