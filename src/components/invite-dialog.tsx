
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";

interface InviteDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function InviteDialog({ isOpen, setOpen }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    async function generateInviteLink() {
      if (isOpen) {
        const user = auth.currentUser;
        if (!user) {
          toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
          return;
        }

        try {
          const orgQuery = query(collection(db, "game_organization"), where("ownerId", "==", user.uid));
          const orgSnapshot = await getDocs(orgQuery);

          if (orgSnapshot.empty) {
            toast({ title: "Error", description: "You don't own an organization.", variant: "destructive" });
            return;
          }

          const orgDoc = orgSnapshot.docs[0];
          let inviteCode = orgDoc.data().inviteCode;

          if (!inviteCode) {
            inviteCode = Math.random().toString(36).substring(2, 10);
            await updateDoc(doc(db, "game_organization", orgDoc.id), { inviteCode });
          }

          const newLink = `${window.location.origin}/invite/${inviteCode}`;
          setInviteLink(newLink);

        } catch (error) {
            toast({ title: "Error", description: "Could not generate invite link.", variant: "destructive" });
        }
      }
    }
    generateInviteLink();
  }, [isOpen, toast]);

  const copyToClipboard = () => {
    if(!inviteLink) {
        toast({
            title: "Error",
            description: "No invite link generated yet.",
            variant: "destructive",
          });
        return;
    }
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied to clipboard!",
      description: "The invite link has been copied.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a Member</DialogTitle>
          <DialogDescription>
            Share this link with others to invite them to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>
            <Input id="link" value={inviteLink} readOnly placeholder="Generating invite link..."/>
          </div>
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard} disabled={!inviteLink}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
