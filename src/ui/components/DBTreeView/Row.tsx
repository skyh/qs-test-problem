import clsx from "clsx";
import React, {FC, useCallback, useMemo} from "react";

import {db} from "../../../lib/db/db";
import {HOCProps} from "./HOCProps";

import styles from "./Row.module.sass";

interface Props<Document> {
    node: db.Node<Document>
    selected: boolean
    onSelect: (node: db.Node<Document>) => void
}

export const CreateRow = <Document extends any>(hocProps: HOCProps<Document>) => {
    const {DocumentComponent} = hocProps;

    const Row: FC<Props<Document>> = (props) => {
        const onClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
            props.onSelect(props.node);
        }, [props]);

        const className = useMemo(() => {
            return clsx(styles.Row, {
                [styles.selected]: props.selected,
            });
        }, [props.selected]);

        return (
            <div className={className} onClick={onClick}>
                <DocumentComponent document={props.node.document}/>
            </div>
        );
    }

    return Row;
}
