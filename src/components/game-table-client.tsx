
"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  PlusCircle,
  Coffee,
  User,
  Users,
  Scroll,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddGameDialog } from "./add-game-dialog";
import { Card, CardContent } from "./ui/card";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "./ui/checkbox";

export type Game = {
  id: string;
  name: string;
  category: "co-op" | "single-player";
  type: "casual" | "historical";
  maxPlayers: number;
  wasDrawn: boolean;
  suggestedBy: string;
  organizationId: string;
  drawCount?: number;
  lastDrawnAt?: Date;
};

const categoryIcons = {
  "co-op": <Users className="h-4 w-4" />,
  "single-player": <User className="h-4 w-4" />,
};

const typeIcons = {
  casual: <Coffee className="h-4 w-4" />,
  historical: <Scroll className="h-4 w-4" />,
};

export const columns: ColumnDef<Game>[] = [
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
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const category = row.getValue("category") as keyof typeof categoryIcons;
      return (
        <Badge variant="outline" className="capitalize">
          {categoryIcons[category]}
          <span className="ml-2">{category}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as keyof typeof typeIcons;
      return (
        <Badge variant="outline" className="capitalize">
          {typeIcons[type]}
          <span className="ml-2">{type}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "maxPlayers",
    header: () => <div className="text-right">Max Players</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right font-medium">
          {row.getValue("maxPlayers")}
        </div>
      );
    },
  },
   {
    accessorKey: "drawCount",
    header: () => <div className="text-center">Draw Count</div>,
    cell: ({ row }) => {
        const count = row.getValue("drawCount") as number | undefined;
        return (
          <div className="text-center font-medium">
            {count || 0}
          </div>
        );
      },
  },
  {
    accessorKey: "suggestedBy",
    header: "Suggested By",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("suggestedBy")}</div>
    ),
  },
  {
    accessorKey: "wasDrawn",
    header: "Drawn",
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
            <Checkbox checked={row.getValue("wasDrawn")} disabled />
        </div>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
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
              <DropdownMenuItem>Edit Game</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete Game
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

export function GameTableClient() {
  const [data, setData] = React.useState<Game[]>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isAddGameOpen, setAddGameOpen] = React.useState(false);
  const { toast } = useToast();
  const [organizationId, setOrganizationId] = React.useState<string | null>(null);
  const [currentUser, setCurrentUser] = React.useState<any | null>(null);

  const fetchGames = React.useCallback(async (orgId: string) => {
    const gamesQuery = query(collection(db, "games_list"), where("organizationId", "==", orgId));
    const gamesSnapshot = await getDocs(gamesQuery);
    const gamesList = gamesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
    setData(gamesList);
  }, []);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
            setCurrentUser(user);
            const membersQuery = query(collection(db, "games_members"), where("uid", "==", user.uid));
            const membersSnapshot = await getDocs(membersQuery);
            if (!membersSnapshot.empty) {
                const memberData = membersSnapshot.docs[0].data();
                setOrganizationId(memberData.organizationId);
                fetchGames(memberData.organizationId);
            }
        } else {
            // Handle user not logged in
            setData([]);
            setOrganizationId(null);
            setCurrentUser(null);
        }
    });

    return () => unsubscribe();
  }, [fetchGames]);

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

  const addGame = async (newGame: Omit<Game, "id" | "wasDrawn" | "suggestedBy" | "organizationId">) => {
    if (!organizationId || !currentUser) {
        toast({ title: "Error", description: "You must be part of an organization to add a game.", variant: "destructive" });
        return;
    }

    try {
        const gameDoc = {
            ...newGame,
            wasDrawn: false,
            suggestedBy: currentUser.displayName || currentUser.email,
            organizationId: organizationId,
            drawCount: 0,
        };
        await addDoc(collection(db, 'games_list'), gameDoc);
        fetchGames(organizationId);
        toast({ title: "Success", description: "Game added successfully!" });
    } catch(err) {
        toast({ title: "Error", description: "Failed to add game.", variant: "destructive" });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter games by name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Button onClick={() => setAddGameOpen(true)} className="ml-auto">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Game
        </Button>
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
                    No results.
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
      <AddGameDialog
        isOpen={isAddGameOpen}
        setOpen={setAddGameOpen}
        onGameAdd={addGame}
      />
    </div>
  );
}
