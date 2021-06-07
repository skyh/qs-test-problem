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

    const AddedNodeChildren: FC<Props<db.cache.LiveNode<T>>> = (props) => {
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

    const CacheNodeChildren: FC<Props<db.cache.CacheNode<T>>> = (props) => {
        return (
            <Fragment>
                <ul className={styles.Children}>
                    {props.node.children.map((node, i) => {
                        return (
                            <li key={i}>
                                <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect as any} onActivate={props.onNodeActivate as any}/>
                                {node.type === "HANDLE" && node.deleted ? null :
                                    <Children selectedNode={props.selectedNode} node={node}
                                              onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                            </li>
                        );
                    })}
                </ul>
                {"addedChildren" in props.node && <AddedNodeChildren node={props.node} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
            </Fragment>
        );
    };

    const RootNodeChildren: FC<Props<db.cache.Node<T>>> = (props) => {
        return (
            <ul className={styles.Children}>
                {props.node.children.map((node, i) => {
                    return (
                        <li key={i}>
                            <Row node={node} selected={node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate}/>
                            {node.type === "HANDLE" && node.deleted ? null :
                                <Children selectedNode={props.selectedNode} node={node}
                                          onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                        </li>
                    );
                })}
            </ul>
        );
    };

    const Children: FC<Props<db.cache.AnyNode<T>>> = (props) => {
        if (isAddedNodeProps(props)) {
            return <AddedNodeChildren {...props} />;
        } else if (isCacheNodeProps(props)) {
            return <CacheNodeChildren {...props}/>;
        }
        return <RootNodeChildren {...props as any}/>;
    };

    return Children;
}

function isAddedNodeProps<T>(props: {node: db.cache.AnyNode<T>}): props is Props<db.cache.AddedNode<T>> {
    return props.node.type === "ADDED";
}

function isCacheNodeProps<T>(props: {node: db.cache.AnyNode<T>}): props is Props<db.cache.CacheNode<T>> {
    return props.node.type === "HANDLE" || props.node.type === "MISSING";
}
