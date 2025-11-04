import { Router } from "express";
import { runPlayerSync } from "../services/sync.service";

export const syncRouter = Router();

syncRouter.post("/", async (_req, res, next) => {
  try {
    console.log("[sync] POST /api/sync requested");
    const summary = await runPlayerSync();
    console.log("[sync] Completed", summary);
    res.json({ summary });
  } catch (error) {
    console.error("[sync] Failed", error);
    next(error);
  }
});
