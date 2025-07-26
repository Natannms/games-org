import { MemberTableClient } from "@/components/member-table-client";

export default function MembersPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Members</h1>
      </div>
      <MemberTableClient />
    </>
  );
}
