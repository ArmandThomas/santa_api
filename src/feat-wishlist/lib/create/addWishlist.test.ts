import { describe, it, expect, vi, beforeEach } from "vitest";
import { addWishlistItem } from "./addWishlist";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { WishlistItemCreate } from "../wishlist.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("addWishlistItem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error if userId is missing", async () => {
        const item = { title: "Test item", status : 'FREE' as const};
        const result = await addWishlistItem(undefined as any, item);
        expect(result).toEqual({ data: null, error: "UserId is required" });
    });

    it("should return error if item data is invalid", async () => {
        const userId = "64f5b3e9c7e4d2a1f2a3b4c5"
        const item = { title: "", status : 'FREE' as const};
        const result = await addWishlistItem(userId, item);
        expect(result).toEqual({ data: null, error: "Invalid data" });
    });

    it("should add a new wishlist item successfully", async () => {
        const userId = "64f5b3e9c7e4d2a1f2a3b4c5"
        const item: WishlistItemCreate = {
            title: "Nouvel item",
            description: "Description optionnelle",
            status : 'FREE' as const
        };

        const insertedId = "64f5b3e12129c7e4d2a1f2a3b4c5"
        const dbMock = {
            collection: vi.fn(() => ({
                insertOne: vi.fn().mockResolvedValue({ insertedId }),
            })),
        };

        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await addWishlistItem(userId, item);

        expect(result.data).toBeTruthy();
        expect(result.data?.title).toBe(item.title);
        expect(result.data?.description).toBe(item.description);
        expect(result.data?._id).toBe(insertedId.toString());
        expect(result.data?.userId).toBe(userId);
        expect(result.error).toBeUndefined();
    });

    it("should handle DB errors gracefully", async () => {
        const userId = new ObjectId();
        const item: WishlistItemCreate = { title: "Item test", status : 'FREE' as const };

        mockedConnectToMongo.mockRejectedValueOnce(new Error("DB connection failed"));

        const result = await addWishlistItem(userId, item);
        expect(result.error).toBeDefined()
    });
});
