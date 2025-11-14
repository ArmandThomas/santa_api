// src/feat-wishlist/lib/updateWishlistStatus.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { updateStatus } from "./updateStatus";
import { getDrawReceiver } from "../../../feat-draw/lib/drawReceiver/getDrawReceiver";
import { connectToMongo } from "../../../db/mongo";

vi.mock("../../../feat-draw/lib/drawReceiver/getDrawReceiver", () => ({
    getDrawReceiver: vi.fn(),
}));

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("updateStatus", () => {
    const mockFindOneAndUpdate = vi.fn();

    const mockDb = {
        collection: vi.fn(() => ({
            findOneAndUpdate: mockFindOneAndUpdate,
        })),
    };

    const uuidDraw = "some-uuid";
    const giverId = new ObjectId();
    const wishlistItemId = new ObjectId();
    const receiverId = new ObjectId();

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should throw error if uuidDraw is missing", async () => {
        await expect(updateStatus("" as any, giverId, wishlistItemId, "RESERVED"))
            .rejects.toThrow("UUID Draw is required");
    });

    it("should throw error if giverId is missing", async () => {
        await expect(updateStatus(uuidDraw, null as any, wishlistItemId, "DONE"))
            .rejects.toThrow("GiverId is required");
    });

    it("should throw error if wishlistItemId is missing", async () => {
        await expect(updateStatus(uuidDraw, giverId, null as any, "RESERVED"))
            .rejects.toThrow("WishlistItemId is required");
    });

    it("should return error if getDrawReceiver returns no data", async () => {
        (getDrawReceiver as any).mockResolvedValue({ data: null });
        const result = await updateStatus(uuidDraw, giverId, wishlistItemId, "FREE");
        expect(result.data).toBeNull();
        expect(result.error).toBe("You are not allowed to update this item");
    });

    it("should return error if wishlist item not found in DB", async () => {
        (getDrawReceiver as any).mockResolvedValue({ data: receiverId });
        mockFindOneAndUpdate.mockResolvedValue(null);

        const result = await updateStatus(uuidDraw, giverId, wishlistItemId, "RESERVED");
        expect(result.data).toBeNull();
        expect(result.error).toBe("Wishlist item not found or cannot be updated");
        expect(mockDb.collection).toHaveBeenCalledWith("wishlist");
        expect(mockFindOneAndUpdate).toHaveBeenCalled();
    });

    it("should update wishlist item status successfully", async () => {
        const updatedItem = { _id: wishlistItemId, userId: receiverId, name: "Gift", status: true };
        (getDrawReceiver as any).mockResolvedValue({ data: receiverId });
        mockFindOneAndUpdate.mockResolvedValue({ ...updatedItem });

        const result = await updateStatus(uuidDraw, giverId, wishlistItemId, "RESERVED");

        expect(result.error).toBeUndefined();
        expect(result.data).toEqual(updatedItem);
        expect(mockDb.collection).toHaveBeenCalledWith("wishlist");
        expect(mockFindOneAndUpdate).toHaveBeenCalledWith(
            { _id: wishlistItemId, userId: receiverId.toString() },
            { $set: { status: "RESERVED" } },
            { returnDocument: "after" }
        );
    });
});
