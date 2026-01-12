import { Router } from "express";
import { playersRouter } from "./players.routes";
import { syncRouter } from "./sync.routes";
import { matchesRouter } from "./matches.routes";
import { dbBrowserRouter } from "./db-browser.routes";

export const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.use("/players", playersRouter);
router.use("/sync", syncRouter);
router.use("/matches", matchesRouter);
router.use("/db-browser", dbBrowserRouter);
