import { ObjectId } from "mongodb";
import { getDrawReceiver } from "../../../feat-draw/lib/drawReceiver/getDrawReceiver";
import { getWishlistItemsByUser } from "../list/getWishlistItemsByUser";
import {WishlistItem} from "../wishlist.dto";
import {getUserInfo, User} from "../../../feat-auth";

export type FindWishlistByUuidDrawResult = {
    data: { wishlist : WishlistItem[], user : User | null } | null;
    error?: string;
};


export const findWishlistByUuidDraw = async (
    uuidDraw: string,
    giverId: string | ObjectId
): Promise<FindWishlistByUuidDrawResult> => {
    if (!uuidDraw) return { data: null, error: "UUID Draw is required" };
    if (!giverId) return { data: null, error: "GiverId is required" };

    const receiverResult = await getDrawReceiver(uuidDraw, giverId);
    if (!receiverResult.data) {
        return { data: null, error: receiverResult.error || "Receiver not found" };
    }

    const receiverId = receiverResult.data;

    const wishlistResult = await getWishlistItemsByUser(receiverId);
    if (!wishlistResult.data) {
        return { data: null, error: wishlistResult.error || "Wishlist not found" };
    }

    const user = await getUserInfo(receiverId);

    const dataUser = user.data

    return {
        data: {wishlist : wishlistResult.data, user : dataUser}
    };
};
