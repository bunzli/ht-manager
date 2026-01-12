import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Stack, Typography, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { fetchPlayers } from "../../api/players";
import { fetchThisWeekOfficialMatchIds } from "../../api/matches";
import { PlayersList, type PlayedThisWeekFilter } from "./PlayersList";

export function PlayersPage() {
  const [playedThisWeekFilter, setPlayedThisWeekFilter] = useState<PlayedThisWeekFilter>("all");
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
      <Box display="flex" alignItems="center" justifyContent="space-between">
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
        <FormControl
          size="small"
          sx={{
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              color: "#cbd5e0",
              "& fieldset": {
                borderColor: "rgba(66, 153, 225, 0.3)"
              },
              "&:hover fieldset": {
                borderColor: "rgba(66, 153, 225, 0.5)"
              },
              "&.Mui-focused fieldset": {
                borderColor: "#4299e1"
              }
            },
            "& .MuiInputLabel-root": {
              color: "#9ca3af"
            },
            "& .MuiSvgIcon-root": {
              color: "#9ca3af"
            }
          }}
        >
          <InputLabel id="played-this-week-filter-label">Played this week?</InputLabel>
          <Select
            labelId="played-this-week-filter-label"
            id="played-this-week-filter"
            value={playedThisWeekFilter}
            label="Played this week?"
            onChange={(e) => setPlayedThisWeekFilter(e.target.value as PlayedThisWeekFilter)}
            sx={{
              color: "#cbd5e0"
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>
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
          isLoading={isLoading || isLoadingMatchIds} 
          playedThisWeekFilter={playedThisWeekFilter}
          thisWeekOfficialMatchesIds={thisWeekOfficialMatchesIds}
          onFilteredCountChange={setFilteredCount}
        />
      )}
    </Stack>
  );
}
