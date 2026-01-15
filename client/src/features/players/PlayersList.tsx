import { useMemo, useEffect } from "react";
import { PlayerCard } from "../../components/PlayerCard";
import { Spinner } from "@/components/ui/spinner";
import type { Player } from "../../api/players";
import { applyFilters, type PlayerFilters } from "./utils/playerFilters";
import { sortPlayers, type PlayerSort } from "./utils/playerSorting";

export type PlayersListProps = {
  players: Player[];
  isLoading?: boolean;
  filters: PlayerFilters;
  sort: PlayerSort;
  thisWeekOfficialMatchesIds: number[];
  onFilteredCountChange?: (count: number) => void;
};

export function PlayersList({ 
  players, 
  isLoading, 
  filters, 
  sort,
  thisWeekOfficialMatchesIds, 
  onFilteredCountChange 
}: PlayersListProps) {
  const filteredAndSortedPlayers = useMemo(() => {
    const filtered = applyFilters(players, filters, thisWeekOfficialMatchesIds);
    const sorted = sortPlayers(filtered, sort);
    return sorted;
  }, [players, filters, sort, thisWeekOfficialMatchesIds]);

  // Notify parent of filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredAndSortedPlayers.length);
    }
  }, [filteredAndSortedPlayers.length, onFilteredCountChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-10 gap-y-8">
      {filteredAndSortedPlayers.map((player) => (
        <div key={player.playerId} className="flex justify-center">
          <PlayerCard player={player} clickable={true} />
        </div>
      ))}
      {filteredAndSortedPlayers.length === 0 && (
        <div className="col-span-full text-center py-16 text-gray-400">
          No players found matching the filters
        </div>
      )}
    </div>
  );
}
