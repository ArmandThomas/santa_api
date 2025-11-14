// src/feat-events/lib/markEventAsDrawed.ts
import { connectToMongo } from "../../../db/mongo";
import { Event, EventSchema } from "../event.dto";
import { ObjectId } from "mongodb";

export type MarkEventAsDrawedResult = {
    data: Event | null;
    error?: string;
};

export const markEventAsDrawed = async (
    eventId: string | ObjectId
): Promise<MarkEventAsDrawedResult> => {
    if (!eventId) return { data: null, error: "EventId is required" };

    let eventObjectId: ObjectId;
    try {
        eventObjectId = typeof eventId === "string" ? new ObjectId(eventId) : eventId;
    } catch {
        return { data: null, error: "Invalid ObjectId" };
    }

    try {
        const db = await connectToMongo();

        const rawEvent = await db.collection("events").findOneAndUpdate(
            { _id: eventObjectId },
            { $set: { isDrawed: true } },
            { returnDocument: "after" }
        );

        if (!rawEvent || !rawEvent.value._id) {
            return { data: null, error: "Event not found" };
        }

        const event: Event = EventSchema.parse(rawEvent.value);
        return { data: event };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
