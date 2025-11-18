import { describe, it, expect, vi } from "vitest";
import { getUserByEmail } from "./getUserByEmail";
import { connectToMongo } from "../../../db/mongo";
import {signJwt} from "../../../utils/utils-jwt/lib";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockedConnectToMongo = vi.mocked(connectToMongo);

describe("retrieveUserFromEmail", () => {
    it("should return valid user", async () => {
        const fakeUser = { _id: "1", firstname: "Alice", lastname: "Dupont", email: "alice@example.com" };
        const dbMock = { collection: vi.fn(() => ({ findOne: vi.fn().mockResolvedValue(fakeUser) })) };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmail("alice@example.com");
        expect(result).toEqual({ data: fakeUser, jwt : signJwt(fakeUser)});
    });

    it("should empty data if user not found", async () => {
        const dbMock = { collection: vi.fn(() => ({ findOne: vi.fn().mockResolvedValue(null) })) };
        mockedConnectToMongo.mockResolvedValue(dbMock as any);

        const result = await getUserByEmail("notfound@example.com");
        expect(result).toEqual({ data: { email : "notfound@example.com"}});
    });

    it("should return error if email is empty", async () => {
        const result = await getUserByEmail("");
        expect(result).toEqual({ data: null, error: "Email is required" });
    });

    it("should return error on unexpected exception", async () => {
        mockedConnectToMongo.mockRejectedValueOnce(new Error("DB connection failed"));

        const result = await getUserByEmail("test@example.com");
        expect(result).toEqual({ data: null, error: "DB connection failed" });
    });
});
