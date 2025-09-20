import { RequestHandler } from "express";
import { getDb } from "../db/mongo";

export const listPosts: RequestHandler = async (req, res) => {
  const { institutionCode } = req.query as any;
  const db = await getDb();
  const posts = await db
    .collection("posts")
    .find(institutionCode ? { institutionCode } : {})
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();
  res.json(posts);
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
  const db = await getDb();
  const doc = { institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone: tone ?? null, tags: cleanTags, createdAt: new Date() };
  await db.collection("posts").insertOne(doc);
  if (tone === "positive" || tone === "negative") {
    await db.collection("library").insertOne({ institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone, tags: cleanTags, createdAt: new Date() });
  }
  res.status(201).json(doc);
};
