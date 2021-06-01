import React, {FC, MouseEventHandler, useCallback, useState} from "react";

import {CacheNode, HandleNode, MissingNode} from "../../../lib/StoragePartialView";
import {ContextMenu} from "../ContextMenu/ContextMenu";
import {ContextMenuItem} from "../ContextMenu/ContextMenuItem";
import {Popup} from "../Popup/Popup";
import {CreateChildren} from "./Children";

import {HOCProps} from "./HOCProps";
import styles from "./CachedTreeView.module.sass";
import { db } from "../../../lib/db/db";
import { assert } from "../../../lib/assert";

interface Props<Document> {
    nodes: Array<CacheNode<Document>>
    onDocumentRequest(path: db.EncodedNodePath): void
}

export const CreateCachedTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);
    const {DocumentEditorComponent} = hocProps;

    const CachedTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<CacheNode<Document>>();

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const [editingNode, setEditingNode] = useState<HandleNode<Document>>();
        const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>();
        const hideContextMenu = () => setContextMenuPosition(undefined);

        const onNodeActivate = useCallback((node: CacheNode<Document>) => {
            if (node instanceof MissingNode) {
                props.onDocumentRequest(node.handlePath.serialize());
            } else if (node instanceof HandleNode) {
                setEditingNode(node);
            }
        }, [props]);

        const onNodeEdited = useCallback((document: Document) => {
            assert(editingNode);
            editingNode.setEditedDocument(document);
            setEditingNode(undefined);
        }, [editingNode]);

        const onContextMenu: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
            event.preventDefault();
            setContextMenuPosition([event.clientX, event.clientY]);
        }, [setContextMenuPosition]);

        const onContextMenuDeactivate = useCallback(() => {
            setContextMenuPosition(undefined);
        }, [setContextMenuPosition])

        return (
            <div className={styles.CachedTreeView}>
                {editingNode && <Popup onHide={() => setEditingNode(undefined)}>
                    <div className={styles.EditorHeader}>Edit document</div>
                    <DocumentEditorComponent document={editingNode.editingDocument} onEdited={onNodeEdited}/>
                </Popup>}

                {(contextMenuPosition && selectedNode) && <ContextMenu position={contextMenuPosition} onDeactivate={onContextMenuDeactivate}>
                    {selectedNode instanceof MissingNode && <ContextMenuItem onClick={()=>{
                        props.onDocumentRequest(selectedNode.handlePath.serialize());
                        hideContextMenu();
                    }}>
                        Request document from the database
                    </ContextMenuItem>}
                    {selectedNode instanceof HandleNode && <ContextMenuItem onClick={() => {
                        setEditingNode(selectedNode);
                        hideContextMenu();
                    }}>
                        Edit document
                    </ContextMenuItem>}
                </ContextMenu>}

                <div onContextMenu={onContextMenu}>
                    <Children nodes={props.nodes} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate}/>
                </div>
            </div>
        );
    }

    return CachedTreeView;
}
