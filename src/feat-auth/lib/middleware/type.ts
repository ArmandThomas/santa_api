import { Request } from "express";

export type AuthenticatedRequest<B = any> = Request & {
    userId?: string;
    body: B;
};