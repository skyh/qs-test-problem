import {assert} from "./assert";
import {db} from "./db/db";
import {Path} from "./db/Path";
import {NodeChange} from "./NodeChange";

export class InMemoryNode<T> implements db.RootNode<T> {
    public children: InMemoryDocumentNode<T>[] = [];

    public appendDocument(document: T): InMemoryDocumentNode<T> {
        const node = new InMemoryDocumentNode(this, this.children.length, document);
        this.children.push(node);
        return node;
    }
}

export class InMemoryDocumentNode<T> extends InMemoryNode<T> implements db.Node<T> {
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
            path: this.path.serialize(),
            document: this.document,
        };
    }

    public get path(): db.NodePath {
        return Path.create([...this.upward()]
            .map((node) => node.key)
            .reverse());
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
            this.applySnapshot(root, sn.children);
        }
        return new InMemoryStorage(root);
    }

    private static applySnapshot<T>(parent: InMemoryNode<T>, snapshots: InMemoryStorageSnapshot<T>[]) {
        for (const sn of snapshots) {
            const node = parent.appendDocument(sn.document);
            if (sn.children) {
                this.applySnapshot(node, sn.children);
            }
        }
    }

    constructor(
        public readonly root: InMemoryNode<T>
    ) {}

    public queryDocument(path: db.EncodedNodePath): null | T {
        const node = this.queryDocumentNode(Path.create(path));
        if (!node || node.deleted) {
            return null;
        }
        return node.document;
    }

    public applyChanges(changes: Array<NodeChange<T>>) {
        for (const change of changes) {
            this.applyChange(change);
        }
    }

    private applyChange(change: NodeChange<T>) {
        const node = this.queryDocumentNode(Path.create(change.handlePath));
        assert(node, "Attempt to apply change to missing node");
        // FIXME: get rid of switch
        switch (change.type) {
            case "changed":
                if ("document" in change) {
                    node.document = change.document;
                }
                if ("added" in change) {
                    InMemoryStorage.applySnapshot(node, change.added); //TODO: make NodeChange.added = InMemoryStorageSnapshot
                }
                break;
            case "deleted":
                node.deleted = true;
                break;
        }
    }

    private queryDocumentNode(path: db.NodePath): null | InMemoryDocumentNode<T> {
        let currentNode: InMemoryNode<T> = this.root;

        for (const key of path.keys) {
            currentNode = currentNode.children[key];
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
