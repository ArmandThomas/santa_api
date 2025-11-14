import { z } from "zod";
import { EventSchema } from "../event.dto";

export const EventPublicInfoSchema = EventSchema
    .pick({
        _id: true,
        name: true,
        backgroundImage: true,
        eventDate: true,
        guests: true
    })
    .transform(ev => ({
        _id: ev._id!,
        name: ev.name,
        backgroundImage: ev.backgroundImage ?? null,
        eventDate : ev.eventDate,
        participantsCount: ev.guests.length
    }));

export type EventPublicInfo = z.infer<typeof EventPublicInfoSchema>;