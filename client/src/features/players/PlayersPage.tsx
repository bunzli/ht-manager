import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Stack, Typography } from "@mui/material";
import { fetchPlayers } from "../../api/players";
import { fetchThisWeekOfficialMatchIds } from "../../api/matches";
import { PlayersList } from "./PlayersList";
import { PlayerFiltersAndSort } from "./components/PlayerFiltersAndSort";
import type { PlayerFilters } from "./utils/playerFilters";
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
    data: thisWeekOfficialMatchesIds = [],
    isLoading: isLoadingMatchIds
  } = useQuery({
    queryKey: ["thisWeekOfficialMatchIds"],
    queryFn: fetchThisWeekOfficialMatchIds
  });


  return (
    <Stack spacing={3}>
      <Typography
        variant="h5"
        sx={{
          color: "#e2e8f0",
          fontWeight: 700,
          letterSpacing: "0.5px"
        }}
      >
        Team Players{filteredCount !== null ? ` (${filteredCount})` : ""}
      </Typography>

      <PlayerFiltersAndSort
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />

      {isError ? (
        <Alert
          severity="error"
          onClose={() => refetch()}
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 2
          }}
        >
          Failed to load players. Try again.
        </Alert>
      ) : (
        <PlayersList 
          players={players} 
          isLoading={isLoading || isLoadingMatchIds} 
          filters={filters}
          sort={sort}
          thisWeekOfficialMatchesIds={thisWeekOfficialMatchesIds}
          onFilteredCountChange={setFilteredCount}
        />
      )}
    </Stack>
  );
}
