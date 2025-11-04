import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { Refresh } from "@mui/icons-material";
import { fetchPlayers, syncPlayers } from "../../api/players";
import { SimplePlayersTable } from "./components/SimplePlayersTable";
import type { BestPosition } from "./utils/positionScores";
import { POSITION_ORDER, getPositionLabel } from "./utils/positionScores";

export function PlayersPage() {
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [evaluationPosition, setEvaluationPosition] = useState<BestPosition | null>(null);

  const {
    data: players = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["players"],
    queryFn: fetchPlayers
  });

  const syncMutation = useMutation({
    mutationFn: syncPlayers,
    onSuccess: (summary) => {
      void queryClient.invalidateQueries({ queryKey: ["players"] });
      setSnackbarMessage(
        `Sync complete: ${summary.playersCreated} new, ${summary.playersUpdated} updated, ${summary.totalChanges} changes`
      );
    },
    onError: (error: unknown) => {
      setSnackbarMessage(
        error instanceof Error ? `Sync failed: ${error.message}` : "Sync failed"
      );
    }
  });

  const handleSync = () => {
    syncMutation.mutate();
  };

  const handleEvaluationChange = (_event: unknown, value: BestPosition | "all" | null) => {
    if (value === null || value === "all") {
      setEvaluationPosition(null);
    } else {
      setEvaluationPosition(value);
    }
  };

  const activePlayersCount = useMemo(
    () => players.filter((player) => player.active).length,
    [players]
  );

  return (
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h5">Team Players</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={syncMutation.isPending ? <CircularProgress size={20} /> : <Refresh />}
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            Fetch updates
          </Button>
        </Stack>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={1.5}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            Evaluate position:
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={evaluationPosition ?? "all"}
            onChange={handleEvaluationChange}
          >
            <ToggleButton value="all">All</ToggleButton>
            {POSITION_ORDER.map((position) => (
              <ToggleButton key={position} value={position}>
                {position}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {evaluationPosition && (
            <Typography variant="body2" color="text.secondary">
              Showing scores for {getPositionLabel(evaluationPosition)}
            </Typography>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Players shown: {activePlayersCount}
        </Typography>
      </Box>

      {isError ? (
        <Alert severity="error" onClose={() => refetch()}>
          Failed to load players. Try again.
        </Alert>
      ) : (
        <SimplePlayersTable
          players={players}
          isLoading={isLoading}
          evaluationPosition={evaluationPosition}
        />
      )}

      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage ?? ""}
      />
    </Stack>
  );
}
