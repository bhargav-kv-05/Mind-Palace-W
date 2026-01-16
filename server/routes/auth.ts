import type { RequestHandler } from "express";
import { getDb } from "../db/mongo";

export const checkVolunteerStatus: RequestHandler = async (req, res) => {
    const { institutionCode, studentId } = req.query as {
        institutionCode?: string;
        studentId?: string;
    };

    if (!institutionCode || !studentId) {
        res.status(400).json({ error: "Missing required query parameters" });
        return;
    }

    try {
        const db = await getDb();
        const volunteer = await db.collection("volunteers").findOne({
            institutionCode,
            studentId,
        });

        res.json({ isVolunteer: !!volunteer });
    } catch (error) {
        // Fail safe: return false if DB error, do not block login
        console.error("Volunteer check failed", error);
        res.json({ isVolunteer: false });
    }
};
