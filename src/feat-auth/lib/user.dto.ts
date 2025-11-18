import { z } from "zod";
import {ObjectId} from "mongodb";

    export const UserSchema = z.object({
        _id: z.preprocess((val) => {
            if (val instanceof ObjectId) return val.toString();
            if (typeof val === "string") return val;
            return val;
        }, z.string().min(1)),
        firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
        lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
        email: z.string().email("Email invalide"),
    });

export type User = z.infer<typeof UserSchema>;

export const isFullUser = (data: any): data is User => {
    return data && typeof data === "object" && "_id" in data;
};