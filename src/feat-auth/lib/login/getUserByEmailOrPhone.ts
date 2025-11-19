import { User, UserSchema } from "../user.dto";
import { connectToMongo } from "../../../db/mongo";
import { signJwt } from "../../../utils/utils-jwt/lib";

export type RetrieveUserResult = {
    data: User | { email?: string; phone?: string } | null;
    jwt?: string;
    error?: string;
};

export const getUserByEmailOrPhone = async (
    email?: string,
    phone?: string
): Promise<RetrieveUserResult> => {
    if (!email && !phone) {
        return { data: null, error: "Email or phone is required" };
    }

    try {
        const db = await connectToMongo();

        const query: any = {};
        if (email) query.email = email;
        if (phone) query.phone = phone;

        const rawUser = await db.collection("users").findOne(query);

        if (!rawUser) {
            return { data: { email, phone } };
        }

        const user = UserSchema.parse(rawUser);

        return { data: user, jwt: signJwt(user) };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
