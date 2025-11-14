// src/feat-events/middleware/checkEventOwner.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { checkEventOwner } from "./isOwner.middleware";
import { connectToMongo } from "../../db/mongo"
import { ObjectId } from "mongodb";

vi.mock("../../db/mongo", () => ({
    connectToMongo: vi.fn(),
}));

describe("checkEventOwner middleware", () => {
    const mockFindOne = vi.fn();
    const mockDb = {
        collection: vi.fn(() => ({
            findOne: mockFindOne,
        })),
    };

    const next = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (connectToMongo as any).mockResolvedValue(mockDb);
    });

    const mockResponse = () => {
        const res: any = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    it("should return 400 if userId or eventId is missing", async () => {
        const req: any = { params: {}, userId: null };
        const res = mockResponse();

        await checkEventOwner(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "EventId and userId are required" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 400 if ObjectId is invalid", async () => {
        const req: any = { params: { id: "invalid" }, userId: "invalid" };
        const res = mockResponse();

        await checkEventOwner(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid ObjectId" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 404 if event not found", async () => {
        const req: any = { params: { id: new ObjectId().toString() }, userId: new ObjectId().toString() };
        const res = mockResponse();

        mockFindOne.mockResolvedValue(null);

        await checkEventOwner(req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: "Event not found" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 if user is not the owner", async () => {
        const ownerId = new ObjectId();
        const userId = new ObjectId();

        const req: any = { params: { id: new ObjectId().toString() }, userId: userId.toString() };
        const res = mockResponse();

        const mockEvent = {
            _id: new ObjectId(),
            ownerId,
            name: "Event",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage : null,
            guests: [],
        };

        mockFindOne.mockResolvedValue(mockEvent);

        await checkEventOwner(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: "User is not the owner" });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next if user is the owner", async () => {
        const ownerId = new ObjectId();

        const req: any = { params: { id: new ObjectId().toString() }, userId: ownerId.toString() };
        const res = mockResponse();

        const mockEvent = {
            _id: new ObjectId(),
            ownerId,
            name: "Event",
            eventDate: new Date().toISOString(),
            drawDate: new Date().toISOString(),
            backgroundImage : null,
            guests: [],
        };

        mockFindOne.mockResolvedValue(mockEvent);

        await checkEventOwner(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    it("should return 500 if DB throws", async () => {
        const ownerId = new ObjectId();
        const req: any = { params: { id: new ObjectId().toString() }, userId: ownerId.toString() };
        const res = mockResponse();

        mockFindOne.mockRejectedValue(new Error("DB exploded"));

        await checkEventOwner(req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "DB exploded" });
        expect(next).not.toHaveBeenCalled();
    });
});
