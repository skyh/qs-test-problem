import {MissingNode, StoragePartialView} from "./StoragePartialView";

type TestDocument = string;

describe("StoragePartialView", () => {
    let storage: StoragePartialView<TestDocument>;

    beforeEach(() => {
        storage = StoragePartialView.create<TestDocument>();
    });

    describe("create", () => {
        it("should create storage instance", () => {
            expect(StoragePartialView.create()).toBeInstanceOf(StoragePartialView);
        });
    });

    describe("addHandle", () => {
        it("should add root child handle to root", () => {
            const handle = {
                path: "/0",
                document: "document at /0",
            };

            storage.addHandle(handle);

            expect(storage.root.children[0]).toHaveProperty("handle", handle);
        });

        it("should keep original handles order", () => {
            const handles = [{
                path: "/0",
                document: "document at /0",
            }, {
                path: "/4",
                document: "document at /4",
            }, {
                path: "/12",
                document: "document at /12",
            }];

            // adding in unsorted order
            storage.addHandle(handles[1]);
            storage.addHandle(handles[0]);
            storage.addHandle(handles[2]);

            expect(storage.root.children).toHaveLength(3);

            // expect order to be restored
            expect(storage.root.children[0]).toHaveProperty("handle", handles[0]);
            expect(storage.root.children[1]).toHaveProperty("handle", handles[1]);
            expect(storage.root.children[2]).toHaveProperty("handle", handles[2]);
        });

        it("should replace existing node with new value", () => {
            const handles = [{
                path: "/0",
                document: "old document",
            }, {
                path: "/0",
                document: "new document",
            }];

            storage.addHandle(handles[0]);
            storage.addHandle(handles[1]);

            expect(storage.root.children[0]).toHaveProperty("handle.document", "new document");
        });

        it("should create MissingNode instances for missing parents", () => {
            const handles = [{
                path: "/0/0/0",
                document: "document at /0/0/0",
            }, {
                path: "/0/0/1",
                document: "document at /0/0/1",
            }];

            storage.addHandle(handles[0]);
            storage.addHandle(handles[1]);
            expect(storage.root.children[0]).toBeInstanceOf(MissingNode);
            expect(storage.root.children[0].children[0]).toBeInstanceOf(MissingNode);

            expect(storage.root.children[0].children[0].children[0]).toHaveProperty("handle", handles[0]);
            expect(storage.root.children[0].children[0].children[1]).toHaveProperty("handle", handles[1]);
        });
    });

    describe("getChanges", () => {
        it("should return empty array if no changes were made", () => {
            const handles = [{
                path: "/0/0/0",
                document: "document at /0/0/0",
            }, {
                path: "/0/0/1",
                document: "document at /0/0/1",
            }];

            storage.addHandle(handles[0]);
            storage.addHandle(handles[1]);

            expect(storage.getChanges()).toEqual([]);
        });

        it("should include changes of all changed nodes", () => {
            const handles = [{
                path: "/0/0/0",
                document: "document at /0/0/0",
            }, {
                path: "/0/0/1",
                document: "document at /0/0/1",
            }];

            const node0 = storage.addHandle(handles[0]);
            const node1 = storage.addHandle(handles[1]);

            node0.setEditedDocument("edited document at /0/0/0");
            node1.setEditedDocument("edited document at /0/0/1");

            expect(storage.getChanges()).toEqual([
                {handlePath: "/0/0/0", document: "edited document at /0/0/0"},
                {handlePath: "/0/0/1", document: "edited document at /0/0/1"},
            ]);
        });
    });
});

describe("regress", () => {
    test("no mis-inserting", () => {
        const storage = StoragePartialView.create<string>();

        const handles = [{
            path: "/0/1/1",
            document: "Cylinder head",
        }, {
            path: "/0/0/1",
            document: "Doors",
        }];

        for (const handle of handles) {
            storage.addHandle(handle);
        }

        expect(storage.queryDocument("/0/1/1")).toEqual("Cylinder head");
        expect(storage.queryDocument("/0/0/1")).toEqual("Doors");

        expect(storage.root.children[0].children[0].children[0]).toHaveProperty("handle.document", "Doors");
        expect(storage.root.children[0].children[1].children[0]).toHaveProperty("handle.document", "Cylinder head");
    });
});

