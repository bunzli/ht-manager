import { prisma } from "../db/client";
import { fetchChppMatches } from "../chpp/matches";
import { env } from "../config/env";

export type MatchWithTeam = {
  id: number;
  matchId: number;
  teamId: number;
  matchDate: Date;
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
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Sync matches from CHPP API
 * Only adds new matches that don't exist yet (based on matchId)
 */
export async function syncMatches(): Promise<{ matchesAdded: number; totalMatches: number }> {
  const teamId = Number.parseInt(env.CHPP_TEAM_ID, 10);
  
  // Fetch matches up to today
  const lastMatchDate = new Date();
  
  console.log(`[match-sync] Starting sync for team ${teamId}`);
  const chppMatches = await fetchChppMatches(teamId, false, lastMatchDate);
  console.log(`[match-sync] Retrieved ${chppMatches.length} matches from CHPP`);

  let matchesAdded = 0;

  for (const chppMatch of chppMatches) {
    // Check if match already exists
    const existing = await prisma.match.findUnique({
      where: {
        matchId: chppMatch.matchId
      }
    });

    if (!existing) {
      // Only add if missing
      await prisma.match.create({
        data: {
          matchId: chppMatch.matchId,
          teamId: chppMatch.teamId,
          matchDate: chppMatch.matchDate,
          homeTeamId: chppMatch.homeTeamId,
          homeTeamName: chppMatch.homeTeamName,
          homeTeamShortName: chppMatch.homeTeamShortName ?? null,
          awayTeamId: chppMatch.awayTeamId,
          awayTeamName: chppMatch.awayTeamName,
          awayTeamShortName: chppMatch.awayTeamShortName ?? null,
          homeGoals: chppMatch.homeGoals,
          awayGoals: chppMatch.awayGoals,
          status: chppMatch.status,
          matchType: chppMatch.matchType,
          matchContextId: chppMatch.matchContextId,
          cupLevel: chppMatch.cupLevel ?? null,
          cupLevelIndex: chppMatch.cupLevelIndex ?? null,
          sourceSystem: chppMatch.sourceSystem ?? null,
          ordersGiven: chppMatch.ordersGiven ?? null
        }
      });
      matchesAdded++;
    } else {
      // Update existing match if scores or status changed
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          homeGoals: chppMatch.homeGoals,
          awayGoals: chppMatch.awayGoals,
          status: chppMatch.status,
          ordersGiven: chppMatch.ordersGiven ?? null
        }
      });
    }
  }

  console.log(`[match-sync] Added ${matchesAdded} new matches, updated ${chppMatches.length - matchesAdded} existing matches`);

  return {
    matchesAdded,
    totalMatches: chppMatches.length
  };
}

/**
 * Get the last Friday date (or today if today is Friday)
 */
function getLastFriday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
  const daysToSubtract = dayOfWeek === 5 ? 0 : dayOfWeek < 5 ? dayOfWeek + 2 : dayOfWeek - 5;
  const lastFriday = new Date(now);
  lastFriday.setDate(now.getDate() - daysToSubtract);
  lastFriday.setHours(0, 0, 0, 0);
  return lastFriday;
}

/**
 * Get match IDs for this week's official matches
 * Returns the last 2 matches played after last Friday
 */
export async function getThisWeekOfficialMatchesIds(teamId: number): Promise<number[]> {
  const lastFriday = getLastFriday();
  
  // Get finished matches after last Friday, ordered by date descending
  // Filter for official matches (LEAGUE and CUP) only
  const matches = await prisma.match.findMany({
    where: {
      teamId,
      matchDate: {
        gte: lastFriday
      },
      status: "FINISHED",
      matchType: {
        in: ["LEAGUE", "CUP"]
      }
    },
    orderBy: {
      matchDate: "desc"
    },
    take: 2 // Get last 2 matches
  });

  return matches.map((match) => match.matchId);
}

/**
 * List matches for a team
 */
export async function listMatches(teamId: number, limit?: number): Promise<MatchWithTeam[]> {
  const matches = await prisma.match.findMany({
    where: {
      teamId
    },
    orderBy: {
      matchDate: "desc"
    },
    take: limit
  });

  return matches;
}

/**
 * Get a single match by matchId
 */
export async function findMatch(matchId: number): Promise<MatchWithTeam | null> {
  const match = await prisma.match.findUnique({
    where: {
      matchId
    }
  });

  return match;
}
