import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
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
      <div className="m-4 p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error">
        <AlertCircle className="size-5" />
        Invalid player ID
      </div>
    );
  }

  if (isLoadingPlayer) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isErrorPlayer || !player) {
    return (
      <div className="m-4 p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error">
        <AlertCircle className="size-5" />
        Failed to load player data
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-wide text-foreground">
          Player Details
        </h1>
      </div>

      {/* Player Card */}
      <div className="bg-background bg-background-gradient border border-border rounded-lg p-4">
        <PlayerCard player={player} clickable={false} />
      </div>

      {/* Changes Table */}
      <div className="bg-background bg-background-gradient border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Property Changes ({player.changes.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted font-medium">Date</th>
                <th className="text-left p-4 text-muted font-medium">Property</th>
                <th className="text-left p-4 text-muted font-medium">Old Value</th>
                <th className="text-left p-4 text-muted font-medium">New Value</th>
                <th className="text-left p-4 text-muted font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {player.changes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-8">
                    No changes recorded
                  </td>
                </tr>
              ) : (
                player.changes.map((change) => {
                  const oldVal = formatChangeValue(change.fieldName, change.oldValue);
                  const newVal = formatChangeValue(change.fieldName, change.newValue);
                  
                  const oldNum = Number(change.oldValue);
                  const newNum = Number(change.newValue);
                  const hasNumericDelta = !Number.isNaN(oldNum) && !Number.isNaN(newNum);
                  const delta = hasNumericDelta ? newNum - oldNum : null;

                  return (
                    <tr
                      key={change.changeId}
                      className="border-b border-border hover:bg-primary/5 transition-colors"
                    >
                      <td className="p-4 text-muted">
                        {new Date(change.recordedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-foreground font-medium">
                        {formatFieldName(change.fieldName)}
                      </td>
                      <td className="p-4 text-muted">{oldVal}</td>
                      <td className="p-4 text-foreground">{newVal}</td>
                      <td className="p-4">
                        {delta !== null ? (
                          <span
                            className={cn(
                              "font-semibold",
                              delta > 0 && "text-emerald-500",
                              delta < 0 && "text-red-500",
                              delta === 0 && "text-muted"
                            )}
                          >
                            {delta > 0 ? "+" : ""}{formatNumericDelta(delta)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Matches List */}
      <div className="bg-background bg-background-gradient border border-border rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Matches ({isLoadingMatches ? "..." : playerMatches.length})
          </h2>
        </div>
        {isLoadingMatches ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : playerMatches.length === 0 ? (
          <div className="p-8 text-center text-muted">
            No matches found for this player
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-muted font-medium">Date</th>
                  <th className="text-left p-4 text-muted font-medium">Type</th>
                  <th className="text-left p-4 text-muted font-medium">Home Team</th>
                  <th className="text-left p-4 text-muted font-medium">Score</th>
                  <th className="text-left p-4 text-muted font-medium">Away Team</th>
                  <th className="text-left p-4 text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {playerMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-border hover:bg-primary/5 transition-colors"
                  >
                    <td className="p-4 text-muted">
                      {formatMatchDate(match.matchDate)}
                    </td>
                    <td className="p-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white"
                        style={{ backgroundColor: getMatchTypeColor(match.matchType) }}
                      >
                        {getMatchTypeLabel(match.matchType)}
                      </span>
                    </td>
                    <td className="p-4 text-foreground">{match.homeTeamName}</td>
                    <td className="p-4 text-primary font-semibold">
                      {match.status === "FINISHED" ? `${match.homeGoals} - ${match.awayGoals}` : "—"}
                    </td>
                    <td className="p-4 text-foreground">{match.awayTeamName}</td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white",
                          match.status === "FINISHED" && "bg-emerald-500",
                          match.status === "ONGOING" && "bg-amber-500",
                          match.status !== "FINISHED" && match.status !== "ONGOING" && "bg-gray-500"
                        )}
                      >
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
