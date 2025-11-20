import type { BestPosition } from "../utils/positionScores";

export type Formation = {
  id: string;
  name: string;
  positions: BestPosition[];
};

/**
 * Formations always use wing backs (WB) and wings (WNG) as specified.
 * Each formation defines the required positions for a starting lineup.
 */
export const FORMATIONS: Formation[] = [
  {
    id: "4-4-2",
    name: "4-4-2",
    positions: ["GK", "CD", "CD", "WB", "WB", "IM", "IM", "WNG", "WNG", "FW", "FW"]
  },
  {
    id: "3-5-2",
    name: "3-5-2",
    positions: ["GK", "CD", "CD", "CD", "WB", "WB", "IM", "IM", "IM", "WNG", "WNG", "FW", "FW"]
  },
  {
    id: "4-3-3",
    name: "4-3-3",
    positions: ["GK", "CD", "CD", "WB", "WB", "IM", "IM", "IM", "WNG", "WNG", "FW", "FW", "FW"]
  },
  {
    id: "5-3-2",
    name: "5-3-2",
    positions: ["GK", "CD", "CD", "CD", "WB", "WB", "IM", "IM", "IM", "WNG", "WNG", "FW", "FW"]
  },
  {
    id: "4-5-1",
    name: "4-5-1",
    positions: ["GK", "CD", "CD", "WB", "WB", "IM", "IM", "IM", "WNG", "WNG", "FW"]
  },
  {
    id: "3-4-3",
    name: "3-4-3",
    positions: ["GK", "CD", "CD", "CD", "WB", "WB", "IM", "IM", "WNG", "WNG", "FW", "FW", "FW"]
  }
];

export function getFormationById(id: string): Formation | null {
  return FORMATIONS.find((f) => f.id === id) ?? null;
}

/**
 * Counts how many players are needed for each position in a formation.
 * Returns a map of position to count needed.
 */
export function countPlayersByPosition(
  players: Array<{ bestPosition: BestPosition | null }>,
  formation: Formation
): Map<BestPosition, number> {
  const counts = new Map<BestPosition, number>();
  
  for (const position of formation.positions) {
    const currentCount = counts.get(position) ?? 0;
    counts.set(position, currentCount + 1);
  }
  
  return counts;
}

/**
 * Selects the best players for each position in a formation.
 * Only considers players who haven't played this week.
 * Returns a set of player IDs that should be highlighted.
 */
export function selectBestPlayersForFormation(
  players: Array<{
    playerId: number;
    bestPosition: BestPosition | null;
    positionScores: Partial<Record<BestPosition, number>>;
    hasPlayedThisPeriod: boolean;
  }>,
  formation: Formation
): Set<number> {
  const selectedPlayerIds = new Set<number>();
  
  // Count how many of each position are needed
  const positionCounts = new Map<BestPosition, number>();
  for (const position of formation.positions) {
    const currentCount = positionCounts.get(position) ?? 0;
    positionCounts.set(position, currentCount + 1);
  }
  
  // For each position, select the best N players who haven't played
  for (const [position, neededCount] of positionCounts.entries()) {
    // Filter players who:
    // 1. Haven't played this week
    // 2. Have this position as their best position
    // 3. Have a score for this position
    const eligiblePlayers = players
      .filter(
        (player) =>
          !player.hasPlayedThisPeriod &&
          player.bestPosition === position &&
          player.positionScores[position] !== undefined
      )
      .sort((a, b) => {
        const scoreA = a.positionScores[position] ?? 0;
        const scoreB = b.positionScores[position] ?? 0;
        return scoreB - scoreA; // Sort descending (best first)
      })
      .slice(0, neededCount); // Take only the top N needed
    
    // Add selected players to the set
    for (const player of eligiblePlayers) {
      selectedPlayerIds.add(player.playerId);
    }
  }
  
  return selectedPlayerIds;
}

/**
 * Checks if a player matches any position in the formation.
 */
export function playerMatchesFormation(
  player: { bestPosition: BestPosition | null },
  formation: Formation
): boolean {
  if (!player.bestPosition) {
    return false;
  }
  return formation.positions.includes(player.bestPosition);
}

