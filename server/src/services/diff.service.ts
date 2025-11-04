import { subDays } from "date-fns";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client";

const TRACKED_FIELDS = [
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
];

type NumericMap = Record<string, number | null>;

function safeNumber(value: Prisma.JsonValue | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type PlayerWeeklyDiff = {
  playerId: number;
  snapshotId: number | null;
  changes: Record<string, { current: number | null; previous: number | null; delta: number | null }>;
};

export async function findWeeklyDiffs(playerIds: number[]): Promise<PlayerWeeklyDiff[]> {
  if (playerIds.length === 0) return [];

  const sevenDaysAgo = subDays(new Date(), 7);

  const snapshots = await prisma.playerSnapshot.findMany({
    where: {
      playerId: { in: playerIds }
    },
    orderBy: {
      fetchedAt: "desc"
    }
  });

  const grouped = new Map<number, typeof snapshots>();
  for (const snapshot of snapshots) {
    if (!grouped.has(snapshot.playerId)) {
      grouped.set(snapshot.playerId, []);
    }
    grouped.get(snapshot.playerId)!.push(snapshot);
  }

  const results: PlayerWeeklyDiff[] = [];

  for (const playerId of playerIds) {
    const playerSnapshots = grouped.get(playerId) ?? [];
    const latest = playerSnapshots[0] ?? null;
    let previous: typeof latest | null = null;

    for (const snapshot of playerSnapshots.slice(1)) {
      if (snapshot.fetchedAt <= sevenDaysAgo) {
        previous = snapshot;
        break;
      }
      previous = snapshot;
    }

    const currentData = (latest?.data as Prisma.JsonObject | undefined) ?? {};
    const previousData = (previous?.data as Prisma.JsonObject | undefined) ?? {};

    const changes: PlayerWeeklyDiff["changes"] = {};

    for (const field of TRACKED_FIELDS) {
      const currentValue = safeNumber(currentData[field]);
      const previousValue = safeNumber(previousData[field]);
      const delta =
        currentValue !== null && previousValue !== null ? currentValue - previousValue : null;

      changes[field] = {
        current: currentValue,
        previous: previousValue,
        delta
      };
    }

    results.push({
      playerId,
      snapshotId: latest?.id ?? null,
      changes
    });
  }

  return results;
}
