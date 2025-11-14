import { describe, it, expect, vi, beforeEach } from "vitest";
import { joinUserToEvent, JoinUserResult } from "./joinUserToEvent";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";
import { Event } from "../event.dto";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("joinUserToEvent", () => {
    const mockFindOne = vi.fn();
    const mockUpdateOne = vi.fn();

    const mockDb = {
        collection: vi.fn().mockReturnValue({
            findOne: mockFindOne,
            updateOne: mockUpdateOne,
        }),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if eventId is missing", async () => {
        const result: JoinUserResult = await joinUserToEvent("" as any, new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("EventId is required");
    });

    it("should return error if userId is missing", async () => {
        const result: JoinUserResult = await joinUserToEvent(new ObjectId(), "" as any);
        expect(result.data).toBeNull();
        expect(result.error).toBe("UserId is required");
    });

    it("should return error if event not found", async () => {
        mockFindOne.mockResolvedValue(null);
        const result: JoinUserResult = await joinUserToEvent(new ObjectId(), new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("Event not found");
    });

    it("should add user to guests if not already joined", async () => {
        const eventId = new ObjectId();
        const userId = new ObjectId();
        const rawEvent = {
            _id: eventId,
            name: "Xmas",
            ownerId: new ObjectId(),
            guests: [],
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage: null,
        };

        mockFindOne.mockResolvedValue(rawEvent);
        mockUpdateOne.mockResolvedValue({ modifiedCount: 1 });

        const result = await joinUserToEvent(eventId, userId);

        expect(mockDb.collection).toHaveBeenCalledWith("events");
        expect(mockFindOne).toHaveBeenCalledWith({ _id: eventId });
        expect(mockUpdateOne).toHaveBeenCalledWith(
            { _id: eventId },
            { $set: { guests: [userId] } }
        );
        expect(result.data?.guests).toContainEqual(userId);
    });

    it("should not add user if already in guests", async () => {
        const eventId = new ObjectId();
        const userId = new ObjectId();
        const rawEvent = {
            _id: eventId,
            name: "Xmas",
            ownerId: new ObjectId(),
            guests: [userId],
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage: null,
        };

        mockFindOne.mockResolvedValue(rawEvent);

        const result = await joinUserToEvent(eventId, userId);

        expect(mockUpdateOne).not.toHaveBeenCalled();
        expect(result.data?.guests).toContainEqual(userId);
    });

    it("should return error if DB throws", async () => {
        mockFindOne.mockRejectedValue(new Error("DB exploded"));
        const result = await joinUserToEvent(new ObjectId(), new ObjectId());
        expect(result.data).toBeNull();
        expect(result.error).toBe("DB exploded");
    });
});
