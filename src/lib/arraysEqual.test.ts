import {arraysEqual} from "./arraysEqual";

describe("arraysEqual", () => {
    it("should return true for empty arrays", () => {
        expect(arraysEqual([], [])).toEqual(true);
    });

    it("should return false for arrays of unequal size", () => {
        expect(arraysEqual(new Array(1), new Array(2))).toEqual(false);
    });

    it("should return true for arrays with equal values", () => {
        const x = {};
        const a1 = [1, x, 3];
        const a2 = [1, x, 3];
        expect(arraysEqual(a1, a2)).toEqual(true);
    });

    it("should return false for arrays with unequal values", () => {
        const x = {};
        const y = {};
        const a1 = [1, x, 3];
        const a2 = [1, y, 3];
        expect(arraysEqual(a1, a2)).toEqual(false);
    });
});
