import {FC, useCallback, useState} from "react";

import {CacheNode, MissingNode} from "../../../lib/StoragePartialView";
import {CreateChildren} from "./Children";

import {HOCProps} from "./HOCProps";
import styles from "./CachedTreeView.module.sass";
import { db } from "../../../lib/db/db";

interface Props<Document> {
    nodes: Array<CacheNode<Document>>
    onDocumentRequest(path: db.EncodedNodePath): void
}

export const CreateCachedTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);

    const CachedTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<undefined | CacheNode<Document>>(undefined);

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const onNodeActivate = useCallback((node: CacheNode<Document>) => {
            if (node instanceof MissingNode) {
                props.onDocumentRequest(node.handlePath);
            }
        }, [props]);


        return (
            <div className={styles.CachedTreeView}>
                <Children nodes={props.nodes} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate}/>
            </div>
        );
    }

    return CachedTreeView;
}
