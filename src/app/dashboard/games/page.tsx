
import { GameTableClient } from "@/components/game-table-client";

export default function GamesPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Game List</h1>
      </div>
      <GameTableClient />
    </>
  );
}
