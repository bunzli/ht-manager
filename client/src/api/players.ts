import { api } from "./http";

export type PlayerChange = {
  changeId: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  recordedAt: string;
  snapshotId: number;
};

export type PlayerWeeklyDiff = Record<
  string,
  {
    current: number | null;
    previous: number | null;
    delta: number | null;
  }
>;

export type PlayerSnapshot = {
  snapshotId: number;
  fetchedAt: string;
  data: Record<string, unknown>;
};

export type PlayerSummary = {
  playerId: number;
  teamId: number;
  name: string;
  active: boolean;
  latestSnapshot?: PlayerSnapshot;
  weeklyDiff?: PlayerWeeklyDiff;
};

export type Player = PlayerSummary & {
  recentChanges: PlayerChange[];
};

export type PlayerDetails = PlayerSummary & {
  changes: PlayerChange[];
};

export type SyncSummary = {
  syncRunId: number;
  totalPlayers: number;
  playersCreated: number;
  playersUpdated: number;
  totalChanges: number;
};

export async function fetchPlayers(): Promise<Player[]> {
  const response = await api.get<{ players: Player[] }>("/players");
  return response.data.players;
}

export async function fetchPlayer(playerId: number): Promise<PlayerDetails> {
  const response = await api.get<{ player: PlayerDetails }>(`/players/${playerId}`);
  return response.data.player;
}

export async function syncPlayers(): Promise<SyncSummary> {
  const response = await api.post<{ summary: SyncSummary }>("/sync");
  return response.data.summary;
}
