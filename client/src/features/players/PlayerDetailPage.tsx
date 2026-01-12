import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Divider
} from "@mui/material";
import { ArrowBack, SportsSoccer } from "@mui/icons-material";
import { fetchPlayer } from "../../api/players";
import { fetchMatches } from "../../api/matches";
import { PlayerCard } from "../../components/PlayerCard";
import { formatNumericValue, formatNumericDelta } from "./utils/formatting";
import { SKILL_LEVELS } from "../../components/PlayerCard/utils";

function formatFieldName(fieldName: string): string {
  // Convert camelCase or PascalCase to readable format
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatChangeValue(fieldName: string, value: string | null): string {
  if (value === null || value === "") {
    return "—";
  }

  // Check if it's a skill field
  const skillLevel = Number(value);
  if (!Number.isNaN(skillLevel) && SKILL_LEVELS[skillLevel]) {
    return `${skillLevel} (${SKILL_LEVELS[skillLevel]})`;
  }

  // Check if it's a numeric value
  const numeric = Number(value);
  if (!Number.isNaN(numeric)) {
    return formatNumericValue(numeric);
  }

  // Check if it's a boolean
  const lower = value.toLowerCase();
  if (lower === "true") return "Yes";
  if (lower === "false") return "No";

  return value;
}

function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getMatchTypeColor(matchType: string): string {
  switch (matchType) {
    case "LEAGUE":
      return "#3b82f6";
    case "CUP":
      return "#f59e0b";
    case "FRIENDLY":
      return "#10b981";
    default:
      return "#6b7280";
  }
}

function getMatchTypeLabel(matchType: string): string {
  switch (matchType) {
    case "LEAGUE":
      return "League";
    case "CUP":
      return "Cup";
    case "FRIENDLY":
      return "Friendly";
    case "QUALIFICATION":
      return "Qualification";
    case "SINGLE":
      return "Single";
    case "PREPARATION":
      return "Preparation";
    case "HATTRICK_MASTERS":
      return "Hattrick Masters";
    case "WORLD_CUP":
      return "World Cup";
    case "U20_WORLD_CUP":
      return "U-20 World Cup";
    case "LADDER":
      return "Ladder";
    case "TOURNAMENT":
      return "Tournament";
    default:
      return matchType;
  }
}

export function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const numericPlayerId = playerId ? Number.parseInt(playerId, 10) : null;

  const {
    data: player,
    isLoading: isLoadingPlayer,
    isError: isErrorPlayer
  } = useQuery({
    queryKey: ["player", numericPlayerId],
    queryFn: () => fetchPlayer(numericPlayerId!),
    enabled: numericPlayerId !== null && !Number.isNaN(numericPlayerId)
  });

  const {
    data: allMatches = [],
    isLoading: isLoadingMatches
  } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(100) // Get more matches to find player's matches
  });

  // Find matches where this player participated
  const playerMatches = useMemo(() => {
    if (!player || !allMatches.length) return [];

    const snapshotData = player.latestSnapshot?.data;
    if (!snapshotData || typeof snapshotData !== "object" || Array.isArray(snapshotData)) {
      return [];
    }

    // Get all LastMatch dates from player's changes
    const matchDates = new Set<string>();
    
    // Add current LastMatch if exists
    const lastMatch = snapshotData.LastMatch as Record<string, unknown> | undefined;
    if (lastMatch && typeof lastMatch === "object" && !Array.isArray(lastMatch)) {
      const matchDate = lastMatch.Date as string | undefined;
      if (matchDate) {
        matchDates.add(matchDate);
      }
    }

    // Add LastMatch dates from changes
    player.changes.forEach((change) => {
      if (change.fieldName === "LastMatch.Date" && change.newValue) {
        matchDates.add(change.newValue);
      }
    });

    // Match with database matches (within 1 hour tolerance)
    return allMatches.filter((match) => {
      const matchDate = new Date(match.matchDate);
      return Array.from(matchDates).some((playerMatchDateStr) => {
        const playerMatchDate = new Date(playerMatchDateStr);
        const timeDiff = Math.abs(matchDate.getTime() - playerMatchDate.getTime());
        const oneHour = 60 * 60 * 1000;
        return timeDiff < oneHour;
      });
    });
  }, [player, allMatches]);

  if (!numericPlayerId || Number.isNaN(numericPlayerId)) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Invalid player ID
      </Alert>
    );
  }

  if (isLoadingPlayer) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isErrorPlayer || !player) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Failed to load player data
      </Alert>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      {/* Header with back button */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: "#4299e1",
            "&:hover": {
              bgcolor: "rgba(66, 153, 225, 0.1)"
            }
          }}
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h4"
          sx={{
            color: "#e2e8f0",
            fontWeight: 700,
            letterSpacing: "0.5px"
          }}
        >
          Player Details
        </Typography>
      </Box>

      {/* Player Card */}
      <Box
        sx={{
          bgcolor: "#0a0e27",
          backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
          border: "1px solid rgba(66, 153, 225, 0.2)",
          borderRadius: 2,
          p: 3
        }}
      >
        <PlayerCard player={player} clickable={false} />
      </Box>

      {/* Changes Table */}
      <Paper
        sx={{
          bgcolor: "#0a0e27",
          backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
          border: "1px solid rgba(66, 153, 225, 0.2)",
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(66, 153, 225, 0.2)" }}>
          <Typography
            variant="h6"
            sx={{
              color: "#e2e8f0",
              fontWeight: 600
            }}
          >
            Property Changes ({player.changes.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                  Date
                </TableCell>
                <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                  Property
                </TableCell>
                <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                  Old Value
                </TableCell>
                <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                  New Value
                </TableCell>
                <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                  Change
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {player.changes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: "center", color: "#9ca3af", py: 4, borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    No changes recorded
                  </TableCell>
                </TableRow>
              ) : (
                player.changes.map((change) => {
                  const oldVal = formatChangeValue(change.fieldName, change.oldValue);
                  const newVal = formatChangeValue(change.fieldName, change.newValue);
                  
                  // Calculate delta if both are numeric
                  const oldNum = Number(change.oldValue);
                  const newNum = Number(change.newValue);
                  const hasNumericDelta = !Number.isNaN(oldNum) && !Number.isNaN(newNum);
                  const delta = hasNumericDelta ? newNum - oldNum : null;

                  return (
                    <TableRow
                      key={change.changeId}
                      sx={{
                        "&:hover": {
                          bgcolor: "rgba(66, 153, 225, 0.05)"
                        }
                      }}
                    >
                      <TableCell sx={{ color: "#cbd5e0", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                        {new Date(change.recordedAt).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: "#e2e8f0", fontWeight: 500, borderColor: "rgba(66, 153, 225, 0.2)" }}>
                        {formatFieldName(change.fieldName)}
                      </TableCell>
                      <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                        {oldVal}
                      </TableCell>
                      <TableCell sx={{ color: "#e2e8f0", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                        {newVal}
                      </TableCell>
                      <TableCell sx={{ borderColor: "rgba(66, 153, 225, 0.2)" }}>
                        {delta !== null ? (
                          <Typography
                            sx={{
                              color: delta > 0 ? "#10b981" : delta < 0 ? "#ef4444" : "#9ca3af",
                              fontWeight: 600
                            }}
                          >
                            {delta > 0 ? "+" : ""}{formatNumericDelta(delta)}
                          </Typography>
                        ) : (
                          <Typography sx={{ color: "#9ca3af" }}>—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Matches List */}
      <Paper
        sx={{
          bgcolor: "#0a0e27",
          backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
          border: "1px solid rgba(66, 153, 225, 0.2)",
          borderRadius: 2,
          overflow: "hidden"
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid rgba(66, 153, 225, 0.2)" }}>
          <Typography
            variant="h6"
            sx={{
              color: "#e2e8f0",
              fontWeight: 600
            }}
          >
            Matches ({isLoadingMatches ? "..." : playerMatches.length})
          </Typography>
        </Box>
        {isLoadingMatches ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : playerMatches.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", color: "#9ca3af" }}>
            No matches found for this player
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Type
                  </TableCell>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Home Team
                  </TableCell>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Score
                  </TableCell>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Away Team
                  </TableCell>
                  <TableCell sx={{ color: "#9ca3af", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                    Status
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {playerMatches.map((match) => (
                  <TableRow
                    key={match.id}
                    sx={{
                      "&:hover": {
                        bgcolor: "rgba(66, 153, 225, 0.05)"
                      }
                    }}
                  >
                    <TableCell sx={{ color: "#cbd5e0", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      {formatMatchDate(match.matchDate)}
                    </TableCell>
                    <TableCell sx={{ borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      <Chip
                        label={getMatchTypeLabel(match.matchType)}
                        size="small"
                        sx={{
                          bgcolor: getMatchTypeColor(match.matchType),
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: "0.75rem"
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: "#e2e8f0", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      {match.homeTeamName}
                    </TableCell>
                    <TableCell sx={{ color: "#4299e1", fontWeight: 600, borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      {match.status === "FINISHED" ? `${match.homeGoals} - ${match.awayGoals}` : "—"}
                    </TableCell>
                    <TableCell sx={{ color: "#e2e8f0", borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      {match.awayTeamName}
                    </TableCell>
                    <TableCell sx={{ borderColor: "rgba(66, 153, 225, 0.2)" }}>
                      <Chip
                        label={match.status}
                        size="small"
                        sx={{
                          bgcolor:
                            match.status === "FINISHED"
                              ? "#10b981"
                              : match.status === "ONGOING"
                                ? "#f59e0b"
                                : "#6b7280",
                          color: "#ffffff",
                          fontWeight: 500,
                          fontSize: "0.75rem"
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Stack>
  );
}
