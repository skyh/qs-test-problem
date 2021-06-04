import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";

import {db} from "../../../lib/db";
import {HOCProps} from "./HOCProps";

import styles from "./Row.module.sass";

interface Props<Document> {
    node: db.storage.DocumentNode<Document>
    selected: boolean
    onSelect: (node: this["node"]) => void
    onActivate: (node: this["node"]) => void
}

export const CreateRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const {DocumentComponent} = hocProps;

    const Row: FC<Props<Document>> = (props) => {
        const onMouseDown = useCallback(() => {
            props.onSelect(props.node);
        }, [props]);

        const onDoubleClick = useCallback(() => {
            props.onActivate(props.node);
        }, [props]);

        const className = useMemo(() => {
            return clsx(styles.Row, {
                [styles.selected]: props.selected,
            });
        }, [props.selected]);

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
                <DocumentComponent document={props.node.document}/>
            </div>
        );
    }

    return Row;
}
