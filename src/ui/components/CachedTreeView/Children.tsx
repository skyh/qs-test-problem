import React, {FC} from "react";

import {HOCProps} from "./HOCProps";
import {CacheNode} from "../../../lib/StoragePartialView";
import {CreateRow} from "./Row";

import styles from "./Children.module.sass";

interface Props<Document> {
    nodes: Array<CacheNode<Document>>
    selectedNode?: CacheNode<Document>
    onNodeSelect: (node: CacheNode<Document>) => void
    onNodeActivate: (node: CacheNode<Document>) => void
}

export const CreateChildren = <T extends any>(hocProps: HOCProps<T>) => {
    const Row = CreateRow(hocProps);

    const Children: FC<Props<T>> = (props) => {
        return (
            <ul className={styles.Children}>
                {props.nodes.map((node, i) => {
                    return (
                        <li key={node.key}>
                            <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            <Children selectedNode={props.selectedNode} nodes={node.children} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return Children;
}
