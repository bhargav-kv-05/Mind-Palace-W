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
  const { institutionCode, authorAnonymousId, text, tone } = req.body as {
    institutionCode: string;
    authorAnonymousId?: string;
    text: string;
    tone?: "positive" | "negative" | null;
  };
  if (!text) return res.status(400).json({ error: "text is required" });
  const db = await getDb();
  const doc = { institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone: tone ?? null, createdAt: new Date() };
  await db.collection("posts").insertOne(doc);
  if (tone === "positive" || tone === "negative") {
    await db.collection("library").insertOne({ institutionCode: institutionCode ?? null, authorAnonymousId: authorAnonymousId ?? null, text, tone, createdAt: new Date() });
  }
  res.status(201).json(doc);
};
