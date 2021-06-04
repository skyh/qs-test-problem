import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";
import {AddedNode} from "../../../../lib/db/cache/AddedNode";

import {HOCProps} from "../HOCProps";
import {RowProps} from "../RowProps";

import styles from "./AddedNodeRow.module.sass";

type Props<Document> = RowProps<AddedNode<Document>>

export const CreateAddedNodeRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const {DocumentComponent} = hocProps;

    const AddedNodeRow: FC<Props<Document>> = (props) => {
        const onMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            props.onSelect(props.node);
        }, [props]);

        const onDoubleClick = useCallback(() => {
            props.onActivate(props.node);
        }, [props]);

        const className = useMemo(() => {
            const {selected} = props
            return clsx(styles.Row, {
                [styles.selected]: selected,
            });
        }, [props]);

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick} title="New document">
                <DocumentComponent document={props.node.document}/>
            </div>
        );
    };

    return AddedNodeRow;
}
