import { connectToMongo } from "../../../db/mongo";
import {ObjectId} from "mongodb";

export type DeleteWishlistItemResult = {
    data: Boolean | null
    error?: string;
};

export const deleteWishlistItem = async (
    userId: string | ObjectId,
    itemId: string | ObjectId
): Promise<DeleteWishlistItemResult> => {

    if (!userId) return { data: null, error: "UserId is required" };
    if (!itemId) return { data: null, error: "ItemId is required" };

    const userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    const itemObjectId = typeof itemId === "string" ? new ObjectId(itemId) : itemId;

    try {
        const db = await connectToMongo();

        const rawItem = await db
            .collection("wishlist")
            .findOneAndDelete({ _id: itemObjectId, userId: userObjectId.toString() });

        if (!rawItem?._id) {
            return {data : null, error : "Item not found or not owned by user"}
        }

        return { data: true};
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
