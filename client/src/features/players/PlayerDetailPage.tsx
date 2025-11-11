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

/**
 * Infers the match date from a recorded date.
 * In Hattrick, matches are played on Fridays, so we find the most recent Friday
 * before or on the recorded date.
 */
function inferMatchDate(recordedDate: Date): Date {
  const date = new Date(recordedDate);
  date.setHours(0, 0, 0, 0);
  
  const day = date.getDay(); // 0 = Sunday, 5 = Friday
  const FRIDAY_INDEX = 5;
  
  // Calculate days to subtract to get to the most recent Friday
  // If it's Friday (day 5), stay on that day (0 days back)
  // If it's Saturday (day 6), go back 1 day
  // If it's Sunday (day 0), go back 2 days
  // If it's Monday-Thursday (day 1-4), go back (day + 3) days
  let daysToSubtract: number;
  if (day === FRIDAY_INDEX) {
    daysToSubtract = 0; // It's Friday, use that day
  } else if (day > FRIDAY_INDEX) {
    // Saturday (6) -> go back 1 day
    daysToSubtract = day - FRIDAY_INDEX;
  } else {
    // Sunday (0) through Thursday (4) -> go back to previous Friday
    daysToSubtract = day + 3; // Sunday: 0+3=3 (but should be 2), Monday: 1+3=4, etc.
    // Actually, Sunday needs special handling
    if (day === 0) {
      daysToSubtract = 2; // Sunday -> go back 2 days to Friday
    }
  }
  
  date.setDate(date.getDate() - daysToSubtract);
  return date;
}

type MatchData = {
  date: Date;
  snapshotId: number;
  matchesPlayed: number;
  goals: number | null;
  assists: number | null;
  cards: number | null;
};

function extractMatches(player: PlayerDetails): MatchData[] {
  // Group changes by snapshotId to identify matches
  const changesBySnapshot = new Map<number, PlayerDetails["changes"]>();
  
  for (const change of player.changes) {
    if (!changesBySnapshot.has(change.snapshotId)) {
      changesBySnapshot.set(change.snapshotId, []);
    }
    changesBySnapshot.get(change.snapshotId)!.push(change);
  }

  const matches: MatchData[] = [];

  // Process each snapshot's changes
  for (const [snapshotId, changes] of changesBySnapshot.entries()) {
    // Check if MatchesCurrentTeam increased (indicating a match was played)
    const matchChange = changes.find(
      (c) => c.fieldName === "MatchesCurrentTeam"
    );

    if (!matchChange) {
      continue;
    }

    const oldMatches = matchChange.oldValue
      ? Number.parseInt(matchChange.oldValue, 10)
      : 0;
    const newMatches = matchChange.newValue
      ? Number.parseInt(matchChange.newValue, 10)
      : 0;

    // Only include if matches increased
    if (newMatches > oldMatches) {
      // Try to get match date from LastMatch in snapshot data
      // Check if this is the latest snapshot and has LastMatch data
      let matchDate: Date;
      const isLatestSnapshot = player.latestSnapshot?.snapshotId === snapshotId;
      
      if (isLatestSnapshot && player.latestSnapshot?.data) {
        const lastMatch = player.latestSnapshot.data["LastMatch"] as
          | Record<string, unknown>
          | undefined;
        
        if (lastMatch && typeof lastMatch === "object") {
          // Try to extract match date from LastMatch
          const matchDateStr = lastMatch["Date"] as string | undefined;
          if (matchDateStr) {
            const parsedDate = new Date(matchDateStr);
            if (!Number.isNaN(parsedDate.getTime())) {
              matchDate = parsedDate;
            } else {
              // Fall back to inferred date
              const recordedDate = new Date(matchChange.recordedAt);
              matchDate = inferMatchDate(recordedDate);
            }
          } else {
            // Fall back to inferred date
            const recordedDate = new Date(matchChange.recordedAt);
            matchDate = inferMatchDate(recordedDate);
          }
        } else {
          // Fall back to inferred date
          const recordedDate = new Date(matchChange.recordedAt);
          matchDate = inferMatchDate(recordedDate);
        }
      } else {
        // For historical snapshots, infer the date
        const recordedDate = new Date(matchChange.recordedAt);
        matchDate = inferMatchDate(recordedDate);
      }
      
      const matchesPlayed = newMatches - oldMatches;
      
      // Extract goals, assists, and cards deltas from the same snapshot
      const goalsChange = changes.find((c) => c.fieldName === "GoalsCurrentTeam");
      const assistsChange = changes.find((c) => c.fieldName === "AssistsCurrentTeam");
      const cardsChange = changes.find((c) => c.fieldName === "Cards");

      let goals: number | null = null;
      if (goalsChange) {
        const oldGoals = goalsChange.oldValue
          ? Number.parseInt(goalsChange.oldValue, 10)
          : 0;
        const newGoals = goalsChange.newValue
          ? Number.parseInt(goalsChange.newValue, 10)
          : 0;
        if (!Number.isNaN(oldGoals) && !Number.isNaN(newGoals)) {
          goals = newGoals - oldGoals;
        }
      }
      
      let assists: number | null = null;
      if (assistsChange) {
        const oldAssists = assistsChange.oldValue
          ? Number.parseInt(assistsChange.oldValue, 10)
          : 0;
        const newAssists = assistsChange.newValue
          ? Number.parseInt(assistsChange.newValue, 10)
          : 0;
        if (!Number.isNaN(oldAssists) && !Number.isNaN(newAssists)) {
          assists = newAssists - oldAssists;
        }
      }
      
      let cards: number | null = null;
      if (cardsChange) {
        const oldCards = cardsChange.oldValue
          ? Number.parseInt(cardsChange.oldValue, 10)
          : 0;
        const newCards = cardsChange.newValue
          ? Number.parseInt(cardsChange.newValue, 10)
          : 0;
        if (!Number.isNaN(oldCards) && !Number.isNaN(newCards)) {
          cards = newCards - oldCards;
        }
      }

      matches.push({
        date: matchDate,
        snapshotId,
        matchesPlayed,
        goals,
        assists,
        cards
      });
    }
  }

  // Sort by date descending (most recent first)
  matches.sort((a, b) => b.date.getTime() - a.date.getTime());

  return matches;
}

function formatMatchDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
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

  const matches = useMemo(() => {
    if (!player) {
      return [];
    }
    return extractMatches(player);
  }, [player]);

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
              <Typography variant="subtitle1">Matches ({matches.length})</Typography>
            </Box>
            {matches.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>Date</TableCell>
                      <TableCell align="right">Matches</TableCell>
                      <TableCell align="right">Goals</TableCell>
                      <TableCell align="right">Assists</TableCell>
                      <TableCell align="right">Cards</TableCell>
                      <TableCell>Snapshot</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {matches.map((match, index) => (
                      <TableRow key={`${match.snapshotId}-${index}`} hover>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          {formatMatchDate(match.date)}
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">{match.matchesPlayed}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {match.goals !== null ? match.goals : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {match.assists !== null ? match.assists : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {match.cards !== null ? match.cards : "—"}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                          #{match.snapshotId}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box px={2} pb={2}>
                <Typography variant="body2" color="text.secondary">
                  No matches recorded yet. Matches will appear here when the player plays.
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
