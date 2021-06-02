import {db} from "./db/db";

export type NodeChange<T> = {
    handlePath: db.EncodedNodePath
} & (
    | {
        type: "changed"
        document: T
    }
    | {
        type: "deleted"
    }
)
