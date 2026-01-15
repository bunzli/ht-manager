import { Star, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PlayerSummary, Avatar } from "../../api/players";
import { PlayerAvatar } from "./PlayerAvatar";
import { PlayerStats } from "./PlayerStats";
import { PlayerSkills } from "./PlayerSkills";
import { PositionField } from "./PositionField";
import { computePositionScores, POSITION_ORDER, getPositionAbbreviation, getPositionColor } from "../../features/players/utils/positionScores";
import { cn } from "@/lib/utils";

export type PlayerCardProps = {
  player: PlayerSummary;
  clickable?: boolean;
};

// Helper to darken a hex color
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * percent));
  const g = Math.max(0, ((num >> 8) & 0x00ff) - Math.round(255 * percent));
  const b = Math.max(0, (num & 0x0000ff) - Math.round(255 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

// Helper to lighten a hex color
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * percent));
  const g = Math.min(255, ((num >> 8) & 0x00ff) + Math.round(255 * percent));
  const b = Math.min(255, (num & 0x0000ff) + Math.round(255 * percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

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
    ? (snapshotData.Specialty as string | number | undefined)
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

  // Compute position scores
  const positionScoresResult = snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)
    ? computePositionScores(snapshotData)
    : null;

  const bestPosition = positionScoresResult?.bestPosition;
  const bestScore = positionScoresResult?.bestScore;
  const positionColor = bestPosition ? getPositionColor(bestPosition) : "#424242";
  const positionAbbrev = bestPosition ? getPositionAbbreviation(bestPosition) : "??";

  // Create gradient colors based on position
  const gradientLight = lightenColor(positionColor, 0.35);
  const gradientDark = darkenColor(positionColor, 0.15);

  const handleClick = () => {
    if (clickable) {
      navigate(`/players/${player.playerId}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "relative w-[380px] rounded-xl overflow-hidden transition-all duration-200",
        clickable && "cursor-pointer hover:shadow-2xl hover:-translate-y-1"
      )}
      style={{
        background: `linear-gradient(135deg, ${gradientLight} 0%, ${positionColor} 50%, ${gradientDark} 100%)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
      }}
    >
      {/* Inner card border effect */}
      <div 
        className="absolute inset-[3px] rounded-lg pointer-events-none"
        style={{
          border: `2px solid rgba(255, 255, 255, 0.3)`,
          background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)`
        }}
      />

      <div className="relative p-4">
        {/* Top section with field, avatar, and stats */}
        <div className="flex items-start justify-between mb-3">
          {/* Left side: Position field indicator */}
          <div className="flex flex-col items-center">
            <PositionField position={bestPosition} />
            <div 
              className="text-xl font-black text-white mt-1"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.5)" }}
            >
              {positionAbbrev}
            </div>
          </div>

          {/* Center: Avatar */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative">
              <PlayerAvatar avatar={avatar} />
              {/* Last rating badge */}
              {lastRating !== undefined && (
                <div 
                  className="absolute -bottom-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-400 shadow-lg"
                >
                  <Star className="size-3 text-amber-900 fill-amber-900" />
                  <span className="text-xs font-bold text-amber-900">{lastRating}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side: Shirt number and country */}
          <div className="flex flex-col items-center gap-2 min-w-[70px]">
            {/* Country flag placeholder */}
            {countryId && (
              <div 
                className="w-8 h-5 rounded-sm border border-white/30"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                title={`Country ID: ${countryId}`}
              />
            )}
            {/* Shirt number */}
            <div className="flex flex-col items-center">
              <Hash className="size-4 text-white/50" />
              <span 
                className="text-2xl font-bold text-white"
                style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
              >
                {playerNumber ?? "—"}
              </span>
            </div>
            {/* Position score */}
            <div 
              className="text-sm font-semibold text-white/80"
            >
              {bestScore?.toFixed(1) ?? "—"}
            </div>
          </div>
        </div>

        {/* Player name */}
        <div className="text-center mb-3 px-2 py-1 bg-black/20 rounded">
          <h3 
            className="font-bold text-white text-base uppercase tracking-wider truncate"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
            title={player.name}
          >
            {player.name}
          </h3>
        </div>

        {/* Stats row with icons */}
        <PlayerStats
          age={age}
          ageDays={ageDays}
          tsi={tsi}
          salary={salary}
          specialty={specialty}
          form={form}
          stamina={stamina}
          experience={experience}
          leadership={leadership}
          loyalty={loyalty}
        />

        {/* Skills compact grid */}
        <PlayerSkills
          keeper={keeper}
          defending={defending}
          playmaking={playmaking}
          winger={winger}
          passing={passing}
          scoring={scoring}
          setPieces={setPieces}
        />

        {/* Position scores row */}
        {positionScoresResult && (
          <div className="mt-3 pt-2 border-t border-white/20">
            <div className="flex justify-center gap-1 flex-wrap">
              {POSITION_ORDER.map((position) => {
                const score = positionScoresResult.scores[position];
                if (score === undefined) return null;
                
                const isBest = positionScoresResult.bestPosition === position;
                const posColor = getPositionColor(position);
                const posAbbrev = getPositionAbbreviation(position);
                
                return (
                  <span
                    key={position}
                    className={cn(
                      "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                      isBest 
                        ? "text-white shadow-md" 
                        : "text-white/70 bg-black/20"
                    )}
                    style={isBest ? { backgroundColor: posColor } : undefined}
                  >
                    {posAbbrev}: {score.toFixed(1)}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
