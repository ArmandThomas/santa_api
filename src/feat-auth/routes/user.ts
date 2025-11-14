import { Router, Request, Response } from "express";
import {
    AuthenticatedRequest,
    getUserByEmail,
    getUserInfo,
    GetUserInfoResult,
    registerUser,
    RegisterUserResult,
    type RetrieveUserResult
} from '../index'

import {authMiddleware} from "../lib/middleware/auth.middleware";
import {UserCreate} from "../lib/register/type";

const router = Router();

interface UserQuery {
    email: string;
}

router.get(
    "/mail",
    async (
        req: Request<UserQuery, any, any, UserQuery>,
        res: Response<RetrieveUserResult>
    ) => {
        const { email } = req.query;

        const result = await getUserByEmail(email);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.post(
    "/register",
    async (
        req: Request<any, any, UserCreate>,
        res: Response<RegisterUserResult>
    ) => {
        const userData = req.body;

        const result = await registerUser(userData);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/me",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<GetUserInfoResult>) => {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        const result = await getUserInfo(userId);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

export default router;