import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";
import {db} from "../../../../lib/db";

import {HOCProps} from "../HOCProps";
import {RowProps} from "../RowProps";
import styles from "./MissingNodeRow.module.sass";

interface Props<Document> extends RowProps<db.cache.MissingNode<Document>> {
    skipped?: number
}

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
                [styles.Row]: true,
                [styles.selected]: props.selected,
            });
        }, [props]);

        const {skipped = 0} = props;
        const missing = skipped + 1;

        return (
            <div className={className} onMouseDown={onMouseDown} onDoubleClick={onDoubleClick}>
                {missing === 1 ? `Missing document` : `Missing ${missing} documents`}
            </div>
        );
    };

    return MissingNodeRow;
}
