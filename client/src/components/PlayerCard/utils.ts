/**
 * Skill level mappings from numeric values to text labels
 * Based on Hattrick skill system
 */
export const SKILL_LEVELS: Record<number, string> = {
  1: "disastrous",
  2: "wretched",
  3: "poor",
  4: "weak",
  5: "inadequate",
  6: "passable",
  7: "solid",
  8: "excellent",
  9: "formidable",
  10: "outstanding",
  11: "brilliant",
  12: "magnificent",
  13: "world class",
  14: "supernatural",
  15: "titanic",
  16: "extra-terrestrial",
  17: "mythical",
  18: "magical",
  19: "utopian",
  20: "divine"
};

/**
 * Get skill level text from numeric value
 */
export function getSkillLevelText(level: number | null | undefined): string {
  if (level === null || level === undefined) {
    return "—";
  }
  return SKILL_LEVELS[level] ?? String(level);
}

/**
 * Get skill level color based on value
 */
export function getSkillLevelColor(level: number | null | undefined): string {
  if (level === null || level === undefined) {
    return "#9ca3af"; // gray
  }
  if (level <= 2) {
    return "#ef4444"; // red for disastrous/wretched
  }
  if (level <= 4) {
    return "#f59e0b"; // orange for poor/weak
  }
  if (level <= 6) {
    return "#eab308"; // yellow for inadequate/passable
  }
  if (level <= 8) {
    return "#84cc16"; // light green for solid/excellent
  }
  return "#22c55e"; // green for higher levels
}

/**
 * Get form/stamina color based on value
 * 7-8: super (green)
 * 6: ok (yellow)
 * 4-5: bad (orange)
 * ≤3: super bad (red)
 */
export function getFormStaminaColor(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "#9ca3af"; // gray
  }
  if (value >= 7) {
    return "#22c55e"; // green - super
  }
  if (value === 6) {
    return "#eab308"; // yellow - ok
  }
  if (value >= 4) {
    return "#f97316"; // orange - bad
  }
  return "#ef4444"; // red - super bad (≤3)
}

/**
 * Format age from years and days
 */
export function formatAge(years: number | null | undefined, days: number | null | undefined): string {
  if (years === null || years === undefined) {
    return "—";
  }
  const daysValue = days ?? 0;
  return `${years} years and ${daysValue} days`;
}

/**
 * Format salary/wage
 */
export function formatWage(salary: number | null | undefined, currency: string = "Pesos"): string {
  if (salary === null || salary === undefined) {
    return "—";
  }
  // Hattrick salary multiplier is 20
  const weeklyWage = salary * 20;
  return `${weeklyWage.toLocaleString()} ${currency}/week`;
}

/**
 * Format TSI
 */
export function formatTSI(tsi: number | null | undefined): string {
  if (tsi === null || tsi === undefined) {
    return "—";
  }
  return tsi.toLocaleString();
}
