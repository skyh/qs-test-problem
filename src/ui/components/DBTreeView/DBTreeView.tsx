import React, {FC, useCallback, useState} from "react";

import {db} from "../../../lib/db/db";
import {CreateChildren} from "./Children";
import {HOCProps} from "./HOCProps";

import styles from "./DBTreeView.module.sass"

interface Props<Document> {
    nodes: db.Node<Document>[]
    onActivate: (handle: db.DocumentHandle<Document>) => void;
}

export const CreateDBTreeView = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Children = CreateChildren(hocProps);

    const DBTreeView: FC<Props<Document>> = (props) => {
        const [selectedNode, setSelectedNode] = useState<undefined | db.Node<Document>>(undefined);

        const onNodeSelect = useCallback((node) => {
            setSelectedNode(node);
        }, []);

        const onNodeActivate = useCallback((node: db.Node<Document>) => {
            props.onActivate(node.getHandle());
            setSelectedNode(undefined);
        }, [props]);

        return (
            <div className={styles.DBTreeView}>
                <Children nodes={props.nodes} selectedNode={selectedNode} onNodeSelect={onNodeSelect} onNodeActivate={onNodeActivate}/>
            </div>
        );
    };

    return DBTreeView;
}
