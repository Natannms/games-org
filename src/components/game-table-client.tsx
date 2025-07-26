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

export type Game = {
  id: string;
  name: string;
  category: "co-op" | "single-player";
  type: "casual" | "historical";
  maxPlayers: number;
};

const mockData: Game[] = [
  { id: "1", name: "Cyberpunk 2077", category: "single-player", type: "casual", maxPlayers: 1 },
  { id: "2", name: "It Takes Two", category: "co-op", type: "casual", maxPlayers: 2 },
  { id: "3", name: "Age of Empires IV", category: "single-player", type: "historical", maxPlayers: 8 },
  { id: "4", name: "Stardew Valley", category: "co-op", type: "casual", maxPlayers: 4 },
  { id: "5", name: "Crusader Kings III", category: "single-player", type: "historical", maxPlayers: 64 },
  { id: "6", name: "Baldur's Gate 3", category: "co-op", type: "casual", maxPlayers: 4 },
  { id: "7", name: "Sid Meier's Civilization VI", category: "single-player", type: "historical", maxPlayers: 12 },
];

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
      return <div className="text-right font-medium">{row.getValue("maxPlayers")}</div>;
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
                <DropdownMenuItem className="text-destructive">Delete Game</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      );
    },
  },
];

export function GameTableClient() {
  const [data, setData] = React.useState(() => [...mockData]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [isAddGameOpen, setAddGameOpen] = React.useState(false);

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
  
  const addGame = (newGame: Omit<Game, "id">) => {
    setData(prev => [{ ...newGame, id: (prev.length + 1).toString() }, ...prev]);
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
