import React, {FC} from "react";

import {HOCProps} from "./HOCProps";
import {AddedNode, CacheNode, HandleNode} from "../../../lib/StoragePartialView";
import {CreateRow} from "./rows/Row";

import styles from "./Children.module.sass";

interface Props<Document> {
    node: AddedNode<Document> | CacheNode<Document>
    selectedNode?: AddedNode<Document> | CacheNode<Document>
    onNodeSelect: (node: AddedNode<Document> | CacheNode<Document>) => void
    onNodeActivate: (node: AddedNode<Document> | CacheNode<Document>) => void
}

export const CreateChildren = <T extends any>(hocProps: HOCProps<T>) => {
    const Row = CreateRow(hocProps);

    const Children: FC<Props<T>> = (props) => {
        // @ts-ignore
        const addedChildren: AddedNode<T>[] = props.node.addedChildren || [];
        return (
            <ul className={styles.Children}>
                {props.node.children.map((node, i) => {
                    return (
                        <li key={node.key}>
                            <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            {node instanceof HandleNode && node.deleted ? null :
                                <Children selectedNode={props.selectedNode} node={node}
                                          onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                        </li>
                    );
                })}
                {addedChildren.map((node, i) => {
                    return (
                        <li key={i}>
                            <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            <Children selectedNode={props.selectedNode} node={node}
                                      onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return Children;
}
