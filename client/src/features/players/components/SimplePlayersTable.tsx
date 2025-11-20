import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Box,
  LinearProgress
} from "@mui/material";
import { sortedVisibleFields, useTableConfig } from "../../config/state/useTableConfig";
import { useTrainingPreferences } from "../state/useTrainingPreferences";
import { TrainingPreferenceToggle } from "./TrainingPreferenceToggle";
import { getPositionLabel } from "../utils/positionScores";
import { useBestPositionOverrides } from "../state/useBestPositionOverrides";
import type { PlayersTableProps } from "../types/table";
import { SKILL_FIELDS } from "../constants/table";
import { toPreparedPlayer } from "../utils/playerPreparation";
import { usePlayerSorting } from "../hooks/usePlayerSorting";
import { formatValue, formatScore } from "../utils/formatting";
import { getFieldValue } from "../utils/playerPreparation";
import { BestPositionCell } from "./table/BestPositionCell";
import { PlayerNameCell } from "./table/PlayerNameCell";
import { ActivityIndicatorCell } from "./table/ActivityIndicatorCell";
import { selectBestPlayersForFormation } from "../constants/formations";

export function SimplePlayersTable({
  players,
  isLoading,
  showWeeklyDiff = false,
  evaluationPosition = null,
  selectedFormation = null
}: PlayersTableProps) {
  const { fields } = useTableConfig();
  const preferences = useTrainingPreferences((state) => state.preferences);
  const overrides = useBestPositionOverrides((state) => state.overrides);
  const setBestPositionOverride = useBestPositionOverrides((state) => state.setOverride);
  const navigate = useNavigate();

  const preparedPlayers = useMemo(() => {
    return players
      .filter((player) => player.active)
      .map((player) => {
        const trainingPreference = preferences[player.playerId] ?? "none";
        const overridePosition = overrides[player.playerId] ?? null;
        return toPreparedPlayer(player, trainingPreference, overridePosition);
      });
  }, [players, preferences, overrides]);

  const visibleFields = useMemo(
    () => sortedVisibleFields(fields).filter((field) => field.id !== "injuryDaysRemaining"),
    [fields]
  );

  const defaultOrderBy = visibleFields[0]?.id ?? "name";
  const { orderBy, orderDirection, handleSort, sortedPlayers } = usePlayerSorting(
    preparedPlayers,
    evaluationPosition,
    defaultOrderBy
  );

  // Calculate which players match the formation (only those who haven't played this week)
  // Selects the best N players for each position slot in the formation
  const matchingPlayerIds = useMemo(() => {
    if (!selectedFormation) {
      return new Set<number>();
    }
    
    return selectBestPlayersForFormation(preparedPlayers, selectedFormation);
  }, [preparedPlayers, selectedFormation]);

  console.info("[PlayersTable] render", {
    playerCount: preparedPlayers.length,
    visibleFields,
    orderBy,
    orderDirection,
    showWeeklyDiff
  });

  const handleRowNavigate = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <Paper
      sx={{
        bgcolor: "#0a0e27",
        backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
        borderRadius: 3,
        border: "1px solid rgba(66, 153, 225, 0.2)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(66, 153, 225, 0.1)",
        overflow: "hidden"
      }}
    >
      {isLoading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              bgcolor: "rgba(66, 153, 225, 0.1)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "#4299e1"
              }
            }}
          />
        </Box>
      )}
      <TableContainer>
        <Table
          size="small"
          sx={{
            "& thead th": {
              fontSize: "0.8rem",
              py: 1.25,
              px: 1.5,
              bgcolor: "#0f1428",
              borderBottom: "2px solid rgba(66, 153, 225, 0.3)",
              color: "#e2e8f0",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase"
            },
            "& tbody td": {
              py: 1,
              px: 1.5,
              borderBottom: "1px solid rgba(66, 153, 225, 0.1)",
              color: "#cbd5e0"
            },
            "& tbody tr": {
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "rgba(66, 153, 225, 0.08)",
                transform: "translateX(2px)",
                boxShadow: "inset 3px 0 0 #4299e1"
              }
            },
            "& tbody tr:last-child td": {
              borderBottom: "none"
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                key="activityIndicator"
                padding="none"
                sx={{ width: 12, bgcolor: "transparent", px: 0, borderBottom: "2px solid rgba(66, 153, 225, 0.3)" }}
              />
              {visibleFields.map((field) => (
                <TableCell
                  key={field.id}
                  sx={{
                    whiteSpace: field.id === "name" ? "nowrap" : "normal",
                    textAlign:
                      field.id === "trainingPreference" || field.id === "bestPosition"
                        ? "center"
                        : "left"
                  }}
                >
                  <TableSortLabel
                    active={orderBy === field.id}
                    direction={orderBy === field.id ? orderDirection : "asc"}
                    onClick={() => handleSort(field.id)}
                    sx={{
                      color: "#cbd5e0 !important",
                      "&:hover": {
                        color: "#4299e1 !important"
                      },
                      "&.Mui-active": {
                        color: "#4299e1 !important",
                        "& .MuiTableSortLabel-icon": {
                          color: "#4299e1 !important"
                        }
                      },
                      "& .MuiTableSortLabel-icon": {
                        color: "rgba(203, 213, 224, 0.5) !important"
                      }
                    }}
                  >
                    {field.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              {evaluationPosition && (
                <TableCell
                  key="evaluationScore"
                  align="right"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  Score ({getPositionLabel(evaluationPosition)})
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((player) => {
              const isMatchingFormation = matchingPlayerIds.has(player.playerId);
              
              return (
              <TableRow
                hover
                key={player.playerId}
                sx={{
                  cursor: "pointer",
                  ...(isMatchingFormation && {
                    bgcolor: "rgba(34, 197, 94, 0.15)",
                    borderLeft: "3px solid #22c55e",
                    "&:hover": {
                      bgcolor: "rgba(34, 197, 94, 0.25)",
                      transform: "translateX(2px)",
                      boxShadow: "inset 3px 0 0 #22c55e"
                    }
                  })
                }}
                tabIndex={0}
                role="button"
                onClick={() => handleRowNavigate(player.playerId)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleRowNavigate(player.playerId);
                  }
                }}
              >
                <ActivityIndicatorCell key={`indicator-${player.playerId}`} player={player} />
                {visibleFields.map((field) => {
                  if (field.id === "trainingPreference") {
                    return (
                      <TableCell
                        key={field.id}
                        sx={{
                          whiteSpace: "nowrap",
                          width: 64,
                          textAlign: "center"
                        }}
                      >
                        <TrainingPreferenceToggle playerId={player.playerId} />
                      </TableCell>
                    );
                  }

                  if (field.id === "bestPosition") {
                    return (
                      <BestPositionCell
                        key={field.id}
                        player={player}
                        onOverrideChange={setBestPositionOverride}
                      />
                    );
                  }

                  if (field.id === "name") {
                    return (
                      <PlayerNameCell
                        key={field.id}
                        player={player}
                        showWeeklyDiff={showWeeklyDiff}
                      />
                    );
                  }

                  const rawValue = getFieldValue(player, field.id);

                  return (
                    <TableCell
                      key={field.id}
                      sx={{
                        whiteSpace: field.id === "Age" || field.id === "TSI" ? "nowrap" : "normal",
                        maxWidth: "auto",
                        minWidth:
                          field.id === "Age"
                            ? 90
                            : field.id === "TSI"
                              ? 120
                              : undefined,
                        width: SKILL_FIELDS.has(field.id) ? 54 : undefined,
                        textAlign: SKILL_FIELDS.has(field.id) ? "center" : "left"
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "0.75rem",
                          color: "#cbd5e0",
                          fontWeight: SKILL_FIELDS.has(field.id) ? 600 : 400
                        }}
                        noWrap={field.id === "Age" || field.id === "TSI"}
                      >
                        {formatValue(field.id, rawValue, player, showWeeklyDiff)}
                      </Typography>
                    </TableCell>
                  );
                })}
                {evaluationPosition && (
                  <TableCell
                    key="evaluationScore"
                    align="right"
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: "0.75rem",
                        color: "#4299e1",
                        fontWeight: 600
                      }}
                    >
                      {formatScore(player.positionScores[evaluationPosition] ?? null)}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {sortedPlayers.length === 0 && !isLoading && (
        <Box sx={{ p: 3 }}>
          <Typography
            variant="body2"
            sx={{
              color: "rgba(203, 213, 224, 0.6)",
              textAlign: "center"
            }}
          >
            No players found. Try syncing with the Hattrick servers.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
