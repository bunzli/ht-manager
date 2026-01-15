import type { Player } from "../../../api/players";
import type { BestPosition } from "./positionScores";
import { computePositionScores } from "./positionScores";
import type { Match } from "../../../api/matches";

/**
 * Get the match ID from a player's LastMatch data
 */
function getPlayerLastMatchId(player: Player): number | null {
  if (!player.latestSnapshot) {
    return null;
  }

  const snapshotData = player.latestSnapshot.data;

  if (!snapshotData || typeof snapshotData !== "object" || Array.isArray(snapshotData)) {
    return null;
  }

  const playerLastMatch = snapshotData.LastMatch as Record<string, unknown> | null | undefined;

  if (!playerLastMatch || typeof playerLastMatch !== "object" || Array.isArray(playerLastMatch)) {
    return null;
  }

  // Try different possible field names for match ID
  const matchId = 
    (playerLastMatch.MatchID as number | undefined) ??
    (playerLastMatch.MatchId as number | undefined) ??
    (playerLastMatch.matchID as number | undefined) ??
    (playerLastMatch.matchId as number | undefined);

  if (typeof matchId === "number" && !Number.isNaN(matchId)) {
    return matchId;
  }

  return null;
}

/**
 * Get a numeric value from snapshot data
 */
function getNumericValue(snapshotData: Record<string, unknown>, key: string): number | null {
  const value = snapshotData[key];
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  return null;
}

/**
 * Get a string value from snapshot data
 */
function getStringValue(snapshotData: Record<string, unknown>, key: string): string | null {
  const value = snapshotData[key];
  if (typeof value === "string") {
    return value;
  }
  return null;
}

/**
 * Get the last Friday date (or today if today is Friday)
 * Uses UTC to avoid timezone issues when comparing dates
 */
function getLastFriday(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 5 = Friday
  const daysToSubtract = dayOfWeek === 5 ? 0 : dayOfWeek < 5 ? dayOfWeek + 2 : dayOfWeek - 5;
  const lastFriday = new Date(now);
  lastFriday.setUTCDate(lastFriday.getUTCDate() - daysToSubtract);
  lastFriday.setUTCHours(0, 0, 0, 0);
  return lastFriday;
}

/**
 * Get match IDs for this week's official matches from a list of matches
 * Returns the last 2 matches played after last Friday
 */
export function getThisWeekOfficialMatchIds(matches: Match[]): number[] {
  const lastFriday = getLastFriday();
  return matches
    .filter(m => 
      m.status === "FINISHED" &&
      ["LEAGUE", "CUP", "TOURNAMENT"].includes(m.matchType) &&
      new Date(m.matchDate) >= lastFriday
    )
    .slice(0, 2)
    .map(m => m.matchId);
}

/**
 * Check if a player played this week
 * Returns true if the player's LastMatch match ID is in thisWeekOfficialMatchesIds
 */
export function playedThisWeek(player: Player, thisWeekOfficialMatchesIds: number[]): boolean {
  const playerMatchId = getPlayerLastMatchId(player);
  
  if (playerMatchId === null) {
    return false;
  }

  return thisWeekOfficialMatchesIds.includes(playerMatchId);
}

/**
 * Check if a player did NOT play this week
 * Returns true if the player's LastMatch match ID is NOT in thisWeekOfficialMatchesIds
 */
export function didNotPlayThisWeek(player: Player, thisWeekOfficialMatchesIds: number[]): boolean {
  return !playedThisWeek(player, thisWeekOfficialMatchesIds);
}

export type PlayerFilters = {
  playedThisWeek?: "yes" | "no" | "all";
  position?: BestPosition | "all";
  minAge?: number | null;
  maxAge?: number | null;
  minTSI?: number | null;
  maxTSI?: number | null;
  minForm?: number | null;
  maxForm?: number | null;
  minStamina?: number | null;
  maxStamina?: number | null;
  minExperience?: number | null;
  maxExperience?: number | null;
  minKeeper?: number | null;
  maxKeeper?: number | null;
  minDefender?: number | null;
  maxDefender?: number | null;
  minPlaymaker?: number | null;
  maxPlaymaker?: number | null;
  minWinger?: number | null;
  maxWinger?: number | null;
  minPassing?: number | null;
  maxPassing?: number | null;
  minScorer?: number | null;
  maxScorer?: number | null;
  minSetPieces?: number | null;
  maxSetPieces?: number | null;
  minPositionScore?: number | null;
  maxPositionScore?: number | null;
  hasInjury?: boolean | null;
  specialty?: string | "all";
};

/**
 * Apply filters to a list of players
 */
