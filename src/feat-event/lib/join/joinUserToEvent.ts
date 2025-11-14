// src/feat-events/lib/joinUserToEvent.ts
import { connectToMongo } from "../../../db/mongo";
import { Event, EventSchema } from "../event.dto"
import { ObjectId } from "mongodb";

export type JoinUserResult = {
    data: Event | null;
    error?: string;
};

export const joinUserToEvent = async (
    eventId: string | ObjectId,
    userId: string | ObjectId
): Promise<JoinUserResult> => {
    if (!eventId) return { data: null, error: "EventId is required" };
    if (!userId) return { data: null, error: "UserId is required" };

    let eventObjectId: ObjectId;
    let userObjectId: ObjectId;

    try {
        eventObjectId = typeof eventId === "string" ? new ObjectId(eventId) : eventId;
        userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    } catch {
        return { data: null, error: "Invalid ObjectId" };
    }

    try {
        const db = await connectToMongo();

        const rawEvent = await db.collection("events").findOne({ _id: eventObjectId });
        if (!rawEvent?._id) return { data: null, error: "Event not found" };
        const guests: ObjectId[] = rawEvent.guests;
        const alreadyJoined = guests.some((g: ObjectId) => g.equals(userObjectId));
         if (!alreadyJoined) {
            rawEvent.guests.push(userObjectId);
            await db.collection("events").updateOne(
                { _id: eventObjectId },
                { $set: { guests: rawEvent.guests } }
            );
        }

        const event: Event = EventSchema.parse(rawEvent);

        return { data: event };

    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
