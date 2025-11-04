import { useMemo, useState } from "react";
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
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
  LinearProgress,
  Chip,
  Tooltip,
  Link as MuiLink,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import CheckIcon from "@mui/icons-material/Check";
import type { Player, PlayerChange } from "../../../api/players";
import { sortedVisibleFields, useTableConfig } from "../../config/state/useTableConfig";
import { TrainingPreference, useTrainingPreferences } from "../state/useTrainingPreferences";
import { TrainingPreferenceToggle } from "./TrainingPreferenceToggle";
import {
  BestPosition,
  computePositionScores,
  getPositionDisplayInfo,
  getPositionLabel,
  POSITION_ORDER
} from "../utils/positionScores";
import { useBestPositionOverrides } from "../state/useBestPositionOverrides";

type PlayersTableProps = {
  players: Player[];
  isLoading?: boolean;
  showWeeklyDiff?: boolean;
  evaluationPosition?: BestPosition | null;
};

type PreparedPlayer = Player & {
  latestSnapshotFetchedAt: string | null;
  recentChangesCount: number;
  recentFieldChanges: Record<string, PlayerChange>;
  trainingPreference: TrainingPreference;
  bestPosition: BestPosition | null;
  bestPositionScore: number | null;
  positionScores: Partial<Record<BestPosition, number>>;
  bestPositionIsOverridden: boolean;
  computedBestPosition: BestPosition | null;
  computedBestScore: number | null;
  hasPlayedThisPeriod: boolean;
  injuryDaysRemaining: number | null;
  [key: string]: unknown;
};

type OrderDirection = "asc" | "desc";

const SALARY_MULTIPLIER = 20;
const moneyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const RECENT_CHANGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

const WEEKLY_FIELDS = new Set([
  "TSI",
  "PlayerForm",
  "Experience",
  "StaminaSkill",
  "KeeperSkill",
  "PlaymakerSkill",
  "ScorerSkill",
  "PassingSkill",
  "WingerSkill",
  "DefenderSkill",
  "SetPiecesSkill"
]);

const FIELDS_WITHOUT_ANNOTATIONS = new Set([
  "PlayerNumber",
  "trainingPreference",
  "bestPosition",
  "bestPositionScore",
  "injuryDaysRemaining"
]);
const SKILL_FIELDS = new Set([
  "StaminaSkill",
  "KeeperSkill",
  "PlaymakerSkill",
  "ScorerSkill",
  "PassingSkill",
  "WingerSkill",
  "DefenderSkill",
  "SetPiecesSkill"
]);

const PLAY_ACTIVITY_FIELDS = new Set([
  "MatchesCurrentTeam",
  "GoalsCurrentTeam",
  "AssistsCurrentTeam",
  "Cards"
]);

function getCurrentMatchPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 Sunday, 5 Friday
  const FRIDAY_INDEX = 5;
  const daysSinceFriday = (day - FRIDAY_INDEX + 7) % 7;
  start.setDate(start.getDate() - daysSinceFriday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function formatNumericValue(value: number): string {
  const maximumFractionDigits = Number.isInteger(value) ? 0 : 2;
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

function formatNumericDelta(delta: number): string {
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  const magnitude = Math.abs(delta);
  return `${sign}${formatNumericValue(magnitude)}`;
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatNumericValue(value);
}

function normalizeChangeString(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "";
  }
  const lower = trimmed.toLowerCase();
  if (lower === "true" || lower === "false") {
    return lower;
  }
  return trimmed;
}

function formatPlainChangeValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "—";
  }
  const lower = trimmed.toLowerCase();
  if (lower === "true") return "Yes";
  if (lower === "false") return "No";
  return trimmed;
}

function formatRecentChange(change: PlayerChange): string | null {
  const { newValue, oldValue } = change;
  if (newValue === null || oldValue === null) {
    return null;
  }

  const numericNew = Number(newValue);
  const numericOld = Number(oldValue);

  if (Number.isFinite(numericNew) && Number.isFinite(numericOld)) {
    const delta = numericNew - numericOld;
    if (delta === 0) {
      return null;
    }
    return `(${formatNumericDelta(delta)})`;
  }

  const normalizedNew = normalizeChangeString(newValue);
  const normalizedOld = normalizeChangeString(oldValue);

  if (normalizedNew !== normalizedOld) {
    return `(was ${formatPlainChangeValue(oldValue)})`;
  }

  return null;
}

