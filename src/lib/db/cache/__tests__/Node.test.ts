import {Path} from "../../Path";
import {Node} from "../Node";

describe("MissingNode", () => {
    describe("isEphemeral", () => {
        it("should return false if node has no children", () => {
            const root = new Node();
            const node = root.appendMissing(Path.create("/0"));

            expect(node.isEphemeral()).toEqual(false);
        });

        it("should return true if node has the only child and it's MissingNode", () => {
            const root = new Node();
            const node = root.appendMissing(Path.create("/0"));
            node.appendMissing(Path.create("/0/0"));

            expect(node.isEphemeral()).toEqual(true);
        });
    });

    describe("deepestNonEphemeral", () => {
        it("should return self with 0 skipped if self isn't ephemeral", () => {
            const root = new Node();
            const node = root.appendMissing(Path.create("/0"));

            expect(node.deepestNonEphemeral()).toEqual({
                node,
                skipped: 0,
            });
        });

        it("should return last non-ephemeral node in a tree", () => {
            const root = new Node();
            const targetNode = root.appendMissing(Path.create("/0"));

            targetNode
                .appendMissing(Path.create("/0/0"))
                .appendMissing(Path.create("/0/0/0"))
                .appendMissing(Path.create("/0/0/0/0"));

            const {node, skipped} = targetNode.deepestNonEphemeral();

            expect(node.isEphemeral()).toEqual(false);
            expect(skipped).toEqual(3);
        });
    });
});
