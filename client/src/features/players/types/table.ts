import type { Player, PlayerChange } from "../../../api/players";
import type { TrainingPreference } from "../state/useTrainingPreferences";
import type { BestPosition } from "../utils/positionScores";
import type { Formation } from "../constants/formations";

export type PlayersTableProps = {
  players: Player[];
  isLoading?: boolean;
  showWeeklyDiff?: boolean;
  evaluationPosition?: BestPosition | null;
  selectedFormation?: Formation | null;
};

export type PreparedPlayer = Player & {
  latestSnapshotFetchedAt: string | null;
  recentChangesCount: number;
  recentFieldChanges: Record<string, PlayerChange>;
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

export type BestPositionCellProps = {
  player: PreparedPlayer;
  onOverrideChange: (playerId: number, position: BestPosition | null) => void;
};

