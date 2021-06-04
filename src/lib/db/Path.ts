import {arraysEqual} from "../arraysEqual";
import {assert} from "../assert";
import {db} from "./index";

const PATH_SEPARATOR = "/";

export class Path implements db.Path {
    public static create(): Path
    public static create(path: Path): Path
    public static create(serialized: db.SerializedPath): Path
    public static create(parts: db.PathSegment[]): Path
    public static create(input?: Path | db.SerializedPath | db.PathSegment[]): Path {
        if (input === undefined) {
            return new this([]);
        } else if (Array.isArray(input)) {
            return new this(input.slice());
        } else if (input instanceof Path) {
            return Path.create(input.segments);
        } else {
            return new this(this.decode(input));
        }
    }

    public static equals(a: Path, b: Path): boolean {
        if (a === b) return true;
        return arraysEqual(a.segments, b.segments);
    }

    private static decode(serialized: db.SerializedPath): db.PathSegment[] {
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
        public segments: db.PathSegment[],
    ) {}

    public getParent(): db.Path {
        const {segments} = this;
        assert(segments.length > 0, "Attempt to get parent for root path");
        return new Path(segments.slice(0, -1));
    }

    public append(segment: db.PathSegment): Path {
        return new Path([...this.segments, segment]);
    }

    public lastSegment(): number {
        const {segments} = this;
        assert(segments.length > 0);
        return segments[segments.length - 1];
    }

    public serialize(): db.SerializedPath {
        return PATH_SEPARATOR + this.segments.join(PATH_SEPARATOR);
    }

    public equals(other: Path): boolean {
        return Path.equals(this, other);
    }

    public relativeTo(other: Path): Path {
        assert(other.includes(this), "Paths are not nested");
        const keys = this.segments.slice(other.segments.length);
        return new Path(keys);
    }

    public includes(other: Path): boolean {
        const {segments: thisKeys} = this;
        const {segments: otherKeys} = other;

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
        return this.segments.length === 0;
    }
}