function appendChangeDecorations(
  fieldId: string,
  baseText: string,
  value: unknown,
  player: PreparedPlayer,
  showWeeklyDiff: boolean
): string {
  if (FIELDS_WITHOUT_ANNOTATIONS.has(fieldId)) {
    return baseText;
  }

  const change = player.recentFieldChanges[fieldId];
  if (change) {
    const annotation = formatRecentChange(change);
    if (annotation) {
      return baseText ? `${baseText} ${annotation}` : annotation;
    }
  }

  if (showWeeklyDiff && !change && player.weeklyDiff && WEEKLY_FIELDS.has(fieldId)) {
    const diff = player.weeklyDiff[fieldId];
    if (diff && diff.delta !== null && diff.delta !== 0) {
      const annotation = `(${formatNumericDelta(diff.delta)})`;
      return baseText ? `${baseText} ${annotation}` : annotation;
    }
  }

  return baseText;
}

function toPreparedPlayer(
  player: Player,
  trainingPreference: TrainingPreference,
  overridePosition: BestPosition | null
): PreparedPlayer {
  const now = Date.now();
  const recentFieldChanges: Record<string, PlayerChange> = {};

  for (const change of player.recentChanges) {
    const recordedAt = new Date(change.recordedAt).getTime();
    if (Number.isNaN(recordedAt)) {
      continue;
    }
    if (now - recordedAt > RECENT_CHANGE_WINDOW_MS) {
      continue;
    }
    const existing = recentFieldChanges[change.fieldName];
    if (!existing || new Date(existing.recordedAt).getTime() < recordedAt) {
      recentFieldChanges[change.fieldName] = change;
    }
  }

  const prepared: PreparedPlayer = {
    ...player,
    latestSnapshotFetchedAt: player.latestSnapshot?.fetchedAt ?? null,
    recentChangesCount: player.recentChanges.length,
    recentFieldChanges,
    trainingPreference,
    bestPosition: null,
    bestPositionScore: null,
    positionScores: {},
    bestPositionIsOverridden: false,
    computedBestPosition: null,
    computedBestScore: null,
    hasPlayedThisPeriod: false,
    injuryDaysRemaining: null
  };

  const snapshotData = player.latestSnapshot?.data;
  if (snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)) {
    for (const [key, value] of Object.entries(snapshotData)) {
      if (prepared[key] === undefined) {
        prepared[key] = value;
      } else {
        prepared[`snapshot.${key}`] = value;
      }
    }
  }

  const positionResult = computePositionScores(prepared);
  prepared.positionScores = positionResult.scores;
  prepared.computedBestPosition = positionResult.bestPosition;
  prepared.computedBestScore = positionResult.bestScore;

  const appliedPosition = overridePosition ?? positionResult.bestPosition;
  prepared.bestPositionIsOverridden = Boolean(overridePosition);
  prepared.bestPosition = appliedPosition;

  if (appliedPosition) {
    prepared.bestPositionScore = positionResult.scores[appliedPosition] ?? null;
  } else {
    prepared.bestPositionScore = positionResult.bestScore;
  }

  const { start: periodStart, end: periodEnd } = getCurrentMatchPeriod();
  prepared.hasPlayedThisPeriod = player.recentChanges.some((change) => {
    if (!PLAY_ACTIVITY_FIELDS.has(change.fieldName)) {
      return false;
    }
    const recordedAt = new Date(change.recordedAt);
    if (Number.isNaN(recordedAt.getTime())) {
      return false;
    }
    return recordedAt >= periodStart && recordedAt < periodEnd;
  });

  const injuryLevel = Number(prepared.InjuryLevel ?? player.InjuryLevel ?? null);
  prepared.injuryDaysRemaining =
    Number.isFinite(injuryLevel) && injuryLevel > 0 ? injuryLevel : null;

  return prepared;
}

function getFieldValue(player: PreparedPlayer, fieldId: string): unknown {
  const record = player as unknown as Record<string, unknown>;
  if (fieldId in record) {
    return record[fieldId];
  }

  if (fieldId.includes(".")) {
    return fieldId.split(".").reduce<unknown>((value, key) => {
      if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
        return (value as Record<string, unknown>)[key];
      }
      return undefined;
    }, player as unknown as Record<string, unknown>);
  }

  return undefined;
}

