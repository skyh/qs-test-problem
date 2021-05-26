import {assert} from "./assert";
import {db} from "./db/db";
import {decodePath, encodePath, getParentPath, getPathKey} from "./db/util";

type HandlePath = db.DocumentHandle<any>["path"];

interface NodeWithHandle {
    handlePath: HandlePath
}

export class Node<T> {
    public children: Array<CacheNode<T>> = [];

    public appendHandle(handle: db.DocumentHandle<T>): HandleNode<T> {
        return this.pushNode(new HandleNode(this, handle));
    }

    public replaceNode(oldNode: CacheNode<T>, newNode: CacheNode<T>) {
        assert(this.children[oldNode.key] === oldNode, "Old node is not a child node");
        this.children[oldNode.key] = newNode;
        newNode.key = oldNode.key;
    }

    public appendMissing(handlePath: HandlePath): MissingNode<T> {
        return this.pushNode(new MissingNode(this, handlePath));
    }

    private pushNode(node: HandleNode<T>): typeof node
    private pushNode(node: MissingNode<T>): typeof node
    private pushNode(node: CacheNode<T>): typeof node {
        this.children.push(node);
        this.reorderChildrenByHandlePath();
        return node;
    }

    private reorderChildrenByHandlePath() {
        this.children.sort((a, b) => {
            return getPathKey(a.handlePath) - getPathKey(b.handlePath);
        });
        this.refreshChildrenKeys();
    }

    private refreshChildrenKeys() {
        for (const [i, child] of this.children.entries()) {
            child.key = i;
        }
    }
}

export class MissingNode<T> extends Node<T> implements NodeWithHandle {
    public key: db.NodeKey = -1;

    constructor(
        public readonly parent: Node<T>,
        public readonly handlePath: HandlePath,
    ) {
       super();
    }

    public createHandleNode(handle: db.DocumentHandle<T>): HandleNode<T> {
        const node = new HandleNode(this.parent, handle);
        node.key = this.key;
        node.children = this.children;
        return node;
    }
}

export class HandleNode<Document> extends Node<Document> implements NodeWithHandle {
    public key: db.NodeKey = -1;

    public constructor(
        public readonly parent: Node<Document>,
        public handle: db.DocumentHandle<Document>,
    ) {
        super();
    }

    get handlePath() {
        return this.handle.path;
    }
}

export type CacheNode<T> = HandleNode<T> | MissingNode<T>

export class StoragePartialView<T> {
    public static create<T>() {
        const root = new Node<T>();
        return new this(root);
    }

    private nodesCacheByHandlePath = new Map<db.EncodedNodePath, CacheNode<T>>();

    public constructor(
        public readonly root: Node<T>,
    ) {}

    public addHandle(handle: db.DocumentHandle<T>) {
        const existingNode = this.getNodeWithHandlePath(handle.path);

        if (existingNode) {
            if (existingNode instanceof HandleNode) {
                existingNode.handle = handle;
            } else if (existingNode instanceof MissingNode) {
                const replacement = existingNode.createHandleNode(handle);
                existingNode.parent.replaceNode(existingNode, replacement);
            } else {
                throw new Error("Not implemented");
            }
            return;
        }

        const parentNode = this.getOrCreateParentNodeForPath(handle.path);

        const node = parentNode.appendHandle(handle);
        this.nodesCacheByHandlePath.set(handle.path, node);
    }

    public queryDocument(path: db.EncodedNodePath): undefined | T {
        const node = this.getNodeWithHandlePath(path);
        if (!node) return
        if (node instanceof MissingNode) return
        return node.handle.document;
    }

    private getNode(path: db.NodePath): undefined | Node<T> {
        let currentNode = this.root;

        for (const p of path) {
            currentNode = currentNode.children[p];
            if (!currentNode) return;
        }

        return currentNode;
    }

    private getNodeWithHandlePath(path: db.EncodedNodePath): undefined | CacheNode<T> {
        return this.nodesCacheByHandlePath.get(path);
    }

    private getOrCreateParentNodeForPath(path: db.EncodedNodePath): Node<T> {
        const nodePath = decodePath(path);
        const parentPath = getParentPath(nodePath);
        const parentNode = this.getNodeWithHandlePath(encodePath(parentPath));

        if (parentNode) {
            return parentNode;
        }

        return this.createMissingNodes(parentPath);
    }

    private createMissingNodes(path: db.NodePath): Node<T> {
        const closestNode = this.getClosestNodeWithHandlePath(path);
        const pathToCreate = closestNode ? path.slice(decodePath(closestNode.handlePath).length) : path.slice();
        return this.createMissingNodesStartingFrom(closestNode || this.root, pathToCreate);
    }

    private createMissingNodesStartingFrom(node: Node<T> | CacheNode<T>, path: db.NodePath): typeof node {
        for (const p of path) {
            const parentPath = isCacheNode(node) ? decodePath(node.handlePath) : [];
            const newPath = encodePath([...parentPath, p]);
            node = node.appendMissing(newPath);
            if (isCacheNode(node)) {
                this.nodesCacheByHandlePath.set(newPath, node);
            } else {
                throw new Error("Not implemented");
            }
        }
        return node;
    }

    private getClosestNodeWithHandlePath(path: db.NodePath): undefined | CacheNode<T> {
        const probePath = path.slice();
        let result: undefined | CacheNode<T>;

        while (probePath.length) {
            result = this.getNodeWithHandlePath(encodePath(probePath));
            if (result) {
                return result;
            } else {
                probePath.pop();
            }
        }

        return result;
    }
}

function isCacheNode<T>(node: any): node is CacheNode<T> {
    return node instanceof HandleNode || node instanceof MissingNode;
}
