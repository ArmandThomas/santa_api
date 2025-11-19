import { describe, it, expect, vi } from "vitest";
import { getUserByEmailOrPhone } from "./getUserByEmailOrPhone";
import { connectToMongo } from "../../../db/mongo";
import { signJwt } from "../../../utils/utils-jwt/lib";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("getUserByEmailOrPhone", () => {

    it("should return valid user when found by email", async () => {
        const fakeUser = {
            _id: "1",
            firstname: "Alice",
            lastname: "Dupont",
            email: "alice@example.com",
        };

        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(fakeUser)
            })),
        };

        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmailOrPhone("alice@example.com");

        expect(result).toEqual({
            data: fakeUser,
            jwt: signJwt(fakeUser),
        });
    });

    it("should return valid user when found by phone", async () => {
        const fakeUser = {
            _id: "2",
            firstname: "Bob",
            lastname: "Martin",
            phone: "0601020304",
        };

        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(fakeUser)
            })),
        };

        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmailOrPhone(undefined, "0601020304");

        expect(result).toEqual({
            data: fakeUser,
            jwt: signJwt(fakeUser),
        });
    });

    it("should return empty data if user not found (email lookup)", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(null)
            })),
        };

        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmailOrPhone("notfound@example.com");

        expect(result).toEqual({
            data: { email: "notfound@example.com", phone: undefined },
        });
    });

    it("should return empty data if user not found (phone lookup)", async () => {
        const dbMock = {
            collection: vi.fn(() => ({
                findOne: vi.fn().mockResolvedValue(null)
            })),
        };

        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmailOrPhone(undefined, "0600000000");

        expect(result).toEqual({
            data: { email: undefined, phone: "0600000000" },
        });
    });

    it("should return error if both email and phone are empty", async () => {
        const result = await getUserByEmailOrPhone("", "");

        expect(result).toEqual({
            data: null,
            error: "Email or phone is required",
        });
    });

    it("should return error on unexpected exception", async () => {
        mockedConnectToMongo.mockRejectedValueOnce(new Error("DB connection failed"));

        const result = await getUserByEmailOrPhone("test@example.com");

        expect(result).toEqual({
            data: null,
            error: "DB connection failed",
        });
    });
});
