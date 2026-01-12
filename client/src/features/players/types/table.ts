// Minimal types file for backward compatibility
// These types may be used by utility functions that are not currently imported
// but kept for potential future use

import type { Player } from "../../../api/players";
import type { TrainingPreference } from "../state/useTrainingPreferences";
import type { BestPosition } from "../utils/positionScores";

export type PreparedPlayer = Player & {
  latestSnapshotFetchedAt: string | null;
  recentChangesCount: number;
  recentFieldChanges: Record<string, Player["recentChanges"][0]>;
  trainingPreference: TrainingPreference;
  bestPosition: BestPosition | null;
  bestPositionScore: number | null;
  positionScores: Partial<Record<BestPosition, number>>;
  bestPositionIsOverridden: boolean;
  computedBestPosition: BestPosition | null;
  computedBestScore: number | null;
  hasPlayedThisPeriod: boolean;
  injuryDaysRemaining: number | null;
  [key: string]: unknown;
};

export type OrderDirection = "asc" | "desc";
