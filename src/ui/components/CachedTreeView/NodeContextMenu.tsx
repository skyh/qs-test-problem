import React, {FC, Fragment} from "react";
import {CacheNode, HandleNode, MissingNode} from "../../../lib/StoragePartialView";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {ContextMenuItem} from "../ContextMenu/ContextMenuItem";

import {ContextMenuPosition} from "../ContextMenu/ContextMenuPosition";
import {HOCProps} from "./HOCProps";

interface Props<Document> {
    position: ContextMenuPosition
    node: CacheNode<Document>
    onDeactivate: () => void
    onNodeEdit: (node: HandleNode<Document>) => void
    onNodeDelete: (node: HandleNode<Document>) => void
    onDocumentRequest: (node: CacheNode<Document>) => void
}

export const CreateNodeContextMenu = <T extends any>(hocProps: HOCProps<T>) => {
    const NodeContextMenu: FC<Props<T>> = (props) => {
        const {position, node, onDeactivate, onNodeEdit, onDocumentRequest, onNodeDelete} = props
        return (
            <ContextMenu position={position} onDeactivate={onDeactivate}>
                {node instanceof MissingNode && <ContextMenuItem onClick={()=>{
                    onDocumentRequest(node);
                    onDeactivate();
                }}>
                    Pull
                </ContextMenuItem>}
                {node instanceof HandleNode && <Fragment>
                    <ContextMenuItem onClick={() => {
                        onNodeEdit(node);
                        onDeactivate();
                    }}>
                        Edit
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
