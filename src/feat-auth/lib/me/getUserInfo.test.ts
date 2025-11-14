import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserInfo, type GetUserInfoResult } from "./getUserInfo";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { User, UserSchema } from "../user.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockFindOne = vi.fn();
const mockDb = {
    collection: vi.fn(() => ({
        findOne: mockFindOne,
    })),
};

describe("getUserInfo", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if userId is missing", async () => {
        const result = await getUserInfo("" as any);
        expect(result).toEqual({
            data: null,
            error: "UserId is required",
        });
    });

    it("should return error if userId is invalid", async () => {
        const invalidId = "123-invalid";
        const result = await getUserInfo(invalidId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid UserId");
    });

    it("should return error if user not found", async () => {
        mockFindOne.mockResolvedValue(null);

        const userId = new ObjectId();
        const result = await getUserInfo(userId);

        expect(mockDb.collection).toHaveBeenCalledWith("users");
        expect(mockFindOne).toHaveBeenCalledWith({ _id: userId });
        expect(result).toEqual({
            data: null,
            error: "User not found",
        });
    });

    it("should return error if DB throws", async () => {
        mockFindOne.mockRejectedValue(new Error("DB failure"));

        const userId = new ObjectId();
        const result = await getUserInfo(userId);

        expect(result.data).toBeNull();
        expect(result.error).toBe("DB failure");
    });

    it("should return user if found", async () => {
        const userId = new ObjectId().toString();
        const userData: User = {
            _id: userId,
            firstname: "Alice",
            lastname: "Dupont",
            email: "alice@example.com",
        };
        mockFindOne.mockResolvedValue(userData);

        const result = await getUserInfo(userId);

        expect(result.error).toBeUndefined();
        expect(result.data).toEqual(userData);
    });
});
