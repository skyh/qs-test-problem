import {db} from "./db/db";

export type NodeChange<T> = {
    handlePath: db.EncodedNodePath
    document: T
}
