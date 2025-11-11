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

export type ChppPlayer = {
  playerId: number;
  teamId: number;
  name: string;
  raw: Record<string, unknown>;
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  textNodeName: "_text"
});

function normalizePlayerName(player: Record<string, unknown>): string {
  const firstName = (player["FirstName"] as string | undefined)?.trim() ?? "";
  const lastName = (player["LastName"] as string | undefined)?.trim() ?? "";
  const nickName = (player["NickName"] as string | undefined)?.trim() ?? "";
  const parts = [firstName, nickName, lastName].filter(Boolean);
  return parts.join(" ").trim();
}

function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export async function fetchChppPlayers(): Promise<ChppPlayer[]> {
  const params = {
    file: "players",
    version: "2.7",
    teamID: env.CHPP_TEAM_ID,
    includeMatchInfo: "true"
  };

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
  console.log("[chpp] Requesting players", `${CHPP_URL}?${queryString}`);

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
  const rootPlayerList = data?.PlayerList;
  const effectivePlayerList = team?.PlayerList ?? rootPlayerList;
  const teamId = Number(team?.TeamID ?? env.CHPP_TEAM_ID);

  const playersRaw = ensureArray<Record<string, unknown>>(effectivePlayerList?.Player);

  if (!effectivePlayerList) {
    console.warn("[chpp] Missing PlayerList in response", data ?? parsed);
  } else {
    console.log("[chpp] PlayerList stats", {
      hasTeam: Boolean(team),
      playerCount: Array.isArray(effectivePlayerList.Player)
        ? effectivePlayerList.Player.length
        : effectivePlayerList.Player
          ? 1
          : 0,
      keys: Object.keys(effectivePlayerList)
    });
  }

  if (!playersRaw.length) {
    console.warn("[chpp] No players returned", {
      teamId,
      playerRawType: typeof effectivePlayerList?.Player,
      sample: effectivePlayerList?.Player
    });
    return [];
  }

  return playersRaw.map((raw) => {
    const playerId = Number(raw["PlayerID"]);
    return {
      playerId,
      teamId: Number(raw["TeamID"] ?? teamId ?? 0),
      name: normalizePlayerName(raw),
      raw
    };
  });
}
