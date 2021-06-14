import React, {FC, Fragment} from "react";

import {HOCProps} from "./HOCProps";
import {CreateMissingNodeRow} from "./rows/MissingNodeRow";
import {CreateRow} from "./rows/Row";

import styles from "./Children.module.sass";
import {db} from "../../../lib/db";

interface Props<Node> {
    node: Node
    selectedNode: undefined | db.cache.AnyNode<any>
    onNodeSelect: (node: db.cache.AnyNode<any>) => void
    onNodeActivate: (node: db.cache.AnyNode<any>) => void
    skipped?: number
}

export const CreateChildren = <T extends any>(hocProps: HOCProps<T>) => {
    const Row = CreateRow(hocProps);
    const MissingNodeRow = CreateMissingNodeRow(hocProps);

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

    const ExistingChildren: FC<Props<db.cache.CacheNode<T> | db.cache.Node<T>>> = (props) => {
        return (
            <ul className={styles.Children}>
                {props.node.children.map((node, i) => {
                    if (node.type === "MISSING" && node.isEphemeral()) {
                        const deepest = node.deepestNonEphemeral();
                        return (
                            <li key={i}>
                                <Children skipped={deepest.skipped} node={deepest.node} selectedNode={props.selectedNode} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>
                            </li>
                        )
                    }
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

    const Children: FC<Props<db.cache.AnyNode<T> | db.cache.Node<T>>> = (props) => {
        const {node, skipped = 0} = props;
        return (
            <Fragment>
                {(node.type === "MISSING" && skipped > 0) ? <MissingNodeRow node={props.node as any} selected={props.node === props.selectedNode} onSelect={props.onNodeSelect} onActivate={props.onNodeActivate} skipped={skipped}/> : null }
                {"children" in node &&
                    <ExistingChildren node={node} selectedNode={props.selectedNode} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
                {"addedChildren" in node &&
                    <AddedChildren node={node} selectedNode={props.selectedNode} onNodeSelect={props.onNodeSelect} onNodeActivate={props.onNodeActivate}/>}
            </Fragment>
        );
    };

    return Children;
}
