import { connectToMongo } from "../../../db/mongo";
import {UserSchema, User, isFullUser} from "../user.dto"
import { UserCreate, UserCreateSchema } from './type'
import {signJwt} from "../../../utils/utils-jwt/lib";
import {getUserByEmailOrPhone} from "../login/getUserByEmailOrPhone";

export type RegisterUserResult = {
    data: User | null;
    error: string;
    jwt ?: string;
}

export const registerUser = async (
    userData: UserCreate
): Promise<RegisterUserResult> => {
    const parsedData = UserCreateSchema.safeParse(userData);
    if (!parsedData.success) {
        return { data: null, error: "Invalid data" };
    }
    try {
        const db = await connectToMongo();

        const existing = await getUserByEmailOrPhone(userData.email, userData.phone);
        if (isFullUser(existing.data)) {
            return { data: null, error: "User with this email/phone already exists" };
        }
        const result = await db.collection("users").insertOne(userData);
        const newUser: User = UserSchema.parse({ _id: result.insertedId.toString(), ...userData });
        return { data: newUser, error: "", jwt: signJwt(newUser) };
    } catch (err: any) {
        return { data: null, error: err?.message || "Unknown error" };
    }
};
