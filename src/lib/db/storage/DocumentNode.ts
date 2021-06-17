import {db} from "../index";
import {Path} from "../Path";

import {Node} from "./Node";

export class DocumentNode<T> extends Node<T> implements db.storage.DocumentNode<T> {
    public static cast<T>(node: Node<T>): null | DocumentNode<T> {
        return node instanceof DocumentNode ? node : null;
    }

    public deleted = false;

    public constructor(
        public readonly parent: Node<T>,
        public index: db.PathSegment,
        public document: T,
    ) {
        super();
    }

    public delete() {
        for (const child of this.children) {
            child.delete();
        }
        this.deleted = true;
    }

    public setDocument(document: T) {
        this.document = document;
    }

    public getHandle(): db.DocumentHandle<T> {
        return {
            path: this.path.serialize(),
            document: this.document,
        };
    }

    public get path(): db.Path {
        return Path.create([...this.upward()]
            .map((node) => node.index)
            .reverse());
    }

    public appendChild(document: T): DocumentNode<T> {
        const node = super.appendChild(document);
        if (this.deleted) {
            node.delete();
        }
        return node;
    }

    public* upward(): IterableIterator<DocumentNode<T>> {
        let node: null | DocumentNode<T> = this;
        do {
            yield node;
        // eslint-disable-next-line no-cond-assign
        } while (node = DocumentNode.cast(node.parent));
    }
}
