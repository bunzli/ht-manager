import type { Player } from "../../../api/players";

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
