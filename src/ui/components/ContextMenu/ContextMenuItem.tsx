import {FC} from "react";

import styles from "./ContextMenu.module.sass";

interface Props {
    onClick?: JSX.IntrinsicElements["div"]["onClick"]
    onClickCapture?: JSX.IntrinsicElements["div"]["onClickCapture"]
}

export const ContextMenuItem: FC<Props> = (props) => {
    return (
        <div className={styles.ItemWrapper} onClick={props.onClick} onClickCapture={props.onClickCapture}>
            <div className={styles.Item} children={props.children}/>
        </div>
    );
}
