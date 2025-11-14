import { describe, it, expect, vi, beforeEach } from "vitest";
import { listEvents } from "./listEvents";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockFind = vi.fn();
const mockToArray = vi.fn();

const mockDb = {
    collection: vi.fn().mockReturnValue({
        find: mockFind.mockReturnValue({
            toArray: mockToArray,
        }),
    }),
};

describe("listEvents", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return mapped events successfully", async () => {
        const events = [
            {
                _id: new ObjectId(),
                name: "Christmas Party",
                backgroundImage: "https://domain.com/img1.png",
                eventDate: new Date().toISOString(),
                guests: [new ObjectId()],
            },
            {
                _id: new ObjectId(),
                name: "New Year Event",
                backgroundImage: null,
                eventDate: new Date().toISOString(),
                guests: [new ObjectId(), new ObjectId(), new ObjectId()],
            }
        ];

        mockToArray.mockResolvedValue(events);

        const result = await listEvents();

        expect(result.error).toBeUndefined();
        expect(result.data?.length).toBe(2);
    });

    it("should handle empty list", async () => {
        mockToArray.mockResolvedValue([]);

        const result = await listEvents();

        expect(result.error).toBeUndefined();
        expect(result.data).toEqual([]);
    });

    it("should set participantsCount = 0 when guests is invalid", async () => {
        const events = [
            {
                _id: new ObjectId(),
                name: "Bad Data",
                backgroundImage: null,
                eventDate: new Date().toISOString(),
                guests: "not-an-array" as any,
            }
        ];

        mockToArray.mockResolvedValue(events);

        const result = await listEvents();

        expect(result.error).toBeUndefined();
        expect(result.data?.[0].participantsCount).toBe(0);
    });

    it("should return error when DB throws", async () => {
        (connectToMongo as any).mockRejectedValue(new Error("DB error test"));

        const result = await listEvents();

        expect(result.data).toBeNull();
        expect(result.error).toBe("DB error test");
    });

    it("should return Unknown error when DB throws without message", async () => {
        (connectToMongo as any).mockRejectedValue({});

        const result = await listEvents();

        expect(result.data).toBeNull();
        expect(result.error).toBe("Unknown error");
    });
});
