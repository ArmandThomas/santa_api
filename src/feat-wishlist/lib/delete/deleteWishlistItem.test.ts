import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteWishlistItem, DeleteWishlistItemResult } from "./deleteWishlistItem";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { WishlistItemSchema } from "../wishlist.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("deleteWishlistItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error if userId is missing", async () => {
        const result = await deleteWishlistItem("" as any, "itemId");
        expect(result).toEqual({ data: null, error: "UserId is required" });
    });

    it("should return error if itemId is missing", async () => {
        const result = await deleteWishlistItem("userId", "" as any);
        expect(result).toEqual({ data: null, error: "ItemId is required" });
    });

    it("should return error if item not found", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                findOneAndDelete: vi.fn().mockResolvedValue(null),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const userId = new ObjectId();
        const itemId = new ObjectId();
        const result = await deleteWishlistItem(userId, itemId);
        expect(result).toEqual({ data: null, error: "Item not found or not owned by user" });
    });

    it("should delete and return the item if found", async () => {
        const rawItem = {
            _id: new ObjectId(),
            userId: "user123",
            title: "Test Item",
            status: "FREE",
        };
        const dbMock = {
            collection: vi.fn(() => ({
                findOneAndDelete: vi.fn().mockResolvedValue(rawItem),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);
        const userId = new ObjectId();

        const result = await deleteWishlistItem(userId, rawItem._id.toString());

        expect(result.data).toBeTruthy()
        expect(result.error).toBeUndefined();
    });

    it("should return error if db throws", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                findOneAndDelete: vi.fn().mockRejectedValue(new Error("DB error")),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);
        const userId = new ObjectId();
        const itemId = new ObjectId();
        const result = await deleteWishlistItem(userId, itemId);
        expect(result).toEqual({ data: null, error: "DB error" });
    });
});
