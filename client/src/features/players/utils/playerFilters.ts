import type { Player } from "../../../api/players";
import type { Match } from "../../../api/matches";

/**
 * Check if a player played in the last match
 * Compares the player's LastMatch.Date with the last match date from the database
 * 
 * If a player has no snapshot or LastMatch data is missing/invalid, they are considered
 * to have NOT played (which is the safe default)
 */
export function hasPlayedLastMatch(player: Player, lastMatch: Match | null): boolean {
  // If no last match in database, we can't determine participation
  if (!lastMatch) {
    return false;
  }
  
  // If no snapshot, player didn't play
  if (!player.latestSnapshot) {
    return false;
  }
  
  const snapshotData = player.latestSnapshot.data;
  
  // If snapshot data is invalid, player didn't play
  if (!snapshotData || typeof snapshotData !== "object" || Array.isArray(snapshotData)) {
    return false;
  }
  
  const playerLastMatch = snapshotData.LastMatch as Record<string, unknown> | null | undefined;
  
  // If LastMatch doesn't exist or is null, player didn't play
  if (!playerLastMatch || typeof playerLastMatch !== "object" || Array.isArray(playerLastMatch)) {
    return false;
  }
  
  const matchDate = playerLastMatch.Date;
  const matchRating = playerLastMatch.Rating;
  
  // Both Date and Rating must exist for the player to have actually played
  // Date must be a valid non-empty string
  const hasValidDate = typeof matchDate === "string" && matchDate.trim() !== "";
  if (!hasValidDate) {
    return false;
  }
  
  // Try to parse the date to ensure it's valid
  const playerMatchDate = new Date(matchDate);
  if (Number.isNaN(playerMatchDate.getTime())) {
    return false;
  }
  
  // Rating should exist (can be 0, but should be a number)
  // If Rating is missing/null/undefined, player likely didn't play
  if (matchRating === null || matchRating === undefined) {
    return false;
  }
  
  // Compare player's match date with the last match date from database
  // Allow a small time difference (e.g., 1 hour) to account for timezone differences
  const lastMatchDate = new Date(lastMatch.matchDate);
  const timeDiff = Math.abs(playerMatchDate.getTime() - lastMatchDate.getTime());
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
  
  // Player participated if their match date matches the last match date (within 1 hour tolerance)
  return timeDiff < oneHour;
}

/**
 * Check if a player did NOT play in the last match
 * This is the inverse of hasPlayedLastMatch
 */
export function didNotPlayLastMatch(player: Player, lastMatch: Match | null): boolean {
  return !hasPlayedLastMatch(player, lastMatch);
}
