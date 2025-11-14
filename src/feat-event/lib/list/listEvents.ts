import { connectToMongo } from "../../../db/mongo";
import { EventPublicInfo, EventPublicInfoSchema } from "./listEvents.dto";

export type ListEventsResult = {
    data: EventPublicInfo[] | null;
    error?: string;
};

export const listEvents = async (): Promise<ListEventsResult> => {
    try {
        const db = await connectToMongo();

        const rawEvents = await db.collection("events")
            .find({})
            .toArray();

        const mapped = rawEvents.map(ev => ({
            _id: ev._id,
            name: ev.name,
            backgroundImage: ev.backgroundImage ?? null,
            eventDate : ev.eventDate,
            guests : Array.isArray(ev.guests) ? ev.guests : []
        }));

        const data = mapped.map(e => EventPublicInfoSchema.parse(e));

        return { data };
    } catch (err: any) {
        return { data: null, error: err?.message ?? "Unknown error" };
    }
};
