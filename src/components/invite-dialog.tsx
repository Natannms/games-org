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

interface InviteDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}

export function InviteDialog({ isOpen, setOpen }: InviteDialogProps) {
  const [inviteLink, setInviteLink] = React.useState("");
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      // In a real app, you'd generate a unique link on the server
      const newLink = `${window.location.origin}/invite/${Math.random().toString(36).substring(2, 10)}`;
      setInviteLink(newLink);
    }
  }, [isOpen]);

  const copyToClipboard = () => {
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
            <Input id="link" value={inviteLink} readOnly />
          </div>
          <Button type="button" size="sm" className="px-3" onClick={copyToClipboard}>
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
