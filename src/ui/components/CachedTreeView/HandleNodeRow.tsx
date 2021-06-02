import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";

import {HandleNode} from "../../../lib/StoragePartialView";

import {HOCProps} from "./HOCProps";
import {RowProps} from "./RowProps";

import styles from "./Row.module.sass";

type Props<Document> = RowProps<HandleNode<Document>>

export const CreateHandleNodeRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const {DocumentComponent} = hocProps;

    const HandleNodeRow: FC<Props<Document>> = (props) => {
        const onMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            props.onSelect(props.node);
        }, [props]);

        const onDoubleClick = useCallback(() => {
            props.onActivate(props.node);
        }, [props]);

        const className = useMemo(() => {
            const {node, selected} = props
            return clsx(styles.Row, {
                [styles.selected]: selected,
                [styles.edited]: node.edited && !node.deleted,
                [styles.deleted]: node.deleted,
            });
        }, [props]);

        const {node} = props;

        let title;
        if (node.deleted) {
            title = "Document was deleted";
        } else if (node.edited) {
            title =  "Document was edited";
        }

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} title={title}>
                <DocumentComponent document={node.deleted ? node.handle.document : node.editingDocument}/>
            </div>
        );
    };

    return HandleNodeRow;
}
