import { z } from "zod";
import { ObjectId } from "mongodb";

export const WishlistItemSchema = z.object({
    _id: z.preprocess((val) => {
        if (val instanceof ObjectId) return val.toString();
        if (typeof val === "string") return val;
        return val;
    }, z.string().min(1)),

    userId: z.preprocess((val) => {
        if (val instanceof ObjectId) return val.toString();
        if (typeof val === "string") return val;
        return val;
    }, z.string().min(1)),

    title: z.string().min(1, "Le titre est requis"),
    description: z.string().optional(),
    url: z.string().url().optional(),
    status: z.enum(["FREE", "RESERVED", "DONE"]).default("FREE"),
});

export type WishlistItem = z.infer<typeof WishlistItemSchema>;

export type WishlistItemCreate = Omit<WishlistItem, "_id" | "userId">;

export const WishlistItemCreateSchema = WishlistItemSchema.omit({ _id: true, userId: true });
