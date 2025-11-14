import {User, UserSchema} from "../user.dto";
import {connectToMongo} from "../../../db/mongo";
import {signJwt} from "../../../utils/utils-jwt/lib";

export type RetrieveUserResult = {
    data: User | null;
    jwt ?: string;
    error ?: string;
}

export const getUserByEmail = async (email: string): Promise<RetrieveUserResult> => {
    if (!email) return { data: null, error: "Email is required" };
    try {
        const db = await connectToMongo();
        const rawUser = await db.collection("users").findOne({ email });
        if (!rawUser) return { data: null };
        const user = UserSchema.parse(rawUser);
        return { data: user, jwt : signJwt(user)};
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
}