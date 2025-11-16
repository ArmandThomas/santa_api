// src/feat-events/lib/drawEvent.ts
import { connectToMongo } from "../../../db/mongo";
import { Draw, DrawSchema } from "../draw.dto";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import {getEventAccess} from "../../../feat-event/lib/access/getEventAccess";
import {markEventAsDrawed} from "../../../feat-event/lib/update/updateDrawStatus";
import {notifyDrawParticipants} from "../notify/email/notifyDrawParticipants";

export type DrawEventResult = {
    data: Draw[] | null;
    error?: string;
};

export const drawEvent = async (
    eventId: string | ObjectId,
    ownerId: string | ObjectId
): Promise<DrawEventResult> => {
    if (!eventId) return { data: null, error: "EventId is required" };

    let eventObjectId: ObjectId;
    try {
        eventObjectId = typeof eventId === "string" ? new ObjectId(eventId) : eventId;
    } catch {
        return { data: null, error: "Invalid ObjectId" };
    }

    try {
        const db = await connectToMongo();

        const event = await getEventAccess(ownerId, eventId)

        if (!event.guests || event.guests.length < 2) {
            return { data: null, error: "Not enough participants for draw" };
        }

        if (event.isDrawed === true) {
            return { data: null, error : 'Already drawed for this event'}
        }

        const shuffled = [...event.guests].sort(() => Math.random() - 0.5);

        const draws: Draw[] = shuffled.map((giver, i) => ({
            eventId: eventObjectId,
            giver: new ObjectId(giver._id),
            receiver: new ObjectId(shuffled[(i + 1) % shuffled.length]._id),
            uuid: uuidv4(),
        }));

        await db.collection("draws").insertMany(draws);
        await markEventAsDrawed(eventObjectId);
        await notifyDrawParticipants(draws, event)

        const parsed = draws.map(d => DrawSchema.parse(d));
        return { data: parsed };

    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
