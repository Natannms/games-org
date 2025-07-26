
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
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import type { MemberRole } from "./member-table-client";

interface InviteDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function InviteDialog({ isOpen, setOpen }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = React.useState("");
  const { toast } = useToast();
  const [currentUserRole, setCurrentUserRole] = React.useState<MemberRole | null>(null);

  React.useEffect(() => {
      const fetchUserRole = async () => {
          const user = auth.currentUser;
          if (user) {
              const membersQuery = query(collection(db, "games_members"), where("uid", "==", user.uid));
              const querySnapshot = await getDocs(membersQuery);
              if (!querySnapshot.empty) {
                  const memberData = querySnapshot.docs[0].data();
                  setCurrentUserRole(memberData.role as MemberRole);
              }
          }
      };
      fetchUserRole();
  }, []);

  React.useEffect(() => {
    async function generateInviteLink() {
      if (isOpen) {
        const user = auth.currentUser;
        if (!user) {
          toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
          return;
        }

        if (currentUserRole !== 'admin' && currentUserRole !== 'owner') {
            toast({ title: "Permission Denied", description: "You don't have permission to invite members.", variant: "destructive" });
            return;
        }
        
        try {
          // An admin might not be the owner, so we need to find the organization via membership
          const membersQuery = query(collection(db, "games_members"), where("uid", "==", user.uid));
          const memberSnapshot = await getDocs(membersQuery);
          if(memberSnapshot.empty) {
            toast({ title: "Error", description: "You are not part of any organization.", variant: "destructive" });
            return;
          }
          const organizationId = memberSnapshot.docs[0].data().organizationId;
          const orgDocRef = doc(db, "game_organization", organizationId);
          const orgDocSnap = await getDocs(query(collection(db, "game_organization"), where("__name__", "==", organizationId)));
          
          if (orgDocSnap.empty) {
            toast({ title: "Error", description: "Organization not found.", variant: "destructive" });
            return;
          }

          const orgDoc = orgDocSnap.docs[0];
          let inviteCode = orgDoc.data().inviteCode;

          if (!inviteCode) {
            inviteCode = `org_${orgDoc.id.substring(0, 8)}`;
            await updateDoc(doc(db, "game_organization", orgDoc.id), { inviteCode });
          }

          const newLink = `${window.location.origin}/invite/${inviteCode}`;
          setInviteLink(newLink);

        } catch (error) {
            console.error("Error generating invite link: ", error);
            toast({ title: "Error", description: "Could not generate invite link. Please try again.", variant: "destructive" });
        }
      }
    }
    if(currentUserRole) {
        generateInviteLink();
    }
  }, [isOpen, toast, currentUserRole]);

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
