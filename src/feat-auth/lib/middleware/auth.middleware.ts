import { Response, NextFunction } from "express";
import { verifyJwt } from "../../../utils/utils-jwt/lib/verifyJwt";
import { AuthenticatedRequest } from "./type";

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing or invalid Authorization header" });
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyJwt(token);

        if (!payload?._id) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.userId = payload._id;

        next();
    } catch (err: any) {
        console.error("JWT verification error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
};
