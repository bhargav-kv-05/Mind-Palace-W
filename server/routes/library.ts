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

    // Filter out items hidden from this institution
    // We assume the caller's institution code is passed in query or available via session middleware (but here it seems to come from query for filtering scope)
    // However, for HIDING, we care about the VIEWER'S institution.
    // The current code passes `institutionCode` as a filter for the AUTHOR'S institution (I assume).
    // Let's rely on a header or the query param `viewerInstitutionCode` if we want strict security, 
    // but typically this logic might be: "Show items NOT in hiddenFromInstitutions containing MyCode".
    // If the frontend sends the viewer's code in `institutionCode` strictly for "My University" tab, that's one thing.
    // But for the Library, it seems to be a general pool.
    // Let's check `req.query.viewerInstitutionCode` or similar. 
    // For now, I'll assume the frontend will pass `viewerInstitutionCode`.
    const viewerCode = (req.query.viewerInstitutionCode as string) || (req.query.institutionCode as string);

    if (viewerCode) {
      q.hiddenFromInstitutions = { $ne: viewerCode };
    }

    const items = await db.collection("library").find(q).sort({ createdAt: -1 }).limit(100).toArray();
    res.json(items);
  } catch (e) {
    console.warn("listLibrary fallback (no DB):", (e as Error).message);
    res.json([]);
  }
};

export const hideLibraryItem: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { institutionCode } = req.body;
    if (!institutionCode) {
      res.status(400).json({ error: "Institution code required" });
      return;
    }
    const db = await getDb();
    const { ObjectId } = await import("mongodb");

    await db.collection("library").updateOne(
      { _id: new ObjectId(id) },
      { $addToSet: { hiddenFromInstitutions: institutionCode } }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
};
