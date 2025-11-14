import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWishlistItemsByUser, GetWishlistItemsResult } from "./getWishlistItemsByUser"
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { WishlistItemSchema } from "../wishlist.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("getWishlistItemsByUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error if userId is missing", async () => {
        const result = await getWishlistItemsByUser("" as any);
        expect(result).toEqual({ data: null, error: "UserId is required" });
    });

    it("should return empty array if no items found", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                find: vi.fn(() => ({
                    toArray: vi.fn().mockResolvedValue([]),
                })),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getWishlistItemsByUser("123");
        expect(result).toEqual({ data: [] });
    });

    it("should return items if found", async () => {
        const rawItems = [
            { _id: new ObjectId(), userId: "123", title: "Test Item", status: "FREE" },
        ];
        const dbMock = {
            collection: vi.fn(() => ({
                find: vi.fn(() => ({
                    toArray: vi.fn().mockResolvedValue(rawItems),
                })),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getWishlistItemsByUser("123");
        expect(result.data).toHaveLength(1);
        expect(result.data![0]).toEqual(
            WishlistItemSchema.parse({
                ...rawItems[0],
                _id: rawItems[0]._id.toString(),
            })
        );
    });

    it("should return error if db throws", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                find: vi.fn(() => ({
                    toArray: vi.fn().mockRejectedValue(new Error("DB error")),
                })),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getWishlistItemsByUser("123");
        expect(result).toEqual({ data: null, error: "DB error" });
    });
});
