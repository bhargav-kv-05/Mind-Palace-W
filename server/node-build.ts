import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "./index";
import * as express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import { wireSocketIO } from "./realtime/socket";

const app = createServer();
const server = http.createServer(app as any);
const port = process.env.PORT || 3000;

// In production, serve the built SPA files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Socket.IO
const origin = process.env.CORS_ORIGIN === "*" || !process.env.CORS_ORIGIN ? true : process.env.CORS_ORIGIN;
const io = new IOServer(server, { cors: { origin } });
wireSocketIO(io);

// Handle React Router - serve index.html for all non-API routes (Express v5 compatible)
app.get(/^(?!\/(api|health)\/).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

server.listen(port, () => {
  console.log(`🚀 MindPalace server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
