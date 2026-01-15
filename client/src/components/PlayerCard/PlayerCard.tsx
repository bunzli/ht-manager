import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PlayerSummary, Avatar } from "../../api/players";
import { PlayerHeader } from "./PlayerHeader";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerStats } from "./PlayerStats";
import { PlayerSkills } from "./PlayerSkills";
import { computePositionScores, POSITION_ORDER, getPositionAbbreviation, getPositionColor } from "../../features/players/utils/positionScores";
import { cn } from "@/lib/utils";

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
  const avatar = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? (snapshotData.Avatar as Avatar | undefined)
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
    <div
      onClick={handleClick}
      className={cn(
        "p-4 bg-white rounded-lg border border-gray-200 shadow-sm transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-lg hover:-translate-y-0.5"
      )}
    >
      <PlayerHeader
        name={player.name}
        experience={experience}
        leadership={leadership}
        loyalty={loyalty}
        countryId={countryId}
      />
      
      <div className="flex gap-4 mb-4">
        <PlayerAvatar avatar={avatar} />
        <div className="flex-1">
          <PlayerStats
            age={age}
            ageDays={ageDays}
            tsi={tsi}
            salary={salary}
            specialty={specialty}
            form={form}
            stamina={stamina}
          />
        </div>
      </div>

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
          <hr className="my-4 border-gray-200" />
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Position Ratings
            </p>
            <div className="flex flex-wrap gap-1">
              {POSITION_ORDER.map((position) => {
                const score = positionScoresResult.scores[position];
                if (score === undefined) return null;
                
                const isBest = positionScoresResult.bestPosition === position;
                const positionColor = getPositionColor(position);
                const positionAbbrev = getPositionAbbreviation(position);
                
                return (
                  <span
                    key={position}
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-xs h-6",
                      isBest ? "font-semibold text-white" : "font-normal text-gray-700 bg-gray-100 border border-gray-200"
                    )}
                    style={isBest ? { backgroundColor: positionColor, borderColor: positionColor, borderWidth: 2 } : undefined}
                  >
                    {positionAbbrev}: {score.toFixed(2)}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      <hr className="my-4 border-gray-200" />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Last rating</span>
        <div className="flex items-center gap-1">
          <Star className="size-4 text-amber-400 fill-amber-400" />
          <span className="text-sm text-gray-500">{lastRating ?? "—"}</span>
        </div>
        {formattedDate && (
          <>
            <span className="text-sm text-emerald-600 underline ml-2">
              {formattedDate}
            </span>
            {lastRatingPosition && (
              <span className="text-sm text-gray-500">({lastRatingPosition})</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
