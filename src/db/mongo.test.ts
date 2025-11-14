import { describe, it, expect, vi, beforeEach } from "vitest";
import { connectToMongo } from "./mongo";

vi.mock("mongodb", () => {
    const connect = vi.fn();
    const db = vi.fn(() => ({ name: "fakeDb" }));

    class MongoClientMock {
        uri: string;
        constructor(uri: string) {
            this.uri = uri;
        }
        connect = connect;
        db = db;
    }

    return { MongoClient: MongoClientMock };
});

describe("connectToMongo", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("should connect to MongoDB only once", async () => {
        const db1 = await connectToMongo();
        const db2 = await connectToMongo();

        expect(db1).toBe(db2);
    });
});
