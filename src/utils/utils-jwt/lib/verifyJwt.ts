import jwt from "jsonwebtoken";
import {JWT_SECRET} from "./constants.domain";
import {Payload} from "./type";

export const verifyJwt = (token: string): Payload | null => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") return null;
        return decoded as Payload;
    } catch (err) {
        return null;
    }
};