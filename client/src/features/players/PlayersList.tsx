import { useMemo, useEffect } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { PlayerCard } from "../../components/PlayerCard";
import type { Player } from "../../api/players";
import { playedThisWeek, didNotPlayThisWeek } from "./utils/playerFilters";

export type PlayedThisWeekFilter = "yes" | "no" | "all";

export type PlayersListProps = {
  players: Player[];
  isLoading?: boolean;
  playedThisWeekFilter?: PlayedThisWeekFilter;
  thisWeekOfficialMatchesIds: number[];
  onFilteredCountChange?: (count: number) => void;
};

export function PlayersList({ players, isLoading, playedThisWeekFilter = "all", thisWeekOfficialMatchesIds, onFilteredCountChange }: PlayersListProps) {
  const activePlayers = useMemo(() => {
    let filtered = players.filter((player) => player.active);
    
    if (playedThisWeekFilter === "yes") {
      // Show only players who played this week
      filtered = filtered.filter((player) => playedThisWeek(player, thisWeekOfficialMatchesIds));
    } else if (playedThisWeekFilter === "no") {
      // Show only players who did NOT play this week
      filtered = filtered.filter((player) => didNotPlayThisWeek(player, thisWeekOfficialMatchesIds));
    }
    // "all" shows all players, no additional filtering
    
    return filtered;
  }, [players, playedThisWeekFilter, thisWeekOfficialMatchesIds]);

  // Notify parent of filtered count
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(activePlayers.length);
    }
  }, [activePlayers.length, onFilteredCountChange]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {activePlayers.map((player) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={player.playerId}>
          <PlayerCard player={player} clickable={true} />
        </Grid>
      ))}
      {activePlayers.length === 0 && (
        <Grid size={12}>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "#9ca3af"
            }}
          >
            No active players found
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
