import React, {FC, Fragment} from "react";

import {HOCProps} from "./HOCProps";
import {CreateRow} from "./rows/Row";

import styles from "./Children.module.sass";
import {db} from "../../../lib/db";

interface Props<Node> {
    node: Node
    selectedNode?: any
    onNodeSelect: (node: db.cache.AnyNode<any>) => void
    onNodeActivate: (node: db.cache.AnyNode<any>) => void
}

export const CreateChildren = <T extends any>(hocProps: HOCProps<T>) => {
    const Row = CreateRow(hocProps);

    const AddedChildren: FC<Props<db.cache.LiveNode<T>>> = (props) => {
        return (
            <ul className={styles.Children}>
                {props.node.addedChildren.map((node, i) => {
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

    const ExistingChildren: FC<Props<db.cache.CacheNode<T>>> = (props) => {
        return (
            <ul className={styles.Children}>
                {props.node.children.map((node, i) => {
                    return (
                        <li key={i}>
                            <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            {node.type === "HANDLE" && node.deleted
                                ? null
                                : <Children selectedNode={props.selectedNode} node={node}
                                          onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const Children: FC<Props<db.cache.AnyNode<T>>> = (props) => {
        return (
            <Fragment>
                {"children" in props.node &&
                    <ExistingChildren node={props.node} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                {"addedChildren" in props.node &&
                    <AddedChildren node={props.node} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
            </Fragment>
        );
    };

    return Children;
}
