import {db} from "./db/db";

export type AddedChange<T> = {
    document: T,
    children?: Array<AddedChange<T>>
}

export type NodeChange<T> = {
    handlePath: db.EncodedNodePath
} & (
    | {
        type: "changed"
        document: T
    }
    | {
        type: "changed"
        added: Array<AddedChange<T>>
    }
    | {
        type: "deleted"
    }
)
