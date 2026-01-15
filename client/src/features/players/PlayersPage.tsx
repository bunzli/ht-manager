import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, X } from "lucide-react";
import { fetchPlayers } from "../../api/players";
import { fetchMatches } from "../../api/matches";
import { PlayersList } from "./PlayersList";
import { PlayerFiltersAndSort } from "./components/PlayerFiltersAndSort";
import type { PlayerFilters } from "./utils/playerFilters";
import { getThisWeekOfficialMatchIds } from "./utils/playerFilters";
import type { PlayerSort } from "./utils/playerSorting";

const defaultFilters: PlayerFilters = {};

const defaultSort: PlayerSort = {
  field: null,
  direction: null
};

export function PlayersPage() {
  const [filters, setFilters] = useState<PlayerFilters>(defaultFilters);
  const [sort, setSort] = useState<PlayerSort>(defaultSort);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  
  const {
    data: players = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers
  });

  const {
    data: matches = [],
    isLoading: isLoadingMatches
  } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(50)
  });

  const thisWeekOfficialMatchesIds = useMemo(() => {
    return getThisWeekOfficialMatchIds(matches);
  }, [matches]);


  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-wide text-foreground">
        Team Players{filteredCount !== null ? ` (${filteredCount})` : ""}
      </h1>

      <PlayerFiltersAndSort
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />

      {isError ? (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
          <AlertCircle className="size-5" />
          <span className="flex-1">Failed to load players. Try again.</span>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-error/20 rounded"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <PlayersList 
          players={players} 
          isLoading={isLoading || isLoadingMatches} 
          filters={filters}
          sort={sort}
          thisWeekOfficialMatchesIds={thisWeekOfficialMatchesIds}
          onFilteredCountChange={setFilteredCount}
        />
      )}
    </div>
  );
}
