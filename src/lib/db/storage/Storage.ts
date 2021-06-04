import {db} from "../index";

import {assert} from "../../assert";
import {Path} from "../Path";
import {DocumentNode} from "./DocumentNode";
import {Node} from "./Node";

export class Storage<T> implements db.storage.Storage<T> {
    public static create<T>(sn?: db.NodeSnapshot<T>): Storage<T> {
        const root = new Node<T>();
        if (sn && sn.children) {
            this.applySnapshot(root, sn.children);
        }
        return new this(root);
    }

    private static applySnapshot<T>(parent: Node<T>, snapshots: db.DocumentNodeSnapshot<T>[]): db.ApplyChangesResult {
        const result: db.ApplyChangesResult = {affected: []};

        for (const sn of snapshots) {
            const node = parent.appendChild(sn.document);
            result.affected.push(node.path.serialize());

            if (sn.children) {
                const {affected} = this.applySnapshot(node, sn.children);
                result.affected.push(...affected);
            }
        }

        return result;
    }

    constructor(
        public readonly root: Node<T>
    ) {}

    public queryDocument(path: db.SerializedPath): undefined | T {
        const node = this.queryDocumentNode(Path.create(path));
        if (!node || node.deleted) {
            return;
        }
        return node.document;
    }

    public applyChanges(changes: db.StorageChange<T>): db.ApplyChangesResult {
        const result: db.ApplyChangesResult = {
            affected: [],
        };

        for (const change of changes) {
            const {affected} = this.applyChange(change);
            result.affected.push(...affected);
        }

        return result;
    }

    private applyChange(change: db.NodeChange<T>): db.ApplyChangesResult {
        const node = this.queryDocumentNode(Path.create(change.handlePath));
        assert(node, "Attempt to apply change to missing node");

        const result: db.ApplyChangesResult = {
            affected: [],
        };

        // FIXME: get rid of switch
        switch (change.type) {
            case "changed":
                if ("document" in change) {
                    node.document = change.document;
                    result.affected.push(change.handlePath);
                }

                if ("added" in change) {
                    const {affected} = Storage.applySnapshot(node, change.added);
                    result.affected.push(...affected);
                }
                break;

            case "deleted":
                node.deleted = true;
                result.affected.push(change.handlePath);
                break;
        }

        return result;
    }

    private queryDocumentNode(path: db.Path): null | DocumentNode<T> {
        let currentNode: Node<T> = this.root;

        for (const segment of path.segments) {
            currentNode = currentNode.children[segment];
            if (!currentNode) {
                return null;
            }
        }

        return DocumentNode.cast(currentNode);
    }
}

