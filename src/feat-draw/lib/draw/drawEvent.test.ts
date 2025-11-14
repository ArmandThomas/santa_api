// src/feat-events/lib/drawEvent.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { drawEvent, DrawEventResult } from "./drawEvent";
import { connectToMongo } from "../../../db/mongo";
import { getEventAccess } from "../../../feat-event/lib/access/getEventAccess";
import { ObjectId } from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

vi.mock("../../../feat-event/lib/access/getEventAccess", () => ({
    getEventAccess: vi.fn(),
}));

describe("drawEvent", () => {
    const mockInsertMany = vi.fn();
    const mockDb = {
        collection: vi.fn(() => ({
            insertMany: mockInsertMany,
        })),
    };

    const ownerId = new ObjectId();
    const eventId = new ObjectId();

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if eventId is missing", async () => {
        const result: DrawEventResult = await drawEvent("" as any, ownerId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("EventId is required");
    });

    it("should return error if eventId is invalid", async () => {
        const result: DrawEventResult = await drawEvent("invalid-id", ownerId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid ObjectId");
    });

    it("should return error if not enough participants", async () => {
        (getEventAccess as any).mockResolvedValue({ guests: [{ _id: new ObjectId().toString() }] });
        const result: DrawEventResult = await drawEvent(eventId, ownerId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("Not enough participants for draw");
    });

    it("should create draws for participants", async () => {
        const participants = [
            { _id: new ObjectId().toString(), firstname: "Alice", lastname: "A", email: "a@example.com" },
            { _id: new ObjectId().toString(), firstname: "Bob", lastname: "B", email: "b@example.com" },
            { _id: new ObjectId().toString(), firstname: "Charlie", lastname: "C", email: "c@example.com" },
        ];
        (getEventAccess as any).mockResolvedValue({ guests: participants });
        mockInsertMany.mockResolvedValue({ insertedCount: 3 });

        const result: DrawEventResult = await drawEvent(eventId, ownerId);

        expect(result.error).toBeUndefined();
        expect(result.data).toHaveLength(3);

        // Chaque draw doit avoir uuid, giver et receiver
        result.data?.forEach(d => {
            expect(d.uuid).toBeDefined();
            expect(d.giver).toBeInstanceOf(ObjectId);
            expect(d.receiver).toBeInstanceOf(ObjectId);
            expect(d.eventId).toEqual(eventId);
        });

        expect(mockDb.collection).toHaveBeenCalledWith("draws");
        expect(mockInsertMany).toHaveBeenCalledTimes(1);
    });

    it("should return error if DB insert fails", async () => {
        const participants = [
            { _id: new ObjectId().toString(), firstname: "Alice", lastname: "A", email: "a@example.com" },
            { _id: new ObjectId().toString(), firstname: "Bob", lastname: "B", email: "b@example.com" },
        ];
        (getEventAccess as any).mockResolvedValue({ guests: participants });
        mockInsertMany.mockRejectedValue(new Error("DB exploded"));

        const result: DrawEventResult = await drawEvent(eventId, ownerId);

        expect(result.data).toBeNull();
        expect(result.error).toBe("DB exploded");
    });
});
