import { RequestHandler } from "express";
import { getDb } from "../db/mongo";

export const listPosts: RequestHandler = async (req, res) => {
  try {
    const { institutionCode } = req.query as any;
    const db = await getDb();
    const posts = await db
      .collection("posts")
      .find(institutionCode ? { institutionCode } : {})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    res.json(posts);
  } catch (e) {
    console.warn("listPosts fallback (no DB):", (e as Error).message);
    res.json([]);
  }
};

export const createPost: RequestHandler = async (req, res) => {
  const { institutionCode, authorAnonymousId, text, tone, tags } = req.body as {
    institutionCode: string;
    authorAnonymousId?: string;
    text: string;
    tone?: "positive" | "negative" | null;
    tags?: string[];
  };
  if (!text) return res.status(400).json({ error: "text is required" });
  const cleanTags = Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [];
  const doc = { institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone: tone ?? null, tags: cleanTags, createdAt: new Date() };
  try {
    const db = await getDb();
    await db.collection("posts").insertOne(doc);
    if (tone === "positive" || tone === "negative") {
      await db.collection("library").insertOne({ institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone, tags: cleanTags, createdAt: new Date() });
    }
  } catch (e) {
    console.warn("createPost fallback (no DB):", (e as Error).message);
  }
  res.status(201).json(doc);
};
