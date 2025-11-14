import {describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import { getEventAccess, EventAccessResult } from "./getEventAccess";
import { connectToMongo } from "../../../db/mongo";
import { getUserInfo } from "../../../feat-auth/lib/me/getUserInfo"
import { User } from '../../../feat-auth'
import { ObjectId } from "mongodb";

vi.mock("../../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

vi.mock("../../../feat-auth/lib/me/getUserInfo", () => ({
    getUserInfo: vi.fn(),
}));

describe("getEventAccess", () => {
    const mockFindOne = vi.fn();
    const mockedGetUserInfo = vi.mocked(getUserInfo)

    const mockDb = {
        collection: vi.fn(() => ({
            findOne: mockFindOne,
        })),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    it("should return error if userId is missing", async () => {
        const result = await getEventAccess("" as any, new ObjectId());
        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(false);
        expect(result.error).toBe("UserId is required");
    });

    it("should return error if eventId is missing", async () => {
        const result = await getEventAccess(new ObjectId(), "" as any);
        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(false);
        expect(result.error).toBe("EventId is required");
    });

    it("should return error if event not found", async () => {
        mockFindOne.mockResolvedValue(null);
        const result = await getEventAccess(new ObjectId(), new ObjectId());
        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(false);
        expect(result.error).toBe("Event not found");
    });

    it("should return owner info with guests", async () => {
        const ownerId = new ObjectId();
        const mockEvent = {
            _id: new ObjectId(),
            ownerId,
            name: "Xmas Party",
            backgroundImage: null,
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            guests: [ownerId],
        };
        mockFindOne.mockResolvedValue(mockEvent);

        const mockUser: User = {
            _id: ownerId.toString(),
            firstname: "Alice",
            lastname: "Dupont",
            email: "alice@example.com",
        };

        mockedGetUserInfo.mockResolvedValueOnce({data : mockUser})

        const result: EventAccessResult = await getEventAccess(ownerId, mockEvent._id);

        expect(result.isOwner).toBe(true);
        expect(result.isGuest).toBe(true);
        expect(result.guests?.length).toBe(1);
        expect(result.name).toBe("Xmas Party");
    });

    it("should return guest info without owner", async () => {
        const ownerId = new ObjectId();
        const guestId = new ObjectId();
        const mockEvent = {
            _id: new ObjectId(),
            ownerId,
            name: "Xmas Party",
            backgroundImage: null,
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            guests: [guestId],
        };

        mockFindOne.mockResolvedValue(mockEvent);

        const mockUser: User = {
            _id: ownerId.toString(),
            firstname: "Alice",
            lastname: "Dupont",
            email: "alice@example.com",
        };


        mockedGetUserInfo.mockResolvedValueOnce({data : mockUser})

        const result: EventAccessResult = await getEventAccess(guestId, mockEvent._id);

        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(true);
        expect(result.guests?.length).toBe(1);
        expect(result.guests?.[0].firstname).toBe("Alice");
    });

    it("should return only isOwner/isGuest false if user not related", async () => {
        const ownerId = new ObjectId();
        const unrelatedId = new ObjectId();
        const mockEvent = {
            _id: new ObjectId(),
            ownerId,
            name: "Xmas Party",
            backgroundImage: null,
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            guests: [],
        };
        mockFindOne.mockResolvedValue(mockEvent);

        const result: EventAccessResult = await getEventAccess(unrelatedId, mockEvent._id);

        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(false);
        expect(result.guests).toBeUndefined();
    });

    it("should return error if DB throws", async () => {
        mockFindOne.mockRejectedValue(new Error("DB exploded"));
        const result = await getEventAccess(new ObjectId(), new ObjectId());
        expect(result.isOwner).toBe(false);
        expect(result.isGuest).toBe(false);
        expect(result.error).toBe("DB exploded");
    });
});
