import type { Player } from "../../../api/players";
import type { BestPosition } from "./positionScores";
import { computePositionScores } from "./positionScores";

export type SortField =
  | "name"
  | "age"
  | "tsi"
  | "positionScoreGK"
  | "positionScoreCD"
  | "positionScoreWB"
  | "positionScoreIM"
  | "positionScoreWNG"
  | "positionScoreFW";

export type SortDirection = "asc" | "desc" | null;

export type PlayerSort = {
  field: SortField | null;
  direction: SortDirection;
};

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
 * Get sort value for a player based on sort field
 */
function getSortValue(player: Player, field: SortField): number | string | null {
  const snapshotData = player.latestSnapshot?.data;
  if (!snapshotData || typeof snapshotData !== "object" || Array.isArray(snapshotData)) {
    return null;
  }

  switch (field) {
    case "name":
      return player.name.toLowerCase();
    case "age":
      return getNumericValue(snapshotData, "Age");
    case "tsi":
      return getNumericValue(snapshotData, "TSI");
    case "positionScoreGK":
    case "positionScoreCD":
    case "positionScoreWB":
    case "positionScoreIM":
    case "positionScoreWNG":
    case "positionScoreFW": {
      const positionResult = computePositionScores(snapshotData);
      const position = field.replace("positionScore", "") as BestPosition;
      return positionResult.scores[position] ?? null;
    }
    default:
      return null;
  }
}

/**
 * Compare two values for sorting
 */
function compareValues(a: number | string | null, b: number | string | null, direction: SortDirection): number {
  if (direction === null) return 0;
  
  const factor = direction === "asc" ? 1 : -1;

  if (a === null && b === null) return 0;
  if (a === null) return 1 * factor;
  if (b === null) return -1 * factor;

  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * factor;
  }

  const strA = String(a).toLowerCase();
  const strB = String(b).toLowerCase();
  if (strA < strB) return -1 * factor;
  if (strA > strB) return 1 * factor;
  return 0;
}

/**
 * Sort players based on sort configuration
 */
export function sortPlayers(players: Player[], sort: PlayerSort): Player[] {
  if (!sort.field || sort.direction === null) {
    return players;
  }
  
  const sorted = [...players];
  
  sorted.sort((a, b) => {
    const valueA = getSortValue(a, sort.field!);
    const valueB = getSortValue(b, sort.field!);
    return compareValues(valueA, valueB, sort.direction);
  });

  return sorted;
}
