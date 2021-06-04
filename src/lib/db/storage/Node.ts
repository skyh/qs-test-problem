import {db} from "../index";
import {DocumentNode} from "./DocumentNode";

export class Node<T> implements db.storage.Node<T> {
    public children: Array<DocumentNode<T>> = [];

    public appendChild(document: T): DocumentNode<T> {
        const node = new DocumentNode(this, this.children.length, document);
        this.children.push(node);
        return node;
    }
}
