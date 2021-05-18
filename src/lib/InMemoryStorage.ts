import {decodePath, encodePath} from "./db/util";
import {db} from "./db/db";

export class InMemoryNode<T> implements db.RootNode<T> {
    public children: InMemoryDocumentNode<T>[] = [];

    public appendDocument(document: T): InMemoryDocumentNode<T> {
        const node = new InMemoryDocumentNode(this, this.children.length, document);
        this.children.push(node);
        return node;
    }
}

export class InMemoryDocumentNode<T> extends InMemoryNode<T> implements db.Node<T> {
    public children: InMemoryDocumentNode<T>[] = [];
    public deleted = false;

    public constructor(
        public parent: InMemoryNode<T>,
        public key: db.NodeKey,
        public document: T,
    ) {
        super();
    }

    public delete() {
        this.deleted = true;
    }

    public alterDocument(document: T) {
        this.document = document;
    }

    public getHandle(): db.DocumentHandle<T> {
        return {
            path: encodePath(this.path),
            document: this.document,
        };
    }

    public get path(): db.NodePath {
        return [...this.upward()]
            .map((node) => node.key)
            .reverse();
    }

    public *upward(): IterableIterator<InMemoryDocumentNode<T>> {
        let node: null | InMemoryDocumentNode<T> = this;
        do {
            yield node;
        // eslint-disable-next-line no-cond-assign
        } while (node = castToDocumentNode(node.parent));
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
        const root = new InMemoryNode<T>();
        if (sn && sn.children) {
            this.buildFromSnapshot(root, sn.children);
        }
        return new InMemoryStorage(root);
    }

    private static buildFromSnapshot<T>(parent: InMemoryNode<T>, snapshots: InMemoryStorageSnapshot<T>[]) {
        for (const sn of snapshots) {
            const node = parent.appendDocument(sn.document);
            if (sn.children) {
                this.buildFromSnapshot(node, sn.children);
            }
        }
    }

    constructor(
        public readonly root: InMemoryNode<T>
    ) {}

    public queryDocument(path: db.EncodedNodePath): null | T {
        const node = this.queryDocumentNode(decodePath(path));
        if (!node) {
            return null;
        }
        return node.document;
    }

    private queryDocumentNode(path: db.NodePath): null | InMemoryDocumentNode<T> {
        let currentNode: InMemoryNode<T> = this.root;

        for (const p of path) {
            currentNode = currentNode.children[p];
            if (!currentNode) {
                return null;
            }
        }

        return castToDocumentNode(currentNode);
    }
}

function isDocumentNode<T>(node: InMemoryNode<T>): node is InMemoryDocumentNode<T> {
    return "document" in node;
}

function castToDocumentNode<T>(node: InMemoryNode<T>): null | InMemoryDocumentNode<T> {
    return isDocumentNode(node) ? node : null;
}
