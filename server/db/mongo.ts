import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });
  await client.connect();
  // Use default db from URI or fallback
  const url = new URL(uri);
  const dbName =
    (url.pathname && url.pathname.replace(/\//g, "")) || "mindpalace";
  db = client.db(dbName || "mindpalace");
  return db;
}

export async function closeDb() {
  await client?.close();
  client = null;
  db = null;
}
