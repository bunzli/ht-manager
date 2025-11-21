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
    // Express 5.x doesn't support app.get("*"), so we use app.use() instead
    app.use((req: Request, res: Response, next: NextFunction) => {
      // Skip API routes and already handled static files
      if (req.path.startsWith("/api")) {
        return next();
      }
      // Serve index.html for SPA routing
      res.sendFile(path.join(clientDistPath, "index.html"));
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  });

  return app;
}
