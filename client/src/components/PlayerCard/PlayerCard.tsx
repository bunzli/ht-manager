import { Box, Paper, Divider, Typography, Chip } from "@mui/material";
import { Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { PlayerSummary } from "../../api/players";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerStats } from "./PlayerStats";
import { PlayerSkills } from "./PlayerSkills";
import { computePositionScores, POSITION_ORDER, getPositionAbbreviation, getPositionColor } from "../../features/players/utils/positionScores";

export type PlayerCardProps = {
  player: PlayerSummary;
  clickable?: boolean;
};

export function PlayerCard({ player, clickable = false }: PlayerCardProps) {
  const navigate = useNavigate();
  const snapshotData = player.latestSnapshot?.data;
  
  // Extract player data from snapshot
  const age = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Age as number | undefined)
    : undefined;
  const ageDays = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.AgeDays as number | undefined)
    : undefined;
  const tsi = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.TSI as number | undefined)
    : undefined;
  const salary = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Salary as number | undefined)
    : undefined;
  const specialty = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Specialty as string | undefined)
    : undefined;
  const form = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.PlayerForm as number | undefined)
    : undefined;
  const stamina = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.StaminaSkill as number | undefined)
    : undefined;
  const experience = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Experience as number | undefined)
    : undefined;
  const leadership = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Leadership as number | undefined)
    : undefined;
  const loyalty = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Loyalty as number | undefined)
    : undefined;
  const countryId = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.CountryID as number | undefined)
    : undefined;
  const playerNumber = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.PlayerNumber as number | undefined)
    : undefined;
  const keeper = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.KeeperSkill as number | undefined)
    : undefined;
  const defending = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.DefenderSkill as number | undefined)
    : undefined;
  const playmaking = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.PlaymakerSkill as number | undefined)
    : undefined;
  const winger = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.WingerSkill as number | undefined)
    : undefined;
  const passing = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.PassingSkill as number | undefined)
    : undefined;
  const scoring = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.ScorerSkill as number | undefined)
    : undefined;
  const setPieces = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.SetPiecesSkill as number | undefined)
    : undefined;
  const lastMatch = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.LastMatch as Record<string, unknown> | undefined)
    : undefined;
  const lastRating = lastMatch && typeof lastMatch === "object"
    ? (lastMatch.Rating as number | undefined)
    : undefined;
  const lastRatingDate = lastMatch && typeof lastMatch === "object"
    ? (lastMatch.Date as string | undefined)
    : undefined;
  const lastRatingPosition = lastMatch && typeof lastMatch === "object"
    ? (lastMatch.Position as string | undefined)
    : undefined;

  // Format date
  const formattedDate = lastRatingDate
    ? new Date(lastRatingDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
    : null;

  // Compute position scores
  const positionScoresResult = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? computePositionScores(snapshotData)
    : null;

  const handleClick = () => {
    if (clickable) {
      navigate(`/players/${player.playerId}`);
    }
  };

  return (
    <Paper
      elevation={2}
      onClick={handleClick}
      sx={{
        p: 3,
        bgcolor: "#ffffff",
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        cursor: clickable ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: clickable ? 6 : 4,
          transform: clickable ? "translateY(-2px)" : "none"
        }
      }}
    >
      <PlayerHeader
        name={player.name}
        experience={experience}
        leadership={leadership}
        loyalty={loyalty}
        countryId={countryId}
      />
      
      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <PlayerAvatar playerNumber={playerNumber} />
        <Box sx={{ flex: 1 }}>
          <PlayerStats
            age={age}
            ageDays={ageDays}
            tsi={tsi}
            salary={salary}
            specialty={specialty}
            form={form}
            stamina={stamina}
          />
        </Box>
      </Box>

      <PlayerSkills
        keeper={keeper}
        defending={defending}
        playmaking={playmaking}
        winger={winger}
        passing={passing}
        scoring={scoring}
        setPieces={setPieces}
      />

      {positionScoresResult && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem", mb: 1, fontWeight: 500 }}>
              Position Ratings
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {POSITION_ORDER.map((position) => {
                const score = positionScoresResult.scores[position];
                if (score === undefined) return null;
                
                const isBest = positionScoresResult.bestPosition === position;
                const positionColor = getPositionColor(position);
                const positionAbbrev = getPositionAbbreviation(position);
                
                return (
                  <Chip
                    key={position}
                    label={`${positionAbbrev}: ${score.toFixed(2)}`}
                    size="small"
                    sx={{
                      bgcolor: isBest ? positionColor : "#f3f4f6",
                      color: isBest ? "#ffffff" : "#374151",
                      fontWeight: isBest ? 600 : 400,
                      fontSize: "0.75rem",
                      height: "24px",
                      border: isBest ? `2px solid ${positionColor}` : "1px solid #e5e7eb",
                      "& .MuiChip-label": {
                        px: 1
                      }
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2" sx={{ color: "#374151", fontSize: "0.875rem" }}>
          Last rating
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Star sx={{ fontSize: 16, color: "#fbbf24" }} />
          <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
            {lastRating ?? "—"}
          </Typography>
        </Box>
        {formattedDate && (
          <>
            <Typography
              variant="body2"
              sx={{
                color: "#059669",
                textDecoration: "underline",
                fontSize: "0.875rem",
                ml: 1
              }}
            >
              {formattedDate}
            </Typography>
            {lastRatingPosition && (
              <Typography variant="body2" sx={{ color: "#6b7280", fontSize: "0.875rem" }}>
                ({lastRatingPosition})
              </Typography>
            )}
          </>
        )}
      </Box>
    </Paper>
  );
}
