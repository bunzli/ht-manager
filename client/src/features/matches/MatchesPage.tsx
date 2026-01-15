import { useQuery } from "@tanstack/react-query";
import { AlertCircle, X, Calendar, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchMatches } from "../../api/matches";

function getMatchTypeColor(matchType: string): string {
  switch (matchType) {
    case "LEAGUE":
      return "#3b82f6"; // blue
    case "CUP":
      return "#f59e0b"; // amber
    case "FRIENDLY":
      return "#10b981"; // green
    default:
      return "#6b7280"; // gray
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

export function MatchesPage() {
  const {
    data: matches = [],
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ["matches"],
    queryFn: () => fetchMatches(50)
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold tracking-wide text-foreground">
        Matches
      </h1>

      {isError ? (
        <div className="flex items-center gap-3 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
          <AlertCircle className="size-5" />
          <span className="flex-1">Failed to load matches. Try again.</span>
          <button
            onClick={() => refetch()}
            className="p-1 hover:bg-error/20 rounded"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-background bg-background-gradient border border-border rounded-lg p-4 transition-all hover:border-border-hover hover:shadow-card"
            >
              <div className="flex justify-between items-start mb-4">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: getMatchTypeColor(match.matchType) }}
                >
                  {getMatchTypeLabel(match.matchType)}
                </span>
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
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Circle className="size-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground flex-1">
                    {match.homeTeamName}
                  </span>
                  {match.status === "FINISHED" && (
                    <span className="text-lg font-bold text-primary">
                      {match.homeGoals}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="size-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground flex-1">
                    {match.awayTeamName}
                  </span>
                  {match.status === "FINISHED" && (
                    <span className="text-lg font-bold text-primary">
                      {match.awayGoals}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted">
                <Calendar className="size-3.5" />
                <span className="text-xs">{formatMatchDate(match.matchDate)}</span>
              </div>
            </div>
          ))}
          {matches.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16 text-muted">
              No matches found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
