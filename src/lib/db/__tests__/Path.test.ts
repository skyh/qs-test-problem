import {Path} from "../Path";

describe("Path", () => {
    describe("static create()", () => {
        it("should create sample path", () => {
            expect(Path.create("/0/0/0/1").segments).toEqual([0, 0, 0, 1]);
        });

        it("should throw error if path contains non-digits", () => {
            expect(() => {
                Path.create("/a/b/c");
            }).toThrow()
        });

        it("should throw if encoded path starts not from /", () => {
            expect(() => {
                Path.create("0/1/2");
            }).toThrow()
        });

        it("should create empty path", () => {
            expect(Path.create("/").segments).toEqual([]);
        });
    });

    describe("serialize", () => {
        it("should serialize empty path", () => {
            const path = Path.create();
            expect(path.serialize()).toEqual("/");
        });

        it("should encode sample path", () => {
            const path = Path.create([5, 4, 3]);
            expect(path.serialize()).toEqual("/5/4/3");
        });
    });

    describe("getParent", () => {
        it("should throw for root path", () => {
            const path = Path.create("/");
            expect(() => {
                path.getParent();
            }).toThrow();
        });

        it("should return parent path for /0", () => {
            const path = Path.create("/0");
            expect(path.getParent().serialize()).toEqual("/");
        });

        it("should return parent for N-level path", () => {
            const path = Path.create("/0/1/45");
            expect(path.getParent().serialize()).toEqual("/0/1");
        });
    });

    describe("getLeafKey", () => {
        it("should throw for root path", () => {
            const path = Path.create("/");
            expect(() => {
                path.lastSegment();
            }).toThrow();
        });

        it("should return own key", () => {
            const path = Path.create("/0/12/32/343/42");
            expect(path.lastSegment()).toEqual(42);
        });
    });

    describe("relativeTo", () => {
        it("should return relative path", () => {
            const parent = Path.create("/0/0/1");
            const child = Path.create("/0/0/1/2/3/4");
            expect(child.relativeTo(parent).serialize()).toEqual("/2/3/4");
        });

        it("should throw an error if parts are not nested", () => {
            const parent = Path.create("/0/0/1");
            const child = Path.create("/0/0/2/3/4");
            expect(() => {
                child.relativeTo(parent);
            }).toThrow();
        });
    });

    describe("includes", () => {
        it("should return true for equal paths", () => {
            const parent = Path.create("/0/0/1");
            const child = Path.create("/0/0/1");

            expect(parent.includes(child)).toEqual(true);
            expect(child.includes(parent)).toEqual(true);
        });

        it("should return true for nested paths", () => {
            const parent = Path.create("/0/0/1");
            const child = Path.create("/0/0/1/2/3/4");
            expect(parent.includes(child)).toEqual(true);
        });

        it("should return false for if child is actually a parent paths", () => {
            const parent = Path.create("/0/0/1");
            const child = Path.create("/0/0/1/2/3/4");
            expect(child.includes(parent)).toEqual(false);
        });

        it("should return false for non-connected paths", () => {
            const parent = Path.create("/1/1/1/1");
            const child = Path.create("/2/1/1/1");

            expect(parent.includes(child)).toEqual(false);
            expect(child.includes(parent)).toEqual(false);
        });
    });
});
