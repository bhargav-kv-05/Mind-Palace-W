import { Server, Socket } from "socket.io";
import { analyzeText, escalation } from "../../shared/sensitive";

export function wireSocketIO(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on("join", ({ roomId }: { roomId: string }) => {
      // Allow joining valid rooms: "inst:...", "global:...", "peer:...", or "private:..."
      if (roomId && (roomId.startsWith("inst:") || roomId.startsWith("global:") || roomId.startsWith("private:") || roomId.startsWith("peer:"))) {
        socket.join(roomId);
      }
    });

    socket.on("request_private_session", ({ institutionCode, targetStudentId, counsellorId }: { institutionCode: string, targetStudentId: string, counsellorId: string }) => {
      // Broadcast a signal to the institution room.
      // The client-side will filter this. If 'myId' === targetStudentId, it will auto-join the private room.
      const privateRoomId = `private:${counsellorId}:${targetStudentId}`;
      io.to(`inst:${institutionCode}`).emit("private_session_invite", {
        targetStudentId,
        privateRoomId,
        counsellorId
      });
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
        tags?: string[];
      }) => {
        try {
          // SECURITY: PII Blocking (Phone Numbers & Email)
          // Matches 10-digit numbers (Indian mobile) or email patterns
          const piiRegex = /(\b\d{10}\b)|(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/;

          if (piiRegex.test(payload.text)) {
            // Block the message!
            socket.emit("alert", {
              severity: "high",
              text: "Your message was blocked because it contains a phone number or email. Sharing personal contact info is not allowed for your safety."
            });
            return; // Stop execution, do not emit to room
          }

          // 1. Optimistic UI: Send to room immediately
          io.to(payload.roomId).emit("message", { ...payload, createdAt: new Date() });

          // 2. Async Persistence (Best effort)
          try {
            const { getDb } = await import("../db/mongo");
            const { detectSensitiveContent } = await import("../services/moderation");
            const { flagged, severity, keyword } = detectSensitiveContent(payload.text);

            const db = await getDb();
            const now = new Date();

            if (flagged) {
              await db.collection("alerts").insertOne({
                institutionCode: payload.institutionCode,
                roomId: payload.roomId,
                studentAnonymousId: payload.authorAnonymousId,
                text: payload.text,
                keyword,
                severity,
                status: "open",
                createdAt: now,
              });
              io.to(payload.roomId).emit("alert", {
                severity,
                text: "This message contains sensitive content and has been flagged for moderation.",
              });
            }

            await db.collection("messages").insertOne({ ...payload, createdAt: now });

            if (payload.consent === "positive" || payload.consent === "negative") {
              await db.collection("library").insertOne({
                institutionCode: payload.institutionCode ?? null,
                authorAnonymousId: payload.authorAnonymousId ?? null,
                text: payload.text,
                tone: payload.consent,
                createdAt: now,
              });
            }
          } catch (dbError) {
            console.error("DB Write Failed (Message sent to room):", dbError);
          }
        } catch (e) {
          console.error("Critical socket error:", e);
        }
      },
    );
  });
}
