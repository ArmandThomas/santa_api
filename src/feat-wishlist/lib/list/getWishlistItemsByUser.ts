import { connectToMongo } from "../../../db/mongo";
import {
    WishlistItem,
    WishlistItemSchema,
} from "../wishlist.dto";
import { ObjectId } from "mongodb";

export type GetWishlistItemsResult = {
    data: WishlistItem[] | null;
    error?: string;
};

export const getWishlistItemsByUser = async (
    userId: string | ObjectId
): Promise<GetWishlistItemsResult> => {
    if (!userId) return { data: null, error: "UserId is required" };

    try {
        const db = await connectToMongo();

        const rawItems = await db
            .collection("wishlist")
            .find({ userId: userId.toString() })
            .toArray();

        const items: WishlistItem[] = rawItems.map(item => WishlistItemSchema.parse({
            ...item,
            _id: item._id.toString(),
        }));

        return { data: items };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
