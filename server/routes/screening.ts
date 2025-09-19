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
