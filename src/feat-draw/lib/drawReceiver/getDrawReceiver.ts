// src/feat-draw/lib/getDrawReceiver.ts
import { connectToMongo } from "../../../db/mongo";
import { ObjectId } from "mongodb";

export type GetDrawReceiverResult = {
    data: ObjectId | null;
    error?: string;
};

export const getDrawReceiver = async (
    uuid: string,
    userId: string | ObjectId
): Promise<GetDrawReceiverResult> => {
    if (!uuid) return { data: null, error: "UUID is required" };
    if (!userId) return { data: null, error: "UserId is required" };

    let userObjectId: ObjectId;

    try {
        userObjectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    } catch {
        return { data: null, error: "Invalid UserId" };
    }

    try {
        const db = await connectToMongo();

        const draw = await db.collection("draws").findOne({
            uuid,
            giver: userObjectId,
        });

        if (!draw) {
            return { data: null, error: "Draw not found or access denied" };
        }
        return { data: draw.receiver };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
