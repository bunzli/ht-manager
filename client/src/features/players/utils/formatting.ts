import type { PlayerChange } from "../../../api/players";
import type { PreparedPlayer } from "../types/table";
import type { BestPosition } from "./positionScores";
import {
  SALARY_MULTIPLIER,
  moneyFormatter,
  WEEKLY_FIELDS,
  FIELDS_WITHOUT_ANNOTATIONS,
  SKILL_FIELDS
} from "../constants/table";
import { getPositionDisplayInfo } from "./positionScores";

export function formatNumericValue(value: number): string {
  const maximumFractionDigits = Number.isInteger(value) ? 0 : 2;
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

export function formatNumericDelta(delta: number): string {
  if (delta === 0) return "0";
  const sign = delta > 0 ? "+" : "-";
  const magnitude = Math.abs(delta);
  return `${sign}${formatNumericValue(magnitude)}`;
}

export function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatNumericValue(value);
}

function normalizeChangeString(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "";
  }
  const lower = trimmed.toLowerCase();
  if (lower === "true" || lower === "false") {
    return lower;
  }
  return trimmed;
}

function formatPlainChangeValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") {
    return "—";
  }
  const lower = trimmed.toLowerCase();
  if (lower === "true") return "Yes";
  if (lower === "false") return "No";
  return trimmed;
}

export function formatRecentChange(change: PlayerChange): string | null {
  const { newValue, oldValue, fieldName } = change;
  if (newValue === null || oldValue === null) {
    return null;
  }

  const numericNew = Number(newValue);
  const numericOld = Number(oldValue);

  if (Number.isFinite(numericNew) && Number.isFinite(numericOld)) {
    const delta = numericNew - numericOld;
    if (delta === 0) {
      return null;
    }
    // For skill fields, use arrows instead of numeric deltas
    if (SKILL_FIELDS.has(fieldName)) {
      return delta > 0 ? "↑" : "↓";
    }
    return `(${formatNumericDelta(delta)})`;
  }

  const normalizedNew = normalizeChangeString(newValue);
  const normalizedOld = normalizeChangeString(oldValue);

  if (normalizedNew !== normalizedOld) {
    return `(was ${formatPlainChangeValue(oldValue)})`;
  }

  return null;
}

export function appendChangeDecorations(
  fieldId: string,
  baseText: string,
  value: unknown,
  player: PreparedPlayer,
  showWeeklyDiff: boolean
): string {
  if (FIELDS_WITHOUT_ANNOTATIONS.has(fieldId)) {
    return baseText;
  }

  const change = player.recentFieldChanges[fieldId];
  if (change) {
    const annotation = formatRecentChange(change);
    if (annotation) {
      return baseText ? `${baseText} ${annotation}` : annotation;
    }
  }

  if (showWeeklyDiff && !change && player.weeklyDiff && WEEKLY_FIELDS.has(fieldId)) {
    const diff = player.weeklyDiff[fieldId];
    if (diff && diff.delta !== null && diff.delta !== 0) {
      // For skill fields, use arrows instead of numeric deltas
      const annotation = SKILL_FIELDS.has(fieldId)
        ? (diff.delta > 0 ? "↑" : "↓")
        : `(${formatNumericDelta(diff.delta)})`;
      return baseText ? `${baseText} ${annotation}` : annotation;
    }
  }

  return baseText;
}

export function formatValue(
  fieldId: string,
  value: unknown,
  player: PreparedPlayer,
  showWeeklyDiff: boolean
): string {
  if (value === undefined || value === null) {
    return "";
  }

  if (fieldId === "AgeDays") {
    return ""; // merged into Age column
  }

  if (fieldId === "name") {
    return appendChangeDecorations(fieldId, String(value), value, player, showWeeklyDiff);
  }

  if (fieldId === "active") {
    const text = value ? "Yes" : "No";
    return appendChangeDecorations(fieldId, text, value, player, showWeeklyDiff);
  }

  if (fieldId === "Age") {
    const years = Number(player.Age ?? value);
    const days = Number(player.AgeDays ?? 0);
    if (Number.isFinite(years) && Number.isFinite(days)) {
      const ageText = `${years}y ${days}d`;
      return appendChangeDecorations(fieldId, ageText, value, player, showWeeklyDiff);
    }
  }

  if (fieldId === "bestPosition") {
    const sourceValue =
      typeof value === "string"
        ? (value as BestPosition)
        : player.bestPosition ?? null;
    const display = getPositionDisplayInfo(sourceValue);
    return display?.label ?? "";
  }

  if (fieldId === "bestPositionScore") {
    const numeric = Number(value ?? player.bestPositionScore);
    if (Number.isFinite(numeric)) {
      return formatNumericValue(numeric);
    }
    return "";
  }

  if (fieldId === "injuryDaysRemaining") {
    const numeric = Number(value ?? player.injuryDaysRemaining);
    if (Number.isFinite(numeric) && numeric > 0) {
      return `+${numeric}`;
    }
    return "";
  }

  if (fieldId === "Salary") {
    const base = Number(value);
    if (Number.isFinite(base)) {
      try {
        const salaryText = moneyFormatter.format(base * SALARY_MULTIPLIER);
        return appendChangeDecorations(fieldId, salaryText, value, player, showWeeklyDiff);
      } catch (_error) {
        const fallback = `$${Math.round(base * SALARY_MULTIPLIER).toLocaleString()}`;
        return appendChangeDecorations(fieldId, fallback, value, player, showWeeklyDiff);
      }
    }
  }

  if (fieldId === "TSI") {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const formatted = formatNumericValue(numeric);
      return appendChangeDecorations(fieldId, formatted, value, player, showWeeklyDiff);
    }
  }

  if (fieldId === "InjuryLevel") {
    const numeric = Number(value);
    if (numeric === -1) return "";
    return appendChangeDecorations(fieldId, String(numeric), value, player, showWeeklyDiff);
  }

  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true") {
      return appendChangeDecorations(fieldId, "Yes", value, player, showWeeklyDiff);
    }
    if (lower === "false") {
      return appendChangeDecorations(fieldId, "No", value, player, showWeeklyDiff);
    }
  }

  if (fieldId.toLowerCase().includes("date") || fieldId.toLowerCase().includes("fetchedat")) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) {
      return appendChangeDecorations(fieldId, date.toLocaleString(), value, player, showWeeklyDiff);
    }
  }

  const baseText = typeof value === "object" ? JSON.stringify(value) : String(value);
  return appendChangeDecorations(fieldId, baseText, value, player, showWeeklyDiff);
}

