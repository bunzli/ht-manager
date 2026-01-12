// Minimal constants file for backward compatibility
// These may be used by utility functions that are not currently imported
// but kept for potential future use

export const SALARY_MULTIPLIER = 20;

export const moneyFormatter = new Intl.NumberFormat(undefined, {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

export const RECENT_CHANGE_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export const WEEKLY_FIELDS = new Set([
  "TSI",
  "PlayerForm",
  "Experience",
  "StaminaSkill",
  "KeeperSkill",
  "PlaymakerSkill",
  "ScorerSkill",
  "PassingSkill",
  "WingerSkill",
  "DefenderSkill",
  "SetPiecesSkill"
]);

export const FIELDS_WITHOUT_ANNOTATIONS = new Set([
  "PlayerNumber",
  "trainingPreference",
  "bestPosition",
  "bestPositionScore",
  "injuryDaysRemaining"
]);

export const SKILL_FIELDS = new Set([
  "StaminaSkill",
  "KeeperSkill",
  "PlaymakerSkill",
  "ScorerSkill",
  "PassingSkill",
  "WingerSkill",
  "DefenderSkill",
  "SetPiecesSkill"
]);

export const PLAY_ACTIVITY_FIELDS = new Set([
  "MatchesCurrentTeam",
  "GoalsCurrentTeam",
  "AssistsCurrentTeam",
  "Cards"
]);
