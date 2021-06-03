import React, {FC, MouseEventHandler, useCallback, useState} from "react";

import {Node, CacheNode, HandleNode, MissingNode, AddedNode} from "../../../lib/StoragePartialView";
import {Popup} from "../Popup/Popup";
import {CreateChildren} from "./Children";

import {HOCProps} from "./HOCProps";
import styles from "./CachedTreeView.module.sass";
import { db } from "../../../lib/db/db";
import { assert } from "../../../lib/assert";
import {CreateNodeContextMenu} from "./NodeContextMenu";

interface Props<Document> {
    node: AddedNode<Document> | CacheNode<Document> | Node<Document>
    onDocumentRequest(path: db.EncodedNodePath): void
}

export const CreateCachedTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);
    const NodeContextMenu = CreateNodeContextMenu(hocProps);

    const {DocumentEditorComponent, documentFactory} = hocProps;

    const CachedTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<CacheNode<Document>>();

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const [editingNode, setEditingNode] = useState<AddedNode<Document> | HandleNode<Document>>();
        const [addingSubdocumentNode, setAddingSubdocumentNode] = useState<AddedNode<Document> | HandleNode<Document>>();
        const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>();

        const onDocumentRequest = useCallback((node: CacheNode<Document>) => {
            props.onDocumentRequest(node.handlePath.serialize());
        }, [props]);

        const onNodeActivate = useCallback((node: AddedNode<Document> | CacheNode<Document>) => {
            if (node instanceof MissingNode) {
                onDocumentRequest(node);
            } else if (node instanceof HandleNode) {
                if (!node.deleted) {
                    setEditingNode(node);
                }
            } else if (node instanceof AddedNode) {
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

                {addingSubdocumentNode && <Popup onHide={() => setAddingSubdocumentNode(undefined)}>
                    <div className={styles.EditorHeader}>Create subdocument</div>
                    <DocumentEditorComponent document={documentFactory.create()} onEdited={(document) => {
                        addingSubdocumentNode.addSubdocument(document);
                        setAddingSubdocumentNode(undefined);
                    }}/>
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
                    onNodeAddSubdocument={(node) => {
                        setAddingSubdocumentNode(node);
                    }}
                    onNodeDiscardSubdocuments={(node) => {
                        node.addedChildren = [];
                        forceRerenderHack();
                    }}
                />}

                <div onContextMenu={onContextMenu}>
                    <Children node={props.node as any} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate as any}/>
                </div>
            </div>
        );
    }

    return CachedTreeView;
}
