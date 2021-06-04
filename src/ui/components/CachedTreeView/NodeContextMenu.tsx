import React, {FC, Fragment} from "react";
import {AddedNode} from "../../../lib/db/cache/AddedNode";
import {CacheNode} from "../../../lib/db/cache/CacheNode";
import {HandleNode, MissingNode} from "../../../lib/db/cache/Node";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {ContextMenuItem} from "../ContextMenu/ContextMenuItem";

import {ContextMenuPosition} from "../ContextMenu/ContextMenuPosition";
import {HOCProps} from "./HOCProps";

interface Props<Document> {
    position: ContextMenuPosition
    node: CacheNode<Document>
    onDeactivate: () => void
    onNodeEdit: (node: HandleNode<Document>) => void
    onNodeDelete: (node: HandleNode<Document> | AddedNode<Document>) => void
    onNodeDiscardEdit: (node: HandleNode<Document>) => void
    onNodeUndelete: (node: HandleNode<Document>) => void
    onNodeAddSubdocument: (node: HandleNode<Document> | AddedNode<Document>) => void
    onNodeDiscardSubdocuments: (node: HandleNode<Document> | AddedNode<Document>) => void
    onDocumentRequest: (node: CacheNode<Document>) => void
}

export const CreateNodeContextMenu = <T extends any>(hocProps: HOCProps<T>) => {
    const NodeContextMenu: FC<Props<T>> = (props) => {
        const {position, node, onDeactivate, onNodeEdit, onNodeDiscardSubdocuments, onDocumentRequest, onNodeDelete, onNodeUndelete, onNodeDiscardEdit, onNodeAddSubdocument} = props
        return (
            <ContextMenu position={position} onDeactivate={onDeactivate}>
                {node instanceof MissingNode && <ContextMenuItem onClick={()=>{
                    onDocumentRequest(node);
                    onDeactivate();
                }}>
                    Pull
                </ContextMenuItem>}
                {node instanceof HandleNode && <Fragment>
                    {node.deleted ? <Fragment>
                        <ContextMenuItem onClick={() => {
                            onNodeUndelete(node);
                            onDeactivate();
                        }}>
                            Undelete
                        </ContextMenuItem>
                    </Fragment> : <Fragment>
                        <ContextMenuItem onClick={() => {
                            onNodeEdit(node);
                            onDeactivate();
                        }}>
                            Edit...
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => {
                            onNodeAddSubdocument(node);
                            onDeactivate();
                        }}>
                            Add subdocument...
                        </ContextMenuItem>
                        {node.edited && <ContextMenuItem onClick={() => {
                            onNodeDiscardEdit(node);
                            onDeactivate();
                        }}>
                            Discard edit
                        </ContextMenuItem>}
                        {node.childrenAdded && <ContextMenuItem onClick={() => {
                            onNodeDiscardSubdocuments(node);
                            onDeactivate();
                        }}>
                            Clear added subdocuments
                        </ContextMenuItem>}
                        <ContextMenuItem onClick={() => {
                            onNodeDelete(node);
                            onDeactivate();
                        }}>
                            Delete
                        </ContextMenuItem>
                    </Fragment>}
                </Fragment>}
                {node instanceof AddedNode && <Fragment>
                    <ContextMenuItem onClick={() => {
                        onNodeAddSubdocument(node);
                        onDeactivate();
                    }}>
                        Add subdocument
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => {
                        onNodeDelete(node);
                        onDeactivate();
                    }}>
                        Delete
                    </ContextMenuItem>
                </Fragment>}
            </ContextMenu>
        );
    };

    return NodeContextMenu;
}
