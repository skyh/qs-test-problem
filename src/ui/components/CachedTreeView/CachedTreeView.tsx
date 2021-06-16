import React, {FC, MouseEventHandler, useCallback, useState} from "react";

import {Popup} from "../Popup/Popup";
import {CreateChildren} from "./Children";

import {HOCProps} from "./HOCProps";
import styles from "./CachedTreeView.module.sass";
import {db} from "../../../lib/db";
import {assert} from "../../../lib/assert";
import {CreateNodeContextMenu} from "./NodeContextMenu";

interface Props<Document> {
    node: db.cache.Node<Document>
    onDocumentRequest(path: db.SerializedPath): void
}

export const CreateCachedTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);
    const NodeContextMenu = CreateNodeContextMenu(hocProps);

    const {DocumentEditorComponent, documentFactory} = hocProps;

    const CachedTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<db.cache.CacheNode<Document>>();

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const [editingNode, setEditingNode] = useState<db.cache.LiveNode<Document>>();
        const [addingSubdocumentNode, setAddingSubdocumentNode] = useState<db.cache.LiveNode<Document>>();
        const [contextMenuPosition, setContextMenuPosition] = useState<[number, number]>();

        const onDocumentRequest = useCallback((node: db.cache.CacheNode<Document>) => {
            props.onDocumentRequest(node.handlePath.serialize());
        }, [props]);

        const onNodeActivate = useCallback((node: db.cache.AnyNode<Document>) => {
            if (node.type === "MISSING") {
                onDocumentRequest(node);
            } else if (node.type === "HANDLE") {
                if (!node.deleted) {
                    setEditingNode(node);
                }
            } else if (node.type === "ADDED") {
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

        const allowContextMenu = selectedNode && (
            selectedNode.type !== "HANDLE" ||
            selectedNode.type === "HANDLE" && !selectedNode.deleted
        );

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

                {(contextMenuPosition && selectedNode && allowContextMenu) && <NodeContextMenu
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
                    onDocumentRequest={onDocumentRequest}
                    onNodeAddSubdocument={(node) => {
                        setAddingSubdocumentNode(node);
                    }}
                    onNodeDiscardSubdocuments={(node) => {
                        node.discardAddedChildren();
                        forceRerenderHack();
                    }}
                />}

                <div onContextMenu={onContextMenu}>
                    <Children node={props.node} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate}/>
                </div>
            </div>
        );
    }

    return CachedTreeView;
}
