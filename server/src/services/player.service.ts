import { prisma } from "../db/client";
import type { Prisma } from "@prisma/client";
import { findWeeklyDiffs, type PlayerWeeklyDiff } from "./diff.service";

type PlayerChangeRecord = {
  changeId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  recordedAt: Date;
  snapshotId: number;
};

export type PlayerWithLatest = {
  playerId: number;
  teamId: number;
  name: string;
  active: boolean;
  latestSnapshot?: {
    snapshotId: number;
    fetchedAt: Date;
    data: Prisma.JsonValue;
  };
  recentChanges: Array<{
    changeId: number;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    recordedAt: Date;
    snapshotId: number;
  }>;
  weeklyDiff?: PlayerWeeklyDiff["changes"];
};

export type PlayerWithHistory = Omit<PlayerWithLatest, "recentChanges"> & {
  changes: PlayerChangeRecord[];
};

function mapChange(change: { id: number; fieldName: string; oldValue: string | null; newValue: string | null; recordedAt: Date; snapshotId: number }): PlayerChangeRecord {
  return {
    changeId: change.id,
    fieldName: change.fieldName,
    oldValue: change.oldValue,
    newValue: change.newValue,
    recordedAt: change.recordedAt,
    snapshotId: change.snapshotId
  };
}

export async function listPlayers(limitRecentChanges = 5): Promise<PlayerWithLatest[]> {
  const players = await prisma.player.findMany({
    orderBy: { playerId: "asc" },
    include: {
      latestSnapshot: true,
      changes: {
        orderBy: { recordedAt: "desc" },
        take: limitRecentChanges
      }
    }
  });

  const weeklyDiffs = await findWeeklyDiffs(players.map((player) => player.playerId));
  const diffMap = new Map(weeklyDiffs.map((diff) => [diff.playerId, diff]));

  return players.map((player) => ({
    playerId: player.playerId,
    teamId: player.teamId,
    name: player.name,
    active: player.active,
    latestSnapshot: player.latestSnapshot
      ? {
          snapshotId: player.latestSnapshot.id,
          fetchedAt: player.latestSnapshot.fetchedAt,
          data: player.latestSnapshot.data
        }
      : undefined,
    recentChanges: player.changes.map(mapChange),
    weeklyDiff: diffMap.get(player.playerId)?.changes
  }));
}

export async function findPlayerWithHistory(playerId: number): Promise<PlayerWithHistory | null> {
  const player = await prisma.player.findFirst({
    where: { playerId },
    include: {
      latestSnapshot: true,
      changes: {
        orderBy: { recordedAt: "desc" }
      }
    }
  });

  if (!player) {
    return null;
  }

  const weeklyDiff = await findWeeklyDiffs([player.playerId]);
  const diff = weeklyDiff.find((item) => item.playerId === player.playerId);

  return {
    playerId: player.playerId,
    teamId: player.teamId,
    name: player.name,
    active: player.active,
    latestSnapshot: player.latestSnapshot
      ? {
          snapshotId: player.latestSnapshot.id,
          fetchedAt: player.latestSnapshot.fetchedAt,
          data: player.latestSnapshot.data
        }
      : undefined,
    changes: player.changes.map(mapChange),
    weeklyDiff: diff?.changes
  };
}
