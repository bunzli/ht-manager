import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Grid
} from "@mui/material";
import { SportsSoccer, CalendarToday, EmojiEvents } from "@mui/icons-material";
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
    queryFn: () => fetchMatches(50) // Get last 50 matches
  });

  return (
    <Stack spacing={3}>
      <Typography
        variant="h5"
        sx={{
          color: "#e2e8f0",
          fontWeight: 700,
          letterSpacing: "0.5px"
        }}
      >
        Matches
      </Typography>

      {isError ? (
        <Alert
          severity="error"
          onClose={() => refetch()}
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 2
          }}
        >
          Failed to load matches. Try again.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {matches.map((match) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={match.id}>
              <Card
                sx={{
                  bgcolor: "#0a0e27",
                  backgroundImage: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)",
                  border: "1px solid rgba(66, 153, 225, 0.2)",
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "rgba(66, 153, 225, 0.4)",
                    boxShadow: "0 4px 12px rgba(66, 153, 225, 0.2)"
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
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
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <SportsSoccer sx={{ fontSize: 16, color: "#4299e1" }} />
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#e2e8f0",
                          fontWeight: 600,
                          fontSize: "0.875rem"
                        }}
                      >
                        {match.homeTeamName}
                      </Typography>
                      {match.status === "FINISHED" && (
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#4299e1",
                            fontWeight: 700,
                            ml: "auto"
                          }}
                        >
                          {match.homeGoals}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <SportsSoccer sx={{ fontSize: 16, color: "#4299e1" }} />
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#e2e8f0",
                          fontWeight: 600,
                          fontSize: "0.875rem"
                        }}
                      >
                        {match.awayTeamName}
                      </Typography>
                      {match.status === "FINISHED" && (
                        <Typography
                          variant="h6"
                          sx={{
                            color: "#4299e1",
                            fontWeight: 700,
                            ml: "auto"
                          }}
                        >
                          {match.awayGoals}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
                    <CalendarToday sx={{ fontSize: 14, color: "#9ca3af" }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#9ca3af",
                        fontSize: "0.75rem"
                      }}
                    >
                      {formatMatchDate(match.matchDate)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {matches.length === 0 && !isLoading && (
            <Grid size={12}>
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "#9ca3af"
                }}
              >
                No matches found
              </Box>
            </Grid>
          )}
        </Grid>
      )}
    </Stack>
  );
}