function compareValues(a: unknown, b: unknown, direction: OrderDirection): number {
  if (a === b) return 0;

  const factor = direction === "asc" ? 1 : -1;

  if (a === undefined || a === null) return -1 * factor;
  if (b === undefined || b === null) return 1 * factor;

  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * factor;
  }

  if (a instanceof Date || b instanceof Date) {
    const timeA = a instanceof Date ? a.getTime() : new Date(String(a)).getTime();
    const timeB = b instanceof Date ? b.getTime() : new Date(String(b)).getTime();
    return (timeA - timeB) * factor;
  }

  const textA = String(a).toLowerCase();
  const textB = String(b).toLowerCase();
  if (textA < textB) return -1 * factor;
  if (textA > textB) return 1 * factor;
  return 0;
}

function formatValue(
  fieldId: string,
  value: unknown,
  player: PreparedPlayer,
  showWeeklyDiff: boolean
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (fieldId === "AgeDays") {
    return ""; // merged into Age column
  }

  if (fieldId === "name") {
    return appendChangeDecorations(fieldId, String(value), value, player, showWeeklyDiff);
  }

  if (fieldId === "active") {
    const text = value ? "Yes" : "No";
    return appendChangeDecorations(fieldId, text, value, player, showWeeklyDiff);
  }

  if (fieldId === "Age") {
    const years = Number(player.Age ?? value);
    const days = Number(player.AgeDays ?? 0);
    if (Number.isFinite(years) && Number.isFinite(days)) {
      const ageText = `${years}y ${days}d`;
      return appendChangeDecorations(fieldId, ageText, value, player, showWeeklyDiff);
    }
  }

  if (fieldId === "bestPosition") {
    const sourceValue =
      typeof value === "string"
        ? (value as BestPosition)
        : player.bestPosition ?? null;
    const display = getPositionDisplayInfo(sourceValue);
    return display?.label ?? "";
  }

  if (fieldId === "bestPositionScore") {
    const numeric = Number(value ?? player.bestPositionScore);
    if (Number.isFinite(numeric)) {
      return formatNumericValue(numeric);
    }
    return "";
  }

  if (fieldId === "injuryDaysRemaining") {
    const numeric = Number(value ?? player.injuryDaysRemaining);
    if (Number.isFinite(numeric) && numeric > 0) {
      return `+${numeric}`;
    }
    return "";
  }

  if (fieldId === "Salary") {
    const base = Number(value);
    if (Number.isFinite(base)) {
      try {
        const salaryText = moneyFormatter.format(base * SALARY_MULTIPLIER);
        return appendChangeDecorations(fieldId, salaryText, value, player, showWeeklyDiff);
      } catch (_error) {
        const fallback = `$${Math.round(base * SALARY_MULTIPLIER).toLocaleString()}`;
        return appendChangeDecorations(fieldId, fallback, value, player, showWeeklyDiff);
      }
    }
  }

  if (fieldId === "TSI") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const formatted = formatNumericValue(numeric);
      return appendChangeDecorations(fieldId, formatted, value, player, showWeeklyDiff);
    }
  }

  if (fieldId === "InjuryLevel") {
    const numeric = Number(value);
    if (numeric === -1) return "";
    return appendChangeDecorations(fieldId, String(numeric), value, player, showWeeklyDiff);
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") {
      return appendChangeDecorations(fieldId, "Yes", value, player, showWeeklyDiff);
    }
    if (lower === "false") {
      return appendChangeDecorations(fieldId, "No", value, player, showWeeklyDiff);
    }
  }

  if (fieldId.toLowerCase().includes("date") || fieldId.toLowerCase().includes("fetchedat")) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return appendChangeDecorations(fieldId, date.toLocaleString(), value, player, showWeeklyDiff);
    }
  }

  const baseText = typeof value === "object" ? JSON.stringify(value) : String(value);
  return appendChangeDecorations(fieldId, baseText, value, player, showWeeklyDiff);
}

