import { createHash } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db/client";
import { fetchChppPlayers } from "../chpp/client";
import { syncMatches } from "./match.service";
import { env } from "../config/env";

function toRecord(value: Prisma.JsonValue | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function hashJson(value: unknown): string {
  const json = JSON.stringify(value);
  return createHash("sha1").update(json).digest("hex");
}

function serialize(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

type ChangeDiff = {
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
};

function diffRecords(oldData: Record<string, unknown>, newData: Record<string, unknown>): ChangeDiff[] {
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  const changes: ChangeDiff[] = [];

  for (const key of keys) {
    const oldValue = oldData[key];
    const newValue = newData[key];

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    changes.push({
      fieldName: key,
      oldValue: serialize(oldValue),
      newValue: serialize(newValue)
    });
  }

  return changes;
}

export type SyncSummary = {
  syncRunId: number;
  totalPlayers: number;
  playersCreated: number;
  playersUpdated: number;
  totalChanges: number;
};

export async function runPlayerSync(): Promise<SyncSummary> {
  const teamId = Number.parseInt(env.CHPP_TEAM_ID, 10);
  const syncRun = await prisma.syncRun.create({
    data: {
      status: "PENDING"
    }
  });

  try {
    console.log(`[sync] Starting run ${syncRun.id} for team ${teamId}`);
    const chppPlayers = await fetchChppPlayers();
    console.log(`[sync] Retrieved ${chppPlayers.length} players from CHPP`);

    let playersCreated = 0;
    let playersUpdated = 0;
    let totalChanges = 0;
    const syncedPlayerIds: number[] = [];

    for (const chppPlayer of chppPlayers) {
      syncedPlayerIds.push(chppPlayer.playerId);
      // eslint-disable-next-line no-await-in-loop
      const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.player.findUnique({
          where: {
            playerId_teamId: {
              playerId: chppPlayer.playerId,
              teamId: chppPlayer.teamId
            }
          },
          include: {
            latestSnapshot: true
          }
        });

        const player = existing
          ? await tx.player.update({
              where: { id: existing.id },
              data: {
                name: chppPlayer.name,
                active: true
              }
            })
          : await tx.player.create({
              data: {
                playerId: chppPlayer.playerId,
                teamId: chppPlayer.teamId,
                name: chppPlayer.name,
                active: true
              }
            });

        const previousSnapshot = existing?.latestSnapshot ?? null;
        const previousData = toRecord(previousSnapshot?.data);
        const newData = chppPlayer.raw;
        const newHash = hashJson(newData);

        if (previousSnapshot && previousSnapshot.hash === newHash) {
          return {
            createdPlayer: !existing,
            updatedPlayer: false,
            changes: 0
          };
        }

        const snapshot = await tx.playerSnapshot.create({
          data: {
            playerId: player.id,
            data: newData as Prisma.InputJsonValue,
            hash: newHash
          }
        });

        await tx.player.update({
          where: { id: player.id },
          data: {
            latestSnapshotId: snapshot.id
          }
        });

        const diffs = existing ? diffRecords(previousData, newData) : [];

        if (diffs.length > 0) {
          await tx.playerChange.createMany({
            data: diffs.map((diff) => ({
              playerId: player.id,
              snapshotId: snapshot.id,
              fieldName: diff.fieldName,
              oldValue: diff.oldValue,
              newValue: diff.newValue
            }))
          });
        }

        return {
          createdPlayer: !existing,
          updatedPlayer: !!existing && diffs.length > 0,
          changes: diffs.length
        };
      });

      if (result.createdPlayer) {
        playersCreated += 1;
      }
      if (result.updatedPlayer) {
        playersUpdated += 1;
      }
      totalChanges += result.changes;
    }

    if (teamId && syncedPlayerIds.length > 0) {
      await prisma.player.updateMany({
        where: {
          teamId,
          playerId: {
            notIn: syncedPlayerIds
          },
          active: true
        },
        data: {
          active: false
        }
      });
    }

    // Sync matches
    console.log(`[sync] Syncing matches...`);
    const matchSyncResult = await syncMatches();
    console.log(`[sync] Matches sync: ${matchSyncResult.matchesAdded} added, ${matchSyncResult.totalMatches} total`);

    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "SUCCESS",
        completedAt: new Date(),
        changesCount: totalChanges
      }
    });
    console.log(
      `[sync] Run ${syncRun.id} success: ${playersCreated} created, ${playersUpdated} updated, ${totalChanges} changes, ${matchSyncResult.matchesAdded} matches added`
    );

    return {
      syncRunId: syncRun.id,
      totalPlayers: chppPlayers.length,
      playersCreated,
      playersUpdated,
      totalChanges
    };
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: syncRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        message: error instanceof Error ? error.message : "Unknown error"
      }
    });

    console.error(`[sync] Run ${syncRun.id} failed`, error);
    throw error;
  }
}
