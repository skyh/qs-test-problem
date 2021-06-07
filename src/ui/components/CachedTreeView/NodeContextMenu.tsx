import React, {FC, Fragment} from "react";
import {db} from "../../../lib/db";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {ContextMenuItem} from "../ContextMenu/ContextMenuItem";

import {ContextMenuPosition} from "../ContextMenu/ContextMenuPosition";
import {HOCProps} from "./HOCProps";

interface Props<Document> {
    position: ContextMenuPosition
    node: db.cache.AnyNode<Document>
    onDeactivate: () => void
    onNodeEdit: (node: db.cache.LiveNode<Document>) => void
    onNodeDelete: (node: db.cache.LiveNode<Document>) => void
    onNodeDiscardEdit: (node: db.cache.HandleNode<Document>) => void
    onNodeUndelete: (node: db.cache.HandleNode<Document>) => void
    onNodeAddSubdocument: (node: db.cache.LiveNode<Document>) => void
    onNodeDiscardSubdocuments: (node: db.cache.LiveNode<Document>) => void
    onDocumentRequest: (node: db.cache.MissingNode<Document>) => void
}

export const CreateNodeContextMenu = <T extends any>(hocProps: HOCProps<T>) => {
    const NodeContextMenu: FC<Props<T>> = (props) => {
        const {position, node, onDeactivate, onNodeEdit, onNodeDiscardSubdocuments, onDocumentRequest, onNodeDelete, onNodeUndelete, onNodeDiscardEdit, onNodeAddSubdocument} = props
        return (
            <ContextMenu position={position} onDeactivate={onDeactivate}>
                {node.type === "MISSING" && <ContextMenuItem onClick={()=>{
                    onDocumentRequest(node);
                    onDeactivate();
                }}>
                    Pull
                </ContextMenuItem>}
                {node.type === "HANDLE" && <Fragment>
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
                {node.type === "ADDED" && <Fragment>
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
