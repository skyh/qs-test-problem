import {assert} from "../assert";
import {db} from "./db";

export function encodePath(path: db.NodePath): db.EncodedNodePath {
    return '/' + path.join('/');
}

export function decodePath(path: db.EncodedNodePath): db.NodePath {
    if (path === "/") return [];

    const pathStarter = path[0];
    assert(pathStarter === "/", "Invalid path format");

    const parts = path.slice(1).split('/');
    return parts.map(p => {
        const num = Number.parseInt(p);
        assert(!Number.isNaN(num), "Path contains non-digits");
        return num;
    });
}