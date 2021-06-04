import {Storage} from "../Storage";

describe("DocumentNode", () => {
    describe("path", () => {
        it("should return node's path in the tree", () => {
            const storage = Storage.create<string>({
                children: [{
                    document: "child at /0",
                    children: [{
                        document: "child at /0/0",
                        children: [{
                            document: "child at /0/0/0",
                        }, {
                            document: "child at /0/0/1",
                        }],
                    }, {
                        document: "child at /0/1",
                    }],
                }],
            });

            expect(storage.root.children[0].children[0].children[1].path.segments).toEqual([0, 0, 1]);
        });
    });
});
