import {User, UserSchema} from "../user.dto";

export type UserCreate = Omit<User, "_id">;

export const UserCreateSchema = UserSchema.omit({ _id: true });