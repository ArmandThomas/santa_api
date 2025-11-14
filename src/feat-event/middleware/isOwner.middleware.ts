// src/feat-events/middleware/checkEventOwner.ts
import { Response, NextFunction } from "express";
import { connectToMongo } from "../../db/mongo"
import { EventSchema } from "../lib/event.dto";
import { ObjectId } from "mongodb";
import { AuthenticatedRequest } from "../../feat-auth";

export const checkEventOwner = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { id: eventId } = req.params;
    const { userId } = req;

    if (!eventId || !userId) {
        return res.status(400).json({ error: "EventId and userId are required" });
    }

    let eventObjectId: ObjectId;
    let userObjectId: ObjectId;

    try {
        eventObjectId = new ObjectId(eventId);
        userObjectId = new ObjectId(userId);
    } catch {
        return res.status(400).json({ error: "Invalid ObjectId" });
    }

    try {
        const db = await connectToMongo();
        const rawEvent = await db.collection("events").findOne({ _id: eventObjectId });

        if (!rawEvent) return res.status(404).json({ error: "Event not found" });

        const event = EventSchema.parse(rawEvent);

        if (!event.ownerId.equals(userObjectId)) {
            return res.status(403).json({ error: "User is not the owner" });
        }

        next();
    } catch (err: any) {
        return res.status(500).json({ error: err?.message || "Unknown error" });
    }
};
