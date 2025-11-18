import { z } from "zod";
import { ObjectId } from "mongodb";

const objectIdSchema = z.preprocess(
    (val) => {
        if (val instanceof ObjectId) return val;
        if (typeof val === "string" && ObjectId.isValid(val)) return new ObjectId(val);
        return val;
    },
    z.instanceof(ObjectId)
);

export const EventSchema = z.object({
    _id: objectIdSchema.optional(),
    ownerId: objectIdSchema,
    name: z.string().min(1, "Name is required"),
    eventDate: z.string().datetime(),
    drawDate: z.string().datetime(),
    backgroundImage: z.string().url().nullable(),
    guests: z.array(objectIdSchema).default([]),
    isDrawed: z.boolean().default(false),
});

export type Event = z.infer<typeof EventSchema>;

// Schéma pour la création
export const EventCreateSchema = EventSchema.omit({ _id: true, guests: true, ownerId: true, isDrawed: true });
export type EventCreate = z.infer<typeof EventCreateSchema>;

