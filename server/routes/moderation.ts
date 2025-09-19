import { RequestHandler } from "express";
import { analyzeText, escalation } from "../../shared/sensitive";
import { mockSeed } from "../../shared/mock-data";

export const checkModeration: RequestHandler = (req, res) => {
  const { text, institutionCode } = req.body as { text: string; institutionCode?: string };
  if (!text) return res.status(400).json({ error: "text is required" });

  const result = analyzeText(text);
  const severity = result.score >= escalation.severeThreshold ? "severe" : result.score >= escalation.moderateThreshold ? "moderate" : "low";

  // Prototype routing to a counsellor for institution
  const counsellor = institutionCode
    ? mockSeed.accounts.find((a) => a.role === "counsellor" && a.institutionCode === institutionCode)
    : undefined;

  // In production: push Socket.io event to counsellor/volunteer; here persist alert
  if (severity !== "low") {
    (async () => {
      try {
        const { getDb } = await import("../db/mongo");
        const db = await getDb();
        await db.collection("alerts").insertOne({
          institutionCode: institutionCode ?? null,
          matches: result.matches,
          severity,
          notifyCounsellorId: counsellor ? (counsellor as any).counsellorId : null,
          createdAt: new Date(),
        });
      } catch (e) {
        console.error("Failed to persist alert:", e);
      }
    })();
  }

  res.json({ severity, matches: result.matches, notifyCounsellorId: counsellor ? (counsellor as any).counsellorId : null });
};
