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
import { FormCell } from "./table/FormCell";
import { StaminaCell } from "./table/StaminaCell";
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

  // Calculate absolute max value across all skills and all players
  const absoluteMaxSkillValue = useMemo(() => {
    let max = 0;
    const skillFieldIds = Array.from(SKILL_FIELDS);
    
    preparedPlayers.forEach((player) => {
      skillFieldIds.forEach((fieldId) => {
        const value = Number(getFieldValue(player, fieldId) ?? 0);
        if (Number.isFinite(value) && value > max) {
          max = value;
        }
      });
    });
    
    return max;
  }, [preparedPlayers]);

  // Get background color for skill value (background blue to super green)
  const getSkillBackgroundColor = (fieldId: string, value: number): string | null => {
    if (!SKILL_FIELDS.has(fieldId)) return null;
    if (absoluteMaxSkillValue === 0 || value === 0) return "#0a0e27"; // background blue for zero
    if (value === 1) return "#0a0e27"; // background blue for value 1
    
    // Calculate ratio from 1 to max (not 0 to max, so 1 maps to background)
    const ratio = (value - 1) / (absoluteMaxSkillValue - 1);
    
    // Interpolate from background blue (#0a0e27) to super green (#3f7137)
    // Background blue: rgb(10, 14, 39)
    // Super green: rgb(63, 113, 55)
    const bgR = 10;
    const bgG = 14;
    const bgB = 39;
    
    const greenR = 63;
    const greenG = 113;
    const greenB = 55;
    
    const red = Math.round(bgR + (greenR - bgR) * ratio);
    const green = Math.round(bgG + (greenG - bgG) * ratio);
    const blue = Math.round(bgB + (greenB - bgB) * ratio);
    
    return `rgb(${red}, ${green}, ${blue})`;
  };

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
                        : "left",
                    ...(SKILL_FIELDS.has(field.id) && {
                      padding: "10px 2px !important"
                    })
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

                  if (field.id === "PlayerForm") {
                    return (
                      <FormCell
                        key={field.id}
                        player={player}
                        showWeeklyDiff={showWeeklyDiff}
                      />
                    );
                  }

                  if (field.id === "StaminaSkill") {
                    return (
                      <StaminaCell
                        key={field.id}
                        player={player}
                        showWeeklyDiff={showWeeklyDiff}
                      />
                    );
                  }

                  const rawValue = getFieldValue(player, field.id);
                  const numericValue = Number(rawValue ?? 0);
                  const displayText = formatValue(field.id, rawValue, player, showWeeklyDiff);
                  const bgColor = getSkillBackgroundColor(field.id, numericValue);

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
                        textAlign: SKILL_FIELDS.has(field.id) ? "center" : "left",
                        ...(SKILL_FIELDS.has(field.id) && {
                          padding: "8px 2px !important"
                        })
                      }}
                    >
                      {bgColor ? (
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            bgcolor: bgColor,
                            mx: "auto"
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: "0.75rem",
                              color: "#ffffff",
                              fontWeight: 600
                            }}
                          >
                            {displayText}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.75rem",
                            color: "#cbd5e0",
                            fontWeight: SKILL_FIELDS.has(field.id) ? 600 : 400
                          }}
                          noWrap={field.id === "Age" || field.id === "TSI"}
                        >
                          {displayText}
                        </Typography>
                      )}
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
