import { connectToMongo } from "../../../db/mongo";
import { EventSchema, Event } from "../event.dto";
import { User, getUserInfo } from "../../../feat-auth";
import { ObjectId } from "mongodb";

export type EventAccessResult = {
    isOwner: boolean;
    isGuest: boolean;
    _id?: string;
    name?: string;
    backgroundImage?: string | null;
    eventDate?: string;
    drawDate?: string;
    isDrawed?: boolean;
    guests?: User[];
    error?: string;
};

export const getEventAccess = async (
    userId: string | ObjectId,
    eventId: string | ObjectId
): Promise<EventAccessResult> => {

    if (!userId) return { isOwner: false, isGuest: false, error: "UserId is required" };
    if (!eventId) return { isOwner: false, isGuest: false, error: "EventId is required" };

    let userObjectId: ObjectId;
    let eventObjectId: ObjectId;
    try {
        userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
        eventObjectId = typeof eventId === "string" ? new ObjectId(eventId) : eventId;
    } catch {
        return { isOwner: false, isGuest: false, error: "Invalid ObjectId" };
    }

    try {
        const db = await connectToMongo();

        const rawEvent = await db.collection("events").findOne({ _id: eventObjectId });

        if (!rawEvent?._id) return { isOwner: false, isGuest: false, error: "Event not found" };

        const event: Event = EventSchema.parse(rawEvent);

        const isOwner = event.ownerId.equals(userObjectId);
        const isGuest = event.guests.some(g => g.equals(userObjectId));


        const result: EventAccessResult = { isOwner, isGuest };

        result.name = event.name;
        result.backgroundImage = event.backgroundImage ?? null;
        result.eventDate = event.eventDate;
        result.drawDate = event.drawDate;
        result.isDrawed = event.isDrawed;

        if (isOwner || isGuest) {
            const guestsPromises = event.guests.map(g => getUserInfo(g));
            const guestsResults = await Promise.all(guestsPromises);
            result.guests = guestsResults
                .filter(r => r.data)
                .map(r => r.data!)
        }
        return result;

    } catch (err: any) {
        return { isOwner: false, isGuest: false, error: err?.message || "Unknown error" };
    }
};