
"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, QueryDocumentSnapshot, DocumentData, doc, updateDoc, query, where, deleteDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";


export type MemberRole = "admin" | "member" | "viewer" | "moderator" | "owner";

export type Member = {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: MemberRole;
  status: "active" | "invited";
};

const ROLES: MemberRole[] = ["member", "viewer", "admin", "moderator"];

async function getMembers(organizationId: string): Promise<Member[]> {
  const membersQuery = query(collection(db, 'games_members'), where("organizationId", "==", organizationId));
  const memberSnapshot = await getDocs(membersQuery);
  const memberList = memberSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
    const data = doc.data();
    return {
        id: doc.id,
        uid: data.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
    } as Member;
  });
  return memberList;
}

export function MemberTableClient() {
    const [data, setData] = React.useState<Member[]>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const { toast } = useToast();
    const [currentUserRole, setCurrentUserRole] = React.useState<MemberRole | null>(null);
    const [organizationId, setOrganizationId] = React.useState<string | null>(null);
    const [memberToRemove, setMemberToRemove] = React.useState<Member | null>(null);

    const fetchMembers = React.useCallback(async (orgId: string) => {
      if (!orgId) return;
      try {
        const members = await getMembers(orgId);
        setData(members);
      } catch (error) {
        console.error("Failed to fetch members:", error);
        toast({
          title: "Error",
          description: "Could not fetch members.",
          variant: "destructive",
        });
      }
    }, [toast]);
  
    React.useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const q = query(collection(db, "games_members"), where("uid", "==", user.uid));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const memberData = querySnapshot.docs[0].data();
                  setCurrentUserRole(memberData.role as MemberRole);
                  setOrganizationId(memberData.organizationId);
                  fetchMembers(memberData.organizationId);
                } else {
                    setCurrentUserRole(null);
                    setOrganizationId(null);
                    setData([]);
                }
            } else {
                setData([]);
                setCurrentUserRole(null);
                setOrganizationId(null);
            }
        });
        return () => unsubscribe();
      }, [fetchMembers]);
  
    const handleRoleChange = async (memberId: string, newRole: MemberRole) => {
        try {
          const memberDocRef = doc(db, "games_members", memberId);
          await updateDoc(memberDocRef, { role: newRole });
          toast({
            title: "Success",
            description: "Member role updated successfully.",
          });
          if(organizationId) fetchMembers(organizationId);
        } catch (error) {
          console.error("Failed to update role:", error);
          toast({
            title: "Error",
            description: "Failed to update member role.",
            variant: "destructive",
          });
        }
      };

    const handleRemoveMember = async () => {
        if (!memberToRemove) return;
        try {
            await deleteDoc(doc(db, "games_members", memberToRemove.id));
            toast({
                title: "Member Removed",
                description: `${memberToRemove.name} has been removed from the organization.`,
            });
            if(organizationId) fetchMembers(organizationId);
        } catch (error) {
            console.error("Failed to remove member:", error);
            toast({
                title: "Error",
                description: "Failed to remove member.",
                variant: "destructive",
            });
        } finally {
            setMemberToRemove(null);
        }
    };
  
    const columns: ColumnDef<Member>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                  <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                );
              },
            cell: ({ row }) => {
                const name = row.getValue("name") as string;
                const fallback = name ? name.split(' ').map(n => n[0]).join('') : '';
              return (
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${fallback}`} data-ai-hint="user avatar" />
                    <AvatarFallback>{fallback}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{name}</span>
                </div>
              );
            },
          },
          {
            accessorKey: "email",
            header: "Email",
          },
          {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
          },
          {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
              <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"} className="capitalize bg-opacity-20">
                {row.getValue("status")}
              </Badge>
            ),
          },
          {
            id: "actions",
            cell: ({ row }) => {
              const member = row.original;
              const canManage = currentUserRole === 'admin' || currentUserRole === 'owner';

              return (
                <div className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={!canManage}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger disabled={!canManage || member.role === 'owner'}>Change Role</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuRadioGroup 
                            value={member.role}
                            onValueChange={(newRole) => handleRoleChange(member.id, newRole as MemberRole)}
                           >
                            {ROLES.map((role) => (
                              <DropdownMenuRadioItem key={role} value={role} className="capitalize">
                                {role}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      {member.status === 'invited' && <DropdownMenuItem>Resend Invite</DropdownMenuItem>}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive" 
                        disabled={!canManage || member.role === 'owner'}
                        onClick={() => setMemberToRemove(member)}
                      >
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            },
          },
        ];
  
    const table = useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
      },
    });
  
    return (
      <div className="w-full">
        <div className="flex items-center py-4">
          <Input
            placeholder="Filter members by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
        <Card>
          <CardContent className="p-0">
          <Table>
              <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                      return (
                      <TableHead key={header.id}>
                          {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                              )}
                      </TableHead>
                      );
                  })}
                  </TableRow>
              ))}
              </TableHeader>
              <TableBody>
              {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                  <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                  >
                      {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                          {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                          )}
                      </TableCell>
                      ))}
                  </TableRow>
                  ))
              ) : (
                  <TableRow>
                  <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                  >
                      No members found.
                  </TableCell>
                  </TableRow>
              )}
              </TableBody>
          </Table>
          </CardContent>
        </Card>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
        {memberToRemove && (
            <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently remove {memberToRemove.name} from the organization.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMemberToRemove(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveMember}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        )}
      </div>
    );
  }

    