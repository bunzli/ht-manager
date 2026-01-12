import { prisma } from "../db/client";

export type TableData = {
  tableName: string;
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
};

export async function getTableData(tableName: string, limit = 1000): Promise<TableData> {
  switch (tableName) {
    case "Player":
      return await getPlayerData(limit);
    case "PlayerSnapshot":
      return await getPlayerSnapshotData(limit);
    case "PlayerChange":
      return await getPlayerChangeData(limit);
    case "SyncRun":
      return await getSyncRunData(limit);
    case "Match":
      return await getMatchData(limit);
    default:
      throw new Error(`Unknown table: ${tableName}`);
  }
}

export async function getTableNames(): Promise<string[]> {
  return ["Player", "PlayerSnapshot", "PlayerChange", "SyncRun", "Match"];
}

async function getPlayerData(limit: number): Promise<TableData> {
  const players = await prisma.player.findMany({
    take: limit,
    orderBy: { id: "desc" }
  });

  return {
    tableName: "Player",
    columns: ["id", "playerId", "teamId", "name", "active", "createdAt", "updatedAt", "latestSnapshotId"],
    rows: players.map((p) => ({
      id: p.id,
      playerId: p.playerId,
      teamId: p.teamId,
      name: p.name,
      active: p.active,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      latestSnapshotId: p.latestSnapshotId
    })),
    rowCount: players.length
  };
}

async function getPlayerSnapshotData(limit: number): Promise<TableData> {
  const snapshots = await prisma.playerSnapshot.findMany({
    take: limit,
    orderBy: { id: "desc" }
  });

  return {
    tableName: "PlayerSnapshot",
    columns: ["id", "playerId", "fetchedAt", "data", "hash"],
    rows: snapshots.map((s) => ({
      id: s.id,
      playerId: s.playerId,
      fetchedAt: s.fetchedAt.toISOString(),
      data: JSON.stringify(s.data, null, 2),
      hash: s.hash
    })),
    rowCount: snapshots.length
  };
}

async function getPlayerChangeData(limit: number): Promise<TableData> {
  const changes = await prisma.playerChange.findMany({
    take: limit,
    orderBy: { id: "desc" }
  });

  return {
    tableName: "PlayerChange",
    columns: ["id", "playerId", "snapshotId", "fieldName", "oldValue", "newValue", "recordedAt"],
    rows: changes.map((c) => ({
      id: c.id,
      playerId: c.playerId,
      snapshotId: c.snapshotId,
      fieldName: c.fieldName,
      oldValue: c.oldValue,
      newValue: c.newValue,
      recordedAt: c.recordedAt.toISOString()
    })),
    rowCount: changes.length
  };
}

async function getSyncRunData(limit: number): Promise<TableData> {
  const runs = await prisma.syncRun.findMany({
    take: limit,
    orderBy: { id: "desc" }
  });

  return {
    tableName: "SyncRun",
    columns: ["id", "requestedAt", "completedAt", "status", "message", "changesCount"],
    rows: runs.map((r) => ({
      id: r.id,
      requestedAt: r.requestedAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      status: r.status,
      message: r.message,
      changesCount: r.changesCount
    })),
    rowCount: runs.length
  };
}

async function getMatchData(limit: number): Promise<TableData> {
  const matches = await prisma.match.findMany({
    take: limit,
    orderBy: { id: "desc" }
  });

  return {
    tableName: "Match",
    columns: [
      "id",
      "matchId",
      "teamId",
      "matchDate",
      "homeTeamId",
      "homeTeamName",
      "homeTeamShortName",
      "awayTeamId",
      "awayTeamName",
      "awayTeamShortName",
      "homeGoals",
      "awayGoals",
      "status",
      "matchType",
      "matchContextId",
      "cupLevel",
      "cupLevelIndex",
      "sourceSystem",
      "ordersGiven",
      "createdAt",
      "updatedAt"
    ],
    rows: matches.map((m) => ({
      id: m.id,
      matchId: m.matchId,
      teamId: m.teamId,
      matchDate: m.matchDate.toISOString(),
      homeTeamId: m.homeTeamId,
      homeTeamName: m.homeTeamName,
      homeTeamShortName: m.homeTeamShortName,
      awayTeamId: m.awayTeamId,
      awayTeamName: m.awayTeamName,
      awayTeamShortName: m.awayTeamShortName,
      homeGoals: m.homeGoals,
      awayGoals: m.awayGoals,
      status: m.status,
      matchType: m.matchType,
      matchContextId: m.matchContextId,
      cupLevel: m.cupLevel,
      cupLevelIndex: m.cupLevelIndex,
      sourceSystem: m.sourceSystem,
      ordersGiven: m.ordersGiven,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString()
    })),
    rowCount: matches.length
  };
}
