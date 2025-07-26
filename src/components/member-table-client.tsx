"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
import { InviteDialog } from "./invite-dialog";
import { Card, CardContent } from "./ui/card";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "invited";
};

const mockData: Member[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin", status: "active" },
  { id: "2", name: "Bob Williams", email: "bob@example.com", role: "member", status: "active" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "member", status: "active" },
  { id: "4", name: "Diana Miller", email: "diana@example.com", role: "member", status: "invited" },
  { id: "5", name: "Ethan Davis", email: "ethan@example.com", role: "member", status: "active" },
];

export const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const fallback = name.split(' ').map(n => n[0]).join('');
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
      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem>Change Role</DropdownMenuItem>
              {member.status === 'invited' && <DropdownMenuItem>Resend Invite</DropdownMenuItem>}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Remove Member</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function MemberTableClient() {
  const [data, setData] = React.useState(() => [...mockData]);
  const [isInviteOpen, setInviteOpen] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="ml-auto">
          <Button onClick={() => setInviteOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Member
          </Button>
        </div>
      </div>
      <Card>
        <CardContent>
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
      <InviteDialog isOpen={isInviteOpen} setOpen={setInviteOpen} />
    </div>
  );
}
