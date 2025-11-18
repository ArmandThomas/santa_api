import { Router, Response } from "express";
import { addWishlistItem, AddWishlistItemResult, getWishlistItemsByUser, GetWishlistItemsResult } from '../index';
import { AuthenticatedRequest, authMiddleware } from "../../feat-auth";
import {deleteWishlistItem, DeleteWishlistItemResult} from "../lib/delete/deleteWishlistItem";
import {findWishlistByUuidDraw, FindWishlistByUuidDrawResult} from "../lib/find/findWishlistByUuidDraw";
import {updateStatus} from "../lib/update/updateStatus";

const router = Router();

router.post(
    "/add",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<AddWishlistItemResult>) => {
        const userId = req.userId;
        const itemData = req.body;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        const result = await addWishlistItem(userId, itemData);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/list",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<GetWishlistItemsResult>) => {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        const result = await getWishlistItemsByUser(userId, true);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.delete(
    "/delete/:id",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<DeleteWishlistItemResult>) => {
        const userId = req.userId;
        const itemId = req.params.id;

        if (!userId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        if (!itemId) {
            return res.status(400).json({ data: null, error: "ItemId is required" });
        }

        const result = await deleteWishlistItem(userId, itemId);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);

router.get(
    "/draw/:uuid",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response<FindWishlistByUuidDrawResult>) => {
        const giverId = req.userId;
        const uuidDraw = req.params.uuid;

        if (!giverId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }

        if (!uuidDraw) {
            return res.status(400).json({ data: null, error: "UUID Draw is required" });
        }

        const result = await findWishlistByUuidDraw(uuidDraw, giverId);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);



router.patch(
    "/update/:uuid/:itemId",
    authMiddleware,
    async (req: AuthenticatedRequest, res: Response) => {
        const giverId = req.userId;

        if (!giverId) {
            return res.status(401).json({ data: null, error: "Unauthorized" });
        }
        const { uuid, itemId } = req.params;
        const { status } = req.body;

        const result = await updateStatus(uuid, giverId, itemId, status);

        if (result.error) {
            return res.status(400).json(result);
        }

        res.json(result);
    }
);


export default router;
