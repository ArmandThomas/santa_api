import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";

import { findWishlistByUuidDraw } from "./findWishlistByUuidDraw";
import { getDrawReceiver } from "../../../feat-draw/lib/drawReceiver/getDrawReceiver";
import { getWishlistItemsByUser } from "../list/getWishlistItemsByUser";
import { WishlistItem } from "../wishlist.dto";

vi.mock("../../../feat-draw/lib/drawReceiver/getDrawReceiver", () => ({
    getDrawReceiver: vi.fn(),
}));

vi.mock("../list/getWishlistItemsByUser", () => ({
    getWishlistItemsByUser: vi.fn(),
}));

describe("findWishlistByUuidDraw", () => {
    const uuid = "abc-uuid";
    const giverId = new ObjectId();
    const receiverId = new ObjectId();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error if uuidDraw is missing", async () => {
        const result = await findWishlistByUuidDraw("" as any, giverId);

        expect(result.data).toBeNull();
        expect(result.error).toBe("UUID Draw is required");
    });

    it("should return error if giverId is missing", async () => {
        const result = await findWishlistByUuidDraw(uuid, "" as any);

        expect(result.data).toBeNull();
        expect(result.error).toBe("GiverId is required");
    });

    it("should return error if getDrawReceiver fails", async () => {
        (getDrawReceiver as any).mockResolvedValue({
            data: null,
            error: "Draw not found",
        });

        const result = await findWishlistByUuidDraw(uuid, giverId);

        expect(getDrawReceiver).toHaveBeenCalledWith(uuid, giverId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Draw not found");
    });

    it("should return error if wishlist is empty", async () => {
        (getDrawReceiver as any).mockResolvedValue({ data: receiverId });
        (getWishlistItemsByUser as any).mockResolvedValue({
            data: null,
            error: "Wishlist not found",
        });

        const result = await findWishlistByUuidDraw(uuid, giverId);

        expect(getDrawReceiver).toHaveBeenCalled();
        expect(getWishlistItemsByUser).toHaveBeenCalledWith(receiverId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Wishlist not found");
    });

    it("should return the wishlist for the receiver", async () => {
        const mockWishlist: WishlistItem[] = [
            {
                _id: "1",
                userId: receiverId.toString(),
                title: "Switch",
                description: "OLED",
                url: "https://nintendo.com",
                status: "FREE"
            },
        ];

        (getDrawReceiver as any).mockResolvedValue({ data: receiverId });
        (getWishlistItemsByUser as any).mockResolvedValue({
            data: mockWishlist,
        });

        const result = await findWishlistByUuidDraw(uuid, giverId);

        expect(getDrawReceiver).toHaveBeenCalledWith(uuid, giverId);
        expect(getWishlistItemsByUser).toHaveBeenCalledWith(receiverId);

        expect(result.error).toBeUndefined();
        expect(result.data).toEqual(mockWishlist);
    });
});
