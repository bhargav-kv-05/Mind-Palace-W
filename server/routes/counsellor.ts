import type { RequestHandler } from "express";

import type { RequestHandler } from "express";
import type { CounsellorOverview } from "../../shared/api";
import { mockSeed } from "../../shared/mock-data";
import { getDb } from "../db/mongo";

export const getCounsellorOverview: RequestHandler = async (req, res) => {
  const { institutionCode, counsellorId } = req.query as {
    institutionCode?: string;
    counsellorId?: string;
  };

  const volunteerPool = mockSeed.accounts.filter(
    (account) =>
      account.role === "volunteer" &&
      (!institutionCode || account.institutionCode === institutionCode),
  );
  const nominatedVolunteers = counsellorId
    ? volunteerPool.filter((account) => account.nominatedBy === counsellorId)
    : volunteerPool;
  const nominatedCount = nominatedVolunteers.length;
  const volunteerMembers = nominatedVolunteers.map((account) => ({
    id: account.id,
    displayName: account.displayName,
    nominatedBy: account.nominatedBy ?? null,
  }));

  try {
    const db = await getDb();
    const matchInstitution = institutionCode ? { institutionCode } : {};
    const matchAlerts = {
      ...matchInstitution,
      ...(counsellorId ? { notifyCounsellorId: counsellorId } : {}),
    };

    const [
      screeningsBySeverity,
      recentScreeningsDocs,
      alertsBySeverity,
      recentAlertsDocs,
      postsNeedingResponse,
      resourcesShared,
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
        .project({ severity: 1, matches: 1, createdAt: 1 })
        .toArray(),
      db
        .collection("posts")
        .countDocuments({
          ...matchInstitution,
          tone: { $ne: "positive" },
        }),
      db.collection("library").countDocuments(matchInstitution),
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

    const recentAlerts = recentAlertsDocs.map((doc) => ({
      id: doc._id ? String(doc._id) : `${doc.severity}-${doc.createdAt?.valueOf?.() ?? Date.now()}`,
      severity:
        doc.severity === "severe"
          ? "severe"
          : doc.severity === "moderate"
            ? "moderate"
            : "low",
      primaryTag: Array.isArray(doc.matches) && doc.matches.length > 0
        ? String(doc.matches[0]?.tag ?? "") || null
        : null,
      createdAt: (doc.createdAt instanceof Date
        ? doc.createdAt
        : new Date(doc.createdAt ?? Date.now())
      ).toISOString(),
    }));

    const overview: CounsellorOverview = {
      screenings: {
        bySeverity: screeningsBySeverity,
        recent: recentScreenings,
      },
      alerts: {
        bySeverity: alertsBySeverity,
        recent: recentAlerts,
      },
      volunteers: {
        total: volunteerPool.length,
        active: volunteerPool.length,
        nominated: nominatedCount,
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
        total: volunteerPool.length,
        active: volunteerPool.length,
        nominated: nominatedCount,
        members: volunteerMembers,
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
