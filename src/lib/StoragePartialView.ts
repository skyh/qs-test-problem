import {assert} from "./assert";
import {db} from "./db/db";
import {Path} from "./db/Path";

interface NodeWithHandle {
    handlePath: db.NodePath
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

    public appendMissing(handlePath: db.NodePath): MissingNode<T> {
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
            return a.handlePath.getKey() - b.handlePath.getKey();
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
        public readonly handlePath: db.NodePath,
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
        return Path.create(this.handle.path);
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
        const handlePath = Path.create(handle.path);
        const existingNode = this.getNodeWithHandlePath(handlePath);

        if (existingNode) {
            if (existingNode instanceof HandleNode) {
                existingNode.handle = handle;
            } else if (existingNode instanceof MissingNode) {
                const handleNode = existingNode.createHandleNode(handle);
                existingNode.parent.replaceNode(existingNode, handleNode);
            } else {
                throw new Error("Not implemented");
            }
            return;
        }

        const parentNode = this.getOrCreateParentNodeForPath(handlePath);
        const node = parentNode.appendHandle(handle);
        this.setNodeWithHandlePath(handlePath, node);
    }

    public queryDocument(path: db.EncodedNodePath): undefined | T {
        const node = this.getNodeWithHandlePath(Path.create(path));
        if (!node) return
        if (node instanceof MissingNode) return
        return node.handle.document;
    }

    private getNode(path: db.NodePath): undefined | Node<T> {
        let currentNode = this.root;

        for (const key of path.keys) {
            currentNode = currentNode.children[key];
            if (!currentNode) return;
        }

        return currentNode;
    }

    private getNodeWithHandlePath(path: db.NodePath): undefined | CacheNode<T> {
        return this.nodesCacheByHandlePath.get(path.serialize());
    }

    private setNodeWithHandlePath(path: db.NodePath, node: CacheNode<T>): void {
        this.nodesCacheByHandlePath.set(path.serialize(), node);
    }

    private getOrCreateParentNodeForPath(path: db.NodePath): Node<T> {
        const parentPath = path.getParent();
        const parentNode = this.getNodeWithHandlePath(parentPath);

        if (parentNode) {
            return parentNode;
        }

        return this.createMissingNodes(parentPath);
    }

    private createMissingNodes(path: db.NodePath): Node<T> {
        const closestNode = this.getClosestNodeWithHandlePath(path);

        if (closestNode) {
            const pathFromClosesNode = path.relativeTo(closestNode.handlePath);
            return this.createMissingNodesStartingFrom(closestNode, pathFromClosesNode);
        } else {
            return this.createMissingNodesStartingFrom(this.root, path);
        }
    }

    private createMissingNodesStartingFrom(initialNode: Node<T> | CacheNode<T>, path: db.NodePath): typeof node {
        let node = initialNode;
        for (const key of path.keys) {
            const newPath = isCacheNode(node) ? node.handlePath.appendChild(key) : Path.create([key]);
            node = node.appendMissing(newPath);
            if (isCacheNode(node)) {
                this.setNodeWithHandlePath(newPath, node);
            } else {
                throw new Error("Not implemented");
            }
        }
        return node;
    }

    private getClosestNodeWithHandlePath(path: db.NodePath): undefined | CacheNode<T> {
        let probePath = path;

        while (!probePath.isRoot()) {
            const result = this.getNodeWithHandlePath(probePath);
            if (result) {
                return result;
            }
            probePath = probePath.getParent();
        }
    }
}

function isCacheNode<T>(node: any): node is CacheNode<T> {
    return node instanceof HandleNode || node instanceof MissingNode;
}