import "dotenv/config";
import express from "express";
import { connectToMongo } from "./db/mongo";
import { userRoutes } from "./feat-auth";
import {wishlistRoutes} from "./feat-wishlist";
import {eventRoutes} from './feat-event';
import {drawRoutes} from "./feat-draw";
import {logMiddleware} from "./utils/utils-log/logMiddleware";

const app = express();
app.use(express.json());

app.use(logMiddleware)

app.get("/", (req, res) => res.send("🚀 API TypeScript ready!"));

app.use("/user", userRoutes)
app.use("/wishlist", wishlistRoutes)
app.use('/event', eventRoutes)
app.use('/draw', drawRoutes)

console.log(process.env.PORT)
const PORT = process.env.PORT || 3000;
export const startServer = async () => {
    try {
        await connectToMongo();
        console.log("✅ Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on ${PORT}`)
        });
    } catch (err) {
        console.error("❌ Impossible de se connecter à MongoDB :", err);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== "test") {
    startServer();
}

export default app
