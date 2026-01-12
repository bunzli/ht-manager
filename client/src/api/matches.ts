import { api } from "./http";

export type Match = {
  id: number;
  matchId: number;
  teamId: number;
  matchDate: string;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamShortName: string | null;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamShortName: string | null;
  homeGoals: number;
  awayGoals: number;
  status: "FINISHED" | "ONGOING" | "UPCOMING";
  matchType: string;
  matchContextId: number;
  cupLevel: number | null;
  cupLevelIndex: number | null;
  sourceSystem: string | null;
  ordersGiven: boolean | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMatches(limit?: number): Promise<Match[]> {
  const params = limit ? { limit: String(limit) } : {};
  const response = await api.get<{ matches: Match[] }>("/matches", { params });
  return response.data.matches;
}

export async function fetchMatch(matchId: number): Promise<Match> {
  const response = await api.get<{ match: Match }>(`/matches/${matchId}`);
  return response.data.match;
}

export async function fetchLastMatch(): Promise<Match | null> {
  const matches = await fetchMatches(1);
  return matches.length > 0 ? matches[0] : null;
}

export async function fetchThisWeekOfficialMatchIds(): Promise<number[]> {
  const response = await api.get<{ matchIds: number[] }>("/matches/this-week-ids");
  return response.data.matchIds;
}
