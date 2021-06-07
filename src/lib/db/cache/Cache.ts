import {assert} from "../../assert";
import {db} from "../index";
import {Path} from "../Path";
import {CacheNode} from "./CacheNode";
import {HandleNode, MissingNode, Node} from "./Node";

export class Cache<T> implements db.cache.Cache<T> {
    public static create<T>() {
        const root = new Node<T>();
        return new this(root);
    }

    private nodesCacheByHandlePath = new Map<db.SerializedPath, CacheNode<T>>();

    public constructor(
        public readonly root: Node<T>,
    ) {}

    public addHandle(handle: db.DocumentHandle<T>): HandleNode<T> {
        const handlePath = Path.create(handle.path);
        const existingNode = this.getNodeWithHandlePath(handlePath);

        if (existingNode) {
            if (existingNode instanceof HandleNode) {
                existingNode.resetEditedDocument(); // TODO: Move to a method
                existingNode.handle = handle;
                return existingNode;
            } else if (existingNode instanceof MissingNode) {
                const handleNode = existingNode.createHandleNode(handle);
                existingNode.parent.replaceNode(existingNode, handleNode);
                return handleNode;
            } else {
                throw new Error("Not implemented");
            }
        }

        const parentNode = this.getOrCreateParentNodeForPath(handlePath);
        const node = parentNode.appendHandle(handle);
        this.setNodeWithHandlePath(handlePath, node);
        return node;
    }

    public removeHandle(encoded: db.SerializedPath): void {
        const path = Path.create(encoded);
        const node = this.getNodeWithHandlePath(path);
        assert(isCacheNode<T>(node), "Can't remove node");
        this.removeNodeAndAllMissingParents(node);
    }

    private removeNodeAndAllMissingParents(node: CacheNode<T>): void {
        const parent = node.parent;
        this.delNodeWithHandlePath(node.handlePath);
        if (parent instanceof MissingNode && parent.children.length === 1) {
            this.removeNodeAndAllMissingParents(parent);
        } else {
            node.parent.removeChild(node);
        }
    }

    public queryDocument(path: db.SerializedPath): undefined | T {
        const node = this.getNodeWithHandlePath(Path.create(path));
        if (!node) return;
        if (node instanceof MissingNode) return;
        return node.handle.document;
    }

    // FIXME: Move this to node itself?
    public getChanges(): db.StorageChange<T> {
        return Array.from(this.iterateChanges());
    }

    public discardChanges(): void {
        for (const node of this.iterateDFS()) {
            if (node instanceof HandleNode) {
                node.discardChanges();
            }
        }
    }

    public *iterateChanges(): IterableIterator<db.NodeChange<T>> {
        for (const node of this.iterateDFS()) {
            if (!isHandleNode<T>(node)) continue;
            const changes = node.getChanges();
            if (changes != null) yield changes;
        }
    }

    // FIXME: Make this node's method?
    private iterateDFS(): IterableIterator<Node<T>> {
        function *dfs(node: Node<T>): IterableIterator<Node<T>> {
            yield node;
            for (const child of node.children) {
                yield* dfs(child);
            }
        }

        return dfs(this.root);
    }

    private getNodeWithHandlePath(path: db.Path): undefined | CacheNode<T> {
        return this.nodesCacheByHandlePath.get(path.serialize());
    }

    private setNodeWithHandlePath(path: db.Path, node: CacheNode<T>): void {
        this.nodesCacheByHandlePath.set(path.serialize(), node);
    }

    private delNodeWithHandlePath(path: db.Path): void {
        this.nodesCacheByHandlePath.delete(path.serialize());
    }

    private getOrCreateParentNodeForPath(path: db.Path): Node<T> {
        const parentPath = path.getParent();
        const parentNode = this.getNodeWithHandlePath(parentPath);

        if (parentNode) {
            return parentNode;
        }

        return this.createMissingNodes(parentPath);
    }

    private createMissingNodes(path: db.Path): Node<T> {
        const closestNode = this.getClosestNodeWithHandlePath(path);

        if (closestNode) {
            const pathFromClosesNode = path.relativeTo(closestNode.handlePath);
            return this.createMissingNodesStartingFrom(closestNode, pathFromClosesNode);
        } else {
            return this.createMissingNodesStartingFrom(this.root, path);
        }
    }

    private createMissingNodesStartingFrom(initialNode: Node<T> | CacheNode<T>, path: db.Path): typeof node {
        let node = initialNode;
        for (const segment of path.segments) {
            const newPath = isCacheNode(node) ? node.handlePath.append(segment) : Path.create([segment]);
            node = node.appendMissing(newPath);
            if (isCacheNode(node)) {
                this.setNodeWithHandlePath(newPath, node);
            } else {
                throw new Error("Not implemented");
            }
        }
        return node;
    }

    private getClosestNodeWithHandlePath(path: db.Path): undefined | CacheNode<T> {
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

export function isCacheNode<T>(node: any): node is CacheNode<T> {
    return node instanceof HandleNode || node instanceof MissingNode;
}

function isHandleNode<T>(node: any): node is HandleNode<T> {
    return node instanceof HandleNode;
}