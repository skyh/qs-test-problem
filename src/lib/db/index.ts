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
        path: SerializedPath
        document: Document
    }

    export interface ApplyChangesResult {
        affected: SerializedPath[],
    }

    export interface NodeSnapshot<T> {
        children?: Array<DocumentNodeSnapshot<T>>
    }

    export interface DocumentNodeSnapshot<T> extends NodeSnapshot<T> {
        document: T,
    }

    export interface NodeChangeDocumentChanged<T> {
        type: "changed"
        handlePath: SerializedPath
        document: T
    }

    export interface NodeChangeSubdocumentsAdded<T> {
        type: "changed"
        handlePath: SerializedPath
        added: Array<DocumentNodeSnapshot<T>>
    }

    export interface NodeChangeNodeDeleted {
        type: "deleted"
        handlePath: SerializedPath
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
        queryDocument(path: SerializedPath): null | T
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
        root: Node<T>
        getChanges(): db.StorageChange<T>
        addHandle(handle: db.DocumentHandle<T>): HandleNode<T>
        discardChanges(): void
        removeHandle(path: db.SerializedPath): void
    }

    export interface Node<T> {

    }

    export interface HandleNode<T> {

    }

    export interface EditableNode<T> {
        readonly document: T
        delete(): void
        setDocument(document: T): void
        getChanges(): db.DocumentNodeSnapshot<T>
    }

    export interface AddedNode<T> {
        readonly path: Path
    }

    export interface ExistingNode<T> {
        readonly path: Path
        readonly targetPath: Path
    }
}