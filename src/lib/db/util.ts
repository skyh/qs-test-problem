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

type VariantPath = db.NodePath | db.EncodedNodePath

export function getParentPath(path: db.EncodedNodePath): db.EncodedNodePath
export function getParentPath(path: db.NodePath): db.NodePath
export function getParentPath(path: VariantPath): VariantPath {
    return isEncodedPath(path) ? getParentPathEncoded(path) : getParentPathDecoded(path);
}

function getParentPathDecoded(path: db.NodePath): db.NodePath {
    assert(path.length > 0);
    return path.slice(0, -1);
}

function isEncodedPath(path: VariantPath): path is db.EncodedNodePath {
    return typeof path === "string"
}

function getParentPathEncoded(path: db.EncodedNodePath): db.EncodedNodePath {
    return encodePath(getParentPathDecoded(decodePath(path)));
}

export function getPathKey(path: VariantPath): db.NodeKey {
    return isEncodedPath(path) ? getPathKeyEncoded(path) : getPathKeyDecoded(path);
}

function getPathKeyEncoded(path: db.EncodedNodePath): db.NodeKey {
    return getPathKeyDecoded(decodePath(path));
}

function getPathKeyDecoded(path: db.NodePath): db.NodeKey {
    assert(path.length > 0);
    return path[path.length - 1];
}
