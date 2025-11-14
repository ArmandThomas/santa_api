// src/feat-events/lib/removeUserFromEvent.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { removeUserFromEvent, RemoveUserResult } from "./removeUserFromEvent";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { Event } from "../event.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("removeUserFromEvent", () => {
    const mockFindOne = vi.fn();
    const mockUpdateOne = vi.fn();

    const mockDb = {
        collection: vi.fn(() => ({
            findOne: mockFindOne,
            updateOne: mockUpdateOne,
        })),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if eventId is missing", async () => {
        const result = await removeUserFromEvent("" as any, new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("EventId is required");
    });

    it("should return error if userId is missing", async () => {
        const result = await removeUserFromEvent(new ObjectId(), "" as any);
        expect(result.data).toBeNull();
        expect(result.error).toBe("UserId is required");
    });

    it("should return error if event not found", async () => {
        mockFindOne.mockResolvedValue(null);
        const result = await removeUserFromEvent(new ObjectId(), new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("Event not found");
    });

    it("should return error if user is not a guest", async () => {
        const eventId = new ObjectId();
        const userId = new ObjectId();
        const ownerId = new ObjectId();

        mockFindOne.mockResolvedValue({
            _id: eventId,
            ownerId,
            name: "Xmas Party",
            backgroundImage: null,
            eventDate: new Date().toISOString(),
            guests: [ownerId],
        });

        const result = await removeUserFromEvent(eventId, userId);
        expect(result.data).toBeNull();
        expect(result.error).toBe("User is not a guest");
    });

    it("should remove a user from guests successfully", async () => {
        const eventId = new ObjectId();
        const ownerId = new ObjectId();
        const guestId = new ObjectId();

        const rawEvent = {
            _id: eventId,
            ownerId,
            name: "Xmas Party",
            backgroundImage: "https://domain.com/link.png",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            guests: [ownerId, guestId],
        };

        mockFindOne.mockResolvedValue(rawEvent);
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

        const result: RemoveUserResult = await removeUserFromEvent(eventId, guestId);

        expect(mockDb.collection).toHaveBeenCalledWith("events");
        expect(mockUpdateOne).toHaveBeenCalledWith(
            { _id: eventId },
            { $set: { guests: [ownerId] } }
        );

        expect(result.data?.guests.length).toBe(1);
        expect(result.data?.guests[0]).toEqual(ownerId);
        expect(result.data?.name).toBe("Xmas Party");
    });

    it("should return error if DB throws", async () => {
        mockFindOne.mockRejectedValue(new Error("DB exploded"));
        const result = await removeUserFromEvent(new ObjectId(), new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("DB exploded");
    });
});
