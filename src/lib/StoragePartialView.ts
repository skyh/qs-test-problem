import {assert} from "./assert";
import {db} from "./db/db";
import {Path} from "./db/Path";
import {NodeChange} from "./NodeChange";

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

    public removeChild(node: CacheNode<T>): void {
        assert(node.parent === this);
        this.children.splice(node.key, 1);
        this.refreshChildrenKeys();
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
    public static readonly EmptyDocument = undefined; // TODO: in theory, undefined could also be a valid document

    public key: db.NodeKey = -1;
    public deleted = false;

    public constructor(
        public readonly parent: Node<Document>,
        public handle: db.DocumentHandle<Document>,
    ) {
        super();
    }

    public editedDocument: typeof HandleNode.EmptyDocument | Document = HandleNode.EmptyDocument;

    get handlePath() {
        return Path.create(this.handle.path);
    }

    get edited(): boolean {
        return this.editedDocument !== HandleNode.EmptyDocument
    }

    get changed(): boolean {
        return this.deleted || this.edited;
    }

    public getChanges(): undefined | NodeChange<Document> {
        if (!this.changed) return;

        if (this.deleted) {
            return {
                handlePath: this.handle.path,
                type: "deleted",
            };
        }

        return {
            handlePath: this.handle.path,
            type: "changed",
            document: this.editingDocument,
        };
    }

    public get editingDocument(): Document {
        if (this.editedDocument === HandleNode.EmptyDocument) {
            return this.handle.document;
        }
        return this.editedDocument
    }

    public resetEditedDocument() {
        this.editedDocument = HandleNode.EmptyDocument;
    }

    public setEditedDocument(document: Document) {
        this.editedDocument = document;
    }

    public delete() {
        this.deleted = true;
    }

    public discardChanges() {
        this.deleted = false;
        this.resetEditedDocument();
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

    public removeHandle(encoded: db.EncodedNodePath): void {
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

    public queryDocument(path: db.EncodedNodePath): undefined | T {
        const node = this.getNodeWithHandlePath(Path.create(path));
        if (!node) return
        if (node instanceof MissingNode) return
        return node.handle.document;
    }

    // FIXME: Move this to node itself?
    public getChanges(): Array<NodeChange<T>> {
        return Array.from(this.iterateChanges());
    }

    public *iterateChanges(): IterableIterator<NodeChange<T>> {
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

    private delNodeWithHandlePath(path: db.NodePath): void {
        this.nodesCacheByHandlePath.delete(path.serialize());
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

function isHandleNode<T>(node: any): node is HandleNode<T> {
    return node instanceof HandleNode;
}