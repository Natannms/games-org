
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Game } from "./game-table-client";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  category: z.enum(["co-op", "single-player"]),
  type: z.enum(["casual", "historical"]),
  maxPlayers: z.coerce.number().int().min(1, "Must have at least 1 player."),
});

type AddGameFormValues = z.infer<typeof formSchema>;

interface AddGameDialogProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onGameAdd: (game: Omit<Game, 'id' | 'wasDrawn' | 'suggestedBy' | 'organizationId'>) => void;
}

export function AddGameDialog({ isOpen, setOpen, onGameAdd }: AddGameDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddGameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      maxPlayers: 1,
    },
  });

  const onSubmit = (data: AddGameFormValues) => {
    onGameAdd(data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Enter the details for the new game you want to add to your org.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input id="name" {...field} className="col-span-3" />
                )}
              />
              {errors.name && <p className="col-span-4 text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="co-op">Co-op</SelectItem>
                      <SelectItem value="single-player">Single-player</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
               {errors.category && <p className="col-span-4 text-sm text-destructive">{errors.category.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="historical">Historical</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="col-span-4 text-sm text-destructive">{errors.type.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxPlayers" className="text-right">
                Max Players
              </Label>
              <Controller
                name="maxPlayers"
                control={control}
                render={({ field }) => (
                  <Input
                    id="maxPlayers"
                    type="number"
                    {...field}
                    className="col-span-3"
                  />
                )}
              />
              {errors.maxPlayers && <p className="col-span-4 text-sm text-destructive">{errors.maxPlayers.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Add Game</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
