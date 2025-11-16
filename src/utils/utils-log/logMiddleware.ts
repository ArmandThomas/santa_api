// logMiddleware.ts
import { Request, Response, NextFunction } from "express";

export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    console.log(`➡️  ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length) {
        console.log("Body:", JSON.stringify(req.body));
    }

    // Hook sur res.send pour logger la réponse
    const originalSend = res.send.bind(res);
    res.send = (body?: any) => {
        const duration = Date.now() - start;
        console.log(`⬅️  ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
        console.log("Response:", body);
        return originalSend(body);
    };

    next();
};
