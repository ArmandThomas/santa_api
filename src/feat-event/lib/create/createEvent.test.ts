import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEvent } from "./createEvent";
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

const mockInsertOne = vi.fn();

const mockDb = {
    collection: vi.fn().mockReturnValue({
        insertOne: mockInsertOne
    })
};

describe("createEvent", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if userId is missing", async () => {
        const result = await createEvent("" as any, {
            name: "Christmas",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            ownerId: new ObjectId(),
            backgroundImage: null
        });

        expect(result).toEqual({
            data: null,
            error: "OwnerId is required"
        });
    });

    it("should return error if ownerId is invalid ObjectId", async () => {
        const result = await createEvent("INVALID_ID", {
            name: "Christmas",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            ownerId: new ObjectId(),
            backgroundImage: null
        });

        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid OwnerId");
    });

    it("should return error if eventData is invalid", async () => {
        const result = await createEvent(new ObjectId(), {
            name: "",
            eventDate: "",
            drawDate: "",
            ownerId: new ObjectId(),
            backgroundImage: null
        });

        expect(result.data).toBeNull();
        expect(result.error).toBe("Invalid data");
    });

    it("should return error if DB throws", async () => {
        mockInsertOne.mockRejectedValue(new Error("DB exploded"));

        const result = await createEvent(new ObjectId(), {
            name: "Xmas",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage: "link.png",
            ownerId: new ObjectId()
        });

        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
    });

    it("should create event with owner as guest", async () => {
        const ownerId = new ObjectId();
        const eventData = {
            name: "Xmas Party",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage: null,
            ownerId
        };

        const insertedId = new ObjectId();
        mockInsertOne.mockResolvedValue({ insertedId });

        const result = await createEvent(ownerId, eventData);

        expect(mockDb.collection).toHaveBeenCalledWith("events");
        expect(mockInsertOne).toHaveBeenCalledWith({
            ...eventData,
            ownerId,
            guests: [ownerId],
        });

        expect(result.data?._id).toEqual(insertedId);
        expect(result.data?.ownerId).toEqual(ownerId);
        expect(result.data?.guests).toEqual([ownerId]);
    });
});
