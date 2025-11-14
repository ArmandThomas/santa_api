import { connectToMongo } from "../../../db/mongo";
import {
    WishlistItem,
    WishlistItemCreate,
    WishlistItemCreateSchema,
    WishlistItemSchema,
} from "../wishlist.dto";
import {z} from "zod";
import {ObjectId} from "mongodb";

export type AddWishlistItemResult = {
    data: WishlistItem | null;
    error ?: string;
};

export const addWishlistItem = async (
    userId: ObjectId | string,
    itemData: WishlistItemCreate
): Promise<AddWishlistItemResult> => {
    if (!userId) return { data: null, error: "UserId is required" };

    const dataWithUser: WishlistItemCreate & { userId: ObjectId | string } = { ...itemData, userId };

    const parsed = WishlistItemCreateSchema.extend({ userId: z.string().min(1) }).safeParse(dataWithUser);
    if (!parsed.success) {
        return { data: null, error: "Invalid data" };
    }

    try {
        const db = await connectToMongo();

        const result = await db.collection("wishlist").insertOne(dataWithUser);

        const newItem: WishlistItem = WishlistItemSchema.parse({
            _id: result.insertedId.toString(),
            ...dataWithUser,
        });

        return { data: newItem };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
