
import { MemberTableClient } from "@/components/member-table-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function MembersPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Members</h1>
      </div>
      <MemberTableClient />
    </>
  );
}
