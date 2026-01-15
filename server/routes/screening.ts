import { RequestHandler } from "express";
import { ScreeningPayload, ScreeningResult } from "../../shared/api";
import { mockSeed } from "../../shared/mock-data";
import { generateAnonymousId } from "../utils/ids";

const anonMap = new Map<string, string>(); // key: institutionCode:studentId -> anonId

function phq9Severity(total: number): ScreeningResult["phq9Severity"] {
  if (total <= 4) return "none";
  if (total <= 9) return "mild";
  if (total <= 14) return "moderate";
  if (total <= 19) return "moderately_severe";
  return "severe";
}

function gad7Severity(total: number): ScreeningResult["gad7Severity"] {
  if (total <= 4) return "none";
  if (total <= 9) return "mild";
  if (total <= 14) return "moderate";
  return "severe";
}

export const assignAnonymousId: RequestHandler = (req, res) => {
  const { institutionCode, studentId } = req.body as {
    institutionCode: string;
    studentId: string;
  };
  if (!institutionCode || !studentId) {
    return res
      .status(400)
      .json({ error: "institutionCode and studentId are required" });
  }
  const key = `${institutionCode}:${studentId}`;
  let anon = anonMap.get(key);
  if (!anon) {
    anon = generateAnonymousId(institutionCode);
    anonMap.set(key, anon);
  }
  res.json({ anonymousId: anon });
};

export const submitScreening: RequestHandler = async (req, res) => {
  const payload = req.body as ScreeningPayload;
  if (
    !payload ||
    !payload.institutionCode ||
    !Array.isArray(payload.phq9) ||
    !Array.isArray(payload.gad7)
  ) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  if (payload.phq9.length !== 9 || payload.gad7.length !== 7) {
    return res
      .status(400)
      .json({ error: "PHQ-9 must have 9 items, GAD-7 must have 7 items" });
  }

  let anonId = payload.studentAnonymousId;
  if (!anonId && payload.studentId) {
    const key = `${payload.institutionCode}:${payload.studentId}`;
    anonId = anonMap.get(key) ?? generateAnonymousId(payload.institutionCode);
    anonMap.set(key, anonId);
  }
  if (!anonId) {
    return res
      .status(400)
      .json({ error: "Provide studentAnonymousId or studentId" });
  }

  const phq9Total = payload.phq9.reduce((a, b) => a + (Number(b) || 0), 0);
  const gad7Total = payload.gad7.reduce((a, b) => a + (Number(b) || 0), 0);

  // pick first counsellor of institution (prototype routing)
  const counsellor = mockSeed.accounts.find(
    (a) =>
      a.role === "counsellor" && a.institutionCode === payload.institutionCode,
  ) as any | undefined;

  const result: ScreeningResult = {
    phq9Total,
    phq9Severity: phq9Severity(phq9Total),
    gad7Total,
    gad7Severity: gad7Severity(gad7Total),
    studentAnonymousId: anonId,
    counsellorAssignedId: counsellor?.counsellorId ?? null,
  };

  try {
    const { getDb } = await import("../db/mongo");
    const db = await getDb();
    const doc = {
      institutionCode: payload.institutionCode,
      studentAnonymousId: anonId,
      phq9: payload.phq9,
      gad7: payload.gad7,
      ...result,
      createdAt: new Date(),
    };
    await db.collection("screenings").insertOne(doc);
  } catch (e) {
    // Non-fatal in prototype
    console.error("Failed to persist screening:", e);
  }

  return res.json(result);
};
export const checkScreeningStatus: RequestHandler = async (req, res) => {
  const { institutionCode, studentId } = req.query as {
    institutionCode: string;
    studentId: string;
  };

  if (!institutionCode || !studentId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const { getDb } = await import("../db/mongo");
    const db = await getDb();

    // Find latest screening for this student (using anonMap to resolve ID if possible, or just query by something else?)
    // Actually, we store studentAnonymousId in the screening, but we might not know it yet if they just logged in.
    // We need to resolve studentId -> anonId first, OR store studentId in screening (which breaks anonymity potentially, but we need a link).
    // WAIT: The screening collection currently ONLY stores `studentAnonymousId`. 
    // To check status by `studentId`, we need to look up the `anonMap` in memory or DB.
    // The current `anonMap` is in-memory (Map<string, string>). If server restarts, this link is lost!
    // For specific requirement "weekly basis", we should robustly persist this link or just trust the client session if possible?
    // No, client session is cleared on logout.
    // We should probably rely on the in-memory map for the prototype, or (better) check if we can reconstruct it.

    const key = `${institutionCode}:${studentId}`;
    const knownAnonId = anonMap.get(key);

    if (!knownAnonId) {
      // If we don't know their anonId, they probably haven't screened or server restarted. 
      // Treat as "needs screening".
      return res.json({ needsScreening: true });
    }

    // Check DB for recent screening
    const lastScreening = await db.collection("screenings").findOne(
      { studentAnonymousId: knownAnonId },
      { sort: { createdAt: -1 } }
    );

    if (!lastScreening) {
      return res.json({ needsScreening: true });
    }

    const diff = Date.now() - new Date(lastScreening.createdAt).getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 7) {
      return res.json({
        needsScreening: false,
        studentAnonymousId: knownAnonId,
        daysRemaining: Math.ceil(7 - days)
      });
    }

    return res.json({ needsScreening: true, lastScreeningDate: lastScreening.createdAt });

  } catch (e) {
    console.error("Check status failed", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
