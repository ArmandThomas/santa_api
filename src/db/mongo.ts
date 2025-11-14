import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri);

let db: Db | null = null;

export const connectToMongo = async (): Promise<Db> => {
    if (!db) {
        await client.connect();
        db = client.db("santa_api");
        console.log("✅ Connected to MongoDB");
    }
    return db;
};
