import { describe, it, expect, vi, beforeEach } from "vitest";
import { markEventAsDrawed, MarkEventAsDrawedResult } from "./updateDrawStatus";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("markEventAsDrawed", () => {
    const mockUpdateOne = vi.fn();
    const mockDb = {
        collection: vi.fn(() => ({
            findOneAndUpdate: mockUpdateOne,
        })),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if eventId is missing", async () => {
        const result: MarkEventAsDrawedResult = await markEventAsDrawed("" as any);
        expect(result.data).toBeNull();
        expect(result.error).toBe("EventId is required");
    });

    it("should return error if eventId is invalid", async () => {
        const result: MarkEventAsDrawedResult = await markEventAsDrawed("invalid-id");
        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid ObjectId");
    });

    it("should return error if event not found", async () => {
        mockUpdateOne.mockResolvedValue(null);
        const eventId = new ObjectId();
        const result: MarkEventAsDrawedResult = await markEventAsDrawed(eventId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Event not found");
    });

    it("should mark event as drawed", async () => {
        const eventId = new ObjectId();
        const rawEvent = {
            _id: eventId,
            ownerId: new ObjectId(),
            name: "Xmas Party",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage: null,
            guests: [],
            isDrawed: true,
        };

        mockUpdateOne.mockResolvedValue({ value: rawEvent });

        const result: MarkEventAsDrawedResult = await markEventAsDrawed(eventId);
        expect(result.error).toBeUndefined();
        expect(result.data).toBeDefined();
        expect(result.data?.isDrawed).toBe(true);
        expect(result.data?._id?.toString()).toBe(eventId.toString());
    });

    it("should handle DB errors", async () => {
        const eventId = new ObjectId();
        mockUpdateOne.mockRejectedValue(new Error("DB exploded"));

        const result: MarkEventAsDrawedResult = await markEventAsDrawed(eventId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("DB exploded");
    });
});
