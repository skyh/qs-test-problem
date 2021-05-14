import {InMemoryStorage} from "./InMemoryStorage";

type TestStorageDocument = string;

describe("InMemoryStorage", () => {
    describe("static create", () => {
        it("should create empty storage", () => {
            const storage = InMemoryStorage.create<TestStorageDocument>();
            expect(storage).toBeInstanceOf(InMemoryStorage);
        });

        it("should create storage from snapshot", () => {
            const storage = InMemoryStorage.create<TestStorageDocument>({
                children: [{
                    document: "child at /0",
                }, {
                    document: "child at /1"
                }]
            });
            expect(storage.root.children).toHaveLength(2);
        });

        it("should create nested items", () => {
            const storage = InMemoryStorage.create<TestStorageDocument>({
                children: [{
                    document: "child at /0",
                    children: [{
                        document: "child at /0/0",
                    }, {
                        document: "child at /0/1",
                        children: [{
                            document: "child at /0/1/0",
                        }],
                    }],
                }],
            });
            expect(storage.queryDocument("/0/1/0")).toEqual("child at /0/1/0");
        });
    });
});
