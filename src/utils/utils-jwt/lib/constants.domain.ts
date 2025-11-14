import jwt from "jsonwebtoken";

export const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const JWT_OPTIONS: jwt.SignOptions = {
    expiresIn: "7d",
};