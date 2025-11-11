import type { Player } from "../../../api/players";
import type { PreparedPlayer } from "../types/table";
import type { TrainingPreference } from "../state/useTrainingPreferences";
import type { BestPosition } from "./positionScores";
import { RECENT_CHANGE_WINDOW_MS } from "../constants/table";
import { computePositionScores } from "./positionScores";

export function getCurrentMatchPeriod(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay(); // 0 Sunday, 5 Friday
  const FRIDAY_INDEX = 5;
  // Calculate days since last Friday (the most recent past Friday)
  // If today is Friday, go back 7 days to get last Friday
  // Otherwise, go back to the most recent Friday
  let daysSinceFriday = (day - FRIDAY_INDEX + 7) % 7;
  if (daysSinceFriday === 0) {
    // Today is Friday, so "last Friday" is 7 days ago
    daysSinceFriday = 7;
  }
  start.setDate(start.getDate() - daysSinceFriday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

export function toPreparedPlayer(
  player: Player,
  trainingPreference: TrainingPreference,
  overridePosition: BestPosition | null
): PreparedPlayer {
  const now = Date.now();
  const recentFieldChanges: Record<string, Player["recentChanges"][0]> = {};

  for (const change of player.recentChanges) {
    const recordedAt = new Date(change.recordedAt).getTime();
    if (Number.isNaN(recordedAt)) {
      continue;
    }
    if (now - recordedAt > RECENT_CHANGE_WINDOW_MS) {
      continue;
    }
    const existing = recentFieldChanges[change.fieldName];
    if (!existing || new Date(existing.recordedAt).getTime() < recordedAt) {
      recentFieldChanges[change.fieldName] = change;
    }
  }

  const prepared: PreparedPlayer = {
    ...player,
    latestSnapshotFetchedAt: player.latestSnapshot?.fetchedAt ?? null,
    recentChangesCount: player.recentChanges.length,
    recentFieldChanges,
    trainingPreference,
    bestPosition: null,
    bestPositionScore: null,
    positionScores: {},
    bestPositionIsOverridden: false,
    computedBestPosition: null,
    computedBestScore: null,
    hasPlayedThisPeriod: false,
    injuryDaysRemaining: null
  };

  const snapshotData = player.latestSnapshot?.data;
  if (snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)) {
    for (const [key, value] of Object.entries(snapshotData)) {
      if (prepared[key] === undefined) {
        prepared[key] = value;
      } else {
        prepared[`snapshot.${key}`] = value;
      }
    }
  }

  const positionResult = computePositionScores(prepared);
  prepared.positionScores = positionResult.scores;
  prepared.computedBestPosition = positionResult.bestPosition;
  prepared.computedBestScore = positionResult.bestScore;

  const appliedPosition = overridePosition ?? positionResult.bestPosition;
  prepared.bestPositionIsOverridden = Boolean(overridePosition);
  prepared.bestPosition = appliedPosition;

  if (appliedPosition) {
    prepared.bestPositionScore = positionResult.scores[appliedPosition] ?? null;
  } else {
    prepared.bestPositionScore = positionResult.bestScore;
  }

  const { start: periodStart, end: periodEnd } = getCurrentMatchPeriod();
  // Check if player has played since last Friday using LastMatch data
  // LastMatch contains the actual match date from the Hattrick API
  let hasPlayed = false;
  
  if (snapshotData && typeof snapshotData === "object" && !Array.isArray(snapshotData)) {
    const lastMatch = snapshotData["LastMatch"] as Record<string, unknown> | undefined;
    
    if (lastMatch && typeof lastMatch === "object") {
      const matchDateStr = lastMatch["Date"] as string | undefined;
      
      if (matchDateStr) {
        const matchDate = new Date(matchDateStr);
        if (!Number.isNaN(matchDate.getTime())) {
          // Check if the match date is within the period (since last Friday)
          hasPlayed = matchDate >= periodStart && matchDate < periodEnd;
        }
      }
    }
  }
  
  prepared.hasPlayedThisPeriod = hasPlayed;

  const injuryLevel = Number((prepared as Record<string, unknown>).InjuryLevel ?? null);
  prepared.injuryDaysRemaining =
    Number.isFinite(injuryLevel) && injuryLevel > 0 ? injuryLevel : null;

  return prepared;
}

export function getFieldValue(player: PreparedPlayer, fieldId: string): unknown {
  const record = player as unknown as Record<string, unknown>;
  if (fieldId in record) {
    return record[fieldId];
  }

  if (fieldId.includes(".")) {
    return fieldId.split(".").reduce<unknown>((value, key) => {
      if (value && typeof value === "object" && key in (value as Record<string, unknown>)) {
        return (value as Record<string, unknown>)[key];
      }
      return undefined;
    }, player as unknown as Record<string, unknown>);
  }

  return undefined;
}

export function compareValues(a: unknown, b: unknown, direction: "asc" | "desc"): number {
  if (a === b) return 0;

  const factor = direction === "asc" ? 1 : -1;

  if (a === undefined || a === null) return -1 * factor;
  if (b === undefined || b === null) return 1 * factor;

  if (typeof a === "number" && typeof b === "number") {
    return (a - b) * factor;
  }

  if (a instanceof Date || b instanceof Date) {
    const timeA = a instanceof Date ? a.getTime() : new Date(String(a)).getTime();
    const timeB = b instanceof Date ? b.getTime() : new Date(String(b)).getTime();
    return (timeA - timeB) * factor;
  }

  const textA = String(a).toLowerCase();
  const textB = String(b).toLowerCase();
  if (textA < textB) return -1 * factor;
  if (textA > textB) return 1 * factor;
  return 0;
}

