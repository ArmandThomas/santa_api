import { Router, Response } from "express";
import { AuthenticatedRequest, authMiddleware } from "../../feat-auth";
import { drawEvent, DrawEventResult } from "../lib/draw/drawEvent"
import { checkEventOwner } from "../../feat-event/middleware/isOwner.middleware"

const router = Router();

router.get(
    "/:id",
    authMiddleware,
    checkEventOwner,
    async (req: AuthenticatedRequest, res: Response<DrawEventResult>) => {
        const eventId = req.params.id;
        const ownerId = req.userId;

        if (!ownerId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        try {
            const result: DrawEventResult = await drawEvent(eventId, ownerId);

            if (result.error) {
                return res.status(400).json(result);
            }

            res.json(result);
        } catch (err: any) {
            res.status(500).json({ data: null, error: err?.message || "Unknown error" });
        }
    }
);

export default router;
