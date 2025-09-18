import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listInstitutions, listAccounts, getSeed } from "./routes/mock";
import { assignAnonymousId, submitScreening } from "./routes/screening";
import { checkModeration } from "./routes/moderation";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Mock dataset endpoints (prototype)
  app.get("/api/mock/institutions", listInstitutions);
  app.get("/api/mock/accounts", listAccounts);
  app.get("/api/mock/seed", getSeed);

  // Screening & identity endpoints (prototype)
  app.post("/api/assign-anon-id", assignAnonymousId);
  app.post("/api/screenings", submitScreening);
  app.post("/api/moderation/check", checkModeration);

  return app;
}
