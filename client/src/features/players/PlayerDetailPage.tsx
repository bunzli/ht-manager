import { useMemo } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Tooltip
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { fetchPlayer, type PlayerDetails } from "../../api/players";
import {
  computePositionScores,
  getPositionDisplayInfo,
  getPositionLabel,
  POSITION_ORDER
} from "./utils/positionScores";

function formatChangeValue(value: string | null): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const trimmed = value.trim();
  if (trimmed === "" || trimmed.toLowerCase() === "null" || trimmed.toLowerCase() === "undefined") {
    return "—";
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object") {
      return JSON.stringify(parsed);
    }
  } catch (_error) {
    // fallthrough to plain string
  }

  return value;
}

function formatChangeDate(dateText: string): string {
  const date = new Date(dateText);
  if (Number.isNaN(date.getTime())) {
    return dateText;
  }
  return date.toLocaleString();
}

function formatScoreValue(score: number | null | undefined): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return "—";
  }
  return score.toFixed(2);
}

export function PlayerDetailPage() {
  const { playerId: playerIdParam } = useParams<{ playerId: string }>();
  const playerId = Number(playerIdParam);
  const isValidPlayerId = Number.isFinite(playerId);

  const { data: player, isLoading, isError, error } = useQuery({
    queryKey: ["player", playerId],
    queryFn: () => fetchPlayer(playerId),
    enabled: isValidPlayerId
  });

  const title = useMemo(() => {
    if (player) {
      return `${player.name} (#${player.playerId})`;
    }
    if (isValidPlayerId) {
      return `Player #${playerId}`;
    }
    return "Player details";
  }, [player, isValidPlayerId, playerId]);

  const positionScores = useMemo(() => {
    if (!player) {
      return null;
    }
    const baseData: Record<string, unknown> = {
      ...player,
      ...(player.latestSnapshot?.data ?? {})
    };
    return computePositionScores(baseData);
  }, [player]);

  const positionEntries = useMemo(() => {
    if (!positionScores) {
      return [];
    }

    return POSITION_ORDER.map((position) => ({
      position,
      label: getPositionLabel(position),
      display: getPositionDisplayInfo(position),
      score: positionScores.scores[position] ?? null,
      isBest: positionScores.bestPosition === position
    }));
  }, [positionScores]);

  if (!isValidPlayerId) {
    return (
      <Alert severity="error">
        The player you are looking for does not exist. Please return to the roster and try again.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="text"
          startIcon={<ArrowBack />}
          component={RouterLink}
          to="/"
        >
          Back
        </Button>
        <Typography variant="h5">{title}</Typography>
      </Stack>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {isError && !isLoading && (
        <Alert severity="error">
          Failed to load player details: {error instanceof Error ? error.message : "Unknown error"}
        </Alert>
      )}

      {player && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Profile
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Player ID
                </Typography>
                <Typography variant="body1">{player.playerId}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Team ID
                </Typography>
                <Typography variant="body1">{player.teamId}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  {player.active ? "Active" : "Inactive"}
                </Typography>
              </Box>
              {player.latestSnapshot && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last snapshot
                  </Typography>
                  <Typography variant="body1">
                    {formatChangeDate(player.latestSnapshot.fetchedAt)}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>

          <Paper variant="outlined">
            <Box
              px={2}
              py={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle1">Position ratings</Typography>
              {positionScores?.bestPosition && (
                <Typography variant="body2" color="text.secondary">
                  Best: {getPositionLabel(positionScores.bestPosition)} (
                  {formatScoreValue(positionScores.bestScore)})
                </Typography>
              )}
            </Box>
            {positionEntries.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Position</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positionEntries.map((entry) => (
                      <TableRow key={entry.position} selected={entry.isBest}>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {entry.display ? (
                              <Tooltip title={entry.label}>
                                <Chip
                                  label={entry.display.label}
                                  size="small"
                                  sx={{
                                    bgcolor: entry.display.color,
                                    color: (theme) =>
                                      theme.palette.getContrastText(entry.display!.color),
                                    fontWeight: 600,
                                    fontSize: "0.7rem"
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Chip label={entry.label} size="small" />
                            )}
                            <Typography variant="body2">{entry.label}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            fontWeight={entry.isBest ? 700 : 400}
                          >
                            {formatScoreValue(entry.score)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box px={2} pb={2}>
                <Typography variant="body2" color="text.secondary">
                  Position ratings will appear once a player snapshot is available.
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper variant="outlined">
            <Box px={2} py={2} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">
                Change history ({player.changes.length})
              </Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>Recorded at</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Old value</TableCell>
                    <TableCell>New value</TableCell>
                    <TableCell>Snapshot</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {player.changes.map((change: PlayerDetails["changes"][number]) => (
                    <TableRow key={change.changeId} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {formatChangeDate(change.recordedAt)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {change.fieldName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatChangeValue(change.oldValue)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatChangeValue(change.newValue)}</Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>#{change.snapshotId}</TableCell>
                    </TableRow>
                  ))}
                  {player.changes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">
                          No changes have been recorded for this player yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
