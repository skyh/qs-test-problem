import React, {FC} from "react";

import {db} from "../../../lib/db/db";
import {HOCProps} from "./HOCProps";
import {CreateRow} from "./Row";

import styles from "./Children.module.sass";

interface Props<Document> {
    nodes: db.Node<Document>[]
    selectedNode?: db.Node<Document>
    onNodeSelect: (node: db.Node<Document>) => void
    onNodeActivate: (node: db.Node<Document>) => void
}

export const CreateChildren = <Document extends any>(hocProps: HOCProps<Document>) => {
    const Row = CreateRow(hocProps);

    const Children: FC<Props<Document>> = (props) => {
        const {nodes} = props;

        return (
            <ul className={styles.Children}>
                {nodes.map(node => {
                    if (node.deleted) {
                        return null;
                    }

                    return (
                        <li key={node.key}>
                            <Row node={node} selected={props.selectedNode === node} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            {node.children.length > 0 &&
                                <Children nodes={node.children} selectedNode={props.selectedNode}
                                    onNodeSelect={props.onNodeSelect}
                                    onNodeActivate={props.onNodeActivate}
                                />
                            }
                        </li>
                    );
                })}
            </ul>
        );
    };

    return Children;
}
