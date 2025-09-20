import { RequestHandler } from "express";
import { getDb } from "../db/mongo";

export const listLibrary: RequestHandler = async (req, res) => {
  try {
    const { tone, institutionCode, tag } = req.query as any;
    const db = await getDb();
    const q: any = {};
    if (tone) q.tone = tone;
    if (institutionCode) q.institutionCode = institutionCode;
    if (tag) q.tags = { $in: [String(tag).toLowerCase()] };
    const items = await db.collection("library").find(q).sort({ createdAt: -1 }).limit(100).toArray();
    res.json(items);
  } catch (e) {
    console.warn("listLibrary fallback (no DB):", (e as Error).message);
    res.json([]);
  }
};
