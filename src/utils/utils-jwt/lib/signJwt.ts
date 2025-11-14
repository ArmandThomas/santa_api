import {JWT_OPTIONS, JWT_SECRET} from "./constants.domain";
import jwt from "jsonwebtoken";

export const signJwt = (payload: object): string => {
    return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
};