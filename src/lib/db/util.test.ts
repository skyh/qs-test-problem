import {decodePath, encodePath, getParentPath, getPathKey} from "./util";

describe("decodePath", () => {
    it("should decode sample path", () => {
        expect(decodePath("/0/0/0/1")).toEqual([0, 0, 0, 1]);
    });

    it("should throw error if path contains non-digits", () => {
        expect(() => {
            decodePath("/a/b/c");
        }).toThrow()
    });

    it("should throw if path starts not from /", () => {
        expect(() => {
            decodePath("0/1/2");
        }).toThrow()
    });

    it("should decode empty path", () => {
        expect(decodePath("/")).toEqual([]);
    });
});

describe("encodePath", () => {
    it("should encode empty path", () => {
        expect(encodePath([])).toEqual("/")
    });

    it("should encode sample path", () => {
        expect(encodePath([5, 4, 3])).toEqual("/5/4/3")
    });
});

describe("getParentPath", () => {
    describe("encoded", () => {
        it("should throw for root path", () => {
            expect(() => {
                getParentPath("/");
            }).toThrow();
        });

        it("should return parent path for /0", () => {
            expect(getParentPath("/0")).toEqual("/");
        });

        it("should return parent for N-l;evel path", () => {
            expect(getParentPath("/0/1/45")).toEqual("/0/1");
        });
    });
});

describe("getPathKey", () => {
    describe("encoded", () => {
        it("should throw for root path", () => {
            expect(() => {
                getPathKey("/");
            }).toThrow();
        });

        it("should return own key", () => {
            expect(getPathKey("/0/12/32/343/42")).toEqual(42);
        });
    });
});