import { Server, Socket } from "socket.io";
import { analyzeText, escalation } from "@shared/sensitive";

export function wireSocketIO(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ roomId }: { roomId: string }) => {
      if (roomId) socket.join(roomId);
    });

    socket.on(
      "message",
      async (payload: {
        roomId: string;
        institutionCode?: string;
        authorAnonymousId?: string;
        authorRole: "student" | "counsellor" | "volunteer";
        text: string;
        consent?: "positive" | "negative" | null;
      }) => {
        try {
          const { getDb } = await import("../db/mongo");
          const db = await getDb();
          const now = new Date();
          // Persist message (ephemeral via TTL index)
          await db.collection("messages").insertOne({ ...payload, createdAt: now });

          // Consent to library
          if (payload.consent === "positive" || payload.consent === "negative") {
            await db.collection("library").insertOne({
              institutionCode: payload.institutionCode ?? null,
              authorAnonymousId: payload.authorAnonymousId ?? null,
              text: payload.text,
              tone: payload.consent,
              createdAt: now,
            });
          }

          // Sensitive-word check -> alerts
          const res = analyzeText(payload.text);
          const severity = res.score >= escalation.severeThreshold ? "severe" : res.score >= escalation.moderateThreshold ? "moderate" : "low";
          if (severity !== "low") {
            await db.collection("alerts").insertOne({
              institutionCode: payload.institutionCode ?? null,
              matches: res.matches,
              severity,
              createdAt: now,
            });
            io.to(payload.roomId).emit("alert", { severity, matches: res.matches });
          }

          io.to(payload.roomId).emit("message", { ...payload, createdAt: now });
        } catch (e) {
          console.error("socket message error", e);
        }
      },
    );
  });
}
