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
import { FormationSelector } from "./components/FormationSelector";
import type { Formation } from "./constants/formations";

export function PlayersPage() {
  const queryClient = useQueryClient();
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [evaluationPosition, setEvaluationPosition] = useState<BestPosition | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);

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
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={syncMutation.isPending ? <CircularProgress size={20} sx={{ color: "#ffffff" }} /> : <Refresh />}
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
          <Typography
            variant="body2"
            sx={{
              color: "rgba(203, 213, 224, 0.8)",
              fontWeight: 500
            }}
          >
            Evaluate position:
          </Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={evaluationPosition ?? "all"}
            onChange={handleEvaluationChange}
            sx={{
              "& .MuiToggleButton-root": {
                borderColor: "rgba(66, 153, 225, 0.2)",
                color: "#cbd5e0"
              }
            }}
          >
            <ToggleButton value="all">All</ToggleButton>
            {POSITION_ORDER.map((position) => (
              <ToggleButton key={position} value={position}>
                {position}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {evaluationPosition && (
            <Typography
              variant="body2"
              sx={{
                color: "#4299e1",
                fontWeight: 500
              }}
            >
              Showing scores for {getPositionLabel(evaluationPosition)}
            </Typography>
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography
            variant="body2"
            sx={{
              color: "rgba(203, 213, 224, 0.8)",
              fontWeight: 500
            }}
          >
            Formation:
          </Typography>
          <FormationSelector
            selectedFormation={selectedFormation}
            onFormationChange={setSelectedFormation}
          />
        </Stack>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(203, 213, 224, 0.8)",
            fontWeight: 500
          }}
        >
          Players shown: {activePlayersCount}
        </Typography>
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
        <SimplePlayersTable
          players={players}
          isLoading={isLoading}
          evaluationPosition={evaluationPosition}
          selectedFormation={selectedFormation}
        />
      )}

      <Snackbar
        open={snackbarMessage !== null}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage(null)}
        message={snackbarMessage ?? ""}
        ContentProps={{
          sx: {
            bgcolor: "#0f1428",
            border: "1px solid rgba(66, 153, 225, 0.2)",
            borderRadius: 2,
            color: "#cbd5e0"
          }
        }}
      />
    </Stack>
  );
}
