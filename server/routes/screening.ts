import { RequestHandler } from "express";
import { ScreeningPayload, ScreeningResult } from "../../shared/api";
import { mockSeed } from "../../shared/mock-data";
import { generateAnonymousId } from "../utils/ids";
import * as crypto from "crypto";

function hashStudentId(institutionCode: string, studentId: string): string {
  return crypto
    .createHash("sha256")
    .update(`${institutionCode}:${studentId}`)
    .digest("hex");
}

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

  // Always generate a fresh Anonymous ID for privacy/rotation
  const anon = generateAnonymousId(institutionCode);
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

  // Ensure we have an Anonymous ID (client provided or generate new)
  let anonId = payload.studentAnonymousId;
  if (!anonId) {
    // Fallback if client didn't assist
    anonId = generateAnonymousId(payload.institutionCode);
  }

  // Calculate Hash for persistence
  let studentIdHash: string | null = null;
  if (payload.studentId) {
    studentIdHash = hashStudentId(payload.institutionCode, payload.studentId);
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
      studentIdHash, // Store hash to link future logins without revealing ID
      phq9: payload.phq9,
      gad7: payload.gad7,
      ...result,
      createdAt: new Date(),
    };
    await db.collection("screenings").insertOne(doc);
  } catch (e) {
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

    // 1. Calculate Hash of the current user
    const currentHash = hashStudentId(institutionCode, studentId);

    // 2. Find latest screening by this HASH
    const lastScreening = await db.collection("screenings").findOne(
      { studentIdHash: currentHash },
      { sort: { createdAt: -1 } }
    );

    if (!lastScreening) {
      return res.json({ needsScreening: true });
    }

    const diff = Date.now() - new Date(lastScreening.createdAt).getTime();
    const days = diff / (1000 * 60 * 60 * 24);

    if (days < 7) {
      // User has valid screening.
      // Generate a FRESH anonymous ID here so they can enter chat immediately
      // This satisfies privacy (new ID) and functionality (session needs and ID)
      const newAnonId = generateAnonymousId(institutionCode);

      return res.json({
        needsScreening: false,
        studentAnonymousId: newAnonId,
        daysRemaining: Math.ceil(7 - days)
      });
    }

    return res.json({ needsScreening: true, lastScreeningDate: lastScreening.createdAt });

  } catch (e) {
    console.error("Check status failed", e);
    return res.status(500).json({ error: "Internal error" });
  }
};
