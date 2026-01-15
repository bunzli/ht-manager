import { useMemo, useEffect } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { PlayerCard } from "../../components/PlayerCard";
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
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredAndSortedPlayers.map((player) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={player.playerId}>
          <PlayerCard player={player} clickable={true} />
        </Grid>
      ))}
      {filteredAndSortedPlayers.length === 0 && (
        <Grid size={12}>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#9ca3af"
            }}
          >
            No players found matching the filters
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
