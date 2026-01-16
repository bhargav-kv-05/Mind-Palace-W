import type { RequestHandler } from "express";
import type { CounsellorOverview } from "../../shared/api";
import { mockSeed } from "../../shared/mock-data";
import { getDb } from "../db/mongo";

export const getCounsellorOverview: RequestHandler = async (req, res) => {
  const { institutionCode, counsellorId } = req.query as {
    institutionCode?: string;
    counsellorId?: string;
  };

  try {
    const db = await getDb();
    const matchInstitution = institutionCode ? { institutionCode } : {};
    const matchAlerts = {
      ...matchInstitution,
      status: { $ne: "resolved" },
    };

    const [
      screeningsBySeverity,
      recentScreeningsDocs,
      alertsBySeverity,
      recentAlertsDocs,
      postsNeedingResponse,
      resourcesShared,
      volunteersDocs
    ] = await Promise.all([
      db
        .collection("screenings")
        .aggregate([
          { $match: matchInstitution },
          { $group: { _id: "$phq9Severity", count: { $sum: 1 } } },
        ])
        .toArray(),
      db
        .collection("screenings")
        .find(matchInstitution)
        .sort({ createdAt: -1 })
        .limit(6)
        .project({
          _id: 0,
          studentAnonymousId: 1,
          phq9Severity: 1,
          gad7Severity: 1,
          phq9Total: 1,
          gad7Total: 1,
          createdAt: 1,
        })
        .toArray(),
      db
        .collection("alerts")
        .aggregate([
          { $match: matchAlerts },
          { $group: { _id: "$severity", count: { $sum: 1 } } },
        ])
        .toArray(),
      db
        .collection("alerts")
        .find(matchAlerts)
        .sort({ createdAt: -1 })
        .limit(6)
        .project({ severity: 1, matches: 1, createdAt: 1, text: 1, keyword: 1, studentAnonymousId: 1 })
        .toArray(),
      db.collection("posts").countDocuments({
        ...matchInstitution,
        tone: { $ne: "positive" },
      }),
      db.collection("library").countDocuments(matchInstitution),
      db.collection("volunteers").find(matchInstitution).toArray()
    ]);

    const recentScreenings = recentScreeningsDocs.map((doc) => ({
      studentAnonymousId: doc.studentAnonymousId ?? "unknown",
      submittedAt: (doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt ?? Date.now())
      ).toISOString(),
      phq9Severity: doc.phq9Severity ?? "none",
      gad7Severity: doc.gad7Severity ?? "none",
      phq9Total: typeof doc.phq9Total === "number" ? doc.phq9Total : 0,
      gad7Total: typeof doc.gad7Total === "number" ? doc.gad7Total : 0,
    }));

    const recentAlerts = recentAlertsDocs.map((doc) => {
      const severity: "low" | "moderate" | "severe" =
        doc.severity === "severe"
          ? "severe"
          : doc.severity === "moderate"
            ? "moderate"
            : "low";
      return {
        id: doc._id
          ? String(doc._id)
          : `${doc.severity}-${doc.createdAt?.valueOf?.() ?? Date.now()}`,
        severity,
        primaryTag: doc.keyword ?? null,
        createdAt: (doc.createdAt instanceof Date
          ? doc.createdAt
          : new Date(doc.createdAt ?? Date.now())
        ).toISOString(),
        text: doc.text ?? "Content not available",
        studentAnonymousId: doc.studentAnonymousId ?? "unknown",
      };
    });

    const volunteerMembers = volunteersDocs.map((v: any) => ({
      id: v.studentId,
      displayName: v.studentId, // For now, use ID as display name
      nominatedBy: v.nominatedBy
    }));

    const overview: CounsellorOverview = {
      screenings: {
        bySeverity: screeningsBySeverity as any,
        recent: recentScreenings,
      },
      alerts: {
        bySeverity: alertsBySeverity as any,
        recent: recentAlerts,
      },
      volunteers: {
        total: volunteersDocs.length,
        active: volunteersDocs.length,
        nominated: volunteersDocs.length, // Simplified for now
        members: volunteerMembers,
      },
      community: {
        postsNeedingResponse,
        resourcesShared,
      },
    };

    res.json(overview);
  } catch (error) {
    const fallback: CounsellorOverview = {
      screenings: { bySeverity: [], recent: [] },
      alerts: { bySeverity: [], recent: [] },
      volunteers: {
        total: 0,
        active: 0,
        nominated: 0,
        members: []
      },
      community: {
        postsNeedingResponse: 0,
        resourcesShared: 0,
      },
      note: "DB unavailable; returning limited counsellor overview",
    };
    res.json(fallback);
  }
};

export const nominateVolunteer: RequestHandler = async (req, res) => {
  const { institutionCode, studentId, counsellorId } = req.body;
  if (!institutionCode || !studentId) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  try {
    const db = await getDb();
    // Check if already nominated
    const existing = await db.collection("volunteers").findOne({
      institutionCode,
      studentId
    });

    if (existing) {
      res.status(400).json({ error: "Student is already a volunteer" });
      return;
    }

    await db.collection("volunteers").insertOne({
      institutionCode,
      studentId,
      nominatedBy: counsellorId,
      createdAt: new Date(),
      role: "volunteer"
    });

    res.json({ success: true, message: "Volunteer nominated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Nominating volunteer failed" });
  }
};

export const getVolunteers: RequestHandler = async (req, res) => {
  const { institutionCode } = req.query as { institutionCode?: string };
  if (!institutionCode) {
    res.status(400).json({ error: "Institution code required" });
    return;
  }
  try {
    const db = await getDb();
    const volunteers = await db.collection("volunteers").find({ institutionCode }).toArray();
    res.json(volunteers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch volunteers" });
  }
};
