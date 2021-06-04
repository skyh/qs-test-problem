import {HandleNode, MissingNode} from "./Node";

export type CacheNode<T> = HandleNode<T> | MissingNode<T>
