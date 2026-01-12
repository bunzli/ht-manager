import OAuth from "oauth-1.0a";
import axios from "axios";
import { createHmac } from "crypto";
import { XMLParser } from "fast-xml-parser";
import { env } from "../config/env";

const CHPP_URL = "https://chpp.hattrick.org/chppxml.ashx";

const oauth = new OAuth({
  consumer: {
    key: env.CHPP_CONSUMER_KEY,
    secret: env.CHPP_CONSUMER_SECRET
  },
  signature_method: "HMAC-SHA1",
  hash_function(baseString: string, key: string) {
    return createHmac("sha1", key).update(baseString).digest("base64");
  }
});

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "_text"
});

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function parseMatchStatus(status: string): "FINISHED" | "ONGOING" | "UPCOMING" {
  const upper = status.toUpperCase();
  if (upper === "FINISHED") return "FINISHED";
  if (upper === "ONGOING") return "ONGOING";
  return "UPCOMING";
}

function parseMatchType(matchTypeId: number): "LEAGUE" | "CUP" | "FRIENDLY" | "QUALIFICATION" | "SINGLE" | "PREPARATION" | "HATTRICK_MASTERS" | "WORLD_CUP" | "U20_WORLD_CUP" | "LADDER" | "TOURNAMENT" {
  // MatchType mapping based on Hattrick documentation
  // 1 = League, 2 = Qualification, 3 = Cup, 4 = Friendly, 5 = Hattrick Masters, 6 = World Cup, 7 = U-20 World Cup, 8 = Ladder, 9 = Tournament, 10 = Single Match, 11 = Preparation Match
  switch (matchTypeId) {
    case 1: return "LEAGUE";
    case 2: return "QUALIFICATION";
    case 3: return "CUP";
    case 4: return "FRIENDLY";
    case 5: return "HATTRICK_MASTERS";
    case 6: return "WORLD_CUP";
    case 7: return "U20_WORLD_CUP";
    case 8: return "LADDER";
    case 9: return "TOURNAMENT";
    case 10: return "SINGLE";
    case 11: return "PREPARATION";
    default: return "FRIENDLY"; // Default fallback
  }
}

export type ChppMatch = {
  matchId: number;
  teamId: number;
  matchDate: Date;
  homeTeamId: number;
  homeTeamName: string;
  homeTeamShortName?: string;
  awayTeamId: number;
  awayTeamName: string;
  awayTeamShortName?: string;
  homeGoals: number;
  awayGoals: number;
  status: "FINISHED" | "ONGOING" | "UPCOMING";
  matchType: "LEAGUE" | "CUP" | "FRIENDLY" | "QUALIFICATION" | "SINGLE" | "PREPARATION" | "HATTRICK_MASTERS" | "WORLD_CUP" | "U20_WORLD_CUP" | "LADDER" | "TOURNAMENT";
  matchContextId: number;
  cupLevel?: number;
  cupLevelIndex?: number;
  sourceSystem?: string;
  ordersGiven?: boolean;
};

export async function fetchChppMatches(teamId?: number, isYouth = false, lastMatchDate?: Date): Promise<ChppMatch[]> {
  const params: Record<string, string | number> = {
    file: "matches",
    version: "2.9",
    isYouth: isYouth ? "true" : "false"
  };

  if (teamId) {
    params.teamID = teamId;
  }

  if (lastMatchDate) {
    params.LastMatchDate = lastMatchDate.toISOString();
  }

  const token = {
    key: env.CHPP_ACCESS_TOKEN,
    secret: env.CHPP_ACCESS_TOKEN_SECRET
  };

  const requestData = {
    url: CHPP_URL,
    method: "GET",
    data: params
  };

  const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

  const queryString = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)])
  ).toString();
  console.log("[chpp] Requesting matches", `${CHPP_URL}?${queryString}`);

  const response = await axios
    .get<string>(CHPP_URL, {
      params,
      headers: {
        ...authHeader
      },
      responseType: "text",
      timeout: 10_000
    })
    .catch((error) => {
      console.error("[chpp] Request failed", error);
      throw error;
    });

  console.log("[chpp] Raw XML snippet", response.data.slice(0, 200));
  const parsed = xmlParser.parse(response.data);
  console.log("[chpp] Response parsed");
  const data = parsed?.HattrickData;
  const team = data?.Team;
  // MatchList is inside Team, not directly in HattrickData
  const matchList = team?.MatchList ?? data?.MatchList;
  const effectiveTeamId = Number(team?.TeamID ?? teamId ?? env.CHPP_TEAM_ID);

  const matchesRaw = ensureArray<Record<string, unknown>>(matchList?.Match);

  if (!matchList) {
    console.warn("[chpp] Missing MatchList in response", {
      hasData: Boolean(data),
      hasTeam: Boolean(team),
      dataKeys: data ? Object.keys(data) : [],
      teamKeys: team ? Object.keys(team) : []
    });
  } else {
    console.log("[chpp] MatchList stats", {
      hasTeam: Boolean(team),
      matchCount: matchesRaw.length,
      matchListType: typeof matchList?.Match,
      isArray: Array.isArray(matchList?.Match)
    });
  }

  if (!matchesRaw.length) {
    console.warn("[chpp] No matches returned", {
      teamId: effectiveTeamId,
      matchRawType: typeof matchList?.Match
    });
    return [];
  }

  return matchesRaw.map((raw) => {
    const matchId = Number(raw["MatchID"]);
    const homeTeam = raw["HomeTeam"] as Record<string, unknown> | undefined;
    const awayTeam = raw["AwayTeam"] as Record<string, unknown> | undefined;
    const matchDateStr = raw["MatchDate"] as string;
    const matchDate = new Date(matchDateStr);

    return {
      matchId,
      teamId: effectiveTeamId,
      matchDate,
      homeTeamId: Number(homeTeam?.["HomeTeamID"] ?? 0),
      homeTeamName: String(homeTeam?.["HomeTeamName"] ?? ""),
      homeTeamShortName: homeTeam?.["HomeTeamShortName"] as string | undefined,
      awayTeamId: Number(awayTeam?.["AwayTeamID"] ?? 0),
      awayTeamName: String(awayTeam?.["AwayTeamName"] ?? ""),
      awayTeamShortName: awayTeam?.["AwayTeamShortName"] as string | undefined,
      homeGoals: Number(raw["HomeGoals"] ?? 0),
      awayGoals: Number(raw["AwayGoals"] ?? 0),
      status: parseMatchStatus(String(raw["Status"] ?? "UPCOMING")),
      matchType: parseMatchType(Number(raw["MatchType"] ?? 4)),
      matchContextId: Number(raw["MatchContextId"] ?? 0),
      cupLevel: raw["CupLevel"] ? Number(raw["CupLevel"]) : undefined,
      cupLevelIndex: raw["CupLevelIndex"] ? Number(raw["CupLevelIndex"]) : undefined,
      sourceSystem: raw["SourceSystem"] ? String(raw["SourceSystem"]) : undefined,
      ordersGiven: raw["OrdersGiven"] !== undefined ? Boolean(raw["OrdersGiven"]) : undefined
    };
  });
}
