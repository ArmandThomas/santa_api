// src/feat-events/lib/createEvent.ts
import { connectToMongo } from "../../../db/mongo";
import { Event, EventSchema, EventCreate, EventCreateSchema } from "../event.dto";
import { ObjectId } from "mongodb";

export type CreateEventResult = {
    data: Event | null;
    error?: string;
};

export const createEvent = async (
    userId: string | ObjectId,
    eventData: EventCreate
): Promise<CreateEventResult> => {

    if (!userId) return { data: null, error: "OwnerId is required" };

    let ownerObjectId: ObjectId;
    try {
        ownerObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    } catch {
        return { data: null, error: "Invalid OwnerId" };
    }

    const parsed = EventCreateSchema.safeParse(eventData);
    if (!parsed.success) {
        return { data: null, error: "Invalid data" };
    }

    try {
        const db = await connectToMongo();

        const toInsert = {
            ...eventData,
            ownerId: ownerObjectId,
            guests: [ownerObjectId],
        };

        const result = await db.collection("events").insertOne(toInsert);

        const newEvent = EventSchema.parse({
            _id: result.insertedId,
            ...toInsert,
        });

        return { data: newEvent };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
