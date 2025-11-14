import { describe, it, expect, vi, beforeEach } from "vitest";
import { ObjectId } from "mongodb";
import { getDrawReceiver } from "./getDrawReceiver";
import { connectToMongo } from "../../../db/mongo";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("getDrawReceiver", () => {
    const mockFindOne = vi.fn();
    const mockDb = {
        collection: vi.fn(() => ({
            findOne: mockFindOne,
        })),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if uuid is missing", async () => {
        const result = await getDrawReceiver("" as any, new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("UUID is required");
    });

    it("should return error if userId is missing", async () => {
        const result = await getDrawReceiver("some-uuid", "" as any);
        expect(result.data).toBeNull();
        expect(result.error).toBe("UserId is required");
    });

    it("should return error if userId is invalid", async () => {
        const result = await getDrawReceiver("some-uuid", "invalid-id");
        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid UserId");
    });

    it("should return error if draw is not found", async () => {
        mockFindOne.mockResolvedValue(null);

        const userId = new ObjectId();
        const result = await getDrawReceiver("my-uuid", userId.toString());

        expect(mockDb.collection).toHaveBeenCalledWith("draws");
        expect(mockFindOne).toHaveBeenCalledWith({
            uuid: "my-uuid",
            giver: new ObjectId(userId),
        });

        expect(result.data).toBeNull();
        expect(result.error).toBe("Draw not found or access denied");
    });

    it("should return receiverId when draw exists and giver matches", async () => {
        const giverId = new ObjectId();
        const receiverId = new ObjectId();

        mockFindOne.mockResolvedValue({
            uuid: "my-uuid",
            giver: giverId,
            receiver: receiverId,
        });

        const result = await getDrawReceiver("my-uuid", giverId.toString());

        expect(result.error).toBeUndefined();
        expect(result.data).toEqual(receiverId);
    });

    it("should return error when database throws", async () => {
        mockFindOne.mockRejectedValue(new Error("DB exploded"));

        const giverId = new ObjectId();

        const result = await getDrawReceiver("my-uuid", giverId.toString());

        expect(result.data).toBeNull();
        expect(result.error).toBe("DB exploded");
    });
});
