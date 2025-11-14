import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUser } from "./registerUser";
import { connectToMongo } from "../../../db/mongo";
import { UserCreate } from "./type";
import {ObjectId} from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("registerUser", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return error if user data is invalid", async () => {
        const invalidUser = { firstname: "A", lastname: "", email: "not-an-email" } as UserCreate;
        const result = await registerUser(invalidUser);
        expect(result).toEqual({ data: null, error: "Invalid data" });
    });

    it("should return error if user already exists", async () => {
        const user: UserCreate = { firstname: "Alice", lastname: "Dupont", email: "alice@example.com" };
        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(user),
                insertOne: vi.fn(),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await registerUser(user);
        expect(result).toEqual({ data: null, error: "User with this email already exists" });
    });

    it("should create a new user if valid and not existing", async () => {
        const user: UserCreate = { firstname: "Alice", lastname: "Dupont", email: "alice@example.com" };

        const insertedId = "64f5b3e9c7e4d2a1f2a3b4c5"
        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(null),
                insertOne: vi.fn().mockResolvedValue({ insertedId }),
            })),
        };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await registerUser(user);

        expect(result.data).toEqual({ _id: insertedId, ...user });
        expect(result.error).toBe("");
    });

    it("should handle DB connection errors gracefully", async () => {
        const user: UserCreate = { firstname: "Alice", lastname: "Dupont", email: "alice@example.com" };
        mockedConnectToMongo.mockRejectedValueOnce(new Error("DB connection failed"));

        const result = await registerUser(user);
        expect(result).toEqual({ data: null, error: "DB connection failed" });
    });
});
