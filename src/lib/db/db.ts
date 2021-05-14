export namespace db {
    export type NodeKey = number
    export type NodePath = NodeKey[]
    export type EncodedNodePath = string

    export interface NodeWithChildren<Document> {
        readonly children: Node<Document>[]
    }

    export interface RootNode<Document> extends NodeWithChildren<Document> {}

    export interface Node<Document> extends NodeWithChildren<Document> {
        readonly key: NodeKey
        readonly parent: null | NodeWithChildren<Document>
        readonly document: Document
        readonly deleted: boolean

        alterDocument(document: Document): void
        delete(): void
    }

    export interface Storage<Document> {
        readonly root: RootNode<Document>
        queryDocument(path: EncodedNodePath): null | Document
    }
}
