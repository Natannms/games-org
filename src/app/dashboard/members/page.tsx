
"use client";

import * as React from "react";
import { MemberTableClient, type MemberRole } from "@/components/member-table-client";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { InviteDialog } from "@/components/invite-dialog";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function MembersPage() {
  const [isInviteOpen, setInviteOpen] = React.useState(false);
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

  const canInvite = currentUserRole === 'admin' || currentUserRole === 'owner';

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Members</h1>
        {canInvite && (
          <Button onClick={() => setInviteOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        )}
      </div>
      <MemberTableClient />
      {canInvite && <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} />}
    </>
  );
}
