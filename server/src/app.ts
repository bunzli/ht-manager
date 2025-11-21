import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "path";
import { router } from "./routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api", router);

  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    const clientDistPath = path.resolve(__dirname, "../../client/dist");
    app.use(express.static(clientDistPath));
    
    // Serve index.html for all non-API routes (SPA routing)
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  return app;
}
