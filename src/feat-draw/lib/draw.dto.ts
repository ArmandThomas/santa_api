import {z} from "zod";
import {ObjectId} from "mongodb";

const objectIdSchema = z.preprocess(
    (val) => {
        if (val instanceof ObjectId) return val;
        if (typeof val === "string" && ObjectId.isValid(val)) return new ObjectId(val);
        return val;
    },
    z.instanceof(ObjectId)
);

export const DrawSchema = z.object({
    _id: objectIdSchema.optional(),
    eventId: objectIdSchema,
    giver: objectIdSchema,
    receiver: objectIdSchema,
    uuid: z.string().uuid()
});

export type Draw = z.infer<typeof DrawSchema>;