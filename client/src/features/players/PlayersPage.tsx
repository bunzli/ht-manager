import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Stack, Typography, FormControlLabel, Checkbox, Box } from "@mui/material";
import { fetchPlayers } from "../../api/players";
import { fetchLastMatch } from "../../api/matches";
import { PlayersList } from "./PlayersList";

export function PlayersPage() {
  const [excludePlayed, setExcludePlayed] = useState(false);
  
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
    data: lastMatch = null,
    isLoading: isLoadingLastMatch
  } = useQuery({
    queryKey: ["lastMatch"],
    queryFn: fetchLastMatch
  });

  return (
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography
          variant="h5"
          sx={{
            color: "#e2e8f0",
            fontWeight: 700,
            letterSpacing: "0.5px"
          }}
        >
          Team Players
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={excludePlayed}
              onChange={(e) => setExcludePlayed(e.target.checked)}
              sx={{
                color: "#4299e1",
                "&.Mui-checked": {
                  color: "#4299e1"
                }
              }}
            />
          }
          label={
            <Typography
              variant="body2"
              sx={{
                color: "#cbd5e0",
                fontSize: "0.875rem"
              }}
            >
              Exclude players who played last match
            </Typography>
          }
        />
      </Box>

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
          isLoading={isLoading || isLoadingLastMatch} 
          excludePlayed={excludePlayed}
          lastMatch={lastMatch}
        />
      )}
    </Stack>
  );
}
