import {arraysEqual} from "../arraysEqual";
import {assert} from "../assert";
import {db} from "./db";

const PATH_SEPARATOR = "/";

export class Path implements db.NodePath {
    public static create(): Path
    public static create(path: Path): Path
    public static create(serialized: db.EncodedNodePath): Path
    public static create(parts: db.NodeKey[]): Path
    public static create(input?: Path | db.EncodedNodePath | db.NodeKey[]): Path {
        if (input === undefined) {
            return new this([]);
        } else if (Array.isArray(input)) {
            return new this(input.slice());
        } else if (input instanceof Path) {
            return Path.create(input.keys);
        } else {
            return new this(this.decode(input));
        }
    }

    public static equals(a: Path, b: Path): boolean {
        if (a === b) return true;
        return arraysEqual(a.keys, b.keys);
    }

    private static decode(serialized: db.EncodedNodePath): db.NodeKey[] {
        if (serialized === PATH_SEPARATOR) return [];

        const pathStarter = serialized[0];
        assert(pathStarter === PATH_SEPARATOR, "Invalid path format");

        const parts = serialized.slice(1).split(PATH_SEPARATOR);
        return parts.map(p => {
            const num = Number.parseInt(p);
            assert(!Number.isNaN(num), "Path contains non-digits");
            return num;
        });
    }

    private constructor(
        public keys: db.NodeKey[],
    ) {}

    public getParent(): db.NodePath {
        const {keys} = this;
        assert(keys.length > 0, "Attempt to get parent for root path");
        return new Path(keys.slice(0, -1));
    }

    public appendChild(key: db.NodeKey): Path {
        return new Path([...this.keys, key]);
    }

    public getKey(): number {
        const {keys} = this;
        assert(keys.length > 0);
        return keys[keys.length - 1];
    }

    public serialize(): db.EncodedNodePath {
        return PATH_SEPARATOR + this.keys.join(PATH_SEPARATOR);
    }

    public equals(other: Path): boolean {
        return Path.equals(this, other);
    }

    public relativeTo(other: Path): Path {
        assert(other.includes(this), "Paths are not nested");
        const keys = this.keys.slice(other.keys.length);
        return new Path(keys);
    }

    public includes(other: Path): boolean {
        const {keys: thisKeys} = this;
        const {keys: otherKeys} = other;

        if (thisKeys.length > otherKeys.length) {
            return false;
        }

        for (let i = thisKeys.length - 1; i >= 0; --i) {
            if (thisKeys[i] !== otherKeys[i]) {
                return false;
            }
        }

        return true;
    }

    public isRoot(): boolean {
        return this.keys.length === 0;
    }
}
