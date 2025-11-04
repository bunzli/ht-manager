import { Router } from "express";
import { listPlayers, findPlayerWithHistory } from "../services/player.service";

export const playersRouter = Router();

playersRouter.get("/", async (_req, res, next) => {
  try {
    console.log("[players] GET /api/players");
    const players = await listPlayers();
    console.log(`[players] Responding with ${players.length} players`);
    res.json({ players });
  } catch (error) {
    console.error("[players] Failed to list players", error);
    next(error);
  }
});

playersRouter.get("/:playerId", async (req, res, next) => {
  try {
    const playerId = Number(req.params.playerId);
    if (Number.isNaN(playerId)) {
      res.status(400).json({ error: "Invalid playerId" });
      return;
    }

    console.log(`[players] GET /api/players/${playerId}`);
    const player = await findPlayerWithHistory(playerId);
    if (!player) {
      res.status(404).json({ error: "Player not found" });
      return;
    }

    res.json({ player });
  } catch (error) {
    console.error("[players] Failed to fetch player", error);
    next(error);
  }
});
