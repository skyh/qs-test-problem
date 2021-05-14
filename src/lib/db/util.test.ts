import {decodePath, encodePath} from "./util";

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