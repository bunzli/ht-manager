import { Box, Stack, IconButton, TextField, Tooltip, Paper, Button } from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Remove,
  Event,
  Person,
  Cake,
  TrendingUp,
  SportsSoccer
} from "@mui/icons-material";
import type { PlayerFilters } from "../utils/playerFilters";
import type { PlayerSort, SortField } from "../utils/playerSorting";
import { POSITION_ORDER, getPositionAbbreviation, getPositionColor } from "../utils/positionScores";

export type PlayerFiltersAndSortProps = {
  filters: PlayerFilters;
  sort: PlayerSort;
  onFiltersChange: (filters: PlayerFilters) => void;
  onSortChange: (sort: PlayerSort) => void;
};

const SORT_OPTIONS: Array<{ field: SortField; label: string; icon: JSX.Element; startsWithDesc?: boolean }> = [
  { field: "name", label: "Name", icon: <Person /> },
  { field: "age", label: "Age", icon: <Cake /> },
  { field: "tsi", label: "TSI", icon: <TrendingUp />, startsWithDesc: true },
  ...POSITION_ORDER.map((pos) => ({
    field: `positionScore${pos}` as SortField,
    label: getPositionAbbreviation(pos),
    icon: <SportsSoccer sx={{ color: getPositionColor(pos) }} />,
    startsWithDesc: true
  }))
];

function getNextSortDirection(
  currentDirection: "asc" | "desc" | null,
  startsWithDesc: boolean
): "asc" | "desc" | null {
  if (currentDirection === null) {
    return startsWithDesc ? "desc" : "asc";
  }
  if (startsWithDesc) {
    // Cycle: desc → asc → null
    if (currentDirection === "desc") return "asc";
    return null;
  } else {
    // Cycle: asc → desc → null
    if (currentDirection === "asc") return "desc";
    return null;
  }
}

function getSortIcon(direction: "asc" | "desc" | null) {
  if (direction === "asc") return <ArrowUpward />;
  if (direction === "desc") return <ArrowDownward />;
  return <Remove />;
}

export function PlayerFiltersAndSort({
  filters,
  sort,
  onFiltersChange,
  onSortChange
}: PlayerFiltersAndSortProps) {
  const handleSortClick = (field: SortField, startsWithDesc: boolean = false) => {
    if (sort.field === field) {
      // Cycle through directions
      const nextDirection = getNextSortDirection(sort.direction, startsWithDesc);
      onSortChange({
        field: nextDirection === null ? null : sort.field,
        direction: nextDirection
      });
    } else {
      // New field, start with appropriate direction
      onSortChange({
        field,
        direction: startsWithDesc ? "desc" : "asc"
      });
    }
  };

  const updateFilter = <K extends keyof PlayerFilters>(key: K, value: PlayerFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const togglePlayedThisWeek = () => {
    if (filters.playedThisWeek === "yes") {
      updateFilter("playedThisWeek", "no");
    } else if (filters.playedThisWeek === "no") {
      updateFilter("playedThisWeek", undefined);
    } else {
      updateFilter("playedThisWeek", "yes");
    }
  };

  const getPlayedThisWeekIcon = () => {
    if (filters.playedThisWeek === "yes") {
      return <Event sx={{ color: "#10b981" }} />;
    }
    if (filters.playedThisWeek === "no") {
      return <Event sx={{ color: "#ef4444", opacity: 0.5 }} />;
    }
    return <Event sx={{ color: "#9ca3af" }} />;
  };

  const commonTextFieldStyles = {
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
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        bgcolor: "rgba(30, 41, 59, 0.5)",
        border: "1px solid rgba(66, 153, 225, 0.2)",
        borderRadius: 2
      }}
    >
      <Stack spacing={2}>
        {/* Sort Section */}
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            {SORT_OPTIONS.map((option) => {
              const isActive = sort.field === option.field;
              const sortDirectionIcon = isActive ? getSortIcon(sort.direction) : <Remove sx={{ opacity: 0.3 }} />;
              const cycleText = option.startsWithDesc
                ? "desc → asc → none"
                : "asc → desc → none";
              
              return (
                <Tooltip
                  key={option.field}
                  title={`Sort by ${option.label} (click to cycle: ${cycleText})`}
                >
                  <Button
                    onClick={() => handleSortClick(option.field, option.startsWithDesc)}
                    startIcon={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {option.icon}
                        {sortDirectionIcon}
                      </Box>
                    }
                    size="small"
                    variant="outlined"
                    sx={{
                      color: isActive
                        ? sort.direction === null
                          ? "#9ca3af"
                          : sort.direction === "asc"
                          ? "#10b981"
                          : "#ef4444"
                        : "#9ca3af",
                      borderColor: isActive ? "rgba(66, 153, 225, 0.5)" : "rgba(66, 153, 225, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(66, 153, 225, 0.1)",
                        borderColor: "rgba(66, 153, 225, 0.5)"
                      }
                    }}
                  >
                    {option.label}
                  </Button>
                </Tooltip>
              );
            })}
          </Stack>
        </Box>

        {/* Filter Section */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {/* Played This Week Filter */}
            <Tooltip title="Filter: Played this week (click to cycle: yes → no → all)">
              <IconButton
                onClick={togglePlayedThisWeek}
                sx={{
                  border: filters.playedThisWeek !== undefined
                    ? "1px solid rgba(66, 153, 225, 0.5)"
                    : "1px solid transparent",
                  "&:hover": {
                    bgcolor: "rgba(66, 153, 225, 0.1)"
                  }
                }}
              >
                {getPlayedThisWeekIcon()}
              </IconButton>
            </Tooltip>

            {/* Best Position Score Filter */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TextField
                size="small"
                label="Min Position Score"
                type="number"
                value={filters.minPositionScore ?? ""}
                onChange={(e) => updateFilter("minPositionScore", e.target.value === "" ? null : Number(e.target.value))}
                sx={{ ...commonTextFieldStyles, width: 150 }}
              />
              <TextField
                size="small"
                label="Max Position Score"
                type="number"
                value={filters.maxPositionScore ?? ""}
                onChange={(e) => updateFilter("maxPositionScore", e.target.value === "" ? null : Number(e.target.value))}
                sx={{ ...commonTextFieldStyles, width: 150 }}
              />
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
