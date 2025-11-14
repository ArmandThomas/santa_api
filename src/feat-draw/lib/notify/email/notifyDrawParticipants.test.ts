// src/feat-events/lib/notifyDrawParticipants.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { notifyDrawParticipants } from "./notifyDrawParticipants";
import { getUserInfo, User } from "../../../../feat-auth";
import { sendMail } from "../../../../utils/utils-email";
import { ObjectId } from "mongodb";
import { Draw } from "../../draw.dto";
import {an} from "vitest/dist/chunks/reporters.d.Da1D1VbQ";


vi.mock("../../../../feat-auth", () => ({
    getUserInfo: vi.fn(),
}));

vi.mock("../../../../utils/utils-email", () => ({
    sendMail: vi.fn(),
}));

describe("notifyDrawParticipants", () => {
    const mockedGetUserInfo = vi.mocked(getUserInfo);
    const mockedSendMail = vi.mocked(sendMail);

    const senderEmail = "contact@santa-family.fr";

    const giverId = new ObjectId();
    const receiverId = new ObjectId();

    const draw: Draw = {
        _id: new ObjectId(),
        eventId: new ObjectId(),
        giver: giverId,
        receiver: receiverId,
        uuid: "123e4567-e89b-12d3-a456-426614174000",
    };

    const giver: User = {
        _id: giverId.toString(),
        firstname: "Alice",
        lastname: "Dupont",
        email: "alice@example.com",
    };

    const receiver: User = {
        _id: receiverId.toString(),
        firstname: "Bob",
        lastname: "Martin",
        email: "bob@example.com",
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should send emails to all draws when giver and receiver exist", async () => {
        mockedGetUserInfo.mockImplementation(async (id) => {
            const objId = typeof id === 'string' ? new ObjectId(id) : id
            if (objId.equals(giverId)) return { data: giver };
            if (objId.equals(receiverId)) return { data: receiver };
            return { data: null };
        });

        await notifyDrawParticipants([draw], {} as any);

        expect(mockedSendMail).toHaveBeenCalledTimes(1);
        expect(mockedSendMail).toHaveBeenCalledWith(senderEmail, giver.email, receiver, {},  draw);
    });

    it("should skip draws if receiver not found", async () => {
        mockedGetUserInfo.mockImplementation(async (id) => {
            const objId = typeof id === 'string' ? new ObjectId(id) : id
            if (objId.equals(giverId)) return { data: giver };
            return { data: null }; // receiver not found
        });

        await notifyDrawParticipants([draw], {} as any);

        expect(mockedSendMail).not.toHaveBeenCalled();
    });

    it("should skip draws if giver not found", async () => {
        mockedGetUserInfo.mockImplementation(async (id) => {
            const objId = typeof id === 'string' ? new ObjectId(id) : id
            if (objId.equals(receiverId)) return { data: receiver };
            return { data: null }; // giver not found
        });

        await notifyDrawParticipants([draw],{} as any);

        expect(mockedSendMail).not.toHaveBeenCalled();
    });

    it("should continue notifying even if one draw fails", async () => {
        const anotherDraw: Draw = {
            ...draw,
            _id: new ObjectId(),
            giver: new ObjectId(),
            receiver: new ObjectId(),
            uuid: "223e4567-e89b-12d3-a456-426614174111",
        };

        mockedGetUserInfo.mockResolvedValue({ data: giver });
        mockedSendMail.mockRejectedValueOnce(new Error("Mail failed"));

        await notifyDrawParticipants([draw, anotherDraw], {} as any);

        // Should try sending both
        expect(mockedSendMail).toHaveBeenCalledTimes(2);
    });
});
