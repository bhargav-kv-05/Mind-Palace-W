import { getDb } from "./mongo";

export async function ensureDbIndexes() {
  const db = await getDb();
  await db.collection("messages").createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }); // 7 days
  await db.collection("screenings").createIndex({ institutionCode: 1, studentAnonymousId: 1, createdAt: -1 });
  await db.collection("alerts").createIndex({ institutionCode: 1, createdAt: -1 });
  await db.collection("library").createIndex({ tone: 1, createdAt: -1 });
  await db.collection("library").createIndex({ tags: 1, createdAt: -1 });
  await db.collection("posts").createIndex({ institutionCode: 1, createdAt: -1 });
}
