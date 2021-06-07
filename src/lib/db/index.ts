export namespace db {
    export type PathSegment = number
    export type SerializedPath = string

    export interface Path {
        readonly segments: ReadonlyArray<PathSegment>

        isRoot(): boolean

        lastSegment(): PathSegment
        serialize(): SerializedPath

        equals(other: Path): boolean
        includes(other: Path): boolean

        getParent(): Path
        append(segment: PathSegment): Path
        relativeTo(other: Path): Path
    }

    export interface DocumentHandle<Document> {
        readonly path: SerializedPath
        readonly document: Document
    }

    export interface ApplyChangesResult {
        readonly affected: SerializedPath[],
    }

    export interface NodeSnapshot<T> {
        readonly children?: Array<DocumentNodeSnapshot<T>>
    }

    export interface DocumentNodeSnapshot<T> extends NodeSnapshot<T> {
        readonly document: T,
    }

    export interface NodeChangeDocumentChanged<T> {
        readonly type: "changed"
        readonly handlePath: SerializedPath
        readonly document: T
    }

    export interface NodeChangeSubdocumentsAdded<T> {
        readonly type: "changed"
        readonly handlePath: SerializedPath
        readonly added: Array<DocumentNodeSnapshot<T>>
    }

    export interface NodeChangeNodeDeleted {
        readonly type: "deleted"
        readonly handlePath: SerializedPath
    }

    export type NodeChange<T> =
        | NodeChangeDocumentChanged<T>
        | NodeChangeSubdocumentsAdded<T>
        | NodeChangeNodeDeleted

    export type StorageChange<T> = NodeChange<T>[]
}

export namespace db.storage {
    export interface Storage<T> {
        readonly root: Node<T>
        queryDocument(path: SerializedPath): undefined | T
        applyChanges(change: StorageChange<T>): ApplyChangesResult
    }

    export interface Node<T> {
        readonly children: ReadonlyArray<DocumentNode<T>>
        appendChild(document: T): DocumentNode<T>
    }

    export interface DocumentNode<T> extends Node<T> {
        readonly document: T
        readonly path: Path
        readonly parent: Node<T> | DocumentNode<T>
        readonly deleted: boolean

        delete(): void
        setDocument(document: T): void
        getHandle(): DocumentHandle<T>
    }
}

export namespace db.cache {
    export interface Cache<T> {
        readonly root: Node<T>
        queryDocument(path: SerializedPath): undefined | T
        addHandle(handle: db.DocumentHandle<T>): HandleNode<T>
        removeHandle(path: db.SerializedPath): void
        getChanges(): db.StorageChange<T>
        discardChanges(): void
    }

    // TODO: EditableNode
    export type LiveNode<T> = AddedNode<T> | HandleNode<T>

    export type CacheNode<T> = HandleNode<T> | MissingNode<T>
    export type AnyNode<T> = AddedNode<T> | HandleNode<T> | MissingNode<T>

    export interface Node<T> {
        readonly type: string
        readonly children: ReadonlyArray<CacheNode<T>>
        appendHandle(handle: db.DocumentHandle<T>): HandleNode<T>
        replaceNode(oldNode: CacheNode<T>, newNode: CacheNode<T>): void
        appendMissing(path: db.Path): MissingNode<T>
        removeChild(node: CacheNode<T>): void
    }

    export interface MissingNode<T> extends Node<T> {
        readonly type: "MISSING"
        readonly handlePath: db.Path
        readonly key: db.PathSegment
        createHandleNode(handle: db.DocumentHandle<T>): HandleNode<T>
    }

    export interface NodeWithAddedChildren<T> {
        readonly addedChildren: ReadonlyArray<AddedNode<T>>
        discardAddedChildren(): void
    }

    export interface HandleNode<T> extends Node<T>, NodeWithAddedChildren<T> {
        readonly type: "HANDLE"
        readonly handle: db.DocumentHandle<T>
        readonly key: db.PathSegment
        readonly handlePath: db.Path
        readonly deleted: boolean
        readonly editedDocument: any
        readonly edited: boolean
        readonly childrenAdded: boolean
        readonly changed: boolean
        readonly editingDocument: T
        getChanges(): undefined | db.NodeChange<T>
        discardChanges(): void
        resetEditedDocument(): void
        setEditedDocument(document: T): void
        delete(): void
        undelete(): void
        addSubdocument(document: T): AddedNode<T>
    }

    export interface AddedNode<T> extends NodeWithAddedChildren<T> {
        readonly type: "ADDED"
        readonly document: T
        readonly editingDocument: T
        addSubdocument(document: T): AddedNode<T>
        delete(): void
        setDocument(document: T): void
        setEditedDocument(document: T): void
        getChanges(): db.DocumentNodeSnapshot<T>
    }
}