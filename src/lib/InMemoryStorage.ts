import {decodePath} from "./db/util";
import {assert} from "./assert";
import {db} from "./db/db";

export class InMemoryRootNode<T> implements db.RootNode<T> {
    public children: InMemoryNode<T>[] = [];
}

export class InMemoryNode<T> implements db.Node<T> {
    public static link<T>(parent: db.NodeWithChildren<T>, child: InMemoryNode<T>) {
        assert(!child.parent, "Can't link nodes, child already has parent")
        const key = parent.children.push(child);
        child.setKey(key);
        child.setParent(parent);
    }

    public parent: null | db.NodeWithChildren<T> = null;
    public children: InMemoryNode<T>[] = [];
    public deleted = false;

    public constructor(
        public key: db.NodeKey,
        public document: T,
    ) {}

    public delete() {
        this.deleteChildren();
        this.deleted = true;
    }

    public alterDocument(document: T) {
        this.document = document;
    }

    private deleteChildren() {
        for (const child of this.children.values()) {
            child.delete();
        }
    }

    private setKey(key: db.NodeKey) {
        this.key = key;
    }

    private setParent(parent: db.NodeWithChildren<T>) {
        this.parent = parent;
    }
}

export interface InMemoryStorageRootSnapshot<T> {
    children?: InMemoryStorageSnapshot<T>[]
}

export interface InMemoryStorageSnapshot<T> {
    document: T
    children?: InMemoryStorageSnapshot<T>[]
}

export class InMemoryStorage<T> implements db.Storage<T> {
    public static create<T>(sn?: InMemoryStorageRootSnapshot<T>): InMemoryStorage<T> {
        const root = new InMemoryRootNode<T>();
        if (sn && sn.children) {
            root.children = this.createChildren(sn.children);
        }
        return new InMemoryStorage(root);
    }

    private static createChildren<T>(children: InMemoryStorageSnapshot<T>[]): InMemoryNode<T>[] {
        return children.map((sn, i) => {
            const node = new InMemoryNode(i, sn.document)
            if (sn.children) {
                node.children = this.createChildren(sn.children);
            }
            return node;
        });
    }

    constructor(
        public readonly root: InMemoryRootNode<T>
    ) {}

    public queryDocument(path: db.EncodedNodePath): null | T {
        const node = this.queryDocumentNode(decodePath(path));
        if (!node) {
            return null;
        }
        return node.document;
    }

    private queryDocumentNode(path: db.NodePath): null | InMemoryNode<T> {
        let currentNode: db.NodeWithChildren<T> = this.root;

        for (const p of path) {
            currentNode = currentNode.children[p];
            if (!currentNode) {
                return null;
            }
        }

        if (isDocumentNode(currentNode)) {
            return currentNode;
        } else {
            return null;
        }
    }
}

function isDocumentNode<T>(node: db.NodeWithChildren<T>): node is InMemoryNode<T> {
    return "document" in node;
}
