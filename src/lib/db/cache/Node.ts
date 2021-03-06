import {assert} from "../../assert";
import {db} from "../index";
import {Path} from "../Path";
import {AddedNode} from "./AddedNode";
import {CacheNode} from "./CacheNode";

export class Node<T> implements db.cache.Node<T> {
    public children: Array<CacheNode<T>> = [];

    public readonly type: string = "";

    public appendHandle(handle: db.DocumentHandle<T>): HandleNode<T> {
        return this.pushNode(new HandleNode(this, handle));
    }

    public replaceChild(oldNode: CacheNode<T>, newNode: CacheNode<T>) {
        assert(this.children[oldNode.key] === oldNode, "Old node is not a child node");
        this.children[oldNode.key] = newNode;
        newNode.key = oldNode.key;
        newNode.children = oldNode.children;
        for (const child of newNode.children) {
            child.parent = newNode;
        }
    }

    public appendMissing(handlePath: db.Path): MissingNode<T> {
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
            return a.handlePath.lastSegment() - b.handlePath.lastSegment();
        });
        this.refreshChildrenKeys();
    }

    private refreshChildrenKeys() {
        for (const [i, child] of this.children.entries()) {
            child.key = i;
        }
    }
}

export class MissingNode<T> extends Node<T> implements db.cache.MissingNode<T> {
    public readonly type = "MISSING";

    public key: db.PathSegment = -1;

    constructor(public parent: Node<T>, public readonly handlePath: db.Path,) {
        super();
    }

    public createHandleNode(handle: db.DocumentHandle<T>): HandleNode<T> {
        const node = new HandleNode(this.parent, handle);
        node.key = this.key;
        node.children = this.children;
        return node;
    }

    public isEphemeral(): boolean {
        const {children} = this;
        return children.length === 1 && children[0].type === "MISSING";
    }

    public deepestNonEphemeral(): {node: MissingNode<T>, skipped: number} {
        let node: MissingNode<T> = this;
        let skipped = 0;

        while (node.isEphemeral()) {
            const firstChild = node.children[0];
            if (firstChild.type === "MISSING") {
                skipped = skipped + 1;
                node = firstChild;
            } else {
                break;
            }
        }

        return {skipped, node};
    }

    public get deleted(): boolean {
        const parent = this.parent;
        if (parent instanceof HandleNode || parent instanceof MissingNode) {
            return parent.deleted;
        }
        return false;
    }
}

export class HandleNode<Document> extends Node<Document> implements db.cache.HandleNode<Document> {
    public static readonly EmptyDocument = undefined; // TODO: in theory, undefined could also be a valid document

    public readonly type = "HANDLE";

    public key: db.PathSegment = -1;
    private _deleted = false;
    public addedChildren: AddedNode<Document>[] = [];

    public constructor(public parent: Node<Document>, public handle: db.DocumentHandle<Document>,) {
        super();
    }

    public editedDocument: typeof HandleNode.EmptyDocument | Document = HandleNode.EmptyDocument;

    get handlePath() {
        return Path.create(this.handle.path);
    }

    get edited(): boolean {
        return this.editedDocument !== HandleNode.EmptyDocument
    }

    get hasAddedChildren(): boolean {
        return this.addedChildren.length > 0;
    }

    get changed(): boolean {
        return this._deleted || this.edited || this.hasAddedChildren;
    }

    public getChanges(): undefined | db.NodeChange<Document> {
        if (!this.changed) return;

        if (this._deleted) {
            return {
                handlePath: this.handle.path, type: "deleted",
            };
        }

        if (this.edited) {
            return {
                handlePath: this.handle.path, type: "changed", document: this.editingDocument,
            };
        }

        if (this.addedChildren.length > 0) {
            return {
                handlePath: this.handle.path, type: "changed", added: this.addedChildren.map(added => {
                    return added.getChanges();
                }),
            };
        }
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
        this._deleted = true;
    }

    public undelete() {
        this._deleted = false;
    }

    public discardChanges() {
        this._deleted = false;
        this.resetEditedDocument();
        this.addedChildren = [];
    }

    public addSubdocument(document: Document): AddedNode<Document> {
        const node = new AddedNode(this, document);
        this.addedChildren.push(node);
        return node;
    }

    public discardAddedChildren(): void {
        this.addedChildren = [];
    }

    public get deleted(): boolean {
        if (this._deleted) {
            return this._deleted;
        }

        const parent = this.parent as Node<Document> | HandleNode<Document>;
        if ("deleted" in parent) {
            return parent.deleted;
        } else {
            return false;
        }
    }

    public set deleted(value: boolean) {
        this._deleted = value;
    }
}
