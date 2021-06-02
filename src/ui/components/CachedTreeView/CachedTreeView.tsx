import React, {FC, MouseEventHandler, useCallback, useState} from "react";

import {CacheNode, HandleNode, MissingNode} from "../../../lib/StoragePartialView";
import {Popup} from "../Popup/Popup";
import {CreateChildren} from "./Children";

import {HOCProps} from "./HOCProps";
import styles from "./CachedTreeView.module.sass";
import { db } from "../../../lib/db/db";
import { assert } from "../../../lib/assert";
import {CreateNodeContextMenu} from "./NodeContextMenu";

interface Props<Document> {
    nodes: Array<CacheNode<Document>>
    onDocumentRequest(path: db.EncodedNodePath): void
}

export const CreateCachedTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);
    const NodeContextMenu = CreateNodeContextMenu(hocProps);

    const {DocumentEditorComponent} = hocProps;

    const CachedTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<CacheNode<Document>>();

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const [editingNode, setEditingNode] = useState<HandleNode<Document>>();
        const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>();

        const onDocumentRequest = useCallback((node: CacheNode<Document>) => {
            props.onDocumentRequest(node.handlePath.serialize());
        }, [props]);

        const onNodeActivate = useCallback((node: CacheNode<Document>) => {
            if (node instanceof MissingNode) {
                onDocumentRequest(node);
            } else if (node instanceof HandleNode) {
                setEditingNode(node);
            }
        }, [onDocumentRequest]);

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

        // FIXME: this is a hack for missing observables
        const forceRerenderHack = () => {
            setSelectedNode(undefined);
        }

        return (
            <div className={styles.CachedTreeView}>
                {editingNode && <Popup onHide={() => setEditingNode(undefined)}>
                    <div className={styles.EditorHeader}>Edit document</div>
                    <DocumentEditorComponent document={editingNode.editingDocument} onEdited={onNodeEdited}/>
                </Popup>}

                {(contextMenuPosition && selectedNode) && <NodeContextMenu
                    position={contextMenuPosition}
                    node={selectedNode}
                    onDeactivate={onContextMenuDeactivate}
                    onNodeEdit={setEditingNode}
                    onNodeDelete={(node) => {
                        node.delete();
                        forceRerenderHack();
                    }}
                    onNodeDiscardEdit={(node) => {
                        node.resetEditedDocument();
                        forceRerenderHack();
                    }}
                    onNodeUndelete={(node) => {
                        node.deleted = false;
                        forceRerenderHack();
                    }}
                    onDocumentRequest={onDocumentRequest}
                />}

                <div onContextMenu={onContextMenu}>
                    <Children nodes={props.nodes} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate}/>
                </div>
            </div>
        );
    }

    return CachedTreeView;
}
