import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddleware } from "./auth.middleware";
import { AuthenticatedRequest } from "./type";
import { Response, NextFunction } from "express";
import * as jwtUtils from "../../../utils/utils-jwt/lib/verifyJwt";
import {Payload} from "../../../utils/utils-jwt/lib/type";

describe("authMiddleware", () => {
    let req: Partial<AuthenticatedRequest>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn(),
        };
        next = vi.fn();
        vi.restoreAllMocks();
    });

    it("should return 401 if Authorization header is missing", () => {
        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing or invalid Authorization header" });
    });

    it("should return 401 if Authorization header is invalid", () => {
        req.headers = { authorization: "InvalidToken" };
        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Missing or invalid Authorization header" });
    });

    it("should return 401 if JWT is invalid", () => {
        req.headers = { authorization: "Bearer invalidtoken" };
        vi.spyOn(jwtUtils, "verifyJwt").mockReturnValueOnce(null);

        authMiddleware(req as AuthenticatedRequest, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    });

    it("should call next() and set req.userId if JWT is valid", () => {
        const payload = { _id: "123" };
        req.headers = { authorization: "Bearer validtoken" };
        vi.spyOn(jwtUtils, "verifyJwt").mockReturnValueOnce(payload as Payload);

        authMiddleware(req as AuthenticatedRequest, res as Response, next);

        expect(req.userId).toBe(payload._id);
        expect(next).toHaveBeenCalled();
    });
});
