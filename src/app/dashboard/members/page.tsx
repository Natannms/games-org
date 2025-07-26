
"use client";

import * as React from "react";
import { MemberTableClient } from "@/components/member-table-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InviteDialog } from "@/components/invite-dialog";

export default function MembersPage() {
  const [isInviteOpen, setInviteOpen] = React.useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Members</h1>
        <Button onClick={() => setInviteOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
        </Button>
      </div>
      <MemberTableClient />
      <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} />
    </>
  );
}
