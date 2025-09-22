import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listInstitutions, listAccounts, getSeed } from "./routes/mock";
import { assignAnonymousId, submitScreening } from "./routes/screening";
import { checkModeration } from "./routes/moderation";
import { createPost, listPosts } from "./routes/posts";
import { listLibrary } from "./routes/library";
import { getAnalytics } from "./routes/admin";

export function createServer() {
  const app = express();

  // Middleware
  const origin =
    process.env.CORS_ORIGIN === "*" || !process.env.CORS_ORIGIN
      ? true
      : process.env.CORS_ORIGIN;
  app.use(cors({ origin }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // DB indexes (fire-and-forget)
  (async () => {
    try {
      const { ensureDbIndexes } = await import("./db/init");
      await ensureDbIndexes();
    } catch (e) {
      console.warn("Index init skipped:", (e as Error).message);
    }
  })();

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
  app.get("/api/posts", listPosts);
  app.post("/api/posts", createPost);
  app.get("/api/library", listLibrary);
  app.get("/api/admin/analytics", getAnalytics);

  return app;
}
