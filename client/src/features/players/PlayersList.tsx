import { useMemo } from "react";
import { Box, Grid, CircularProgress } from "@mui/material";
import { PlayerCard } from "../../components/PlayerCard";
import type { Player } from "../../api/players";
import type { Match } from "../../api/matches";
import { didNotPlayLastMatch } from "./utils/playerFilters";

export type PlayersListProps = {
  players: Player[];
  isLoading?: boolean;
  excludePlayed?: boolean;
  lastMatch: Match | null;
};

export function PlayersList({ players, isLoading, excludePlayed = false, lastMatch }: PlayersListProps) {
  const activePlayers = useMemo(() => {
    let filtered = players.filter((player) => player.active);
    
    if (excludePlayed) {
      // Exclude players who played, keep only those who didn't play
      filtered = filtered.filter((player) => didNotPlayLastMatch(player, lastMatch));
    }
    
    return filtered;
  }, [players, excludePlayed, lastMatch]);

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
          <PlayerCard player={player} />
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
