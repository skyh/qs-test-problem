import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";

import {MissingNode} from "../../../lib/StoragePartialView";

import {HOCProps} from "./HOCProps";
import {RowProps} from "./RowProps";
import styles from "./MissingNodeRow.module.sass";

type Props<Document> = RowProps<MissingNode<Document>>

export const CreateMissingNodeRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const MissingNodeRow: FC<Props<Document>> = (props) => {
        const onMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            props.onSelect(props.node);
        }, [props]);

        const onDoubleClick = useCallback(() => {
            props.onActivate(props.node);
        }, [props]);

        const className = useMemo(() => {
            return clsx({
                [styles.MissingNodeRow]: true,
                [styles.selected]: props.selected,
            });
        }, [props]);

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
                Missing document
            </div>
        );
    };

    return MissingNodeRow;
}