export function applyFilters(
  players: Player[],
  filters: PlayerFilters,
  thisWeekOfficialMatchesIds: number[]
): Player[] {
  return players.filter((player) => {
    // Active filter (always applied)
    if (!player.active) {
      return false;
    }

    const snapshotData = player.latestSnapshot?.data;
    if (!snapshotData || typeof snapshotData !== "object" || Array.isArray(snapshotData)) {
      // If no snapshot data, only apply basic filters
      return filters.playedThisWeek === undefined || filters.playedThisWeek === "all";
    }

    // Played this week filter
    if (filters.playedThisWeek === "yes") {
      if (!playedThisWeek(player, thisWeekOfficialMatchesIds)) {
        return false;
      }
    } else if (filters.playedThisWeek === "no") {
      if (!didNotPlayThisWeek(player, thisWeekOfficialMatchesIds)) {
        return false;
      }
    }

    // Position filter
    if (filters.position && filters.position !== "all") {
      const positionResult = computePositionScores(snapshotData);
      if (positionResult.bestPosition !== filters.position) {
        return false;
      }
    }

    // Age filters
    const age = getNumericValue(snapshotData, "Age");
    if (filters.minAge !== null && filters.minAge !== undefined) {
      if (age === null || age < filters.minAge) {
        return false;
      }
    }
    if (filters.maxAge !== null && filters.maxAge !== undefined) {
      if (age === null || age > filters.maxAge) {
        return false;
      }
    }

    // TSI filters
    const tsi = getNumericValue(snapshotData, "TSI");
    if (filters.minTSI !== null && filters.minTSI !== undefined) {
      if (tsi === null || tsi < filters.minTSI) {
        return false;
      }
    }
    if (filters.maxTSI !== null && filters.maxTSI !== undefined) {
      if (tsi === null || tsi > filters.maxTSI) {
        return false;
      }
    }

    // Form filters
    const form = getNumericValue(snapshotData, "PlayerForm");
    if (filters.minForm !== null && filters.minForm !== undefined) {
      if (form === null || form < filters.minForm) {
        return false;
      }
    }
    if (filters.maxForm !== null && filters.maxForm !== undefined) {
      if (form === null || form > filters.maxForm) {
        return false;
      }
    }

    // Stamina filters
    const stamina = getNumericValue(snapshotData, "StaminaSkill");
    if (filters.minStamina !== null && filters.minStamina !== undefined) {
      if (stamina === null || stamina < filters.minStamina) {
        return false;
      }
    }
    if (filters.maxStamina !== null && filters.maxStamina !== undefined) {
      if (stamina === null || stamina > filters.maxStamina) {
        return false;
      }
    }

    // Experience filters
    const experience = getNumericValue(snapshotData, "Experience");
    if (filters.minExperience !== null && filters.minExperience !== undefined) {
      if (experience === null || experience < filters.minExperience) {
        return false;
      }
    }
    if (filters.maxExperience !== null && filters.maxExperience !== undefined) {
      if (experience === null || experience > filters.maxExperience) {
        return false;
      }
    }

    // Skill filters
    const keeper = getNumericValue(snapshotData, "KeeperSkill");
    const defender = getNumericValue(snapshotData, "DefenderSkill");
    const playmaker = getNumericValue(snapshotData, "PlaymakerSkill");
    const winger = getNumericValue(snapshotData, "WingerSkill");
    const passing = getNumericValue(snapshotData, "PassingSkill");
    const scorer = getNumericValue(snapshotData, "ScorerSkill");
    const setPieces = getNumericValue(snapshotData, "SetPiecesSkill");

    if (filters.minKeeper !== null && filters.minKeeper !== undefined && (keeper === null || keeper < filters.minKeeper)) return false;
    if (filters.maxKeeper !== null && filters.maxKeeper !== undefined && (keeper === null || keeper > filters.maxKeeper)) return false;
    if (filters.minDefender !== null && filters.minDefender !== undefined && (defender === null || defender < filters.minDefender)) return false;
    if (filters.maxDefender !== null && filters.maxDefender !== undefined && (defender === null || defender > filters.maxDefender)) return false;
    if (filters.minPlaymaker !== null && filters.minPlaymaker !== undefined && (playmaker === null || playmaker < filters.minPlaymaker)) return false;
    if (filters.maxPlaymaker !== null && filters.maxPlaymaker !== undefined && (playmaker === null || playmaker > filters.maxPlaymaker)) return false;
    if (filters.minWinger !== null && filters.minWinger !== undefined && (winger === null || winger < filters.minWinger)) return false;
    if (filters.maxWinger !== null && filters.maxWinger !== undefined && (winger === null || winger > filters.maxWinger)) return false;
    if (filters.minPassing !== null && filters.minPassing !== undefined && (passing === null || passing < filters.minPassing)) return false;
    if (filters.maxPassing !== null && filters.maxPassing !== undefined && (passing === null || passing > filters.maxPassing)) return false;
    if (filters.minScorer !== null && filters.minScorer !== undefined && (scorer === null || scorer < filters.minScorer)) return false;
    if (filters.maxScorer !== null && filters.maxScorer !== undefined && (scorer === null || scorer > filters.maxScorer)) return false;
    if (filters.minSetPieces !== null && filters.minSetPieces !== undefined && (setPieces === null || setPieces < filters.minSetPieces)) return false;
    if (filters.maxSetPieces !== null && filters.maxSetPieces !== undefined && (setPieces === null || setPieces > filters.maxSetPieces)) return false;

    // Position score filters
    if (filters.minPositionScore !== null && filters.minPositionScore !== undefined || 
        filters.maxPositionScore !== null && filters.maxPositionScore !== undefined) {
      const positionResult = computePositionScores(snapshotData);
      const bestScore = positionResult.bestScore;
      if (bestScore === null) {
        return false;
      }
      if (filters.minPositionScore !== null && filters.minPositionScore !== undefined && bestScore < filters.minPositionScore) {
        return false;
      }
      if (filters.maxPositionScore !== null && filters.maxPositionScore !== undefined && bestScore > filters.maxPositionScore) {
        return false;
      }
    }

    // Injury filter
    if (filters.hasInjury !== null && filters.hasInjury !== undefined) {
      const injuryLevel = getNumericValue(snapshotData, "InjuryLevel");
      const hasInjury = injuryLevel !== null && injuryLevel > 0;
      if (filters.hasInjury !== hasInjury) {
        return false;
      }
    }

    // Specialty filter
    if (filters.specialty && filters.specialty !== "all") {
      const specialty = getStringValue(snapshotData, "Specialty");
      if (specialty !== filters.specialty) {
        return false;
      }
    }

    return true;
  });
}
