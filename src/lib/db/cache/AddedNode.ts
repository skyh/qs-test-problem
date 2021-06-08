import {assert} from "../../assert";
import {db} from "../index";
import {HandleNode} from "./Node";

export class AddedNode<Document> implements db.cache.AddedNode<Document> {
    public readonly type = "ADDED";

    public addedChildren: Array<AddedNode<Document>> = [];

    constructor(
        public parent: HandleNode<Document> | AddedNode<Document>,
        public document: Document,
    ) {}

    public addSubdocument(document: Document): AddedNode<Document> {
        const node = new AddedNode(this, document);
        this.addedChildren.push(node);
        return node;
    }

    public delete() {
        const {addedChildren} = this.parent;
        const index = addedChildren.findIndex(child => child === this);
        assert(index !== -1)
        addedChildren.splice(index, 1);
    }

    public setDocument(document: Document) {
        this.document = document;
    }

    public setEditedDocument(document: Document) {
        this.document = document;
    }

    public get editingDocument(): Document {
        return this.document;
    }

    public getChanges(): db.DocumentNodeSnapshot<Document> {
        const {document, addedChildren} = this;

        let children;
        if (addedChildren.length > 0) {
            children = addedChildren.map(child => child.getChanges());
        }

        return {document, children};
    }

    public discardAddedChildren(): void {
        this.addedChildren = [];
    }

    public get hasAddedChildren(): boolean {
        return this.addedChildren.length > 0;
    }
}