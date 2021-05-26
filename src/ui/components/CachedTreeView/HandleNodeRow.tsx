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
            return clsx(styles.Row, {
                [styles.selected]: props.selected,
            });
        }, [props.selected]);

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
                <DocumentComponent document={props.node.handle.document}/>
            </div>
        );
    };

    return HandleNodeRow;
}