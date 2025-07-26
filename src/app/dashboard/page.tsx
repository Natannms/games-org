import { GameTableClient } from "@/components/game-table-client";

export default function Dashboard() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Games</h1>
      </div>
      <GameTableClient />
    </>
  );
}
