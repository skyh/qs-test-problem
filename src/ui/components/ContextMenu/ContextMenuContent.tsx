import {FC} from "react";

import styles from "./ContextMenu.module.sass";

export const ContextMenuContent: FC = (props) => {
    return (
        <div className={styles.ContextMenuContent} children={props.children}/>
    );
}
