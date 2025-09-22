import { RequestHandler } from "express";
import { getDb } from "../db/mongo";

export const getAnalytics: RequestHandler = async (req, res) => {
  const { institutionCode } = req.query as any;
  try {
    const db = await getDb();
    const matchInst = institutionCode ? { institutionCode } : {};

    const [screeningsAgg] = await db.collection("screenings").aggregate([
      { $match: matchInst },
      { $group: { _id: "$phq9Severity", count: { $sum: 1 } } },
    ]).toArray();

    const screeningsTotal = await db.collection("screenings").countDocuments(matchInst);

    const alertsBySeverity = await db.collection("alerts").aggregate([
      { $match: matchInst },
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]).toArray();

    const topTags = await db.collection("alerts").aggregate([
      { $match: matchInst },
      { $unwind: "$matches" },
      { $group: { _id: "$matches.tag", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]).toArray();

    const libraryStats = await db.collection("library").aggregate([
      { $match: matchInst },
      { $group: { _id: "$tone", count: { $sum: 1 } } },
    ]).toArray();

    const postsTotal = await db.collection("posts").countDocuments(matchInst);

    res.json({
      screenings: { bySeverity: screeningsAgg ?? [], total: screeningsTotal },
      alerts: { bySeverity: alertsBySeverity, topTags },
      library: { byTone: libraryStats },
      posts: { total: postsTotal },
    });
  } catch (e) {
    res.json({
      screenings: { bySeverity: [], total: 0 },
      alerts: { bySeverity: [], topTags: [] },
      library: { byTone: [] },
      posts: { total: 0 },
      note: "DB unavailable; returning empty analytics",
    });
  }
};
