import {Storage} from "../Storage";

describe("Storage", () => {
    describe("static create", () => {
        it("should create empty storage", () => {
            const storage = Storage.create<string>();
            expect(storage).toBeInstanceOf(Storage);
        });

        it("should create storage from snapshot", () => {
            const storage = Storage.create<string>({
                children: [{
                    document: "child at /0",
                }, {
                    document: "child at /1",
                }],
            });
            expect(storage.root.children).toHaveLength(2);
        });

        it("should create nested items", () => {
            const storage = Storage.create<string>({
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

    describe("applyChanges", () => {
        it("should apply simple change to storage", () => {
            const storage = Storage.create<string>({
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

            storage.applyChanges([{
                handlePath: "/0",
                type: "changed",
                document: "new document at /0",
            }]);

            expect(storage.queryDocument("/0")).toEqual("new document at /0");
        });
    });
});
