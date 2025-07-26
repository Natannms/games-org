
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  
  const [organizationName, setOrganizationName] = useState("your new organization");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const inviteCode = Array.isArray(params.code) ? params.code[0] : params.code;

  useEffect(() => {
    async function fetchOrganization() {
      if (!inviteCode) {
        setError("Invalid invite link.");
        setLoading(false);
        return;
      }

      try {
        const q = query(collection(db, "game_organization"), where("inviteCode", "==", inviteCode));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError("This invitation is no longer valid or is incorrect.");
        } else {
          const orgDoc = querySnapshot.docs[0];
          setOrganizationName(orgDoc.data().name);
          setOrganizationId(orgDoc.id);
        }
      } catch (err) {
        console.error("Error verifying invitation:", err);
        setError("Failed to verify invitation. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [inviteCode]);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) {
        setError("Cannot register without a valid organization. The invite link might be incorrect.");
        return;
    }
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(collection(db, "games_members"), {
        uid: user.uid,
        name: fullName,
        email: email,
        role: "member",
        status: "active",
        organizationId: organizationId,
      });

      router.push("/dashboard");

    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "This email is already registered.";
            break;
          case "auth/invalid-email":
            errorMessage = "Please enter a valid email address.";
            break;
          case "auth/weak-password":
            errorMessage = "Password should be at least 6 characters.";
            break;
          default:
            errorMessage = "Failed to create account. Please try again.";
            break;
        }
      }
      setError(errorMessage);
       toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <p>Verifying your invitation...</p>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
       <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">OrgPlay</span>
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">You're Invited to Join</CardTitle>
            <CardDescription>
              <span className="font-bold text-primary">{organizationName}</span>! Create an account to accept.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input 
                  id="full-name" 
                  placeholder="John Doe" 
                  required 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full" disabled={!organizationId}>
                Accept & Create Account
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline">
                Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
