// src/feat-auth/lib/getUserInfo.ts
import { connectToMongo } from "../../../db/mongo";
import { UserSchema, User } from "../user.dto";
import { ObjectId } from "mongodb";

export type GetUserInfoResult = {
    data: User | null;
    error?: string;
};

export const getUserInfo = async (userId: string | ObjectId): Promise<GetUserInfoResult> => {
    if (!userId) return { data: null, error: "UserId is required" };

    let objectId: ObjectId;
    try {
        objectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    } catch {
        return { data: null, error: "Invalid UserId" };
    }

    try {
        const db = await connectToMongo();

        const rawUser = await db.collection("users").findOne({ _id: objectId });

        if (!rawUser) return { data: null, error: "User not found" };

        const user: User = UserSchema.parse(rawUser);
        return { data: user };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
