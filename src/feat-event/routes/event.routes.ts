// src/feat-events/routes/event.routes.ts
import { Router, Response } from "express";
import {createEvent, CreateEventResult, JoinUserResult, joinUserToEvent, listEvents, ListEventsResult} from "../index";
import {AuthenticatedRequest, authMiddleware, RetrieveUserResult} from "../../feat-auth";
import {EventAccessResult, getEventAccess} from "../lib/access/getEventAccess";
import {checkEventOwner} from "../middleware/isOwner.middleware";
import {removeUserFromEvent, RemoveUserResult} from "../lib/remove/removeUserFromEvent";
import {isFullUser} from "../../feat-auth/lib/user.dto";
import {getUserByEmailOrPhone} from "../../feat-auth/lib/login/getUserByEmailOrPhone";

const router = Router();
type InviteBody = {
    email: string;
}


router.post(
    "/create",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<CreateEventResult>) => {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        const result = await createEvent(userId, req.body);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/list",
    async (_req, res: Response<ListEventsResult>) => {
        const result = await listEvents();

        if (result.error) {
            return res.status(500).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/:id",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<EventAccessResult>) => {
        const userId = req.userId;
        const eventId = req.params.id;

        if (!userId) {
            return res.status(401).json({ isOwner: false, isGuest: false, error: "Unauthorized" });
        }

        const result = await getEventAccess(userId, eventId);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/join/:id",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<JoinUserResult>) => {
        const userId = req.userId;
        const eventId = req.params.id;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        try {
            const result = await joinUserToEvent(eventId, userId);

            if (result.error) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (err: any) {
            res.status(500).json({ data: null, error: err?.message || "Unknown error" });
        }
    }
);

router.post(
    "/invite/:id",
    authMiddleware,
    checkEventOwner,
    async (
        req: AuthenticatedRequest<InviteBody>,
        res: Response<JoinUserResult>
    ) => {
        const eventId = req.params.id;
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ data: null, error: "Email or phone is required" });
        }

        try {
            const userResult: RetrieveUserResult = await getUserByEmailOrPhone(email, phone);

            if (!isFullUser(userResult.data)) {
                return res.status(404).json({ data: null, error: "User not found" });
            }

            const userId = userResult.data._id;

            const joinResult: JoinUserResult = await joinUserToEvent(eventId, userId);

            if (joinResult.error) {
                return res.status(400).json(joinResult);
            }

            res.json(joinResult);
        } catch (err: any) {
            res.status(500).json({ data: null, error: err?.message || "Unknown error" });
        }
    }
);

router.post(
    "/remove/:id",
    authMiddleware,
    checkEventOwner,
    async (
        req: AuthenticatedRequest<InviteBody>,
        res: Response<RemoveUserResult>
    ) => {
        const eventId = req.params.id;
        const { email, phone } = req.body;

        if (!email && !phone) {
            return res.status(400).json({ data: null, error: "Email or phone is required" });
        }

        try {
            const userResult = await getUserByEmailOrPhone(email, phone);

            if (!isFullUser(userResult.data)) {
                return res.status(404).json({ data: null, error: "User not found" });
            }

            const userId = userResult.data._id;

            const removeResult = await removeUserFromEvent(eventId, userId);

            if (removeResult.error) {
                return res.status(400).json(removeResult);
            }

            res.json(removeResult);
        } catch (err: any) {
            res.status(500).json({ data: null, error: err?.message || "Unknown error" });
        }
    }
);


export default router;
