type NumericRecord = Record<string, number>;

export type BestPosition = "GK" | "CD" | "WB" | "IM" | "WNG" | "FW";

const POSITION_LABELS: Record<BestPosition, string> = {
  GK: "Goalkeeper",
  CD: "Central Defender",
  WB: "Wing Back",
  IM: "Inner Midfielder",
  WNG: "Winger",
  FW: "Forward"
};

const POSITION_ABBREVIATIONS: Record<BestPosition, string> = {
  GK: "GK",
  CD: "CD",
  WB: "WB",
  IM: "IM",
  WNG: "WG",
  FW: "FW"
};

const POSITION_COLORS: Record<BestPosition, string> = {
  GK: "#1e88e5",
  CD: "#6d4c41",
  WB: "#00897b",
  IM: "#8e24aa",
  WNG: "#f4511e",
  FW: "#c62828"
};

export const POSITION_ORDER: BestPosition[] = ["GK", "CD", "WB", "IM", "WNG", "FW"];

export type PositionScoreResult = {
  bestPosition: BestPosition | null;
  bestScore: number | null;
  scores: Partial<Record<BestPosition, number>>;
};

function toNumber(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function applyLoyaltyBonus(skill: number, loyalty: number): number {
  return skill + loyalty / 20;
}

export function getPositionLabel(position: BestPosition | string): string {
  return POSITION_LABELS[position as BestPosition] ?? position;
}

export function getPositionAbbreviation(position: BestPosition | string): string {
  return POSITION_ABBREVIATIONS[position as BestPosition] ?? String(position).toUpperCase();
}

export function getPositionColor(position: BestPosition | string): string {
  return POSITION_COLORS[position as BestPosition] ?? "#424242";
}

export function getPositionDisplayInfo(
  position: BestPosition | string | null | undefined
): { label: string; color: string } | null {
  if (!position) {
    return null;
  }
  const abbrev = getPositionAbbreviation(position);
  const color = getPositionColor(position);
  return { label: abbrev, color };
}

export function computePositionScores(
  player: Record<string, unknown>
): PositionScoreResult {
  const loyalty = toNumber(player.Loyalty);

  const keeperEff = applyLoyaltyBonus(toNumber(player.KeeperSkill), loyalty);
  const defenderEff = applyLoyaltyBonus(toNumber(player.DefenderSkill), loyalty);
  const passingEff = applyLoyaltyBonus(toNumber(player.PassingSkill), loyalty);
  const playmakerEff = applyLoyaltyBonus(toNumber(player.PlaymakerSkill), loyalty);
  const wingerEff = applyLoyaltyBonus(toNumber(player.WingerSkill), loyalty);
  const scorerEff = applyLoyaltyBonus(toNumber(player.ScorerSkill), loyalty);
  const setPiecesEff = applyLoyaltyBonus(toNumber(player.SetPiecesSkill), loyalty);

  const baseScores: NumericRecord = {
    GK:
      0.85 * keeperEff +
      0.05 * defenderEff +
      0.03 * passingEff +
      0.05 * setPiecesEff +
      0.02 * playmakerEff,
    CD:
      0.70 * defenderEff +
      0.12 * passingEff +
      0.08 * playmakerEff +
      0.05 * setPiecesEff +
      0.05 * wingerEff,
    WB:
      0.55 * defenderEff +
      0.20 * wingerEff +
      0.12 * passingEff +
      0.07 * playmakerEff +
      0.03 * scorerEff +
      0.03 * setPiecesEff,
    IM:
      0.60 * playmakerEff +
      0.15 * passingEff +
      0.10 * defenderEff +
      0.05 * wingerEff +
      0.05 * scorerEff +
      0.05 * setPiecesEff,
    WNG:
      0.55 * wingerEff +
      0.15 * passingEff +
      0.10 * playmakerEff +
      0.10 * scorerEff +
      0.07 * defenderEff +
      0.03 * setPiecesEff,
    FW:
      0.60 * scorerEff +
      0.20 * passingEff +
      0.07 * wingerEff +
      0.05 * playmakerEff +
      0.05 * setPiecesEff +
      0.03 * defenderEff
  };

  const form = toNumber(player.PlayerForm);
  const experience = toNumber(player.Experience);
  const stamina = toNumber(player.StaminaSkill);

  const formFactor = 0.85 + 0.025 * form;
  const experienceFactor = 0.02 * experience;
  const staminaFactor = 0.9 + 0.01 * stamina;

  const scores = Object.entries(baseScores).reduce<Partial<Record<BestPosition, number>>>(
    (result, [position, baseScore]) => {
      const perfScore = ((0.8 * baseScore) * formFactor + 0.2 * experienceFactor) * staminaFactor;
      result[position as BestPosition] = perfScore;
      return result;
    },
    {}
  );

  let bestPosition: BestPosition | null = null;
  let bestScore: number | null = null;

  for (const [position, score] of Object.entries(scores)) {
    if (bestScore === null || (score ?? 0) > bestScore) {
      bestScore = score ?? 0;
      bestPosition = position as BestPosition;
    }
  }

  if (bestScore === null) {
    return {
      bestPosition: null,
      bestScore: null,
      scores
    };
  }

  return {
    bestPosition,
    bestScore,
    scores
  };
}
