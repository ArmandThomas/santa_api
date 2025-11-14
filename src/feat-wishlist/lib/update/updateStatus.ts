import {ObjectId} from "mongodb";
import {WishlistItem} from "../wishlist.dto";
import {getDrawReceiver} from "../../../feat-draw/lib/drawReceiver/getDrawReceiver";
import {connectToMongo} from "../../../db/mongo";

type UpdateStatusResponse = {
    data : WishlistItem | null,
    error ?: string,
}

export const updateStatus = async (
    uuidDraw: string,
    giverId: string | ObjectId,
    wistListId : string | ObjectId,
    status : WishlistItem["status"]
): Promise<UpdateStatusResponse> => {
    if (!uuidDraw) throw new Error("UUID Draw is required");
    if (!giverId) throw new Error("GiverId is required");
    if (!wistListId) throw new Error("WishlistItemId is required");

    try {

        const receiverResult = await getDrawReceiver(uuidDraw, giverId);

        if (!receiverResult.data) {
            return {data : null, error : "You are not allowed to update this item"}
        }

        const receiverId = receiverResult.data;

        const db = await connectToMongo();

        const result = await db.collection("wishlist").findOneAndUpdate(
            { _id: typeof wistListId === "string" ? new ObjectId(wistListId) : wistListId, userId: receiverId.toString() },
            { $set: { status: status } },
            { returnDocument: "after" }
        ) as WishlistItem | null;

        if (!result || !result._id) {
            return {data: null, error: 'Wishlist item not found or cannot be updated'}
        }

        return {
            data : result,
        }
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }

}