export function SimplePlayersTable({
  players,
  isLoading,
  showWeeklyDiff = false,
  evaluationPosition = null
}: PlayersTableProps) {
  const { fields } = useTableConfig();
  const preferences = useTrainingPreferences((state) => state.preferences);
  const overrides = useBestPositionOverrides((state) => state.overrides);
  const setBestPositionOverride = useBestPositionOverrides((state) => state.setOverride);
  const navigate = useNavigate();

  const preparedPlayers = useMemo<PreparedPlayer[]>(() => {
    return players
      .filter((player) => player.active)
      .map((player) => {
        const trainingPreference = preferences[player.playerId] ?? "none";
        const overridePosition = overrides[player.playerId] ?? null;
        return toPreparedPlayer(player, trainingPreference, overridePosition);
      });
  }, [players, preferences, overrides]);

  const visibleFields = useMemo(() => 
    sortedVisibleFields(fields).filter((field) => field.id !== "injuryDaysRemaining"), 
    [fields]
  );

  const defaultOrderBy = visibleFields[0]?.id ?? "name";
  const [orderBy, setOrderBy] = useState<string>(defaultOrderBy);
  const [orderDirection, setOrderDirection] = useState<OrderDirection>("asc");

  console.info("[PlayersTable] render", {
    playerCount: preparedPlayers.length,
    visibleFields,
    orderBy,
    orderDirection,
    showWeeklyDiff
  });

  const handleSort = (fieldId: string) => {
    if (orderBy === fieldId) {
      setOrderDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(fieldId);
      setOrderDirection("asc");
    }
  };

  const sortedPlayers = useMemo(() => {
    const rows = [...preparedPlayers];
    if (evaluationPosition) {
      rows.sort((rowA, rowB) => {
        const scoreA = rowA.positionScores[evaluationPosition] ?? -Infinity;
        const scoreB = rowB.positionScores[evaluationPosition] ?? -Infinity;
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return rowA.name.localeCompare(rowB.name);
      });
      return rows;
    }

    if (orderBy === "bestPosition") {
      rows.sort((rowA, rowB) => {
        const indexA =
          rowA.bestPosition !== null
            ? POSITION_ORDER.indexOf(rowA.bestPosition)
            : -1;
        const indexB =
          rowB.bestPosition !== null
            ? POSITION_ORDER.indexOf(rowB.bestPosition)
            : -1;
        const safeIndexA = indexA === -1 ? POSITION_ORDER.length : indexA;
        const safeIndexB = indexB === -1 ? POSITION_ORDER.length : indexB;
        const factor = orderDirection === "asc" ? 1 : -1;

        if (safeIndexA !== safeIndexB) {
          return (safeIndexA - safeIndexB) * factor;
        }

        const scoreA = rowA.bestPositionScore ?? -Infinity;
        const scoreB = rowB.bestPositionScore ?? -Infinity;
        if (scoreA !== scoreB) {
          return orderDirection === "asc" ? scoreB - scoreA : scoreA - scoreB;
        }

        return rowA.name.localeCompare(rowB.name);
      });
      return rows;
    }

    return rows.sort((a, b) => {
      const valueA = getFieldValue(a, orderBy);
      const valueB = getFieldValue(b, orderBy);
      return compareValues(valueA, valueB, orderDirection);
    });
  }, [preparedPlayers, orderBy, orderDirection, evaluationPosition]);

  const handleRowNavigate = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <Paper variant="outlined">
      {isLoading && (
        <Box sx={{ width: "100%" }}>
          <LinearProgress />
        </Box>
      )}
      <TableContainer>
        <Table
          size="small"
          sx={{
            "& thead th": {
              fontSize: "0.8rem",
              py: 0.75,
              px: 1.25
            },
            "& tbody td": {
              py: 0.5,
              px: 1.25
            }
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                key="activityIndicator"
                padding="none"
                sx={{ width: 12, bgcolor: "transparent", px: 0 }}
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
            {sortedPlayers.map((player) => (
              <TableRow
                hover
                key={player.playerId}
                sx={{
                  cursor: "pointer"
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
                <TableCell
                  key={`indicator-${player.playerId}`}
                  padding="none"
                  sx={{
                    width: 12,
                    borderBottom: "inherit",
                    px: 0,
                    position: "relative"
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: "block",
                      width: 4,
                      height: "100%",
                      minHeight: 32,
                      borderRadius: 2,
                      mx: "auto",
                      bgcolor: player.hasPlayedThisPeriod ? "success.main" : "grey.300"
                    }}
                  />
                </TableCell>
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

                  const rawValue = getFieldValue(player, field.id);

                  if (field.id === "name") {
                    const displayName = formatValue(field.id, rawValue, player, showWeeklyDiff);
                    const hattrickUrl = `https://www.hattrick.org/goto.ashx?path=/Club/Players/Player.aspx?playerId=${player.playerId}`;
                    const hasInjury = Number.isFinite(player.injuryDaysRemaining) && (player.injuryDaysRemaining ?? 0) > 0;

                    return (
                      <TableCell
                        key={field.id}
                        sx={{
                          whiteSpace: "nowrap",
                          maxWidth: 220
                        }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                          <Typography variant="body2" sx={{ fontSize: "0.75rem", minWidth: 0, flex: 1 }} noWrap>
                            <MuiLink
                              href={hattrickUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              onClick={(event) => {
                                event.stopPropagation();
                              }}
                              onKeyDown={(event) => {
                                if (event.key === " " || event.key === "Enter") {
                                  event.stopPropagation();
                                }
                              }}
                            >
                              {displayName}
                            </MuiLink>
                          </Typography>
                          {hasInjury && (
                            <Tooltip title={`Injury: ${player.injuryDaysRemaining} days remaining`}>
                              <Box
                                sx={{
                                  width: 34,
                                  height: 28,
                                  borderRadius: "8px",
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "rgba(244, 67, 54, 0.08)",
                                  flexShrink: 0,
                                  ml: 0.5
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: "error.main",
                                    fontWeight: 700,
                                    lineHeight: 1,
                                    fontSize: "0.95rem"
                                  }}
                                >
                                  +
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    position: "absolute",
                                    bottom: 2,
                                    left: 4,
                                    fontWeight: 600,
                                    fontSize: "0.65rem",
                                    color: "text.primary"
                                  }}
                                >
                                  {player.injuryDaysRemaining}
                                </Typography>
                              </Box>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    );
                  }

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
                          sx={{ fontSize: "0.75rem" }}
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
                    <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
                      {formatScore(player.positionScores[evaluationPosition] ?? null)}
                    </Typography>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {sortedPlayers.length === 0 && !isLoading && (
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No players found. Try syncing with the Hattrick servers.
          </Typography>
        </Box>
      )}
    </Paper>
  );
}

type BestPositionCellProps = {
  player: PreparedPlayer;
  onOverrideChange: (playerId: number, position: BestPosition | null) => void;
};

function BestPositionCell({ player, onOverrideChange }: BestPositionCellProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const display = getPositionDisplayInfo(player.bestPosition);

  const handleOpen = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (position: BestPosition | null) => {
    onOverrideChange(player.playerId, position);
    handleClose();
  };

  const chipLabel = display?.label ?? "Set";

  return (
    <TableCell
      sx={{
        whiteSpace: "nowrap",
        width: 120,
        textAlign: "center"
      }}
    >
      <Tooltip
        title={
          player.bestPosition
            ? `${getPositionLabel(player.bestPosition)}${
                player.bestPositionIsOverridden ? " (overridden)" : ""
              }`
            : "No position data"
        }
      >
        <Box
          onClick={handleOpen}
          onKeyDown={(event: ReactKeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              setAnchorEl(event.currentTarget);
            }
          }}
          role="button"
          tabIndex={0}
          sx={{
            position: "relative",
            display: "inline-flex"
          }}
        >
          <Chip
            label={chipLabel}
            size="small"
            variant={display ? "filled" : "outlined"}
            sx={{
              bgcolor: display ? display.color : "transparent",
              color: display
                ? (theme) => theme.palette.getContrastText(display.color)
                : "text.secondary",
              fontWeight: 600,
              fontSize: "0.7rem",
              px: 1,
              cursor: "pointer"
            }}
          />
          {player.bestPositionIsOverridden && (
            <StarIcon
              fontSize="inherit"
              sx={{
                position: "absolute",
                top: -6,
                right: -6,
                fontSize: "0.85rem",
                color: (theme) => theme.palette.warning.main
              }}
            />
          )}
        </Box>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(event: ReactMouseEvent<HTMLElement>) => event.stopPropagation()}
      >
        <MenuItem onClick={() => handleSelect(null)}>
          <ListItemIcon>
            {!player.bestPositionIsOverridden ? <CheckIcon fontSize="small" /> : null}
          </ListItemIcon>
          <ListItemText
            primary="Auto (calculated)"
            secondary={
              player.computedBestPosition
                ? `${getPositionLabel(player.computedBestPosition)} · ${formatScore(
                    player.computedBestScore
                  )}`
                : "No data"
            }
          />
        </MenuItem>
        {POSITION_ORDER.map((position) => {
          const isSelected = player.bestPositionIsOverridden && player.bestPosition === position;
          const score = player.positionScores[position] ?? null;
          return (
            <MenuItem key={position} onClick={() => handleSelect(position)}>
              <ListItemIcon>{isSelected ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
              <ListItemText
                primary={getPositionLabel(position)}
                secondary={`Score: ${formatScore(score)}`}
              />
            </MenuItem>
          );
        })}
      </Menu>
    </TableCell>
  );
}

