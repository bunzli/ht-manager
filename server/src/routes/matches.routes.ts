import { Router } from "express";
import { listMatches, findMatch } from "../services/match.service";
import { env } from "../config/env";

export const matchesRouter = Router();

matchesRouter.get("/", async (_req, res, next) => {
  try {
    const teamId = Number.parseInt(env.CHPP_TEAM_ID, 10);
    const limit = _req.query.limit ? Number(_req.query.limit) : undefined;
    console.log(`[matches] GET /api/matches${limit ? `?limit=${limit}` : ""}`);
    const matches = await listMatches(teamId, limit);
    console.log(`[matches] Responding with ${matches.length} matches`);
    res.json({ matches });
  } catch (error) {
    console.error("[matches] Failed to list matches", error);
    next(error);
  }
});

matchesRouter.get("/:matchId", async (req, res, next) => {
  try {
    const matchId = Number(req.params.matchId);
    if (Number.isNaN(matchId)) {
      res.status(400).json({ error: "Invalid matchId" });
      return;
    }

    console.log(`[matches] GET /api/matches/${matchId}`);
    const match = await findMatch(matchId);
    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    res.json({ match });
  } catch (error) {
    console.error("[matches] Failed to fetch match", error);
    next(error);
  }
});
