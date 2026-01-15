import {
  ArrowUp,
  ArrowDown,
  Minus,
  CalendarDays,
  User,
  Cake,
  TrendingUp,
  Circle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PlayerFilters } from "../utils/playerFilters";
import type { PlayerSort, SortField } from "../utils/playerSorting";
import { POSITION_ORDER, getPositionAbbreviation, getPositionColor } from "../utils/positionScores";

export type PlayerFiltersAndSortProps = {
  filters: PlayerFilters;
  sort: PlayerSort;
  onFiltersChange: (filters: PlayerFilters) => void;
  onSortChange: (sort: PlayerSort) => void;
};

const SORT_OPTIONS: Array<{ field: SortField; label: string; icon: React.ReactNode; startsWithDesc?: boolean }> = [
  { field: "name", label: "Name", icon: <User className="size-4" /> },
  { field: "age", label: "Age", icon: <Cake className="size-4" /> },
  { field: "tsi", label: "TSI", icon: <TrendingUp className="size-4" />, startsWithDesc: true },
  ...POSITION_ORDER.map((pos) => ({
    field: `positionScore${pos}` as SortField,
    label: getPositionAbbreviation(pos),
    icon: <Circle className="size-4" style={{ color: getPositionColor(pos) }} />,
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
  if (direction === "asc") return <ArrowUp className="size-4" />;
  if (direction === "desc") return <ArrowDown className="size-4" />;
  return <Minus className="size-4" />;
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

  const getPlayedThisWeekColor = () => {
    if (filters.playedThisWeek === "yes") return "text-emerald-500";
    if (filters.playedThisWeek === "no") return "text-red-500 opacity-50";
    return "text-gray-400";
  };

  return (
    <div className="p-4 bg-slate-800/50 border border-border rounded-lg space-y-4">
      {/* Sort Section */}
      <div className="flex flex-wrap gap-2 items-center">
        {SORT_OPTIONS.map((option) => {
          const isActive = sort.field === option.field;
          const sortDirectionIcon = isActive 
            ? getSortIcon(sort.direction) 
            : <Minus className="size-4 opacity-30" />;
          const cycleText = option.startsWithDesc
            ? "desc → asc → none"
            : "asc → desc → none";
          
          return (
            <Tooltip key={option.field}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleSortClick(option.field, option.startsWithDesc)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1",
                    isActive && sort.direction === "asc" && "text-emerald-500",
                    isActive && sort.direction === "desc" && "text-red-500",
                    isActive && sort.direction === null && "text-gray-400",
                    !isActive && "text-gray-400",
                    isActive ? "border-border-hover" : "border-border"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {option.icon}
                    {sortDirectionIcon}
                  </span>
                  {option.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Sort by {option.label} (click to cycle: {cycleText})
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Played This Week Filter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={togglePlayedThisWeek}
              className={cn(
                "p-2 rounded-md transition-colors hover:bg-primary/10",
                filters.playedThisWeek !== undefined ? "border border-border-hover" : "border border-transparent"
              )}
            >
              <CalendarDays className={cn("size-5", getPlayedThisWeekColor())} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            Filter: Played this week (click to cycle: yes → no → all)
          </TooltipContent>
        </Tooltip>

        {/* Best Position Score Filter */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Min Position Score</label>
            <Input
              type="number"
              value={filters.minPositionScore ?? ""}
              onChange={(e) => updateFilter("minPositionScore", e.target.value === "" ? null : Number(e.target.value))}
              className="w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">Max Position Score</label>
            <Input
              type="number"
              value={filters.maxPositionScore ?? ""}
              onChange={(e) => updateFilter("maxPositionScore", e.target.value === "" ? null : Number(e.target.value))}
              className="w-36"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
